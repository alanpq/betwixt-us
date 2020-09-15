import * as twgl from './lib/twgl-full.module.js'
import Player from './Player.js'
import * as input from './input.js'
import { canvas, overlayCanvas, gl, ctx, W, H } from './canvas.js'

import { Vector } from './util/Vector.js'
import { colors, lerp, mobileCheck, debounce } from './util/util.js'
import { addObject, drawScene, gameObjects, instantiate, recalculateBounds } from './object.js'

import { solidProgramInfo, drawSprite, getSprite, drawTex, spriteShader } from './sprite.js'

import * as joystick from './ui/joystick.js'
import { m4, camera, loadShader } from './render.js'

import { baseVisibility, gameOptions, gameState } from './state.js'

import { drawUI, tickUI } from './ui/ui.js'
// twgl.setDefaults({ attribPrefix: "a_" });

import { doPlayerPhysics } from './physics.js'
import { lineIntersect } from './util/raycasts.js'
import { hookPreload, preloadHooks } from './hooks.js'
import { drawInteractables, addInteractable, interactables, drawHighlight } from './interactables.js'

/** @type {SocketIO.Socket} */
const socket = io('/' + sessionStorage.getItem('code'), {
  autoConnect: false,
});
console.log(`Connecting to room '${sessionStorage.getItem('code')}'`);

const urlParams = new URLSearchParams(window.location.search);

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

  socket.on('kill', id => { // TODO: do serverside kill time checking
    console.log("someone else died !!")
    if (players[id])
      players[id].dead = true;
    else if (locPlayer.id == id)
      locPlayer.dead = true;
  })

  // TODO: do serverside movement speed/collision checking
  // TODO: separate these - dont need as many position updates as velocity updates
  socket.on('movement update', (id, pos, vel) => {
    if (!players[id]) return console.log(`${id} not found!`);
    players[id].pos.x = pos.x;
    players[id].pos.y = pos.y;
    players[id].velocity.x = vel.x;
    players[id].velocity.y = vel.y;

    if (vel.x != 0)
      players[id].facing = vel.x > 0

    players[id].moving = vel.x < -0.05 || vel.x > 0.05 || vel.y < -0.05 || vel.y > 0.05
  })

  socket.on('you', (newPlayer) => {
    locPlayer = new Player(newPlayer);
    locPlayer.isLocal = true;
    start();
  })

  socket.emit('self register', urlParams.get('name') || localStorage.getItem("name"));
})
window.focused = true;
window.onblur = document.onblur = () => { window.focused = false; }
window.onfocus = document.onfocus = () => { window.focused = true; }

addObject(gl, {
  pos: new Vector(3, 0),
  sprite: "box",
  bounds: {
    x: -1.7 / 2,
    y: -0.25,
    w: 1.7,
    h: 1,
  }
});

addObject(gl, {
  pos: new Vector(4, 2),
  sprite: "box",
  bounds: {
    x: -1.7 / 2,
    y: -0.25,
    w: 1.7,
    h: 1,
  }
});

addObject(gl, {
  pos: new Vector(1, 7),
  sprite: "box",
  bounds: {
    x: -1.7 / 2,
    y: -0.25,
    w: 1.7,
    h: 1,
  }
});

addInteractable({
  pos: new Vector(-1, -1),
  sprite: "laptop",
}, (self) => {
  console.log('interact!!')
});

/** @type {{[id: string] : Player}} */
const players = {};
/** @type {Player} */
export let locPlayer = new Player();
let playerCount = 1;

export let time = 0;
/** @type {Player[]} */
let playerList;

/** @type {Player} */
let closestPlayer = null;

/** @type {number} */
let closestInteractable = -1;

