#extension GL_OES_standard_derivatives : enable
precision highp float;

uniform vec3 color;

varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vViewPosition;
varying float vPosition;

#pragma glslify: faceNormal = require('glsl-face-normal');

void main () {
  // handle flat and smooth normals

  float brightness = vNormal.y * 0.5 + 0.5;

  float transparent = 1.0 - abs(sin(vPosition * PI * 10.0));
  transparent = pow(transparent, 4.0);

  float highlight = 1.0 - abs(sin(vPosition * PI * 5.0));
  highlight = pow(highlight, 4.0);

  gl_FragColor = vec4(brightness * color, 1.0);
}