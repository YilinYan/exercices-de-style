// Reference:
// https://github.com/mattdesl/parametric-curves/blob/master/lib/shaders/tube.frag#L14

#extension GL_OES_standard_derivatives : enable
precision highp float;

uniform vec3 color;

varying vec3 vNormal;
varying vec2 vUv; 
varying vec3 vViewPosition;
varying float vPosition;
varying vec3 vVertPos;
varying float vIndex;
varying float vTime;

#pragma glslify: faceNormal = require('glsl-face-normal');

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

void main () {
  // handle flat and smooth normals
  vec3 normal = vNormal;
  // #ifdef FLAT_SHADED
  //   normal = faceNormal(vViewPosition);
  // #endif
  vec3 scol = vec3(0.3, 0.3, 0.5);
  vec3 lightDirec = normalize(vec3(10.0, -2.0, 6.0));
  float diffuse = clamp(dot(lightDirec, normal), 0.0, 1.0);
  float ambient = dot(lightDirec, normal) * 0.5 + 0.5;

  vec3 col = vec3(0.0);
  col += diffuse * vec3(0.1, 0.1, 1.0) * scol;
  col += ambient * vec3(0.3, 0.1, 0.1) * scol;

  // add some fake rim lighting
  vec3 view = normalize(vViewPosition);
  vec3 ref = normalize(2.0 * normal - lightDirec);
  float specular = clamp(dot(view, ref), 0.0, 1.0);
  col += pow(specular, 4.0) * diffuse * vec3(0.1, 0.1, 1.0);
  col += pow(specular, 12.0) * vec3(0.1, 0.1, 1.0);

  // back light
  float diffuse2 = clamp(dot(-lightDirec, normal), 0.0, 1.0);
  col += diffuse2 * vec3(0.7, 0.1, 0.1) * scol;

  // tone map
  col = col / (vec3(1.0) + col);
  col = pow(col, vec3(0.7)) * 1.5;

  // alpha
  float alpha = clamp(length(vVertPos) * 0.05, 0.0, 1.0) * (
    sqrt(ambient) + pow(specular, 4.0) * diffuse);
  // cut into segments
  // alpha *= sign(fract((vPosition + 0.5) * 12.0 + vIndex / 40. * 2.0 + vTime / 4.) - 0.5);
  alpha *= pow(noise(8.0*vec2(vPosition, 1024.0*vIndex/float(TOTAL_MESHES))), 3.0);

  gl_FragColor = vec4(col, alpha);
}