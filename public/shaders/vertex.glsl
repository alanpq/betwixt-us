precision mediump float;


uniform mat4 u_matrix;
uniform mat4 u_textureMatrix;

attribute vec4 position;
attribute vec2 texcoord;


varying vec4 v_position;
varying vec2 v_texcoord;
// varying float v_depth;

void main () {
  v_position = u_matrix * position;
  gl_Position = v_position;

  
  v_texcoord = texcoord;
  // v_depth = v_position.z;
}