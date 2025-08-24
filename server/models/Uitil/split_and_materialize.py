import bpy, sys, os, json, math
from mathutils import Vector

# ============== 参数解析 ==============
def parse_args():
    argv = sys.argv
    if "--" in argv:
        argv = argv[argv.index("--") + 1:]
    else:
        argv = []

    args = {
        "in": None,
        "out": None,
        "keep_existing": False,
        "angle": 30.0,
        "name_map": "Seat=seat,sitz,cushion;Legs=leg,gestell,frame,bein,foot",
        "seat_color": "#B7BBC2",
        "legs_color": "#111111",
        "report": None,
    }
    i = 0
    while i < len(argv):
        k = argv[i]
        if k == "--in": args["in"] = argv[i+1]; i += 2
        elif k == "--out": args["out"] = argv[i+1]; i += 2
        elif k == "--keep-existing-materials": args["keep_existing"] = True; i += 1
        elif k == "--angle": args["angle"] = float(argv[i+1]); i += 2
        elif k == "--name-map": args["name_map"] = argv[i+1]; i += 2
        elif k == "--seat-color": args["seat_color"] = argv[i+1]; i += 2
        elif k == "--legs-color": args["legs_color"] = argv[i+1]; i += 2
        elif k == "--report": args["report"] = argv[i+1]; i += 2
        else:
            i += 1
    if not args["in"] or not args["out"]:
        print("Usage: blender --background --factory-startup --python split_and_materialize.py -- "
              "--in in.glb --out out.glb [--keep-existing-materials] [--angle 30] "
              "[--name-map \"Seat=seat;Legs=leg,...\"] [--seat-color #HEX] [--legs-color #HEX] [--report path]")
        sys.exit(1)
    return args

# ============== 工具函数 ==============
def clean_scene():
    bpy.ops.wm.read_homefile(use_empty=True)

def import_gltf(path):
    bpy.ops.import_scene.gltf(filepath=path)

def select(obj):
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj

def mode(obj, m):
    select(obj)
    try:
        bpy.ops.object.mode_set(mode=m)
    except RuntimeError:
        pass

def by_loose_parts(obj):
    mode(obj, 'EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.separate(type='LOOSE')
    mode(obj, 'OBJECT')

def split_by_sharp_then_loose(obj, angle_deg=30.0):
    select(obj)
    # 应用 Edge Split 修改器更稳地断开几何
    mod = obj.modifiers.new(name="AutoEdgeSplit", type='EDGE_SPLIT')
    mod.use_edge_angle = True
    mod.split_angle = math.radians(angle_deg)
    mod.use_edge_sharp = True
    bpy.ops.object.modifier_apply(modifier=mod.name)
    # 再按松散部件分离
    by_loose_parts(obj)

def ensure_principled(mat):
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        return bsdf
    # 保险：如果没有，重建
    nt = mat.node_tree
    for n in nt.nodes: nt.nodes.remove(n)
    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.location = (0,0)
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    out.location = (200,0)
    nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    return bsdf

def hex_to_rgba_f(hex_str):
    h = hex_str.strip().lstrip("#")
    if len(h) == 3:
        h = "".join([c*2 for c in h])
    r = int(h[0:2], 16) / 255.0
    g = int(h[2:4], 16) / 255.0
    b = int(h[4:6], 16) / 255.0
    return (r,g,b,1.0)

def create_or_get_material(name, color_rgba=None):
    m = bpy.data.materials.get(name)
    if not m:
        m = bpy.data.materials.new(name)
    bsdf = ensure_principled(m)
    if color_rgba:
        bsdf.inputs["Base Color"].default_value = color_rgba
        # 合理默认
        bsdf.inputs["Metallic"].default_value = 0.0
        bsdf.inputs["Roughness"].default_value = 0.6
    return m

def clear_and_assign_single_material(obj, mat):
    me = obj.data
    # 清空旧材质槽
    me.materials.clear()
    me.materials.append(mat)
    # 给所有面指定到 0 号材质槽（确保生效）
    mode(obj, 'EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.material_slot_set(assign=True)
    mode(obj, 'OBJECT')

# ============== 语义命名 ==============
def parse_name_map(s):
    # "Seat=seat,sitz,cushion;Legs=leg,gestell,frame"
    out = {}
    for part in s.split(";"):
        part = part.strip()
        if not part: continue
        if "=" in part:
            key, vals = part.split("=", 1)
            out[key.strip()] = [v.strip().lower() for v in vals.split(",") if v.strip()]
        else:
            out[part] = [part.lower()]
    return out

def guess_semantic_name(obj, mapping, bbox_dims: Vector):
    name_low = obj.name.lower()
    for slot, keys in mapping.items():
        if any(k in name_low for k in keys):
            return slot
    # 简单启发：更扁平/宽大的归 Seat，更细长高的归 Legs
    x,y,z = bbox_dims.x, bbox_dims.y, bbox_dims.z
    if max(x,y) > z * 1.5:
        return "Seat"
    if z > max(x,y) * 1.2:
        return "Legs"
    return "Part"

# ============== 主流程 ==============
def main():
    args = parse_args()
    NAME_MAP = parse_name_map(args["name_map"])
    COLOR_MAP = {
        "Seat": hex_to_rgba_f(args["seat_color"]),
        "Legs": hex_to_rgba_f(args["legs_color"]),
        "Part": (0.75,0.75,0.75,1.0),
    }

    clean_scene()
    import_gltf(args["in"])

    # 收集所有网格对象
    meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']

    # 如果只有一个对象，尽量拆开
    if len(meshes) == 1:
        obj = meshes[0]
        try:
            by_loose_parts(obj)
        except:
            # 若真是连体，先按锐边切
            split_by_sharp_then_loose(obj, args["angle"])
    else:
        # 多对象：对每个尝试松散分离
        for o in list(meshes):
            try:
                by_loose_parts(o)
            except:
                pass

    # 重新收集（分离后会产生新对象）
    meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']

    report = {
        "input": args["in"],
        "output": args["out"],
        "parts": []
    }

    # 逐个对象命名 & 指派材质
    for o in meshes:
        # 确保变换应用（有助于尺寸与导出）
        select(o)
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)

        sem = guess_semantic_name(o, NAME_MAP, o.dimensions)
        # 统一对象命名（保留原名方便排查）
        old_name = o.name
        o.name = f"{sem}_{old_name}"

        # 材质
        if args["keep_existing"]:
            if len(o.data.materials) == 0:
                mat = create_or_get_material(sem, COLOR_MAP.get(sem))
                clear_and_assign_single_material(o, mat)
        else:
            mat = create_or_get_material(sem, COLOR_MAP.get(sem))
            clear_and_assign_single_material(o, mat)

        report["parts"].append({
            "object": o.name,
            "semantic": sem,
            "dimensions": [o.dimensions.x, o.dimensions.y, o.dimensions.z],
            "materials": [m.name for m in o.data.materials if m],
        })

    # 导出
    os.makedirs(os.path.dirname(args["out"]), exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=args["out"],
        export_format='GLB',
        export_yup=True,
        export_apply=True,
        export_animations=False,
        use_selection=False,
        export_materials='EXPORT'
    )
    print("[OK] Exported:", args["out"])

    # 报告
    if args["report"]:
        with open(args["report"], "w", encoding="utf-8") as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        print("[REPORT]", args["report"])

if __name__ == "__main__":
    main()