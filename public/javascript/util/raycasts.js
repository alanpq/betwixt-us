import { Vector } from "./Vector.js";
import { AABB } from './util.js'
import { ctx } from '../canvas.js';

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

  const c = b1.subtract(a1);
  const t = c.dotProduct(b) / abDot;
  if (t < 0 || t > 1)
    return false;

  const u = c.dotProduct(a) / abDot;
  if (u < 0 || u > 1)
    return false;

  return a1.add(a.multiply(t));
}

const rectNormals = [
  new Vector(0, 1),
  new Vector(0, -1),
  new Vector(-1, 0),
  new Vector(1, 0),
];

/**
 * 
 * @param {Ray} ray The ray to check
 * @param {AABB} bounds The box bounds
 */
export function boxIntersect(ray, bounds) { // TODO: maybe implement cohen-sutherland
  const a = new Vector2(bounds.x, bounds.y);
  const b = a.add(new Vector2(bounds.w, 0));
  const c = a.add(new Vector2(bounds.w, bounds.h));
  const d = a.add(new Vector2(0, bounds.h));

  const rA = ray.origin;
  const rB = ray.origin.add(ray.dir);

  const sides = [
    lineIntersect(rA, rB, a, b), // top
    lineIntersect(rA, rB, c, d), // bottom
    lineIntersect(rA, rB, a, c), // left
    lineIntersect(rA, rB, b, d), // right
  ]

  let minDist = 100000;
  let minPoint = -1;
  sides.forEach((side, i) => {
    let dist = rA.subtract(side).getSqrtMagnitude();
    if (dist < minDist) {
      minPoint = i;
      minDist = dist;
    }
  })
  if (minPoint != -1) {
    return {
      point: sides[minPoint],
      normal: rectNormals[minPoint],
    }
  } else {
    return false
  }

} 