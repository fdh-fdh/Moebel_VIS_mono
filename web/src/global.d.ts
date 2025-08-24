declare namespace JSX {
  interface IntrinsicElements {
    "model-viewer": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    > & {
      src?: string;
      alt?: string;
      "ios-src"?: string;
      ar?: boolean;
      "ar-modes"?: string;
      "ar-scale"?: "fixed" | "auto";
      "ar-placement"?: "floor" | "wall";
      "xr-environment"?: boolean;
      "camera-controls"?: boolean;
      "auto-rotate"?: boolean;
      exposure?: string | number;
      "shadow-intensity"?: string | number;
      "shadow-softness"?: string | number;
      class?: string;
    };
  }
}