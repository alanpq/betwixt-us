/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext('2d');

/** @type {SocketIO.Socket} */
const socket = io('/' + sessionStorage.getItem('code'));
console.log(`Connecting to room '${sessionStorage.getItem('code')}'`);

const isMobile = mobileCheck();

socket.on('connect', () => {
  socket.on('new player', newPlayer => {
    const player = new Player(); // TODO: put this in player constructor
    player.host = newPlayer.host;
    player.id = newPlayer.id;
    player.pos.x = newPlayer.pos.x;
    player.pos.y = newPlayer.pos.y;
    player.name = newPlayer.name;
    player.color = newPlayer.color;
    players[player.id] = player;
    playerCount++;
  })

  socket.on('kicked', (msg) => {
    alert(`Kicked for reason:
    ${msg}`);
    window.location = "../";
  })

  socket.on('disconnected', () => {
    alert("disconnected.");
    window.location = "../";
  })

  socket.on('player leave', id => {
    if (players[id])
      delete players[id];
    playerCount--;
  })

  socket.on('movement update', (id, pos, vel) => {
    if (!players[id]) return console.log(`${id} not found!`);
    players[id].pos = pos;
    players[id].velocity = vel;
  })

  socket.on('you', (newPlayer) => {
    locPlayer.host = newPlayer.host;
    locPlayer.id = newPlayer.id;
    locPlayer.pos.x = newPlayer.pos.x;
    locPlayer.pos.y = newPlayer.pos.y;
    locPlayer.name = newPlayer.name;
    locPlayer.color = newPlayer.color;
  })

  socket.emit('self register', localStorage.getItem("name"));
})

const playerLayer = playerLayerCanvas.getContext('2d');
const playerMask = playerMaskCanvas.getContext('2d');

/** @type {{[id: string] : Player}} */
const players = {};
/** @type {Player} */
let locPlayer = new Player();
let playerCount = 1;

let camera = new Vector(0, 0);
let cameraZoom = 1; // TODO: implement camera zoom

let prev;
const tick = (now) => {
  window.requestAnimationFrame(tick);
  const dt = (now - prev) / 1000; // change in seconds
  prev = now;

  tickUI();

  if (document.fullscreenElement == null && isMobile) {
    draw(dt);
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
  locPlayer.velocity = Vector.lerp(locPlayer.velocity, inp, 40 * dt);
  locPlayer.pos.addTo(locPlayer.velocity.multiply(130 * dt));

  camera = Vector.lerp(camera, locPlayer.pos.subtract(new Vector(W / 2, H / 2)), 10 * dt);

  // inputInterpreter();
  draw(dt);
  inputTick();
}

const testImage = new Image();
testImage.src = "../images/test.png";
const testImage2 = new Image();
testImage2.src = "../images/cheersluka.png";

// TODO: add noise for dithering
const visibilityGrad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.min(W, H) * 0.25);
visibilityGrad.addColorStop(0.5, "transparent");
visibilityGrad.addColorStop(1, "rgba(0,0,0,0.75)");


const visibilityGradMask = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.min(W, H) * 0.25);
visibilityGradMask.addColorStop(0.8, "white");
visibilityGradMask.addColorStop(1, "transparent");

const draw = (dt) => {
  ctx.clearRect(0, 0, W, H);
  playerLayer.clearRect(0, 0, W, H);
  playerMask.clearRect(0, 0, W, H);

  playerMask.globalCompositeOperation = "copy";
  playerMask.fillStyle = visibilityGradMask;
  playerMask.fillRect(0, 0, W, H);

  if (document.fullscreenElement == null && isMobile) {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "white";
    ctx.font = `${(30 / 355) * W}px Kumbh Sans, sans-serif`;
    ctx.textAlign = "center";
    const gap = (20 / 355) * W;
    ctx.fillText("Tap to go", W / 2, H / 2 - gap);
    ctx.fillText("Fullscreen", W / 2, H / 2 + gap);
    return;
  }

  // TODO: add camera scale (maybe rotation?!?!?!?) to affine matrix
  ctx.setTransform(1, 0, 0, 1, -camera.x, -camera.y); // apply camera translation to main layer matrix
  playerLayer.setTransform(1, 0, 0, 1, -camera.x, -camera.y); // apply camera translation to player layer matrix
  // playerMask.setTransform(1, 0, 0, 1, -camera.x, -camera.y); // apply camera translation to player layer matrix

  ctx.drawImage(testImage, 0, 0);
  ctx.drawImage(testImage2, 0, 0 + testImage.height);


  for (let player of Object.values(players)) {
    // ctx.fillRect(playerCanvas, player.pos.x - camera.x, player.pos.y - camera.y, 50, 50);
    player.draw(playerLayer, camera);
  }
  locPlayer.draw(playerLayer, camera);


  playerLayer.setTransform(1, 0, 0, 1, 0, 0); // reset transformation matrix for player layer
  // playerMask.setTransform(1, 0, 0, 1, 0, 0); // reset transformation matrix for player layer
  ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transformation matrix

  playerMask.globalCompositeOperation = "source-in";
  playerMask.drawImage(playerLayerCanvas, 0, 0);
  ctx.drawImage(playerMaskCanvas, 0, 0);

  ctx.fillStyle = visibilityGrad;
  ctx.fillRect(0, 0, W, H);

  drawUI(ctx, dt);
  // meetingCalled("000")
}

// TODO: maybe not use setInterval? not sure
setInterval(() => {
  if (locPlayer.id)
    socket.emit('movement update', locPlayer.id, locPlayer.pos, locPlayer.velocity)
}, 1000 / 64);


const meetingHome = [0, 0]

const meetingCalled = (callerID) => {
  /** @type {Canvas} */
  const meetingCanvas = document.createElement('canvas')
  /** @type {CanvasRenderingContext2D}*/
  const meetingCTX = meetingCanvas.getContext("2d")
  meetingCanvas.width = W * 0.8
  meetingCanvas.height = H * 0.8
  meetingCTX.fillText("meeting time", 0, 0)
  meetingCTX.fillText(`${callerID}`, 100, 100)
  ctx.drawImage(meetingCanvas, W * 0.1, H * 0.1)
}








prev = performance.now()
window.requestAnimationFrame(tick);