let prev;
const tick = (now) => {
  const dt = (now - prev) / 1000; // change in seconds
  prev = now;
  time += dt; // TODO: figure out if it should be dt or something else

  ctx.clearRect(0, 0, W, H) // TODO: put this back in draw (needed it here for player coll visualisations)
  // if (document.fullscreenElement == null && isMobile) {
  //   draw(dt);
  //   return;
  // }

  camera.W = W / camera.zoom;
  camera.H = H / camera.zoom;
  if (!locPlayer.dead) {
    gameState.killCounter -= dt;
    // TODO: better key shit
    let inp = new Vector(
      input.getKeyCode(68) - input.getKeyCode(65) + input.getKeyCode(39) - input.getKeyCode(37),
      input.getKeyCode(83) - input.getKeyCode(87) + input.getKeyCode(40) - input.getKeyCode(38)
    ).add(input.joystick);
    if (inp.getLength() > 1)
      inp.setLength(1);

    if (!window.focused) {
      locPlayer.velocity = new Vector(0, 0)
      inp = new Vector(0, 0)
    }
    locPlayer.velocity = Vector.lerp(locPlayer.velocity, inp, 15 * dt);


    if (locPlayer.velocity.x != 0)
      locPlayer.facing = locPlayer.velocity.x > 0

    locPlayer.moving = locPlayer.velocity.x < -0.05 || locPlayer.velocity.x > 0.05 || locPlayer.velocity.y < -0.05 || locPlayer.velocity.y > 0.05
    // if (!locPlayer.moving)
    //   locPlayer.velocity = new Vector(0, 0);


    doPlayerPhysics(locPlayer, dt);


    playerList = Object.values(players);

    closestPlayer = null;
    let min = gameOptions.kill_range;
    for (let player of playerList) {
      const d = player.pos.subtract(locPlayer.pos).getSqrtMagnitude();
      if (d < min && !player.dead) {
        min = d;
        closestPlayer = player;
      }
    }

    min = gameOptions.interactable_range;
    closestInteractable = -1;
    for (let interactable of interactables) {
      const d = interactable.pos.subtract(locPlayer.pos).getSqrtMagnitude();
      if (d < min) {
        min = d;
        closestInteractable = interactable.id;
      }
    }

    if (closestInteractable != -1 && input.getKeyCodeDown(69)) {
      interactables[closestInteractable].interactCB(interactables[closestInteractable]);
    }

    // console.log(input.keyState[65]);


    if (closestPlayer && input.getKeyCodeDown(69) && gameState.killCounter <= 0) {
      gameState.killCounter = gameOptions.kill_counter;
      socket.emit('kill', closestPlayer.id)
      console.log('kill')
    }
  }

  camera.pos = Vector.lerp(camera.pos, locPlayer.pos.subtract(new Vector(camera.W / 2, camera.H / 2)), 10 * dt);
  // inputInterpreter();
  draw(dt);
  tickUI(prev, performance.now());
  input.inputTick();
  window.requestAnimationFrame(tick);
}

const tex = twgl.createTexture(gl, {
  target: gl.TEXTURE_2D
});

let visibilityShader;
hookPreload(async () => {
  visibilityShader = twgl.createProgramInfo(gl, [await loadShader("vertex"), await loadShader("f_visibility")])
})



// AA
if (!isMobile) {
  gl.enable(gl.SAMPLE_COVERAGE);
  gl.sampleCoverage(4, false);
}

gl.depthFunc(gl.LEQUAL);
// gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
// gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

gl.enable(gl.BLEND);
gl.enable(gl.DEPTH_TEST);
gl.enable(gl.STENCIL_TEST);
// gl.enable(gl.CULL_FACE);
/** @param {Vector} line */
const line = (line, arrays, object) => {
  line.subtractFrom(locPlayer.pos)
  const len = line.getLength();
  line.setLength(1);

  if (baseVisibility * 5 < len) return undefined;

  const a = line.multiply(len).add(locPlayer.pos);
  const b = line.multiply(baseVisibility * 5).add(locPlayer.pos);

  const i = arrays.position.length / 3;
  arrays.position.push(b.x + object.pos.x);
  arrays.position.push(b.y + object.pos.y);
  arrays.position.push(-5);

  // ctx.fillRect(b.x, b.y, 1, 1);

  // ctx.beginPath();
  // ctx.moveTo(a.x, a.y);
  // ctx.lineTo(b.x, b.y);
  // ctx.stroke();
  return i;
}

