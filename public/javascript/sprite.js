import * as twgl from './lib/twgl-full.module.js'
import { m4, loadShader, camera } from './render.js'
import { gl } from './canvas.js'
import { Vector } from './util/Vector.js'


export let spriteShader;
export let spriteSheetShader;
export let solidProgramInfo;
(async () => {
  spriteShader = twgl.createProgramInfo(gl, [await loadShader("vertex"), await loadShader("fragTex")])
  spriteSheetShader = twgl.createProgramInfo(gl, [await loadShader("v_animSprite"), await loadShader("fragTex")])
  solidProgramInfo = twgl.createProgramInfo(gl, [await loadShader("vertex"), await loadShader("frag")]);
})()

export const quadBufferInfo = twgl.primitives.createXYQuadBufferInfo(gl);


/**
 * @type {{[name: string]: {texture: WebGLTexture}}}
 */
export const sprites = {};

export const getSprite = (gl, spriteName) => {
  if (sprites[spriteName])
    return new Promise(resolve => {
      resolve(sprites[spriteName]);
    })
  else {
    return new Promise((resolve, reject) => {
      const tex = twgl.createTexture(gl, {
        target: gl.TEXTURE_2D,
        src: `../images/${spriteName}.png`,
        wrap: gl.CLAMP_TO_EDGE
      });
      sprites[spriteName] = tex;
      resolve(tex)
    });
  }
}

export const drawTex = (gl, tex, pos, cameraOff, scale = [1, 1], shader, uniforms = {}) => {
  if (!shader)
    return console.error("Invalid shader!")
  if (!tex)
    return console.error("Invalid texture!")


  const eye = [0, 0, -1];
  const target = [0, 0, 0];
  const up = [0, 1, 0];

  const projection = twgl.m4.ortho(0, gl.canvas.width / camera.zoom, gl.canvas.height / camera.zoom, 0, -100, 100);
  // twgl.m4.rotateY(projection, time, projection);
  twgl.m4.translate(projection, [-cameraOff.x, -cameraOff.y, 0], projection);
  const ca = twgl.m4.lookAt(eye, target, up);
  const view = twgl.m4.inverse(ca);
  const viewProjection = twgl.m4.multiply(projection, view);

  const world = twgl.m4.translation([-pos.x, pos.y, pos.z])
  // twgl.m4.rotateY(world, time * 5, world))

  uniforms.u_matrix = twgl.m4.multiply(viewProjection, world)
  uniforms.u_texture = tex;
  twgl.m4.scale(uniforms.u_matrix, [...scale, 1], uniforms.u_matrix)
  gl.useProgram(shader.program)
  twgl.setBuffersAndAttributes(gl, shader, quadBufferInfo);
  twgl.setUniforms(shader, uniforms);
  twgl.drawBufferInfo(gl, quadBufferInfo);
}

/**
 * 
 * @param {WebGLRenderingContext} gl 
 * @param {*} sprite 
 * @param {*} pos 
 * @param {*} worldSpace 
 * @param {*} tint 
 * @param {*} scale 
 * @param {*} customShader 
 * @param {*} customUniforms 
 */
export const drawSprite = (gl, sprite, pos, worldSpace = false, tint = [1, 1, 1, 1], scale = [1, 1], customShader = null, customUniforms = {}, customZ = null) => {
  // if (!spriteShader || !sprite || !pos) return;
  const uniforms = {
    u_tint: tint,
    u_cutThreshold: 1,
    ...customUniforms
  };
  gl.depthMask(true);
  gl.colorMask(false, false, false, false);
  drawTex(gl, sprite, {
    x: pos.x,
    y: pos.y,
    z: customZ || -pos.y,
  }, camera.pos, scale, customShader || spriteShader, uniforms);

  gl.colorMask(true, true, true, true);
  gl.depthMask(false);
  gl.stencilMask(0);

  uniforms.u_cutThreshold = 0;
  drawTex(gl, sprite, {
    x: pos.x,
    y: pos.y,
    z: customZ || -pos.y,
  }, camera.pos, scale, customShader || spriteShader, uniforms);
  gl.depthMask(true);
}

/**
 * 
 * @param {WebGLRenderingContext} gl 
 * @param {WebGLTexture} spriteSheet 
 * @param {*} frame 
 * @param {*} framesPerRow 
 * @param {*} frames 
 * @param {*} pos 
 * @param {*} worldSpace 
 * @param {*} tint 
 * @param {*} scale 
 * @param {*} customShader 
 * @param {*} customUniforms 
 */
export const drawSpriteSheet = (gl, spriteSheet, frame, framesPerRow, frames, pos, worldSpace = false, tint = [1, 1, 1, 1], scale = [1, 1], customUniforms = {}) => {
  // if (!spriteSheetShader) return;
  const uniforms = {
    u_tint: tint,
    u_frameOffset: frame,
    u_spritesPerRow: framesPerRow,
    u_numFrames: frames,
    u_cutThreshold: 1,
    ...customUniforms,
  };

  gl.depthMask(true);
  gl.colorMask(false, false, false, false);
  drawTex(gl, spriteSheet, {
    x: pos.x,
    y: pos.y,
    z: -pos.y,
  }, camera.pos, scale, spriteSheetShader, uniforms);

  gl.colorMask(true, true, true, true);
  gl.depthMask(false);
  gl.stencilMask(0);

  uniforms.u_cutThreshold = 0;
  drawTex(gl, spriteSheet, {
    x: pos.x,
    y: pos.y,
    z: -pos.y,
  }, camera.pos, scale, spriteSheetShader, uniforms);
}