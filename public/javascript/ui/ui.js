import { fillStrokedText } from '../util/util.js'
import { gl, canvas, overlayCanvas, ctx, W, H, minAxis, resizeCanvas, recalculateResVars } from '../canvas.js'
import * as button from './button.js'
import { gameState, gameOptions } from '../state.js';
import { camera } from '../render.js';
import * as input from '../input.js'
import { socket } from '../socket.js';

export const options = {
  fpsDisplay: true, // 0 - off, 1 - fps, 2 - full,
  showPos: true,
  drawCollInfo: false,
}



// Framerate Variables
let frameTimeSum = 0;
let frameTimeMin = 10000;
let frameTimeMax = -10000;
let frameTimeI = 0;
let frameTimeSamples = new Array(99);
const frameTimeSampleCount = 100;

export const tickUI = (prev, now) => {
  if (options.fpsDisplay) {
    const dt = now - prev
    frameTimeSum -= frameTimeSamples[frameTimeI] || 0;
    frameTimeSamples[frameTimeI] = dt;
    frameTimeSum += dt;
    frameTimeMin = dt < frameTimeMin ? dt : frameTimeMin;
    frameTimeMax = dt > frameTimeMax ? dt : frameTimeMax;
    frameTimeI = frameTimeI >= frameTimeSampleCount - 1 ? 0 : frameTimeI + 1;
  }
}

let dialogueOpen = false;
let optionsBounds = {
  w: W * 0.33,
  h: H * 0.75,
}
optionsBounds.x = W / 2 - optionsBounds.w / 2;
optionsBounds.y = H / 2 - optionsBounds.h / 2;

const drawOptions = () => {
  input.UnEatMouse();
  ctx.fillStyle = "#111";
  ctx.fillRect(optionsBounds.x, optionsBounds.y, optionsBounds.w, optionsBounds.h)

  if (button.drawButton(ctx, "x", optionsBounds.x + optionsBounds.w - 10, optionsBounds.y + 10, 25, 25, 1, 0, false, 0))
    closeWindow();

  let yOff = 50;
  const size = optionsBounds.w * 0.075;
  ctx.fillStyle = "white";
  ctx.textAlign = "left";
  ctx.textBaseline = "hanging";
  ctx.font = `${size * 0.75}px Kumbh Sans, sans-serif`
  options.fpsDisplay = button.drawCheckbox(ctx, options.fpsDisplay, optionsBounds.x + 10, optionsBounds.y + yOff, size, 0, 0, false)
  ctx.fillText("FPS Counter", optionsBounds.x + 20 + size, optionsBounds.y + yOff - 5 + size / 2);
  yOff += size + 5

  options.showPos = button.drawCheckbox(ctx, options.showPos, optionsBounds.x + 10, optionsBounds.y + yOff, size, 0, 0, false)
  ctx.fillText("Show position", optionsBounds.x + 20 + size, optionsBounds.y + yOff - 5 + size / 2);
  yOff += size + 5

  options.drawCollInfo = button.drawCheckbox(ctx, options.drawCollInfo, optionsBounds.x + 10, optionsBounds.y + yOff, size, 0, 0, false)
  ctx.fillText("Draw collision info", optionsBounds.x + 20 + size, optionsBounds.y + yOff - 5 + size / 2);
  yOff += size + 5

  ctx.textBaseline = "middle";
}

const drawNumber = (value, x, y, inc = 0.25, customString = null) => {
  const buttonSize = minAxis * 0.05;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText(customString || value.toFixed(2), x + buttonSize + minAxis * 0.05, y + 5);
  if (button.drawButton(ctx, "<", x, y, buttonSize, buttonSize, 0, 0.5, false, 0)) {
    value -= inc
  }
  if (button.drawButton(ctx, ">", x + buttonSize + minAxis * 0.1, y, buttonSize, buttonSize, 0, 0.5, false, 0)) {
    value += inc
  }
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  return value;
}

const drawGameOptions = () => {
  input.UnEatMouse();
  ctx.fillStyle = "#111";
  ctx.fillRect(optionsBounds.x, optionsBounds.y, optionsBounds.w, optionsBounds.h)

  if (button.drawButton(ctx, "x", optionsBounds.x + optionsBounds.w - 10, optionsBounds.y + 10, 25, 25, 1, 0, false, 0))
    closeWindow();

  let yOff = 70;
  const size = minAxis * 0.05;
  ctx.fillStyle = "white";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.font = `${optionsBounds.w * 0.075 * 0.7}px Kumbh Sans, sans-serif`
  button.clean();

  gameOptions.player_speed = drawNumber(Math.max(gameOptions.player_speed, 1), optionsBounds.x + 10 + optionsBounds.w / 2, optionsBounds.y + yOff, 0.25)
  ctx.fillText("Player Speed", optionsBounds.x + 20, optionsBounds.y + yOff);
  yOff += size + 5

  gameOptions.crew_visibility = drawNumber(Math.max(gameOptions.crew_visibility, 1), optionsBounds.x + 10 + optionsBounds.w / 2, optionsBounds.y + yOff, 0.25)
  ctx.fillText("Innocent Visibility", optionsBounds.x + 20, optionsBounds.y + yOff);
  yOff += size + 5

  gameOptions.kill_counter = drawNumber(Math.max(5, gameOptions.kill_counter), optionsBounds.x + 10 + optionsBounds.w / 2, optionsBounds.y + yOff, 5, gameOptions.kill_counter + ' sec')
  ctx.fillText("Kill Counter", optionsBounds.x + 20, optionsBounds.y + yOff);
  yOff += size + 5

  gameOptions.kill_range = drawNumber(Math.max(1.75, gameOptions.kill_range), optionsBounds.x + 10 + optionsBounds.w / 2, optionsBounds.y + yOff, 5)
  ctx.fillText("Kill Range", optionsBounds.x + 20, optionsBounds.y + yOff);
  yOff += size + 5

  if (button.dirty) {
    console.log("Sending new game options to server...");
    socket.emit('gameOptions', gameOptions)
    recalculateResVars();
  }

  ctx.textBaseline = "middle";
}


