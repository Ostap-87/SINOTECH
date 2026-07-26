export interface PointCloud {
  positions: Float32Array
}

export type ShapeGenerator = (count: number) => PointCloud
