const height = 900;
const scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 50, window.innerWidth / height, 0.1, 1000 );
const cameraPos = [1.0, 0.3, 1.0];
camera.position.x = cameraPos[0];
camera.position.y = cameraPos[1];
camera.position.z = cameraPos[2];
camera.lookAt(new THREE.Vector3(0,0,0));
var renderer = new THREE.WebGLRenderer({ alpha: true, depth: true });
renderer.setSize( window.innerWidth, height );
renderer.setClearColor('#000000');
canvas = renderer.domElement;
canvas.setAttribute('background', '#000000');
document.getElementById ("canvas").appendChild(canvas)
window.addEventListener('resize', () => {
  renderer.setSize( window.innerWidth, height );
});

// create material
const lengthSeg = 200;
const curveSides = 10;
const glslify = require( 'glslify' );
const vShader = glslify( './curve.vert' );
const fShader = glslify( './curve.frag' );
const totalMeshes = 300;
const baseMaterial = new THREE.RawShaderMaterial({
  vertexShader: vShader,
  fragmentShader: fShader,
  side: THREE.FrontSide,
  transparent: true,
  extensions: {
    deriviatives: true
  },
  defines: {
    PI: Math.PI,
    TOTAL_SEGMENTS: lengthSeg,
    TOTAL_MESHES: totalMeshes,
  },
  uniforms: {
    thickness: { type: 'f', value: 0.01 },
    time: { type: 'f', value: 0 },
    size: { type: 'f', value: 4.0 },
    sscolor: { type: 'c', value: new THREE.Color('#222242') },
    index: { type: 'f', value: 0 },
    cameraPos: { type: 'vec3', value: new THREE.Vector3(cameraPos[0], cameraPos[1], cameraPos[2]) },
  }
});

// create meshes
const myRand = (a, b) => { return Math.random() * (b - a) + a; };
const createCurve = require( './createCurve.js' );
const geometry = createCurve( curveSides, lengthSeg );
const meshContainer = new THREE.Object3D();
const meshes = new Array(totalMeshes).fill(null).map((_, i) => {
  const material = baseMaterial.clone();
  material.uniforms = THREE.UniformsUtils.clone(material.uniforms);
  material.uniforms.index.value = i;
  material.uniforms.thickness.value = myRand(0.001, 0.002);  // random thickness

  const mesh = new THREE.Mesh(geometry, material);
  // mesh.frustumCulled = false;
  meshContainer.add(mesh);
  return mesh;
});
scene.add(meshContainer);

// animate
var timeNow = Date.now();
function animate() {
  requestAnimationFrame( animate );
  renderer.render( scene, camera );

  var dt = (Date.now() - timeNow) / 1000.0;
  timeNow = Date.now();
  meshes.forEach((mesh) => {
    mesh.material.uniforms.time.value += dt;
  });
}
animate();