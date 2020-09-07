// TODO: spacial segregation ;)

/**
 * @typedef GameObject
 * @property {number} id
 * @property {string} name
 * @property {Vector} pos
 * @property {string} sprite
 */

/**
 * @type {GameObject[]}
 */
const gameObjects = [];

/**
 * Add a GameObject to the scene asynchronously
 * @param {GameObject} object The GameObject to add the scene
 */
const addObject = async (object) => {
  object._sprite = await getSprite(object.sprite);
  object.id = gameObjects.length;
  recalculateBounds(object);
  gameObjects.push(object);
  return object;
}

const recalculateBounds = (object) => {
  // TODO: implement AABB calculation
}

/**
 * @param {GameObject} object The GameObject to instantiate.
 */
const instantiate = (object, position) => {

}

/**
 * Draw the current scene
 * @param {CanvasRenderingContext2D} ctx Canvas context
 * @param {number} dt Delta Time
 */
const drawScene = (ctx, dt) => {
  for (let object of gameObjects) {
    // console.log(object.sprite);
    ctx.drawImage(object._sprite, object.pos.x, object.pos.y);
  }
}