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
uniform float size;
uniform float index;

// pass a few things along to the vertex shader
varying vec2  vUv;
varying vec3  vViewPosition;
varying vec3  vNormal;
varying float vPosition;
varying vec3  vVertPos;
varying float vIndex;
varying float vTime;

float noise(float t) {
  return fract(sin(t * 31.7 + 24151.991));
}

float hash(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233)))*
        43758.5453123);
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

void noised(vec2 x, out float value, out vec3 derivative) {
    vec2 p = floor(x);
    vec2 w = fract(x);
    vec2 u = w * w * (3. - 2. * w);
    vec2 du = 6. * w * (1. - w);

    float a = hash( p+vec2(0,0) );
    float b = hash( p+vec2(1,0) );
    float c = hash( p+vec2(0,1) );
    float d = hash( p+vec2(1,1) );

    float k0 =  a;
    float k1 =  - a + b;
    float k2 =  a - b - c + d;
    float k3 =  - a + c;
    float k4 =  a - b - c + d;

    // value = k0 + k1 * u.x + k3 * u.y + k2 * u.x * u.y;
    value = noise(x);
    vec2 deri = du * vec2(k1 + k2 * u.y, k3 + k4 * u.x);
    derivative =  normalize(vec3(deri.x, noise(x + deri) - value, deri.y));
    // derivative =  normalize(vec3(deri.x, 1.0, deri.y));
}

void sample (float t, out vec3 samplePos, out vec3 derivative) {
  float value;
  vec3 deri;
  vec2 hashPos = vec2(-time/4., time/16.) + 8.0 * vec2(t, index / float(TOTAL_MESHES)).yx;
  noised(hashPos, value, deri);
  // samplePos = vec3(t, 0.14 * value, index / float(TOTAL_MESHES));
  samplePos = vec3(index / float(TOTAL_MESHES), 0.14 * value, t);
  derivative = deri;

  // samplePos = vec3(t, 0.14 * noise(vec2(-time/4.) + 8.0 * vec2(t, index / float(TOTAL_MESHES))), index / float(TOTAL_MESHES));

  // vec3 ret = vec3(t, 0.14 * noise(vec2(-time/4.) + 8.0 * vec2(t, index / float(TOTAL_MESHES))), index / float(TOTAL_MESHES));
  // if(int(index) > int(index) / 2 * 2) return ret.xyz;
  // return vec3(ret.z, 0.14 * noise(vec2(-time/4.) + 8.0 * vec2(ret.z, ret.x)), ret.x);;
}

void createTube (float t, vec2 volume, out vec3 offset, out vec3 normal) {
  float nextT = t + (1.0 / float(TOTAL_SEGMENTS));
  vec3 current, currentDeri;
  sample(t, current, currentDeri);
  vec3 next, nextDeri;
  sample(nextT, next, nextDeri);

  // compute the TBN matrix
  vec3 T = normalize(next - current);
  // vec3 T = currentDeri;
  // vec3 B = normalize(cross(T, next + current));
  // vec3 B = normalize(cross(T, currentDeri));
  vec3 B = normalize(vec3(0, 1, 0));
  vec3 N = -normalize(cross(B, T));

  // extrude outward to create a tube
  float tubeAngle = angle;
  float circX = cos(tubeAngle);
  float circY = sin(tubeAngle);

  // compute position and normal
  normal.xyz = normalize(B * circX + N * circY);
  offset.xyz = current + (B * volume.x * circX + N * volume.y * circY);
}

void main() {
  vec2 volume = vec2(thickness * 8.0, thickness * 0.5);
  vec3 transformed;
  vec3 objNormal;

  createTube(position, volume, transformed, objNormal);
  vec4 mvPos = modelViewMatrix * vec4(transformed, 1.0);
  vNormal = normalize(normalMatrix * objNormal);
  vUv = uv.yx;
  vViewPosition = -mvPos.xyz;  // ??????
  vPosition = position;
  vVertPos = transformed;
  vIndex = index;
  vTime = time;

  gl_Position = projectionMatrix * mvPos;
}