/**
 * @typedef {"options" | "gameOptions"} WindowType
 */
const windows = {
  options: drawOptions,
  gameOptions: drawGameOptions
}

let curWindow = null;

/**
 * 
 * @param {WindowType} window 
 */
export const openWindow = (window) => {
  curWindow = window;
}

export const closeWindow = () => {
  curWindow = null;
}


export const drawUI = (ctx, dt, socket, playerCount, locPlayer) => {
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  if (curWindow) {
    input.EatMouse(); // TODO: better options menu
  }

  ctx.font = "20px 'Roboto Mono'";
  ctx.fillStyle = "white";
  ctx.strokeStyle = "black";

  ctx.lineWidth = 0.5;
  ctx.textAlign = "left";
  const avgFrameTime = (frameTimeSum / frameTimeSamples.length);
  if (options.fpsDisplay) {
    ctx.fillText(`    Avg Frame Time: ${(avgFrameTime).toPrecision(4)} ms`, 5, 15);
    ctx.fillText(`Min/Max Frame Time: ${(frameTimeMin).toPrecision(4)}/${(frameTimeMax).toPrecision(4)} ms`, 5, 35);
  }
  if (options.fpsDisplay) {
    ctx.fillText(`${options.fpsDisplay ? '           ' : ''}Avg FPS: ${(1000 / avgFrameTime).toPrecision(6)} FPS`, 5, 60);
    if (frameTimeSamples[frameTimeI] <= frameTimeMin)
      frameTimeMin = 100000;
    if (frameTimeSamples[frameTimeI] >= frameTimeMax)
      frameTimeMax = -100000;


    // ctx.font = "10px Kumbh Sans, sans-serif"
    // ctx.beginPath()
    // ctx.moveTo(5, 0);
    // for (let i = 0; i < frameTimeSampleCount; i++) {
    //   ctx.lineTo(5 + frameTimeSamples[i] * 10000, (H / frameTimeSampleCount) * i);
    // }
    // ctx.fillRect(0, (H / frameTimeSampleCount) * frameTimeI, 200, 1);
    // ctx.stroke();
  }

  ctx.lineWidth = 1;
  ctx.textAlign = "center";
  ctx.font = "50px Kumbh Sans, sans-serif";
  // TODO: use non canvas HUD overlay for finer text control?
  fillStrokedText(ctx, socket.nsp.slice(1), W / 2, H - 43);
  ctx.font = "30px Kumbh Sans, sans-serif";
  ctx.fillStyle = playerCount < 4 ? "#ff0000" : "#00ff00"
  fillStrokedText(ctx, `${playerCount}/10`, W / 2, H - 93);

  if (locPlayer.host) {
    ctx.font = "50px Kumbh Sans, sans-serif";
    if (button.drawButton(ctx, "Start", W / 2, H - 130, 250, 80, 0.5, 1, playerCount < 4))
      console.log('start game!!')
  }

  if (button.drawButton(ctx, "Options", W - 10, 10, 100, 100, 1, 0, false))
    openWindow("options")

  ctx.textAlign = "right";
  ctx.font = "30px Kumbh Sans, sans-serif";
  fillStrokedText(ctx, Math.max(0, gameState.killCounter.toFixed(0)), W - 10, H - 43)

  ctx.fillStyle = "white"
  ctx.font = "11px 'Roboto Mono'"
  ctx.textAlign = "right"
  if (options.showPos) {
    ctx.fillText(locPlayer.pos, W - 120, 16);
    ctx.fillText(camera.pos, W - 120, 26);
    ctx.fillText(camera.zoom, W - 120, 36);
    ctx.fillText((camera.zoom / gl.canvas.width) / 2, W - 120, 46);
  }

  if (curWindow)
    windows[curWindow]();

  // ctx.fillText(["held", "down", "down", "unheld", "just unheld", "asdagrhjasgejhasg"][input.mouseState], W / 2, 100);


  // TODO need a better human to debug this
  // ctx.drawImage(randomUiFunc(), 0, 0)
  // ctx.drawImage(scoreCanvas, 0, 0)
}

const randomUiFunc = () => {
  // ui components are dont move and stay in their seperate areas, when they update the space they takeup is cleared
  uiCtx.fillStyle = "white"
  let epic = drawButton(ctx, "call meting", W / 2, H - 130, 250, 80, 0.5, 1)
  return uiCanvas
}

/** @type {Canvas} */
// let scoreCanvas = document.createElement('canvas')
// scoreCanvas.width = 300
// scoreCanvas.height = 200

// /** @type {CanvasRenderingContext2D} */
// let scoreCtx = scoreCanvas.getContext('2d')
// let curScoreAmnt = 0;
// let scoreDirty = false;

// const scoreUIDraw = (dt) => {

//   scoreCtx.fillStyle = "white"
//   scoreCtx.fillRect(0, 0, 20, 200)
//   scoreCtx.fillRect(280, 0, 20, 200)
//   scoreCtx.stroke()
//   scoreCtx.fillStyle = "green"
//   scoreCtx.fillRect(20, 70, (curScoreAmnt / gameOptions.max_score) * 260, 60)

//   if (dt) {
//     curScoreAmnt = lerp(curScoreAmnt, gameState.score, 20 * dt);
//     if (gameState.score - curScoreAmnt <= EPSILON) scoreDirty = false;
//   } else
//     scoreDirty = true;
// }