// Reference:
// https://github.com/mattdesl/parametric-curves/blob/master/lib/shaders/tube.frag#L14

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
  vec3 normal = vNormal;
  #ifdef FLAT_SHADED
    normal = faceNormal(vViewPosition);
  #endif
  float brightness = normal.y * 0.5 + 0.5;

  // add some fake rim lighting
  vec3 V = normalize(vViewPosition);
  float vDotN = 1.0 - max(dot(V, normal), 0.0);
  float rim = smoothstep(0.5, 1.0, vDotN);
  brightness += rim * 2.0 + pow(rim, 16.0) * 0.5;

  float transparent = 1.0 - abs(sin(vPosition * PI * 10.0));
  transparent = pow(transparent, 4.0);

  float highlight = 1.0 - abs(sin(vPosition * PI * 5.0));
  highlight = pow(highlight, 4.0);

  gl_FragColor = vec4(brightness * color, 1.0);
}