const drawVisibility = () => { // TODO: convex polygons?
  if (!solidProgramInfo) return;
  for (let object of gameObjects) { // TODO: optimise
    const points = [
      object.pos.add(new Vector(object.bounds.x, object.bounds.y)),
      object.pos.add(new Vector(object.bounds.x + object.bounds.w, object.bounds.y)),
      object.pos.add(new Vector(object.bounds.x, object.bounds.y + object.bounds.h)),
      object.pos.add(new Vector(object.bounds.x + object.bounds.w, object.bounds.y + object.bounds.h)),
    ];

    const arrays = {
      position: [
        locPlayer.pos.x + points[0].x, locPlayer.pos.y + points[0].y, -5,
        locPlayer.pos.x + points[1].x, locPlayer.pos.y + points[1].y, -5,
        locPlayer.pos.x + points[2].x, locPlayer.pos.y + points[2].y, -5,
        locPlayer.pos.x + points[3].x, locPlayer.pos.y + points[3].y, -5,
      ],
      indices: [
        0, 1, 2,
        1, 3, 2,
      ]
    }
    let did0, did1, did2, did3;

    if (locPlayer.pos.y >= points[0].y || locPlayer.pos.x >= points[0].x)
      did0 = line(points[0], arrays, object)
    if (locPlayer.pos.y >= points[1].y || locPlayer.pos.x <= points[1].x)
      did1 = line(points[1], arrays, object)
    if (locPlayer.pos.y <= points[2].y || locPlayer.pos.x >= points[2].x)
      did2 = line(points[2], arrays, object)
    if (locPlayer.pos.y <= points[3].y || locPlayer.pos.x <= points[3].x)
      did3 = line(points[3], arrays, object)

    // TODO: jesus christ
    if (did0 && did1) {
      arrays.indices.push(
        0, did0, 1,
        1, did0, did1
      );
    }
    if (did1 && did3) {
      arrays.indices.push(
        1, did1, 3,
        3, did1, did3
      );
    }
    if (did2 && did3) {
      arrays.indices.push(
        3, did3, 2,
        2, did3, did2
      );
    }
    if (did2 && did0) {
      arrays.indices.push(
        0, did0, 2,
        2, did0, did2
      );
    }
    const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

    const eye = [0, 0, 1];
    const target = [0, 0, 0];
    const up = [0, 1, 0];

    const projection = twgl.m4.ortho(0, gl.canvas.width / camera.zoom, gl.canvas.height / camera.zoom, 0, -100, 100);
    // twgl.m4.rotateY(projection, time, projection);
    // if (worldSpace)
    twgl.m4.translate(projection, [-camera.pos.x, -camera.pos.y, 0], projection);
    twgl.m4.translate(projection, [-locPlayer.pos.x, -locPlayer.pos.y, 0], projection);
    const ca = twgl.m4.lookAt(eye, target, up);
    const view = twgl.m4.inverse(ca);
    const viewProjection = twgl.m4.multiply(projection, view);

    const uniforms = {
      u_matrix: viewProjection,
      u_tint: [0, 0, 0, 0.5]
    };

    gl.useProgram(solidProgramInfo.program);
    twgl.setBuffersAndAttributes(gl, solidProgramInfo, bufferInfo);
    twgl.setUniforms(solidProgramInfo, uniforms);
    gl.drawElements(gl.TRIANGLES, bufferInfo.numElements, gl.UNSIGNED_SHORT, 0);
  }
}

