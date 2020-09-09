import * as object from './object.js'
import { Vector } from './util/Vector.js'
import Player from './Player.js'

/** @param {Player}
 */

export const locPlayerColl = (locPlayer) => {
  return;
  for (let obj of object.gameObjects) {
    // height and width of palyer is ahrdcoded for now
    // TODO: im sleepy must improve efficiency 
    // also add player thickness at some point
    // only works for squares at the moment

    // checks if in x space
    if (locPlayer.pos.x + locPlayer.velocity.x > obj.pos.x + obj.bounds.x && locPlayer.pos.x + locPlayer.velocity.x < obj.pos.x + obj.bounds.w) {
      // now check if in y space
      if (locPlayer.pos.y + locPlayer.velocity.y > obj.pos.y + obj.bounds.y && locPlayer.pos.y + locPlayer.velocity.y < obj.pos.y + obj.bounds.h) {
        console.log(`collision with object of id ${obj.id}, bitch`)
        if (Math.abs(locPlayer.velocity.x) > Math.abs(locPlayer.velocity.y)) {
          if (locPlayer.velocity.x > 0) {
            locPlayer.velocity.x = object.pos.x + object.bounds.x - locPlayer.pos.x
          } else if (locPlayer.velocity.x < 0) {
            locPlayer.velocity.x = obj.pos.x + obj.bounds.w - locPlayer.pos.x
          }
        } else {
          if (locPlayer.velocity.y > 0) {
            locPlayer.velocity.y = obj.pos.y + obj.bounds.y - locPlayer.pos.y
          } else if (locPlayer.velocity.y < 0) {
            locPlayer.velocity.y = obj.pos.y + obj.bounds.h - locPlayer.pos.y
          }
        }
      }
    }
  }
}