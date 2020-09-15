import * as twgl from '../javascript/lib/twgl-full.module.js'
import { gl, W, H } from './canvas.js'
import * as sprite from './sprite.js'
import * as player from './Player.js'
import { hookPreload } from './hooks.js';
import { loadShader, camera } from './render.js'

/**
 * @typedef Interactable
 * @property {number} id
 * @property {string} name
 * @property {Vector} pos
 * @property {string} sprite
 * @property {any} interactCB
 * @property {boolean} disabled
 */

/** @type {Interactable[]} */
export const interactables = [];

let highlightShader;
hookPreload(async () => {
  highlightShader = twgl.createProgramInfo(gl, [await loadShader("vertex"), await loadShader("f_highlight")])
});

/**
 * 
 * @param {Interactable} interactable 
 * @param {any} cb 
 */
export const addInteractable = async (interactable, cb) => {
  interactable._sprite = await sprite.getSprite(gl, interactable.sprite)
  interactable.id = interactables.length;
  interactable.interactCB = cb;
  interactables.push(interactable);
  return interactable.id;
}

export const drawInteractables = () => {
  for (let obj of interactables) {
    gl.stencilMask(0x00);
    gl.stencilFunc(gl.ALWAYS, 0, 0xff);

    // drawHighlight(obj.id, [1, 0, 0, 1]);
    sprite.drawSprite(gl, obj._sprite, obj.pos, true)
  }
}

/**
 * 
 * @param {number} interactableID ID of interactable
 * @param {[number,number,number,number]} tint 
 */
export const drawHighlight = (interactableID, tint) => {
  const obj = interactables[interactableID]
  if (!obj) return;
  // gl.enable(gl.DEPTH_TEST);
  gl.disable(gl.DEPTH_TEST);
  gl.depthMask(false);
  sprite.drawTex(gl, obj._sprite, {
    x: obj.pos.x,
    y: obj.pos.y,
    z: -obj.pos.y + 0.01,
  },
    camera.pos,
    [1.1, 1.1],
    highlightShader,
    {
      u_tint: tint,
      u_cutThreshold: 0,
    });
  gl.depthMask(true);
}