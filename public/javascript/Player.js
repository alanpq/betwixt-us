/**
 * @typedef {Object} Player
 * @property {Vector} position
 * @property {Vector} velocity
 */
class Player {

  constructor(basePlayer) {
    if (basePlayer) {
      this.id = basePlayer.id || "";
      this.pos = new Vector(basePlayer.pos.x, basePlayer.pos.y);
      this.velocity = new Vector(basePlayer.velocity.x, basePlayer.velocity.y);

      this.host = basePlayer.host || false;

      this.name = basePlayer.name || "";
      this.color = basePlayer.color || 0;
    } else {
      this.id = "";
      this.pos = new Vector(0, 0);
      this.velocity = new Vector(0, 0);

      this.host = false;

      this.name = "";
      this.color = 0;
    }
  }

  _drawCharacter(ctx, camera) {
    // ctx.fillRect(playerCanvas, player.pos.x - camera.x, player.pos.y - camera.y, 50, 50);
    ctx.fillStyle = colors[this.color];
    const width = 60;
    const height = 100;
    ctx.fillRect((this.pos.x - width / 2) - camera.x, (this.pos.y - height / 2) - camera.y, width, height);
    ctx.fillStyle = "white";
    ctx.shadowColor = "black";
    ctx.shadowBlur = 3;
    ctx.font = "bold 30px Kumbh Sans, sans-serif"
    ctx.textAlign = "center";
    ctx.fillText(this.name, this.pos.x, this.pos.y - width * 1.1);

    ctx.shadowColor = "";
    ctx.shadowBlur = 0;
  }

  draw(ctx, playerMask, visibilityGradMask, camera) {
    playerMask.clearRect(0, 0, W, H);
    playerLayer.clearRect(0, 0, W, H);

    playerMask.globalCompositeOperation = "source-over";
    playerMask.fillStyle = visibilityGradMask;
    playerMask.fillRect(0, 0, W, H);

    this._drawCharacter(playerLayer, camera);

    playerMask.globalCompositeOperation = "source-in";
    playerMask.drawImage(playerLayerCanvas, 0, 0);

    ctx.drawImage(playerMaskCanvas, camera.x, camera.y);
  }
}