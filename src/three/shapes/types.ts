export interface PointCloud {
  positions: Float32Array
  colors: Float32Array
}

export type ShapeGenerator = (count: number) => PointCloud
