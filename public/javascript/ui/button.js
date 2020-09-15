import { mousePos, GetLeftMouse, GetLeftMouseUp } from '../input.js'

export const style = {
  fg: "white",
  bg: "#606060",
  disabledBg: "#555",
  disabledFg: "#666",
  hover: "#7a7a7a",
  active: "#545454",
}

export let dirty = false;


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
export const drawButton = (ctx, text, x, y, w, h, anchorX = 0, anchorY = 0, disabled = false, textOff = 5) => {
  const bb = {
    x: x - (w * anchorX),
    y: y - (h * anchorY)
  }
  let clicked = false;
  ctx.fillStyle = style.bg;
  if (disabled) {
    ctx.fillStyle = style.disabledBg;
  } else if (mousePos.x >= bb.x && mousePos.x <= bb.x + w && mousePos.y >= bb.y && mousePos.y <= bb.y + h) {
    ctx.fillStyle = GetLeftMouse(true) ? style.active : style.hover;
    if (GetLeftMouseUp(true)) {
      clicked = true;
      dirty = true;
    }
  }

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillRect(bb.x, bb.y, w, h);
  ctx.fillStyle = disabled ? style.disabledFg : style.fg;
  ctx.fillText(text, bb.x + w / 2, bb.y + textOff + h / 2, w);
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
  ctx.fillStyle = style.bg;
  if (disabled) {
    ctx.fillStyle = style.disabledBg;
  } else if (mousePos.x >= bb.x && mousePos.x <= bb.x + w && mousePos.y >= bb.y && mousePos.y <= bb.y + h) {
    ctx.fillStyle = GetLeftMouse(true) ? style.active : style.hover;
    if (GetLeftMouseUp(true)) {
      clicked = true;
      dirty = true;
    }
  }

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.beginPath();
  ctx.arc(x + w / 2, y + w / 2, w / 2)
  ctx.fillRect(bb.x, bb.y, w, h);
  ctx.fillStyle = disabled ? style.disabledFg : style.fg;
  ctx.fillText(text, bb.x + w / 2, bb.y + 5 + h / 2, w);
  return clicked;
}

/**
 * Draws a checkbox at a specified point. Colours can be customized with style.fill, style.hover, etc. Returns the new value of the checkbox
 * @param {CanvasRenderingContext2D} ctx The canvas rendering context
 * @param {CanvasImageSource} img Text to draw in the button
 * @param {number} x X position of the button
 * @param {number} y Y position of the button
 * @param {number} size Size of the button
 * @param {number} anchorX X position of anchor point [0-1]
 * @param {number} anchorY Y position of anchor point [0-1]
 * @returns {boolean} New checkbox value
 */
export const drawCheckbox = (ctx, checked, x, y, size, anchorX = 0, anchorY = 0, disabled = false) => {
  const bb = {
    x: x - (size * anchorX),
    y: y - (size * anchorY)
  }
  ctx.fillStyle = style.bg;
  if (disabled) {
    ctx.fillStyle = style.disabledBg;
  } else if (mousePos.x >= bb.x && mousePos.x <= bb.x + size && mousePos.y >= bb.y && mousePos.y <= bb.y + size) {
    ctx.fillStyle = GetLeftMouse(true) ? style.active : style.hover;
    if (GetLeftMouseUp(true)) {
      dirty = true;
      checked = !checked;
    }
  }

  ctx.fillRect(bb.x, bb.y, size, size);
  if (checked) {
    ctx.fillStyle = disabled ? style.disabledFg : style.fg;
    ctx.fillRect(bb.x + 5, bb.y + 5, size - 10, size - 10);
  }
  return checked;
}