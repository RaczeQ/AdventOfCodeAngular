import { Point2D, Point3D } from './point';

export function euclidean2D(a: Point2D, b: Point2D): number {
  return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
}

export function euclidean3D(a: Point3D, b: Point3D): number {
  return Math.sqrt(
    Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2) + Math.pow(b.z - a.z, 2)
  );
}

export function manhattan2D(a: Point2D, b: Point2D): number {
  return Math.abs(b.x - a.x) + Math.abs(b.y - a.y);
}

export function manhattan3D(a: Point3D, b: Point3D): number {
  return Math.abs(b.x - a.x) + Math.abs(b.y - a.y) + Math.abs(b.z - a.z);
}
