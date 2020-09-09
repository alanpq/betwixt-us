precision mediump float;
varying vec2 v_texcoord;
// varying float v_depth;
uniform sampler2D u_texture;
uniform sampler2D u_colorTexture;
uniform vec2 u_lightPosition;
uniform float u_radius;
uniform vec4 u_tint;
uniform float u_cutThreshold;

void main() {
  vec4 tex = texture2D(u_texture, v_texcoord);
  vec4 color = texture2D(u_colorTexture, v_texcoord);
  if(tex.a < u_cutThreshold) discard;

  float distance  = length( u_lightPosition - gl_FragCoord.xy );

  float maxDistance = pow( u_radius, 1.0);
  float quadDistance = pow( distance, 1.0);

  float quadIntensity = 1.0 - pow(min( quadDistance, maxDistance ) / maxDistance, 6.0);

  // gl_FragColor = vec4(u_tint.rgb, (1.0-quadIntensity) * u_tint.a) * u_tint.a;

  
  gl_FragColor = vec4(mix(tex.rgb, color.rgb * u_tint.rgb, color.a * u_tint.a), tex.a * quadIntensity);
}