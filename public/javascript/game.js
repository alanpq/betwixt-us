/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext('2d');

/** @type {SocketIO.Socket} */
const socket = io('/' + localStorage.getItem('code'));
console.log(`Connecting to room '${localStorage.getItem('code')}'`);

const players = [];
let locPlayer;

/** @type {Canvas} */
const playerCanvas = document.createElement('canvas');
/** @type {CanvasRenderingContext2D}*/
const playerCTX = playerCanvas.getContext('2d');
playerCanvas.width = 200;
playerCanvas.height = 200;
playerCTX.beginPath();
playerCTX.moveTo(100, 0);
playerCTX.lineTo(200, 200);
playerCTX.lineTo(0, 200);
playerCTX.lineTo(100, 0);
playerCTX.fillStyle = "white";
playerCTX.fill();

const keyState = {};

window.addEventListener('keydown', function (e) {
  keyState[e.keyCode] = true;
})

window.addEventListener('keyup', function (e) {
  keyState[e.keyCode] = false;
})

let prev;
const tick = (now) => {
  window.requestAnimationFrame(tick);
  const dt = (now - prev) / 1000; // change in seconds
  prev = now;

  // inputInterpreter();
  draw(dt);
}

const draw = (dt) => {
  ctx.clearRect(0, 0, W, H);
  ctx.font = "20px Kumbh Sans, sans-serif"
  ctx.fillStyle = "white";
  ctx.strokeStyle = "black";

  ctx.lineWidth = 0.5;
  ctx.textAlign = "left";
  fillStrokedText(ctx, dt, 5, 23);

  ctx.lineWidth = 1;
  ctx.textAlign = "center";
  ctx.font = "50px Kumbh Sans, sans-serif";
  // TODO: use non canvas HUD overlay for finer text control?
  fillStrokedText(ctx, socket.nsp.slice(1), W / 2, H - 23);

  ctx.drawImage(playerCanvas, (W / 2) - 100, (H / 2) - 100, 50, 50);
}

const inputInterpreter = () => {
  let out = ""
  for (const [keyCode, value] in Object.values(keyState)) {
    if (value) {
      out += keyCode + " "
    }
  }
  if (out) {
    console.log(out)
  }
}

prev = performance.now()
window.requestAnimationFrame(tick);