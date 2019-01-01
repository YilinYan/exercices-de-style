#extension GL_OES_standard_derivatives : enable
precision highp float;

varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vViewPosition;

#pragma glslify: faceNormal = require('glsl-face-normal');

void main () {
  // handle flat and smooth normals

  gl_FragColor = vec4(vec3(vNormal.y * 0.5 + 0.5), 1.0);
}