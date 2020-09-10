import { Vector } from "./Vector.js";
import { AABB } from './util.js'
import { ctx } from '../canvas.js'

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
      x: this.invdir.x < 0,
      y: this.invdir.y < 0
    };
  }


}

const shitDotProduct = (a, b) => {
  return a.x * b.y - a.y * b.x;
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
  const abDot = shitDotProduct(a, b);

  // if b dot d == 1, it means the lines are parallel so have infinite intersection points
  if (abDot == 1)
    return false;

  const c = b1.subtract(a1);
  const t = shitDotProduct(c, b) / abDot;
  if (t < 0 || t > 1)
    return false;

  const u = shitDotProduct(c, a) / abDot;
  if (u < 0 || u > 1)
    return false;

  return a1.add(a.multiply(t));
}

const rectNormals = [
  new Vector(0, -1),// top
  new Vector(0, 1), // bottom
  new Vector(-1, 0),// left
  new Vector(1, 0), // right
];

const rectTangents = [
  new Vector(1, 0), // top
  new Vector(-1, 0),// bottom
  new Vector(0, 1),// left
  new Vector(0, -1), // right
];

/**
 * 
 * @param {Ray} ray The ray to check
 * @param {AABB} bounds The box bounds
 */
export const boxIntersect = (ray, pos, bounds) => { // TODO: maybe implement cohen-sutherland
  const a = new Vector(bounds.x + pos.x, bounds.y + pos.y);
  const b = a.add(new Vector(bounds.w, 0));
  const c = a.add(new Vector(bounds.w, bounds.h));
  const d = a.add(new Vector(0, bounds.h));

  // ctx.fillStyle = "blue";
  // ctx.fillRect(a.x, a.y, 0.05, 0.05)
  // ctx.fillStyle = "orange";
  // ctx.fillRect(b.x, b.y, 0.05, 0.05)
  // ctx.fillStyle = "green";
  // ctx.fillRect(c.x, c.y, 0.05, 0.05)
  // ctx.fillStyle = "cyan";
  // ctx.fillRect(d.x, d.y, 0.05, 0.05)

  const rA = ray.origin;
  const rB = ray.origin.add(ray.dir);

  const sides = [
    lineIntersect(rA, rB, a, b), // top
    lineIntersect(rA, rB, c, d), // bottom
    lineIntersect(rA, rB, a, d), // left
    lineIntersect(rA, rB, b, c), // right
  ]

  let minDist = 100000;
  let minPoint = -1;
  sides.forEach((side, i) => {
    if (!side) return
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
      tangent: rectTangents[minPoint]
    }
  } else {
    return false
  }

} 