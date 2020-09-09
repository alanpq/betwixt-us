precision mediump float;

varying vec2 v_texcoord;
// varying float v_depth;

uniform sampler2D u_texture;
uniform vec4 u_tint;
uniform float u_cutThreshold;
 
void main() {
  vec4 tex = texture2D(u_texture, v_texcoord);
  if(tex.a < u_cutThreshold) discard;
  gl_FragColor = vec4(u_tint.rgb, tex.a);
}