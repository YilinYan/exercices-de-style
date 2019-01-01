// attributes of our mesh
attribute float position;
attribute float angle;
attribute vec2 uv;

// built-in uniforms from ThreeJS camera and Object3D
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat3 normalMatrix;

// custom uniforms to build up our tubes
uniform float thickness;
uniform float time;
uniform float radialSegments;

// pass a few things along to the vertex shader
varying vec2 vUv;
varying vec3 vViewPosition;
varying vec3 vNormal;

vec3 sample (float t) {
  float x = t * 2.0 - 1.0;
  float y = sin(t + time);
  return vec3(x, y, 0.0);
}

void createTube (float t, vec2 volume, out vec3 offset, out vec3 normal) {
  // find next sample along curve
  float nextT = t + (1.0 / float(lengthSegments));

  // sample the curve in two places
  vec3 current = sample(t);
  vec3 next = sample(nextT);
  
  // compute the TBN matrix
  vec3 T = normalize(next - current);
  vec3 B = normalize(cross(T, next + current));
  vec3 N = -normalize(cross(B, T));

  // extrude outward to create a tube
  float tubeAngle = angle;
  float circX = cos(tubeAngle);
  float circY = sin(tubeAngle);

  // compute position and normal
  normal.xyz = normalize(B * circX + N * circY);
  offset.xyz = current + B * volume.x * circX + N * volume.y * circY;
}

void main() {
  float t = position + 0.5;
  vec2 volume = vec2(thickness, thickness);
  vec3 transformed;
  vec3 objNormal;
  createTube(t, volume, transformed, objNormal);

  vec4 mvPos = modelViewMatrix * vec4(transformed, 1.0);
  gl_Position = projectionMatrix * mvPos;
}