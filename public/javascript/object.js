import * as twgl from './lib/twgl-full.module.js'
import * as sprite from './sprite.js'
import { ctx } from './canvas.js';
import { AABB } from './util/util.js'
import { locPlayer } from './game.js'

// TODO: spacial segregation ;)

/**
 * @typedef GameObject
 * @property {number} id
 * @property {string} name
 * @property {Vector} pos
 * @property {string} sprite
 * @property {AABB} bounds
 */

/**
 * @type {GameObject[]}
 */
export const gameObjects = [];

/**
 * Add a GameObject to the scene asynchronously
 * @param {GameObject} object The GameObject to add the scene
 */
export const addObject = async (gl, object) => {
  object._sprite = await sprite.getSprite(gl, object.sprite);
  object.id = gameObjects.length;
  // recalculateBounds(object);
  gameObjects.push(object);
  return object;
}

export const recalculateBounds = (object) => {
  // TODO: implement AABB calculation
  object.bounds = new AABB();
  object.bounds.x = -1;
  object.bounds.y = -1;
  object.bounds.w = 2;
  object.bounds.h = 2;
}

/**
 * @param {GameObject} object The GameObject to instantiate.
 */
export const instantiate = (object, position) => {

}

/**
 * Draw the current scene
 * @param {CanvasRenderingContext2D} ctx Canvas context
 * @param {number} dt Delta Time
 */
export const drawScene = (gl, camera) => {
  for (let object of gameObjects) {
    // console.log(object);
    // ctx.drawImage(object._sprite, object.pos.x, object.pos.y);
    gl.stencilMask(0xff); // write to stencil buffer
    gl.stencilFunc(gl.ALWAYS, 0, 0xff);

    sprite.drawSprite(gl, object._sprite, object.pos, true)
    ctx.fillStyle = "rgba(0,0,0,0.1)"
    ctx.lineWidth = 0.01
    ctx.strokeRect(object.pos.x + object.bounds.x, object.pos.y + object.bounds.y, object.bounds.w, object.bounds.h);

    // ctx.fillRect(object.pos.x * gl.canvas.width)
  }
}