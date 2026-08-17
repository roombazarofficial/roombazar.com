export interface Photo {
  id: string;
  url: string;
  width: number;
  height: number;
  /** Rendered while the image loads. Matters on slow mobile connections. */
  blurhash: string | null;
  position: number;
}
