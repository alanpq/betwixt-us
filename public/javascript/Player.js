import * as twgl from '../javascript/lib/twgl-full.module.js'
import { sprites, drawSprite, getSprite } from './sprite.js';
import { Vector } from './util/Vector.js'
import { gl } from './render.js'
import { colors } from './util/util.js'


let sprite;
(async () => {
  sprite = await getSprite(gl, "ball")
})()

/**
 * @typedef {Object} Player
 * @property {Vector} position
 * @property {Vector} velocity
 */
export default class Player {

  constructor(basePlayer) {
    if (basePlayer) {
      this.id = basePlayer.id || "";
      this.pos = new Vector(basePlayer.pos.x, basePlayer.pos.y);
      this.velocity = new Vector(basePlayer.velocity.x, basePlayer.velocity.y);

      this.host = basePlayer.host || false;

      this.name = basePlayer.name || "";
      this.color = basePlayer.color % colors.length || 0;
    } else {
      this.id = "";
      this.pos = new Vector(0, 0);
      this.velocity = new Vector(0, 0);

      this.host = false;

      this.name = "";
      this.color = 0;
    }
    console.log(
      `Player ${this.name}${this.host ? ' (host)' : ''}:
      ID - ${this.id}
      Color - ${this.color}`)
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

  async draw(gl, camera) {
    // const uniforms = {
    //   matrix: twgl.m4.identity(),
    //   tint: [1, 1, 0, 1]
    // };

    // // console.log(10 - (this.pos.y / 100))
    // // twgl.m4.perspective(Math.PI, gl.canvas.width / gl.canvas.height, 0.1, 100, uniforms.matrix);
    // twgl.m4.ortho(0, gl.canvas.width / camera.zoom, gl.canvas.height / camera.zoom, 0, -100, 100, uniforms.matrix);
    // twgl.m4.translate(uniforms.matrix, [this.pos.x - camera.pos.x, 5.5, this.pos.y * 10], uniforms.matrix)
    // // twgl.m4.scale(uniforms.matrix, [1, 1, 1], uniforms.matrix)

    // gl.useProgram(programInfo.program)
    // twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    // twgl.setUniforms(programInfo, uniforms);
    // twgl.drawBufferInfo(gl, bufferInfo, gl.TRIANGLES);
    drawSprite(gl, sprite, this.pos, true, colors[this.color])
  }
}

