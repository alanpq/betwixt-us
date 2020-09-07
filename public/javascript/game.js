/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext('2d');

/** @type {SocketIO.Socket} */
const socket = io('/' + sessionStorage.getItem('code'));
console.log(`Connecting to room '${sessionStorage.getItem('code')}'`);

const isMobile = mobileCheck();

socket.on('connect', () => {
  socket.on('new player', newPlayer => {
    const player = new Player(newPlayer);
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
    locPlayer = new Player(newPlayer);
  })

  socket.emit('self register', localStorage.getItem("name"));
})


const gameState = {
  _score: 0,
  set score(newScore) {
    this._score = newScore;
    // uiDrawScore();
    scoreUIDraw()
    console.log(this._score)
  },
  get score() {
    return this._score;
  },

  updateScore(change) {
    this._score += change
    scoreUIDraw()
  }

}

const gameOptions = {
  max_score: 100
}

addObject({
  pos: new Vector(0, 0),
  sprite: "box"
});

addObject({
  pos: new Vector(100, 133),
  sprite: "box"
});

addObject({
  pos: new Vector(200, 80),
  sprite: "box"
});

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

const blueNoise = new Image();
blueNoise.src = "../images/blueNoise.png"



// TODO: add noise for dithering
const visibilityGrad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.min(W, H) * 0.35);
visibilityGrad.addColorStop(0.7, "transparent");
visibilityGrad.addColorStop(1, "rgba(0,0,0,0.75)");


const visibilityGradMask = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.min(W, H) * 0.35);
visibilityGradMask.addColorStop(0.8, "white");
visibilityGradMask.addColorStop(1, "transparent");



const draw = (dt) => {
  ctx.clearRect(0, 0, W, H);
  // playerLayer.clearRect(0, 0, W, H);

  // if (document.fullscreenElement == null && isMobile) { // TODO: move to event listener
  //   ctx.fillStyle = "black";
  //   ctx.fillRect(0, 0, W, H);
  //   ctx.fillStyle = "white";
  //   ctx.font = `${(30 / 355) * W}px Kumbh Sans, sans-serif`;
  //   ctx.textAlign = "center";
  //   const gap = (20 / 355) * W;
  //   ctx.fillText("Tap to go", W / 2, H / 2 - gap);
  //   ctx.fillText("Fullscreen", W / 2, H / 2 + gap);
  //   return;
  // }

  // TODO: add camera scale (maybe rotation?!?!?!?) to affine matrix
  ctx.setTransform(1, 0, 0, 1, -camera.x, -camera.y); // apply camera translation to main layer matrix
  // playerLayer.setTransform(1, 0, 0, 1, -camera.x, -camera.y); // apply camera translation to player layer matrix
  // playerMask.setTransform(1, 0, 0, 1, -camera.x, -camera.y); // apply camera translation to player layer matrix

  for (let player of Object.values(players)) {
    // ctx.fillRect(playerCanvas, player.pos.x - camera.x, player.pos.y - camera.y, 50, 50);
    player.draw(ctx, playerMask, visibilityGradMask, camera);
  }
  locPlayer.draw(ctx, playerMask, visibilityGradMask, camera);


  ctx.drawImage(testImage2, 0, 0 + testImage.height);

  drawScene(ctx, dt);

  // playerLayer.setTransform(1, 0, 0, 1, 0, 0); // reset transformation matrix for player layer
  // playerMask.setTransform(1, 0, 0, 1, 0, 0); // reset transformation matrix for player layer
  ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transformation matrix

  //////// DRAW MASKED PLAYER LAYER TO MAIN CANVAS
  // playerMask.globalCompositeOperation = "source-in";
  // playerMask.drawImage(playerLayerCanvas, 0, 0);
  // ctx.drawImage(playerMaskCanvas, 0, 0);

  // ctx.fillStyle = visibilityGrad;
  // ctx.fillRect(0, 0, W, H);

  drawUI(ctx, dt);

  if (scoreDirty)
    scoreUIDraw(dt);


  // meetingCalled("000")
}

// TODO: maybe not use setInterval? not sure
setInterval(() => {
  if (locPlayer.id)
    socket.emit('movement update', locPlayer.id, locPlayer.pos, locPlayer.velocity)
}, 1000 / 64);

scoreUIDraw()
prev = performance.now()

if (document.fullscreenElement == null && isMobile) { // TODO: move to event listener
  window.addEventListener('fullscreenchange', (e) => {
    window.requestAnimationFrame(tick);
  })
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "white";
  ctx.font = `${(30 / 355) * W}px Kumbh Sans, sans-serif`;
  ctx.textAlign = "center";
  const gap = (20 / 355) * W;
  ctx.fillText("Tap to go", W / 2, H / 2 - gap);
  ctx.fillText("Fullscreen", W / 2, H / 2 + gap);

} else {
  window.requestAnimationFrame(tick);
}

scoreUIDraw()
prev = performance.now()



