// Reference:
// https://github.com/mattdesl/parametric-curves/blob/master/lib/shaders/tube.frag#L14

#extension GL_OES_standard_derivatives : enable
precision highp float;

uniform vec3 sscolor;
uniform vec3 cameraPos;

varying vec2  vUv;
varying vec3  vViewPosition;
varying vec3  vNormal;
varying float vPosition;
varying vec3  vVertPos;
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
  vec3 normal = vNormal;
  vec3 lightDirec = normalize(vec3(1.0, 1.0, -1.0) - vVertPos);
  float diffuse = clamp(dot(lightDirec, normal), 0.0, 1.0);
  diffuse = pow(diffuse, 1.5);
  float ambient = dot(lightDirec, normal) * 0.5 + 0.5;

  vec3 col = vec3(0.0);
  col += diffuse * vec3(0.1, 0.1, 1.0) * sscolor;
  col += ambient * vec3(0.4, 0.1, 0.1) * sscolor;

  // add some fake rim lighting
  vec3 view = normalize(vViewPosition);
  vec3 ref = normalize(2.0 * normal - lightDirec);
  float specular = clamp(dot(view, ref), 0.0, 1.0);
  col += pow(specular, 4.0) * diffuse * vec3(0.1, 0.1, 1.0);
  col += pow(specular, 12.0) * vec3(0.1, 0.1, 1.0);

  // back light
  float diffuse2 = clamp(dot(-lightDirec, normal), 0.0, 1.0);
  diffuse2 = pow(diffuse2, 4.0);
  col += diffuse2 * vec3(0.2, 0.1, 0.1) * sscolor;

  // tone map
  col = col / (vec3(1.0) + col);
  col = pow(col, vec3(0.7)) * 1.5;

  // alpha
  float alpha = pow(1.0 - clamp(dot(view, normal), 0.0, 1.0), 2.0);
  // if(int(vIndex) == int(vIndex) / 32 * 32) {
  //   col = pow(col, vec3(0.9, 0.6, 0.4));
  //   alpha *= vVertPos.x * 2.;
  //   alpha = alpha / 4.;
  // }
  // else {
  //   if(length(vVertPos.z) < 0.4) alpha *= vVertPos.z * 2.5;
  //   if(length(vVertPos.x) < 0.2) alpha *= vVertPos.x * 5.0;
  // }
  gl_FragColor = vec4(col, 1.0);
}