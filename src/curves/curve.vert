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
uniform float animateRadius;
uniform float animateStrength;
uniform float index;
uniform float radialSegments;

// pass a few things along to the vertex shader
varying vec2 vUv;
varying vec3 vViewPosition;
varying vec3 vNormal;

void main() {
  gl_Position = projectionMatrix * position;
}