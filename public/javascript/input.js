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
let mouseState = 2; // 0 - held, 1 - just pressed, 2 - released, 3 - just released
let mouseIsEaten = false; // used for mouse click consuming items (buttons, etc)

/**
 * Returns true if the left mouse button is currently pressed.
 * @return {boolean}
 */
export const GetLeftMouse = () => { // no need for other mouse clicks, we're going for crossplay
  return mouseState < 2;
}
/**
 * Returns true if the left mouse button has just been pressed.
 * @return {boolean}
 */
export const GetLeftMouseDown = () => {
  return mouseState == 1;
}

/**
 * Returns true if the left mouse button has just been released.
 * @return {boolean}
 */
export const GetLeftMouseUp = () => {
  return mouseState == 3;
}

//// TICK

export const inputTick = () => {
  switch (mouseState) { // TODO: investigate whether this should be after all other ticks or before
    case 1:
      mouseState = 0;
      break;
    case 3:
      mouseState = 2;
      break;
  }
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

  mouseState = 1;
})

window.addEventListener('mouseup', (e) => {
  mousePos.x = e.clientX;
  mousePos.y = e.clientY;

  mouseState = 3;
})

window.addEventListener('mousemove', (e) => {
  mousePos.x = e.clientX;
  mousePos.y = e.clientY;
});

// TOUCH