import * as twgl from './lib/twgl-full.module.js'
import Player from './Player.js'
import * as input from './input.js'
import { addObject, drawScene, gameObjects, instantiate, recalculateBounds } from './object.js'
import { gl, m4, camera, ctx } from './render.js'

import { solidProgramInfo, drawSprite, getSprite } from './sprite.js'

import * as joystick from './ui/joystick.js'
import { Vector } from './util/Vector.js'
import { colors, lerp, mobileCheck, debounce } from './util/util.js'
import { canvas, overlayCanvas, W, H } from './canvas.js'

import { baseVisibility, gameOptions, gameState } from './state.js'

// twgl.setDefaults({ attribPrefix: "a_" });

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

addObject(gl, {
  pos: new Vector(0, 0),
  sprite: "box"
});

addObject(gl, {
  pos: new Vector(3, 2),
  sprite: "box"
});

addObject(gl, {
  pos: new Vector(1, 7),
  sprite: "box"
});

/** @type {{[id: string] : Player}} */
const players = {};
/** @type {Player} */
let locPlayer = new Player();
let playerCount = 1;


let prev;
const tick = (now) => {
  const dt = (now - prev) / 1000; // change in seconds
  prev = now;

  // camera.zoom = (Math.min(W, H) / Math.max(W, H)) * 0.05;

  // tickUI();

  // if (document.fullscreenElement == null && isMobile) {
  //   draw(dt);
  //   return;
  // }

  camera.W = W / camera.zoom;
  camera.H = H / camera.zoom;

  // TODO: better key shit
  const inp = new Vector(
    input.getKeyCode(68) - input.getKeyCode(65),
    input.getKeyCode(83) - input.getKeyCode(87)
  ).add(input.joystick);
  if (inp.getLength > 1)
    inp.setLength(1);

  const deltaMovement = inp.multiply(dt * 100);
  locPlayer.velocity = Vector.lerp(locPlayer.velocity, inp, 20 * dt);
  locPlayer.pos.addTo(locPlayer.velocity.multiply(10 * dt));

  camera.pos = Vector.lerp(camera.pos, locPlayer.pos.subtract(new Vector(camera.W / 2, camera.H / 2)), 10 * dt);
  // inputInterpreter();
  draw(dt);
  // inputTick();
  window.requestAnimationFrame(tick);
}

const tex = twgl.createTexture(gl, {
  target: gl.TEXTURE_2D
});

// AA
if (!isMobile) {
  gl.enable(gl.SAMPLE_COVERAGE);
  gl.sampleCoverage(4, false);
}
// gl.depthMask(true);


gl.depthFunc(gl.LEQUAL);
// gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
// gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

gl.enable(gl.BLEND);
gl.enable(gl.DEPTH_TEST);
gl.enable(gl.STENCIL_TEST);
// gl.enable(gl.CULL_FACE);


/*
560 - diam
280 - radius
280 / 8 = 35
pxRadius / visibility = zoom

*/

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

    // const a = object.pos.add(points[0]).subtract(locPlayer.pos);
    // const b = object.pos.add(points[1]).subtract(locPlayer.pos);
    // const c = object.pos.add(points[2]).subtract(locPlayer.pos);
    // const d = object.pos.add(points[3]).subtract(locPlayer.pos);
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
  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = "black"
  ctx.fillText(locPlayer.pos, 10, 10);
  ctx.fillText(camera.zoom, 10, 20);
  ctx.fillText((camera.zoom / gl.canvas.width) / 2, 10, 30);
  // ctx.fillText(, 10, 40);
  ctx.setTransform(camera.zoom, 0, 0, camera.zoom, -camera.pos.x * camera.zoom, -camera.pos.y * camera.zoom);

  ctx.beginPath();
  ctx.arc(locPlayer.pos.x, locPlayer.pos.y, baseVisibility, 0, Math.PI * 2);
  ctx.stroke();

  // twgl.resizeCanvasToDisplaySize(gl.canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.stencilMask(0); // disable writing to stencil buffer

  gl.clearDepth(1);
  gl.clearStencil(0);
  gl.clearColor(0.8, 0.8, 0.8, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);


  gl.stencilFunc(gl.ALWAYS, 1, 0xff);
  gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);

  gl.stencilMask(0xff); // write to stencil buffer
  gl.depthMask(false); // dont write to depth buffer
  gl.disable(gl.DEPTH_TEST);
  // gl.colorMask(false, false, false, false); // dont write to color buffer
  drawVisibility();

  gl.stencilMask(0); // dont write to stencil buffer
  gl.colorMask(true, true, true, true); // write to color buffer
  gl.depthMask(true); // write to depth buffer
  gl.enable(gl.DEPTH_TEST);
  gl.stencilFunc(gl.NOTEQUAL, 1, 0xff); // pass stencil if stencil == 1

  for (let player of Object.values(players)) {
    player.draw(gl); // TODO: fix these params
  }
  locPlayer.draw(gl);

  gl.stencilFunc(gl.ALWAYS, 1, 0xff); // ignore stencil buffer (always pass)

  // drawSprite(gl, await getSprite(gl, "pixel"), locPlayer.pos, true, [1, 1, 1, 1], baseVisibility);




  drawScene(gl, camera);
  joystick.drawJoystick();


  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

// TODO: maybe not use setInterval? not sure
setInterval(() => {
  if (locPlayer.id)
    socket.emit('movement update', locPlayer.id, locPlayer.pos, locPlayer.velocity)
}, 1000 / 64);

prev = performance.now()
window.requestAnimationFrame(tick);
