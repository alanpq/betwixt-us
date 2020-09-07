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

    this.host = false;

    this.name = "";
    this.color = 0;
  }

  draw(ctx, camera) {
    // ctx.fillRect(playerCanvas, player.pos.x - camera.x, player.pos.y - camera.y, 50, 50);
    ctx.fillStyle = colors[this.color];
    const width = 15 * WSF;
    const height = 22 * WSF;
    ctx.fillRect(this.pos.x - width / 2, this.pos.y - height / 2, width, height);
    ctx.fillStyle = "white";
    ctx.shadowColor = "black";
    ctx.shadowBlur = 3;
    ctx.font = "bold 30px Kumbh Sans, sans-serif"
    ctx.textAlign = "center";
    ctx.fillText(this.name, this.pos.x, this.pos.y - width * 1.1);

    ctx.shadowColor = "";
    ctx.shadowBlur = 0;
  }
}