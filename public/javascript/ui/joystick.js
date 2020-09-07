let joystickTouchID = null;
let joystick = new Vector();
const joystickBase = new Vector();
const joystickSize = 40;

window.addEventListener("touchstart", (e) => {

  if (document.fullscreenElement == null)
    document.body.requestFullscreen();

  if (joystickTouchID == null) {
    joystickBase.x = e.changedTouches[0].clientX;
    joystickBase.y = e.changedTouches[0].clientY;
    if (joystickBase.x <= W / 2)
      joystickTouchID = e.changedTouches[0].identifier;
  }
  touchEvent.preventDefault();
}, false)

window.addEventListener("touchmove", (e) => {
  for (let touch of e.changedTouches) {
    if (touch.identifier == joystickTouchID) {
      joystick.x = (touch.clientX - joystickBase.x) / (joystickSize * (W / 355));
      joystick.y = (touch.clientY - joystickBase.y) / (joystickSize * (W / 355));
      if (joystick.getMagnitude() > 1)
        joystick.setMagnitude(1);
    }
  }
  touchEvent.preventDefault();
}, canvas)

window.addEventListener("touchend", (e) => {
  if (e.changedTouches[0].identifier == joystickTouchID) {
    joystick.x = 0;
    joystick.y = 0;
    joystickTouchID = null;
  }
  touchEvent.preventDefault();
})

/**
 * Draws the joystick
 * @param {CanvasRenderingContext2D} ctx 
 * @param {number} dt 
 */
const drawJoystick = (ctx, dt) => {
  if (joystickTouchID != null) {
    ctx.fillStyle = "rgba(66,76,91,0.5)";
    ctx.beginPath();
    ctx.arc(joystickBase.x, joystickBase.y,
      (joystickSize * (W / 355)),
      0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = "rgba(66,76,91,0.75)";

    ctx.beginPath();
    ctx.arc(
      joystickBase.x + (joystick.x * (joystickSize * (W / 355))),
      joystickBase.y + (joystick.y * (joystickSize * (W / 355))),
      (joystickSize * (W / 355)) * 0.40,
      0, 2 * Math.PI);
    ctx.fill();
  }
}