const draw = async (dt) => {
  // console.time("Draw")
  // ctx.fillStyle = "blue"
  // ctx.fillRect(W / 2 + Math.sin(time * 10) * 20, H / 2 + Math.cos(time * 10) * 20, 5, 5);
  // ctx.fillText(, 10, 40);
  ctx.setTransform(camera.zoom, 0, 0, camera.zoom, -camera.pos.x * camera.zoom, -camera.pos.y * camera.zoom);

  // ctx.strokeStyle = "black";
  // ctx.lineWidth = 0.01;
  // ctx.beginPath();
  // ctx.arc(locPlayer.pos.x, locPlayer.pos.y, baseVisibility, 0, Math.PI * 2);
  // ctx.stroke();

  // twgl.resizeCanvasToDisplaySize(gl.canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);


  gl.clearDepth(1);
  gl.clearStencil(0);
  gl.clearColor(0.8, 0.8, 0.8, 1);
  gl.stencilMask(0xff);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);


  gl.stencilFunc(gl.ALWAYS, 1, 0xff);
  gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);

  gl.stencilMask(0xff); // write to stencil buffer
  gl.depthMask(false); // dont write to depth buffer
  gl.disable(gl.DEPTH_TEST);
  gl.colorMask(false, false, false, false); // dont write to color buffer
  drawVisibility();

  gl.colorMask(true, true, true, true); // write to color buffer
  gl.depthMask(true); // write to depth buffer
  gl.enable(gl.DEPTH_TEST);

  gl.stencilFunc(gl.ALWAYS, 0, 0xff);
  drawScene(gl, camera);



  gl.stencilFunc(gl.EQUAL, 0, 0xff); // pass stencil if stencil == 0

  for (let player of playerList) {
    player.tick(dt);
    player.draw(gl, dt); // TODO: fix these params
  }
  if (closestPlayer)
    closestPlayer.drawHighlight(gl, [1, 0, 0, 1]);

  gl.disable(gl.DEPTH_TEST)
  drawHighlight(closestInteractable, [1, 1, 1, 1]);
  drawInteractables();
  gl.enable(gl.DEPTH_TEST)

  gl.stencilFunc(gl.EQUAL, 1, 0xff);
  gl.depthMask(false); // dont write to depth buffer
  gl.stencilMask(0); // dont write to stencil buffer


  // drawSprite(gl, await getSprite(gl, "pixel"), locPlayer.pos, true, [0, 0, 0, 0.9], camera.W)
  drawTex(gl, await getSprite(gl, "pixel"), {
    x: locPlayer.pos.x,
    y: locPlayer.pos.y,
    z: -10,
  }, camera.pos, [camera.W, camera.H], spriteShader, {
    u_tint: [0, 0, 0, 0.9]
  })

  gl.stencilFunc(gl.NOTEQUAL, 1, 0xff); // pass stencil if stencil == 1
  gl.depthMask(false); // dont write to depth buffer
  drawTex(gl, await getSprite(gl, "pixel"), {
    x: locPlayer.pos.x,
    y: locPlayer.pos.y,
    z: -50,
  }, camera.pos, [camera.W, camera.H], visibilityShader, {
    u_lightPosition: [W / 2, H / 2],
    u_radius: baseVisibility * camera.zoom,
    u_tint: [0, 0, 0, 0.9],
  })
  gl.stencilFunc(gl.ALWAYS, 1, 0xff); // ignore stencil buffer (always pass)
  gl.depthMask(true); // write to depth buffer


  gl.enable(gl.DEPTH_TEST);
  gl.stencilFunc(gl.ALWAYS, 1, 0xff); // ignore stencil buffer (always pass)
  gl.depthMask(true); // write to depth buffer

  locPlayer.drawNametag(gl);
  locPlayer.draw(gl, dt);

  gl.stencilFunc(gl.EQUAL, 0, 0xff); // pass stencil if stencil == 0
  for (let player of playerList) {
    player.drawNametag(gl); // TODO: fix these params
  }

  // drawSprite(gl, await getSprite(gl, "pixel"), locPlayer.pos, true, [1, 1, 1, 1], baseVisibility);



  joystick.drawJoystick();


  ctx.setTransform(1, 0, 0, 1, 0, 0);
  drawUI(ctx, dt, socket, playerCount, locPlayer);
  ctx.fillStyle = "black";
  ctx.fillRect(input.mousePos.x - 1, input.mousePos.y - 1, 3, 3);
  ctx.fillStyle = "white";
  ctx.fillRect(input.mousePos.x, input.mousePos.y, 1, 1);

  // const a1 = input.mousePos;
  // const a2 = new Vector(300, H / 2 - 50);
  // const b1 = camera.pos.multiply(camera.zoom).add(new Vector(1000, 500));
  // const b2 = new Vector(500, H / 2 - 250);
  // const intersect = lineIntersect(a1, a2, b1, b2, ctx);
  // ctx.strokeStyle = intersect != false ? "green" : "red";
  // ctx.lineWidth = 2;
  // ctx.beginPath();
  // ctx.moveTo(a1.x, a1.y);
  // ctx.lineTo(a2.x, a2.y);
  // ctx.moveTo(b1.x, b1.y);
  // ctx.lineTo(b2.x, b2.y);
  // ctx.stroke();
  // if (intersect)
  //   ctx.fillRect(intersect.x, intersect.y, 5, 5);
  // console.timeEnd("Draw")
}
const start = () => {
  // TODO: maybe not use setInterval? not sure
  setInterval(() => {
    if (locPlayer.id)
      socket.emit('movement update', locPlayer.id, locPlayer.pos, locPlayer.velocity)
  }, 1000 / 20);

  prev = performance.now()
  window.requestAnimationFrame(tick);
}



Promise.all([
  // VERTEX SHADERS
  loadShader("vertex"),
  loadShader("v_animSprite"),

  // FRAGMENT SHADERS
  loadShader("frag"),
  loadShader("fragTex"),
  loadShader("f_highlight"),
  loadShader("f_player"),
  loadShader("f_visibility"),

  //SPRITES
  getSprite(gl, "pixel"),
  getSprite(gl, "walksprite"),
  getSprite(gl, "walkspriteColor"),
  getSprite(gl, "crown"),
  getSprite(gl, "box"),
]).then(() => {
  preloadHooks.forEach(e => {
    e();
  });

  console.log("Preload finished. Starting game...")
  socket.open();
}).catch(reason => {
  console.error("Failed to preload shaders/sprites.")
  console.error(reason)
})