import * as twgl from '../javascript/lib/twgl-full.module.js'
import { sprites, drawSprite, getSprite, drawSpriteSheet, spriteShader, drawTex } from './sprite.js';
import { Vector } from './util/Vector.js'
import { colors, textureFromCanvas } from './util/util.js'
import { gl, ctx, canvas, overlayCanvas, W, H, nametagCanvas, nametagCtx } from './canvas.js'
import { camera, loadShader } from './render.js'
import { baseVisibility, gameOptions, gameState } from './state.js'
import { time } from './game.js'
import { hookPreload } from './hooks.js'
import { doPlayerPhysics } from './physics.js'

let sprite;
let maskSprite;
let playerShader;
let highlightShader;
let nametagShader;
let nametagSprite;
let crownSprite;
hookPreload(async () => {
  sprite = await getSprite(gl, "walksprite")
  maskSprite = await getSprite(gl, "walkspriteColor")
  nametagSprite = await getSprite(gl, "pixel")
  crownSprite = await getSprite(gl, "crown")
  playerShader = twgl.createProgramInfo(gl, [await loadShader("v_animSprite"), await loadShader("f_player")])
  highlightShader = twgl.createProgramInfo(gl, [await loadShader("v_animSprite"), await loadShader("f_highlight")])
  nametagShader = twgl.createProgramInfo(gl, [await loadShader("vertex"), await loadShader("f_player")])
})

const stepsPerSec = 4.1;

const width = 60;
const height = 100;

const origin = new Vector(0, .45);


const walkCycleSharpness = 4.5;
const walkCycleExtremumA = 0.3209;
const walkCycleExtremumB = 0.67218;

const wCLong = walkCycleExtremumA * 2;
const wCShort = walkCycleExtremumB - walkCycleExtremumA;

const calculateWalkCycle = (x) => {
  // if you want to understand this one, plug it into geogebra
  return 1 - Math.pow(Math.abs(Math.sin(Math.PI * x * stepsPerSec)), walkCycleSharpness)
}

/**
 * @typedef {Object} Player
 * @property {Vector} position
 * @property {Vector} velocity
 */
export default class Player {

  constructor(basePlayer) {
    /// REPLICATED VARIABLES
    if (basePlayer) {
      this.id = basePlayer.id || "";
      this.pos = new Vector(basePlayer.pos.x || 0, basePlayer.pos.y || 0);
      this.velocity = new Vector(basePlayer.velocity.x || 0, basePlayer.velocity.y || 0);

      this.host = basePlayer.host || false;

      this.name = basePlayer.name || "";
      this.color = basePlayer.color % colors.length || 0;
      this.dead = basePlayer.dead || false;
    } else {
      this.id = "";
      this.pos = new Vector(0, 0);
      this.velocity = new Vector(0, 0);

      this.host = false;

      this.name = "";
      this.color = 0;
      this.dead = false;
    }

    // NON-REPLICATED VARIABLES
    this.facing = true;
    this.moving = false;
    this.walkCycle = 0;
    this.isLocal = false;
    this.a = 0; // TODO: rename these
    this.b = 0;

    this.clientPos = this.pos.copy();


    this.generateNametag();
    console.log(
      `Player ${this.name}${this.host ? ' (host)' : ''}:
      ID - ${this.id}
      Color - ${this.color}`)
  }

  tick(dt) {
    if (!this.isLocal) {
      // this.clientPos = Vector.lerp(this.clientPos, this.pos, 10 * dt);
      // this.pos.addTo(this.velocity.multiply(dt * gameOptions.player_speed))
      if (this.dead)
        this.velocity.x = this.velocity.y = 0
      doPlayerPhysics(this, dt);
    }
  }

