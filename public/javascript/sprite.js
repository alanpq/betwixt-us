import * as twgl from './lib/twgl-full.module.js'
import { gl, m4, loadShader, camera } from './render.js'


export let spriteShader;
(async () => {
  spriteShader = twgl.createProgramInfo(gl, [await loadShader("vertex"), await loadShader("fragTex")])
})()
export const quadBufferInfo = twgl.primitives.createXYQuadBufferInfo(gl);
export let solidProgramInfo
(async () => {
  solidProgramInfo = twgl.createProgramInfo(gl, [await loadShader("vertex"), await loadShader("frag")]);
})()

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

export const drawSprite = (gl, sprite, pos, worldSpace = false, tint = [1, 1, 1, 1], scale = 1) => {
  if (!spriteShader || !sprite || !pos) return;
  const uniforms = {
    u_matrix: twgl.m4.identity(),
    u_texture: sprite,
    // textureMatrix: twgl.m4.scale(twgl.m4.identity(), [0.5, 0.5]),
    u_tint: tint
  };


  // const eye = [Math.sin(time * 3) * 10, 4, Math.cos(time * 3) * 10];
  const eye = [0, 0, -1];
  const target = [0, 0, 0];
  const up = [0, 1, 0];

  const fov = 40 * Math.PI / 180;
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 1;
  const zFar = 500;
  // const projection = twgl.m4.perspective(fov, aspect, zNear, zFar);

  const projection = twgl.m4.ortho(0, gl.canvas.width / camera.zoom, gl.canvas.height / camera.zoom, 0, -100, 100);
  // twgl.m4.rotateY(projection, time, projection);
  if (worldSpace)
    twgl.m4.translate(projection, [-camera.pos.x, -camera.pos.y, 0], projection);
  const ca = twgl.m4.lookAt(eye, target, up);
  const view = twgl.m4.inverse(ca);
  const viewProjection = twgl.m4.multiply(projection, view);

  const world = twgl.m4.translation([-pos.x, pos.y, -pos.y])
  // twgl.m4.rotateY(world, time * 5, world))

  uniforms.u_matrix = twgl.m4.multiply(viewProjection, world)
  twgl.m4.scale(uniforms.u_matrix, [scale, scale, 1], uniforms.u_matrix)

  gl.useProgram(spriteShader.program)
  twgl.setBuffersAndAttributes(gl, spriteShader, quadBufferInfo);
  twgl.setUniforms(spriteShader, uniforms);
  twgl.drawBufferInfo(gl, quadBufferInfo);
}