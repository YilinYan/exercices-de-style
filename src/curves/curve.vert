// Reference:
// https://github.com/mattdesl/parametric-curves/blob/master/lib/shaders/tube.vert#L35

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
uniform float size;
uniform float index;

// pass a few things along to the vertex shader
varying vec2 vUv;
varying vec3 vViewPosition;
varying vec3 vNormal;
varying float vPosition;
varying vec3 vVertPos;
varying float vIndex;
varying float vTime;

#pragma glslify: ease = require('glsl-easings/exponential-in-out');

float noise(float t) {
  return fract(abs(sin(t * 135711.7 + 24151.991)));
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12325.13, 12245.93))) * 86762.39);
}

float noise(vec2 p) {
  vec2 w = fract(p);
  w = w * w * (3.0 - 2.0 * w);
  p = floor(p);
  return mix(
    mix(hash(p + vec2(0.0, 0.0)), hash(p + vec2(1.0, 0.0)), w.x),
    mix(hash(p + vec2(0.0, 1.0)), hash(p + vec2(1.0, 1.0)), w.x), 
    w.y);
}

vec3 spherical (float r, float phi, float theta) {
  return vec3(
    r * cos(phi) * cos(theta),
    r * cos(phi) * sin(theta),
    r * sin(phi)
  );
}

vec3 sample (float t) {
  float beta = t * PI;
  
  float ripple = ease(sin(t * 2.0 * PI + time / 2.) * 0.5 + 0.5) * 0.5;
  // increase delay of each circle
  float noise = time / 128. + index * ripple * 16.0;
  
  // animate radius on click
  float animateRadius = size;
  float animateStrength = 1.5;
  float radiusAnimation = animateRadius * animateStrength * 0.25;
  float r = sin(index * 1.0 + beta * 2.0) * (0.75 + radiusAnimation);
  // increase anim radius
  //r *= r;
  float theta = 4.0 * beta + index * 4.0 + time / 16.;
  float phi = sin(index * 2.0 + beta * 8.0 + noise);

  return spherical(r, phi, theta);
}

/* knot 1
  float beta = t * PI;
  float r = sin(beta * 4.0) + cos(beta * 2.0) * 0.2;
  float phi = sin(beta * 16.0 + time) * 2.0;
  float theta = 10.0 * beta;
  return spherical(r, phi, theta) * size;
*/

/* knot 2
// Reference:
// http://paulbourke.net/geometry/knots/
  float nlongitude = 11.0;
  float nmeridian = 6.0;
  float mu = t * PI * 2.0 * nmeridian;

  float x = cos(mu) * (1.0 + cos(nlongitude*mu/nmeridian) / 2.0);
  float y = sin(mu) * (1.0 + cos(nlongitude*mu/nmeridian) / 2.0);
  float z = sin(nlongitude*mu/nmeridian) / 2.0;

  return vec3(x, y, z) * size * 3.0;
*/

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
  // increase tube radius when getting wider
  offset.xyz = current + 
  (B * volume.x * circX + N * volume.y * circY) * pow((length(current) + 1.0), 0.3);

  // if(noise(t * 0.01, index / 40.0 * 0.01) > 0.3) offset.xyz = current;
}

/* pattern 1
  offset.xyz = current + (B * volume.x * circX + N * volume.y * circY) 
  * step(0.99, noise(t + index * 4.0));
*/

/* pattern 2
  offset.xyz = current + (B * volume.x * circX + N * volume.y * circY) 
  *  noise(t * 710.0);
*/
void main() {
  float t = position + 0.5;
  vec2 volume = vec2(thickness * 
  (0.5*noise(vec2(index/float(TOTAL_MESHES), t)) + 0.5), thickness * 0.2);
  // vec2 volume = vec2(thickness, thickness * 0.2);
  vec3 transformed;
  vec3 objNormal;
  createTube(t, volume, transformed, objNormal);

  vec4 mvPos = modelViewMatrix * vec4(transformed, 1.0);
  vNormal = normalize(normalMatrix * objNormal);
  vUv = uv.yx;
  vViewPosition = -mvPos.xyz;
  vPosition = position + 0.5;
  vVertPos = mvPos.xyz;
  vIndex = index;
  vTime = time;

  gl_Position = projectionMatrix * mvPos;
}