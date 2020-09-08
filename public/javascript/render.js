import * as twgl from './lib/twgl-full.module.js'
import { Vector } from './util/Vector.js'

/** @type {WebGLRenderingContext} */
export const gl = twgl.getContext(canvas, {
  alpha: false,
  stencil: true,
  antialias: true,
  desynchronized: true,
  powerPreference: 'high-performance',
});
/** @type {CanvasRenderingContext2D} */
export const ctx = overlayCanvas.getContext("2d", { alpha: true })

export const m4 = twgl.m4;

export const loadShader = async (path) => { // TODO: cache shaders
  return fetch(`../shaders/${path}.glsl`).then(res => res.text())
}

export const camera = {
  pos: new Vector(0, 0),
  zoom: 50,
}