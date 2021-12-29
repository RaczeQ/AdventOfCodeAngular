export interface Point2D {
  x: number;
  y: number;
}

export interface Point3D extends Point2D {
  z: number;
}

export function points2DEqual(a: Point2D, b: Point2D): boolean {
  return a.x == b.x && a.y == b.y;
}

export function points3DEqual(a: Point3D, b: Point3D): boolean {
  return a.x == b.x && a.y == b.y && a.z == b.z;
}