  generateNametag() {
    nametagCtx.fillStyle = "white";
    nametagCtx.clearRect(0, 0, nametagCanvas.width, nametagCanvas.height)
    nametagCtx.shadowColor = "black";
    nametagCtx.shadowBlur = 3;
    nametagCtx.font = `bold ${nametagCanvas.height * 0.6383}px Kumbh Sans, sans-serif`
    nametagCtx.textAlign = "center";
    nametagCtx.fillText(this.name, nametagCanvas.width / 2, nametagCanvas.height / 2);

    this.nametag = textureFromCanvas(gl, nametagCanvas, gl.RGBA);

    // Set the parameters so we can render any size image.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  }

  drawNametag(gl) {
    gl.disable(gl.DEPTH_TEST)
    if (this.isLocal)
      gl.disable(gl.STENCIL_TEST)
    gl.depthMask(true);
    // gl.stencilFunc(gl.NEVER, 1, 0xff);
    drawTex(gl, this.nametag, {
      x: this.pos.x - origin.x,
      y: this.pos.y - origin.y - 1.45,
      z: 51,
    }, camera.pos, [-nametagCanvas.width / (camera.zoom * 2), nametagCanvas.height / (camera.zoom * 2)], nametagShader, {
      u_lightPosition: [W / 2, H / 2],
      u_radius: baseVisibility * camera.zoom,
      u_colorTexture: nametagSprite,
      u_tint: [1, 1, 1, 0],
      u_cutThreshold: 0,
      u_frameOffset: 0,
      u_spritesPerRow: 1,
      u_numFrames: 1,
    });
    if (this.host)
      drawTex(gl, crownSprite, {
        x: this.pos.x - origin.x,
        y: this.pos.y - origin.y - 1.75 - nametagCanvas.height / (camera.zoom * 2),
        z: 50,
      }, camera.pos, [0.25, 0.25], spriteShader, {
        u_lightPosition: [W / 2, H / 2],
        u_radius: baseVisibility * camera.zoom,
        u_tint: [1, 1, 1, 1],
        u_cutThreshold: 0,
      });
    gl.enable(gl.STENCIL_TEST)
    gl.enable(gl.DEPTH_TEST)
    gl.depthMask(true);
  }

  /**
   * 
   * @param {WebGLRenderingContext} gl 
   * @param {[number, number, number, number]} color 
   */
  drawHighlight(gl, color = [1, 1, 1, 1]) {
    gl.enable(gl.DEPTH_TEST);
    drawSprite(gl, sprite,
      this.pos.add(new Vector(0, -this.b * 0.4 * this.moving)).subtract(origin), // add vertical offset based on cycle function
      true,
      color,
      [(this.facing * 2 - 1) * 1.1, 1.1],
      highlightShader,
      {
        u_lightPosition: [W / 2, H / 2],
        u_radius: baseVisibility * camera.zoom,
        u_colorTexture: maskSprite,
        u_frameOffset: this.moving ? this.walkCycle : 0,
        u_spritesPerRow: 5,
        u_numFrames: 5,
        u_cutThreshold: 1,
      }, -this.pos.y + 0.01)
  }

  /**
   * 
   * @param {WebGLRenderingContext} gl
   * @param {number} dt 
   */
  draw(gl, dt) {
    /*
    this ones real fun to read shang trust
    Math.sin(Math.PI * time) has a period of 1 second
    every footstep (arc from ground to sky back to ground) goes through 3 frames, where the last frame of one step is the first frame of the next
    */

    this.a = calculateWalkCycle((time - dt) - 0.1);
    this.b = calculateWalkCycle((time) - 0.1);
    if (Math.round(this.a) != Math.round(this.b)) // TODO: investigate offset walk cycle bug (link between lag + skipping frames?)
      this.walkCycle = this.walkCycle > 3 ? 1 : this.walkCycle + 1;

    drawSprite(gl, sprite,
      this.pos.add(new Vector(0, -this.b * 0.4 * this.moving)).subtract(origin), // add vertical offset based on cycle function
      true,
      this.dead ? [...colors[this.color].slice(0, 3).map((v, i, a) => {
        return v * 0.5;
      }), 1] : colors[this.color],
      [this.facing * 2 - 1, this.dead ? 0.5 : 1],
      playerShader,
      {
        u_lightPosition: [W / 2, H / 2],
        u_radius: baseVisibility * camera.zoom,
        u_colorTexture: maskSprite,
        u_frameOffset: this.moving && !this.dead ? this.walkCycle : 0,
        u_spritesPerRow: 5,
        u_numFrames: 5,
        u_cutThreshold: 1,
      }, -this.pos.y)

    // ctx.fillStyle = "black"
    // ctx.fillRect(this.pos.x, this.pos.y, 0.1, 0.1);

    // drawSprite(gl, sprite, this.pos, true, colors[this.color], 1, spriteShader, {
    //   u_lightPosition: [W / 2, H / 2],
    //   u_radius: baseVisibility * camera.zoom,
    // })

    // ctx.fillStyle = "white";
    // ctx.shadowColor = "black";
    // ctx.shadowBlur = 3;
    // ctx.font = "bold 0.5px Kumbh Sans, sans-serif"
    // ctx.textAlign = "center";
    // ctx.fillText(this.name, this.pos.x, this.pos.y - 1.5);
    // ctx.font = "bold 0.5px monospace"



    // ctx.fillStyle = "white";
    // ctx.shadowColor = "black";
    // ctx.shadowBlur = 3;
    // ctx.font = "bold 0.5px monospace"
    // ctx.textAlign = "center";

    // ctx.fillText(this.walkCycle, this.pos.x, this.pos.y + 1)
    // ctx.fillRect(this.pos.x - (Math.round(this.a) * 1.5) / 2, this.pos.y + 1.25, Math.round(this.a) * 1.5, 0.25);
    // ctx.fillRect(this.pos.x - (Math.round(this.b) * 1.5) / 2, this.pos.y + 1.55, Math.round(this.b) * 1.5, 0.25);
    // ctx.fillText(time.toPrecision(5), this.pos.x, this.pos.y + 2.5)

    // ctx.shadowColor = "";
    // ctx.shadowBlur = 0;
  }
}

