import * as twgl from './lib/twgl-full.module.js'
import { Vector } from './util/Vector.js'


export const m4 = twgl.m4;

const shaders = {};

export const loadShader = async (path) => { // TODO: cache shaders
  // console.log(shaders)
  if (shaders[path]) return shaders[path];
  return fetch(`../shaders/${path}.glsl`).then(async (res) => {
    console.log(`Loaded shader '${path}'!`)
    shaders[path] = await res.text();
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