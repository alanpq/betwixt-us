/**
 * @typedef {Object} Player
 * @property {Vector} position
 * @property {Vector} velocity
 */
class Player {
  constructor() {
    this.id = "";
    this.pos = new Vector(0, 0);
    this.velocity = new Vector(0, 0);

    this.name = "";
    this.color = 0;
  }

  draw(ctx, camera) {
    // ctx.fillRect(playerCanvas, player.pos.x - camera.x, player.pos.y - camera.y, 50, 50);
    ctx.fillStyle = colors[this.color];
    ctx.fillRect(this.pos.x - 25 - camera.x, this.pos.y - 25 - camera.y, 50, 50);
  }
}