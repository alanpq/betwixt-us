import { mousePos } from '../input.js'

export const style = {
  text: "white",
  button: "white",
  disabled: "white",
  hover: "white",
  active: "white",
}



/**
 * Draws a button at a specified point. Colours can be customized with style.fill, style.hover, etc. Returns true if the button has been pressed
 * @param {CanvasRenderingContext2D} ctx The canvas rendering context
 * @param {string} text Text to draw in the button
 * @param {number} x X position of the button
 * @param {number} y Y position of the button
 * @param {number} w Width of the button
 * @param {number} h Height of the button
 * @param {number} anchorX X position of anchor point [0-1]
 * @param {number} anchorY Y position of anchor point [0-1]
 * @returns {boolean} Whether the button has been pressed.
 */
export const drawButton = (ctx, text, x, y, w, h, anchorX = 0, anchorY = 0, disabled = false) => {
  const bb = {
    x: x - (w * anchorX),
    y: y - (h * anchorY)
  }
  let clicked = false;
  ctx.fillStyle = style.button;
  if (disabled) {
    ctx.fillStyle = style.disabled;
  } else if (mousePos.x >= bb.x && mousePos.x <= bb.x + w && mousePos.y >= bb.y && mousePos.y <= bb.y + h) {
    ctx.fillStyle = GetLeftMouse() ? style.active : style.hover;
    if (GetLeftMouseUp())
      clicked = true;
  }

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillRect(bb.x, bb.y, w, h);
  ctx.fillStyle = disabled ? style.disabledText : style.text;
  ctx.fillText(text, bb.x + w / 2, bb.y + 5 + h / 2, w);
  return clicked;
}

/**
 * Draws a button at a specified point. Colours can be customized with style.fill, style.hover, etc. Returns true if the button has been pressed
 * @param {CanvasRenderingContext2D} ctx The canvas rendering context
 * @param {CanvasImageSource} img Text to draw in the button
 * @param {number} x X position of the button
 * @param {number} y Y position of the button
 * @param {number} w Width of the button
 * @param {number} h Height of the button
 * @param {number} anchorX X position of anchor point [0-1]
 * @param {number} anchorY Y position of anchor point [0-1]
 * @returns {boolean} Whether the button has been pressed.
 */
export const drawImgButton = (ctx, img, x, y, size, anchorX = 0, anchorY = 0, disabled = false) => { // TODO: finish implementing
  const bb = {
    x: x - (size * anchorX),
    y: y - (size * anchorY)
  }
  let clicked = false;
  ctx.fillStyle = style.button;
  if (disabled) {
    ctx.fillStyle = style.disabled;
  } else if (mousePos.x >= bb.x && mousePos.x <= bb.x + w && mousePos.y >= bb.y && mousePos.y <= bb.y + h) {
    ctx.fillStyle = GetLeftMouse() ? style.active : style.hover;
    if (GetLeftMouseUp())
      clicked = true;
  }

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.beginPath();
  ctx.arc(x + w / 2, y + w / 2, w / 2)
  ctx.fillRect(bb.x, bb.y, w, h);
  ctx.fillStyle = disabled ? style.disabledText : style.text;
  ctx.fillText(text, bb.x + w / 2, bb.y + 5 + h / 2, w);
  return clicked;
}

// returns canvas
const drawCheckButton = (text) => {

  return
}