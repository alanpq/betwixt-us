import * as twgl from './lib/twgl-full.module.js'
import { Vector } from './util/Vector.js'


export const m4 = twgl.m4;

const shaders = {};
// let shadersLock = false;

export const loadShader = async (path) => { // TODO: cache shaders
  // console.log(shaders)
  // console.trace()
  if (shaders[path]) {
    console.log("precached shader")
    return Promise.resolve(shaders[path]);
  }
  // console.trace(`Loading shader ${path}...`)
  return fetch(`../shaders/${path}.glsl`).then(async (res) => {
    // while (shadersLock);
    // shadersLock = true;
    shaders[path] = await res.text();
    // shadersLock = false;
    console.log(`Loaded shader '${path}'!`)
    return shaders[path]
  }).catch((reason) => {
    console.error(`Failed to load shader '${path}'!`)
    console.error(`Reason: ${reason}`)
  })
}

export const camera = {
  pos: new Vector(0, 0),
  zoom: 50,
}