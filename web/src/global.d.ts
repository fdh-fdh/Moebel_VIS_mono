// web/src/global.d.ts
declare namespace JSX {
  interface IntrinsicElements {
    "model-viewer": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      src?: string;
      alt?: string;
      "camera-controls"?: boolean;
      "auto-rotate"?: boolean;
      exposure?: string | number;
      "shadow-intensity"?: string | number;
    };
  }
}