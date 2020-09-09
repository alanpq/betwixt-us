import * as object from './object.js'
import { Vector } from './util/Vector.js'
import Player from './Player.js'

/** @param {Player}
 * @param {Vector}
 */

export const locPlayerColl = (locPlayer, prevPos) => {

  for (let obj of object.gameObjects) {
    // height and width of palyer is ahrdcoded for now
    // TODO: im sleepy must improve efficiency 
    // also add player thickness at some point
    // only works for squares at the moment

    // checks if in x space
    if (locPlayer.pos.x > obj.pos.x + obj.bounds.x && locPlayer.pos.x < obj.pos.x + obj.bounds.w) {
      // now check if in y space
      if (locPlayer.pos.y > obj.pos.y + obj.bounds.y && locPlayer.pos.y < obj.pos.y + obj.bounds.h) {
        console.log(`collision with object of id ${obj.id}, bitch`)
        // confirmed intersection
        if(locPlayer.pos.x < obj.pos.x + obj.bounds.x){}
      }
    }
  }
}