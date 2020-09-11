import { Vector } from './util/Vector.js'

//// KEYBOARD

export const keyState = {};


export const joystick = new Vector(0, 0);

export const getKeyCode = (key) => {
  return keyState[key] || false;
}

//// MOUSE/TOUCH
/** @type {Vector} */
export let mousePos = new Vector(0, 0);
// need 2 states for just down/up to ensure at least 1 frame is executed
// TODO: check if this breaks shit
export let mouseState = 2; // 0 - held, 1 - just down, 2 - just down, 3 - released, 4 - just released, 5 - just released
let mouseIsEaten = false; // used for mouse click consuming items (buttons, etc)

/**
 * Returns true if the left mouse button is currently pressed.
 * @param {boolean} edible Whether this check can be blocked by UI elements
 * @return {boolean}
 */
export const GetLeftMouse = (edible = false) => { // no need for other mouse clicks, we're going for crossplay
  return mouseState < 3 && (!edible || !mouseIsEaten);
}
/**
 * Returns true if the left mouse button has just been pressed.
 * @param {boolean} edible Whether this check can be blocked by UI elements
 * @return {boolean}
 */
export const GetLeftMouseDown = (edible = false) => {
  return mouseState == 1 && (!edible || !mouseIsEaten);
}

/**
 * Returns true if the left mouse button has just been released.
 * @param {boolean} edible Whether this check can be blocked by UI elements
 * @return {boolean}
 */
export const GetLeftMouseUp = (edible = false) => {
  return mouseState == 4 && (!edible || !mouseIsEaten);
}

export const EatMouse = () => {
  mouseIsEaten = true;
}

export const UnEatMouse = () => {
  mouseIsEaten = false;
}



//// TICK

export const inputTick = () => {
  switch (mouseState) { // TODO: investigate whether this should be after all other ticks or before
    case 1:
      mouseState = 0;
      break;
    case 2:
      mouseState = 1;
      break;
    case 4:
      mouseState = 3;
      break;
    case 5:
      mouseState = 4;
      break;
  }
  mouseIsEaten = false;
}


//// EVENT LISTENERS

// KEYBOARD
window.addEventListener('keydown', (e) => {
  keyState[e.keyCode] = true;
})

window.addEventListener('keyup', (e) => {
  keyState[e.keyCode] = false;
})

// MOUSE
window.addEventListener('mousedown', (e) => {
  mousePos.x = e.clientX;
  mousePos.y = e.clientY;

  mouseState = 2;
})

window.addEventListener('mouseup', (e) => {
  mousePos.x = e.clientX;
  mousePos.y = e.clientY;

  mouseState = 5;
})

window.addEventListener('mousemove', (e) => {
  mousePos.x = e.clientX;
  mousePos.y = e.clientY;
});

// TOUCH