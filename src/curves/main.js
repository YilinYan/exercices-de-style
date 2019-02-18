const scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 5;
var renderer = new THREE.WebGLRenderer({ alpha: true, depth: true });
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor('#000000');

canvas = renderer.domElement;
canvas.setAttribute('background', '#000000');
// gl = canvas.getContext('webgl', { premultipliedAlpha: false });
// gl.blendFunc(gl.ONE_MINUS_SRC_ALPHA, gl.SRC_ALPHA);
document.body.appendChild( canvas );

/*
var curve = createCurve();
// MeshBasicMaterial in THREE.js is like a toon shader (
// good for silouhette, shadow drawing or wireframe) and and is not affected by lights.
// https://stackoverflow.com/a/16624721/7720237
var material = new THREE.MeshPhongMaterial( {color: 0xff1111} );
var cylinder = new THREE.Mesh( curve, material );
scene.add( cylinder );
*/

/*
var light = new THREE.PointLight( 0xfefeee, 1, 100 );
light.position.set( 4, 4, 0 );
scene.add( light );

var light = new THREE.AmbientLight( 0x404040 );
scene.add( light );
*/

const lengthSeg = 300;
const curveSides = 10;
// use the tool to make shaders
const glslify = require( 'glslify' );
//const Path = require('path');
const vShader = glslify( './curve.vert' );
const fShader = glslify( './curve.frag' );
const baseMaterial = new THREE.RawShaderMaterial({
  vertexShader: vShader,
  fragmentShader: fShader,
  side: THREE.FrontSide,  // what is side ?
  blendMode: THREE.AdditiveBlending,
  depthMode: THREE.GreaterDepth,
  transparent: true,
  extensions: {
    deriviatives: true
  },
  defines: {
    lengthSegments: lengthSeg,  // subdivs
    FLAT_SHADED: false,
    PI: Math.PI
  },
  uniforms: {
    thickness: { type: 'f', value: 0.04 },
    time: { type: 'f', value: 0 },
    radialSegments: { type: 'f', value: 8 },
    size: { type: 'f', value: 4.0 },
    color: { type: 'c', value: new THREE.Color('#222262') },
    index: { type: 'f', value: 0 }
  }
});

const myRand = (a, b) => { return Math.random() * (b - a) + a; };
const createCurve = require( './createCurve.js' );
const geometry = createCurve( curveSides, lengthSeg );
const meshContainer = new THREE.Object3D();
const totalMeshes = 40;
const meshes = new Array(totalMeshes).fill(null).map((_, i) => {
  const t = totalMeshes <= 1 ? 0 : i / (totalMeshes - 1);

  const material = baseMaterial.clone();
  material.uniforms = THREE.UniformsUtils.clone(material.uniforms);
  material.uniforms.index.value = t;
  material.uniforms.thickness.value = myRand(0.02, 0.04);

  const mesh = new THREE.Mesh(geometry, material);
  // our geometry only contains a 1-dimensional position attribute 
  // which causes issues with ThreeJS’s built-in frustum culling.
  // https://mattdesl.svbtle.com/shaping-curves-with-parametric-equations
  mesh.frustumCulled = false;

  meshContainer.add(mesh);
  return mesh;
});
scene.add(meshContainer);

var timeNow = Date.now();
function animate() {
  requestAnimationFrame( animate );
  renderer.render( scene, camera );

  var dt = (Date.now() - timeNow) / 1000.0;
  meshes.forEach((mesh) => {
    mesh.material.uniforms.time.value += dt;
  });
  timeNow = Date.now();

  //  mesh.material.uniforms.thickness.value = Math.sin(Date.now() / 1000.0) * 0.2 + 0.5;
}
animate();