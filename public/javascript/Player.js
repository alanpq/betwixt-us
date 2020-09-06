/**
 * @typedef {Object} Player
 * @property {Vector} position
 * @property {Vector} velocity
 */
class Player {
  constructor(pos = Vector.zero, velocity = Vector.zero) {
    this.pos = pos;
    this.velocity = velocity;

    this.name = "";
    this.color = 0;
  }
}