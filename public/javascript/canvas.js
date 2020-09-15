import * as twgl from './lib/twgl-full.module.js'
import { Vector } from './util/Vector.js'
import { debounce } from './util/util.js'
import { camera } from './render.js';
import { baseVisibility, gameOptions, locPlayer } from './state.js'

// CANVASES

/** @type {HTMLCanvasElement} */
export const canvas = document.getElementById("canvas");
/** @type {HTMLCanvasElement} */
export const overlayCanvas = document.getElementById("overlayCanvas");
/** @type {HTMLCanvasElement} */
export const nametagCanvas = document.createElement("canvas");


/// RENDERING CONTEXTS

/** @type {WebGLRenderingContext} */
export const gl = twgl.getContext(canvas, {
  alpha: false,
  stencil: true,
  antialias: true,
  desynchronized: true,
  powerPreference: 'high-performance',
});
/** @type {CanvasRenderingContext2D} */
export const ctx = overlayCanvas.getContext("2d", { alpha: true })
/** @type {CanvasRenderingContext2D} */
export const nametagCtx = nametagCanvas.getContext("2d", { alpha: true })

export const resizeHooks = [];

export var W, H;
export var minAxis;
var WSF, HSF;
export const resizeCanvas = () => {
  W = canvas.width = overlayCanvas.width = (window.innerWidth || document.body.clientWidth);
  H = canvas.height = overlayCanvas.height = (window.innerHeight || document.body.clientHeight);
  minAxis = Math.min(W, H);
  nametagCanvas.width = minAxis * 0.17;
  nametagCanvas.height = minAxis * 0.052;

  console.log(`Resized overlay canvas to ${overlayCanvas.width}x${overlayCanvas.height} pixels`)
  console.log(`Resized nametag canvas to ${nametagCanvas.width}x${nametagCanvas.height} pixels`)

  WSF = W / 355;
  HSF = H / 600;
  recalculateResVars();
  for (let hook of resizeHooks)
    hook();
}

export const recalculateResVars = () => {
  if (camera && locPlayer) {
    camera.zoom = (minAxis * 0.45) / Math.max(baseVisibility * gameOptions.crew_visibility, 8);
    camera.W = W / camera.zoom;
    camera.H = H / camera.zoom;
    camera.pos = locPlayer.pos.subtract(new Vector(camera.W / 2, camera.H / 2))
  }
}
resizeCanvas();

window.addEventListener('resize', debounce(resizeCanvas, 100));
window.addEventListener('fullscreenchange', debounce(resizeCanvas, 500));