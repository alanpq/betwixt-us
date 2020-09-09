precision mediump float;
uniform float u_frameOffset;

uniform mat4 u_matrix;

uniform float u_spritesPerRow;
uniform float u_numFrames;

// Specified in normalized coordinates (0.0..1.0).
uniform vec2 u_spriteTextureSize;

attribute vec4 position;
attribute vec2 texcoord;

// Output to the fragment shader.
varying vec2 v_texcoord;

void main() {
  // Compute the frame number
  float frameNumber = mod(u_frameOffset, u_numFrames);
  // Compute the row
  float row = floor(frameNumber / u_spritesPerRow);
  // Compute the upper left texture coordinate of the sprite
  // vec2 upperLeftTC = vec2((1.0/u_spritesPerRow) * (frameNumber - (row * u_spritesPerRow)),
  //                         (1.0/(u_numFrames/u_spritesPerRow)) * row);
  vec2 frameSize = vec2(
    1.0 / u_spritesPerRow,
    1.0 / (u_numFrames / u_spritesPerRow)
  );
  vec2 offset = vec2(frameSize.x * (frameNumber - row*u_spritesPerRow),
                      frameSize.y * row);
  // Compute the texture coordinate of this vertex
  vec2 tc = ((texcoord * frameSize) + offset);// * (vec2(0.5, 0.5));
  // v_texcoord = tc;
  v_texcoord = tc;

  // gl_Position = vec4(pos * u_screenDims.xy + u_screenDims.zw, 0.0, 1.0) * u_matrix;
  gl_Position = u_matrix * position;

}