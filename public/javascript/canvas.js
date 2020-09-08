import { debounce } from './util/util.js'
import { camera } from './render.js';
import { baseVisibility, gameOptions, gameState } from './state.js'

/** @type {HTMLCanvasElement} */
export const canvas = document.getElementById("canvas");
/** @type {HTMLCanvasElement} */
export const overlayCanvas = document.getElementById("overlayCanvas");

export var W, H;
var WSF, HSF;
const resizeCanvas = () => {
  W = canvas.width = overlayCanvas.width = (window.innerWidth || document.body.clientWidth);
  H = canvas.height = overlayCanvas.height = (window.innerHeight || document.body.clientHeight);
  WSF = W / 355;
  HSF = H / 600;
  camera.zoom = (Math.min(W, H) * 0.45) / (baseVisibility * gameOptions.crew_visibility);
}
resizeCanvas();

window.addEventListener('resize', debounce(resizeCanvas, 100));
window.addEventListener('fullscreenchange', debounce(resizeCanvas, 500));