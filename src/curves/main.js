const scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 10;
var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

/*
var curve = createCurve();
// MeshBasicMaterial in THREE.js is like a toon shader (
// good for silouhette, shadow drawing or wireframe) and and is not affected by lights.
// https://stackoverflow.com/a/16624721/7720237
var material = new THREE.MeshPhongMaterial( {color: 0xff1111} );
var cylinder = new THREE.Mesh( curve, material );
scene.add( cylinder );
*/

var light = new THREE.PointLight( 0xfefeee, 1, 100 );
light.position.set( 4, 4, 0 );
scene.add( light );

var light = new THREE.AmbientLight( 0x404040 );
scene.add( light );

// use the tool to make shaders
const glslify = require( 'glslify' );
//const Path = require('path');
const vShader = glslify( './curve.vert' );
const fShader = glslify( './curve.frag' );
const material = new THREE.RawShaderMaterial({
  vertexShader: vShader,
  fragmentShader: fShader,
  side: THREE.FrontSide,  // what is side ?
  extensions: {
    deriviatives: true
  },
  defines: {
    lengthSegments: 50,  // subdivs
    FLAT_SHADED: false
  },
  uniforms: {
    thickness: { type: 'f', value: 1 },
    time: { type: 'f', value: 0 },
    radialSegments: { type: 'f', value: 8 }
  }
});

const createCurve = require( './createCurve.js' );
var geometry = createCurve();
const mesh = new THREE.Mesh( geometry, material );
mesh.frustumCulled = false;
scene.add( mesh );

function animate() {
  requestAnimationFrame( animate );
  renderer.render( scene, camera );
  mesh.material.uniforms.time.value += 0.1;
}
animate();