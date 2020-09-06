/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext('2d');

/** @type {SocketIO.Socket} */
const socket = io('/' + sessionStorage.getItem('code'));
console.log(`Connecting to room '${sessionStorage.getItem('code')}'`);

const isMobile = mobileCheck();

socket.on('new player', newPlayer => {
  const player = new Player(); // TODO: put this in player constructor
  player.id = newPlayer.id;
  player.pos.x = newPlayer.pos.x;
  player.pos.y = newPlayer.pos.y;
  player.name = newPlayer.name;
  player.color = newPlayer.color;
  players[player.id] = player;
})

socket.on('player leave', id => {
  if (players[id])
    delete players[id];
})

socket.on('movement update', (id, pos, vel) => {
  players[id].pos = pos;
  players[id].velocity = vel;
})

socket.on('you', (newPlayer) => {
  locPlayer.id = newPlayer.id;
  locPlayer.pos.x = newPlayer.pos.x;
  locPlayer.pos.y = newPlayer.pos.y;
  locPlayer.name = newPlayer.name;
  locPlayer.color = newPlayer.color;
})

/** @type {{[id: string] : Player}} */
const players = {};
/** @type {Player} */
let locPlayer = new Player();

let camera = new Vector(0, 0);
let cameraZoom = 1; // TODO: implement camera zoom

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

const getKeyCode = (key) => {
  return keyState[key] || false;
}

let prev;
const tick = (now) => {
  window.requestAnimationFrame(tick);
  const dt = (now - prev) / 1000; // change in seconds
  prev = now;

  if (document.fullscreenElement == null && isMobile) {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "white";
    ctx.font = `${(30 / 355) * W}px Kumbh Sans, sans-serif`;
    ctx.textAlign = "center";
    const gap = (20 / 355) * W
    ctx.fillText("Tap to go", W / 2, H / 2 - gap);
    ctx.fillText("Fullscreen", W / 2, H / 2 + gap);
    return;
  }

  // TODO: better key shit
  const inp = new Vector(
    getKeyCode(68) - getKeyCode(65),
    getKeyCode(83) - getKeyCode(87)
  ).add(joystick);
  if (inp.getLength > 1)
    inp.setLength(1);

  // const deltaMovement = inp.multiply(dt * 100);
  locPlayer.velocity = Vector.lerp(locPlayer.velocity, inp, 10 * dt);
  locPlayer.pos.addTo(locPlayer.velocity.multiply(130 * dt));

  camera = Vector.lerp(camera, locPlayer.pos.subtract(new Vector(W / 2, H / 2)), 10 * dt);

  // inputInterpreter();
  draw(dt);
}

const testImage = new Image();
testImage.src = "../images/test.png";
const testImage2 = new Image();
testImage2.src = "../images/cheersluka.png";

let frameTimeSum = 0;
let frameTimeMin = 10000;
let frameTimeMax = -10000;
let frameTimeI = 0;
let frameTimeSamples = new Array(99);
const frameTimeSampleCount = 100;

const draw = (dt) => {
  ctx.clearRect(0, 0, W, H);

  ctx.drawImage(testImage, -camera.x, -camera.y);
  ctx.drawImage(testImage2, -camera.x, -camera.y + testImage.height);

  ctx.font = "20px monospace";
  ctx.fillStyle = "white";
  ctx.strokeStyle = "black";

  ctx.lineWidth = 0.5;
  ctx.textAlign = "left";
  const avgFrameTime = (frameTimeSum / frameTimeSamples.length);
  ctx.fillText(`    Avg Frame Time: ${(avgFrameTime * 1000).toPrecision(4)} ms`, 5, 23);
  ctx.fillText(`Min/Max Frame Time: ${(frameTimeMin * 1000).toPrecision(4)}/${(frameTimeMax * 1000).toPrecision(4)} ms`, 5, 43);
  ctx.fillText(`           Avg FPS: ${(1 / avgFrameTime).toPrecision(3)} FPS`, 5, 63);
  if (frameTimeSamples[frameTimeI] <= frameTimeMin)
    frameTimeMin = 100000;
  if (frameTimeSamples[frameTimeI] >= frameTimeMax)
    frameTimeMax = -100000;

  frameTimeSum -= frameTimeSamples[frameTimeI] || 0;
  frameTimeSamples[frameTimeI] = dt;
  frameTimeSum += dt;
  frameTimeMin = dt < frameTimeMin ? dt : frameTimeMin;
  frameTimeMax = dt > frameTimeMax ? dt : frameTimeMax;
  frameTimeI = frameTimeI >= frameTimeSampleCount - 1 ? 0 : frameTimeI + 1;

  ctx.font = "10px Kumbh Sans, sans-serif"
  ctx.beginPath()
  ctx.moveTo(5, 0);
  for (let i = 0; i < frameTimeSampleCount; i++) {
    ctx.lineTo(5 + frameTimeSamples[i] * 10000, (H / frameTimeSampleCount) * i);
  }
  ctx.fillRect(0, (H / frameTimeSampleCount) * frameTimeI, 200, 1);
  ctx.stroke();

  ctx.lineWidth = 1;
  ctx.textAlign = "center";
  ctx.font = "50px Kumbh Sans, sans-serif";
  // TODO: use non canvas HUD overlay for finer text control?
  fillStrokedText(ctx, socket.nsp.slice(1), W / 2, H - 23);

  for (let player of Object.values(players)) {
    // ctx.fillRect(playerCanvas, player.pos.x - camera.x, player.pos.y - camera.y, 50, 50);
    player.draw(ctx, camera);
  }
  locPlayer.draw(ctx, camera);

  drawJoystick(ctx, dt);
}

// TODO: maybe not use setInterval? not sure
// setInterval(() => {
//   if (locPlayer.id)
//     socket.emit('movement update', locPlayer.id, locPlayer.pos, locPlayer.velocity)
// }, 1000 / 64);

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