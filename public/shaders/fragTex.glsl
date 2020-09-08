precision mediump float;

varying vec2 v_texcoord;
// varying float v_depth;

uniform sampler2D u_texture;
uniform vec4 u_tint;
 
void main() {
  vec4 tex = texture2D(u_texture, v_texcoord);
  if(tex.a < 0.95) discard;
  gl_FragColor = vec4(tex.rgb * u_tint.rgb, tex.a) * tex.a;
}