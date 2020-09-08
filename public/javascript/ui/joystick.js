import { drawSprite, getSprite } from "../sprite.js";

import { gl, m4, loadShader, camera } from '../render.js'
import { joystick } from '../input.js'

import { Vector } from '../util/Vector.js'
import { canvas, overlayCanvas, W, H } from '../canvas.js'

let joystickTouchID = null;
// export let joystick = new Vector();
/**
 * @type {Vector}
 */
const joystickBase = new Vector();
export let joystickSize = 40;
let realSize = 0;

window.addEventListener("touchstart", (e) => {

  if (document.fullscreenElement == null)
    document.body.requestFullscreen();

  if (joystickTouchID == null) {
    joystickBase.x = e.changedTouches[0].clientX;
    joystickBase.y = e.changedTouches[0].clientY;
    // if (joystickBase.x <= W / 2)
    joystickTouchID = e.changedTouches[0].identifier;

    realSize = (joystickSize * (W / 355));

    dom_joystickBase.style.display = dom_joystick.style.display = 'inline';
    dom_joystickBase.style.left = (joystickBase.x - realSize / 2) + 'px';
    dom_joystickBase.style.top = (joystickBase.y - realSize / 2) + 'px';

    dom_joystick.style.left = (joystickBase.x - realSize * 0.4 / 2) + 'px';
    dom_joystick.style.top = (joystickBase.y - realSize * 0.4 / 2) + 'px';

    dom_joystickBase.style.width = dom_joystickBase.style.height = realSize + 'px';
    dom_joystick.style.width = dom_joystick.style.height = (realSize * 0.4) + 'px';

  }
  e.preventDefault();
}, false)

window.addEventListener("touchmove", (e) => {
  for (let touch of e.changedTouches) {
    if (touch.identifier == joystickTouchID) {
      joystick.x = (touch.clientX - joystickBase.x) / realSize;
      joystick.y = (touch.clientY - joystickBase.y) / realSize;
      if (joystick.getMagnitude() > 1)
        joystick.setMagnitude(1);
      dom_joystick.style.left = ((joystickBase.x + joystick.x * realSize * 0.5) - realSize * 0.4 / 2) + 'px';
      dom_joystick.style.top = ((joystickBase.y + joystick.y * realSize * 0.5) - realSize * 0.4 / 2) + 'px';
    }
  }
  e.preventDefault();
}, canvas)

window.addEventListener("touchend", (e) => {
  if (e.changedTouches[0].identifier == joystickTouchID) {
    joystick.x = 0;
    joystick.y = 0;
    joystickTouchID = null;
    dom_joystickBase.style.display = 'none';
    dom_joystick.style.display = 'none';
  }
  e.preventDefault();
})

const dom_joystick = document.getElementById("joystick");
const dom_joystickBase = document.getElementById("joystickBase");

/**
 * Draws the joystick
 * @param {WebGLRenderingContext} gl
 * @param {number} dt
 */
export const drawJoystick = async (dt) => {
  if (joystickTouchID != null || true) {
    // drawSprite(gl, await getSprite(gl, "box"), joystickBase, false, [66 / 255, 76 / 255, 91 / 255, 1]);
    // drawSprite(gl, await getSprite(gl, "box"), joystickBase, false, [66 / 255, 76 / 255, 91 / 255, 1]);
    // ctx.arc(joystickBase.x, joystickBase.y,
    //   (joystickSize * (W / 355)),
    //   0, 2 * Math.PI);
    // ctx.fill();
    // [66, 76, 91, 0.75]

    // ctx.beginPath();
    // ctx.arc(
    //   joystickBase.x + (joystick.x * (joystickSize * (W / 355))),
    //   joystickBase.y + (joystick.y * (joystickSize * (W / 355))),
    //   (joystickSize * (W / 355)) * 0.40,
    //   0, 2 * Math.PI);
    // ctx.fill();
  }
}

/**
 * Draws the joystick
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} dt
 */
// export const drawJoystick = (ctx, dt) => {
//   if (joystickTouchID != null) {
//     ctx.fillStyle = "rgba(66,76,91,0.5)";
//     ctx.beginPath();
//     ctx.arc(joystickBase.x, joystickBase.y,
//       (joystickSize * (W / 355)),
//       0, 2 * Math.PI);
//     ctx.fill();
//     ctx.fillStyle = "rgba(66,76,91,0.75)";

//     ctx.beginPath();
//     ctx.arc(
//       joystickBase.x + (joystick.x * (joystickSize * (W / 355))),
//       joystickBase.y + (joystick.y * (joystickSize * (W / 355))),
//       (joystickSize * (W / 355)) * 0.40,
//       0, 2 * Math.PI);
//     ctx.fill();
//   }
// }