import { Vector } from "./Vector";

export class Ray {
  /**
   * 
   * @param {Vector} origin Origin Point
   * @param {Vector} dir Direction Vector
   */
  constructor(origin, dir) {
    this.origin = origin;
    this.dir = dir;
    this.invdir = new Vector(1 / dir.x, 1 / dir.y);
    this.sign = {
      x: invdir.x < 0,
      y: invdir.y < 0
    };
  }


}
/**
 * Does a line-line intersection test
 * @param {Vector} a1 Line A start point
 * @param {Vector} a2 Line A end point
 * @param {Vector} b1 Line B start point
 * @param {Vector} b2 Line B end point
 */
export const lineIntersect = (a1, a2, b1, b2) => {
  const a = a2.subtract(a1);
  const b = b2.subtract(b1);
  const abDot = a.dotProduct(b);

  // if b dot d == 1, it means the lines are parallel so have infinite intersection points
  if (abDot == 1)
    return false;

  const c = b1 - a1;
  const t = c.dotProduct(b) / abDot;
  if (t < 0 || t > 1)
    return false;

  const u = c.dotProduct(a) / abDot;
  if (u < 0 || u > 1)
    return false;

  return a1 + t * a;
}

/**
 * 
 * @param {Ray} r The ray to check
 */
export function boxIntersect(r) { // TODO: maybe implement cohen-sutherland
  let tmin, tmax, tymin, tymax, tzmin, tzmax;



  tmin = (bounds[r.sign[0]].x - r.orig.x) * r.invdir.x;
  tmax = (bounds[1 - r.sign[0]].x - r.orig.x) * r.invdir.x;
  tymin = (bounds[r.sign[1]].y - r.orig.y) * r.invdir.y;
  tymax = (bounds[1 - r.sign[1]].y - r.orig.y) * r.invdir.y;


  if ((tmin > tymax) || (tymin > tmax))
    return false;
  if (tymin > tmin)
    tmin = tymin;
  if (tymax < tmax)
    tmax = tymax;

  tzmin = (bounds[r.sign[2]].z - r.orig.z) * r.invdir.z;
  tzmax = (bounds[1 - r.sign[2]].z - r.orig.z) * r.invdir.z;

  if ((tmin > tzmax) || (tzmin > tmax))
    return false;
  if (tzmin > tmin)
    tmin = tzmin;
  if (tzmax < tmax)
    tmax = tzmax;

  return true;
} 