precision mediump float;
varying vec2 v_texcoord;
// varying float v_depth;
uniform vec2 u_lightPosition;
uniform float u_radius;
uniform vec4 u_tint;

void main() {
  float distance  = length( u_lightPosition - gl_FragCoord.xy );

  float maxDistance = pow( u_radius, 1.0);
  float quadDistance = pow( distance, 1.0);

  float quadIntensity = 1.0 - min( quadDistance, maxDistance )/maxDistance;

  gl_FragColor = vec4(u_tint.rgb, (1.0-quadIntensity) * u_tint.a) * u_tint.a;
}