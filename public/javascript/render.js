import * as twgl from './lib/twgl-full.module.js'
import { Vector } from './util/Vector.js'


export const m4 = twgl.m4;

export const loadShader = async (path) => { // TODO: cache shaders
  return fetch(`../shaders/${path}.glsl`).then(res => {
    console.log(`Loaded shader '${path}'!`)
    return res.text()
  }).catch((reason) => {
    console.error(`Failed to load shader '${path}'!`)
    console.error(`Reason: ${reason}`)
  })
}

export const camera = {
  pos: new Vector(0, 0),
  zoom: 50,
}