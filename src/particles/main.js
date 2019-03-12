const scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.01, 1000 );
var cameraPos = [1.0, 1.0, 1.0];
camera.position.x = cameraPos[0];
camera.position.y = cameraPos[1];
camera.position.z = cameraPos[2];
camera.lookAt(new THREE.Vector3(0.5, 0.5, 0.5));
var renderer = new THREE.WebGLRenderer({ alpha: true, depth: true });
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor('#000000');
canvas = renderer.domElement;
canvas.setAttribute('background', '#000000');
document.getElementById ("canvas").appendChild(canvas)
// window.addEventListener('resize', () => {
//   renderer.setSize( window.innerWidth, height );
// });

// create material
const lengthSeg = 4;
const curveSides = 6;
const glslify = require( 'glslify' );
const vShader = glslify( './curve.vert' );
const fShader = glslify( './curve.frag' );
const totalMeshes = 5000;
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
    posBias: { type: 'vec3', value: new THREE.Vector3() },
    posDire: { type: 'vec3', value: new THREE.Vector3() },
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
  material.uniforms.thickness.value = myRand(0.0018, 0.002);  // random thickness

  var resolution = Math.pow(totalMeshes, 0.33) + 1;
  var idx = Math.floor(i/(resolution*resolution));
  var idy = Math.floor( (i % (resolution*resolution)) / resolution );
  var idz = (i % (resolution*resolution)) % resolution;
  material.uniforms.posBias.value = new THREE.Vector3( idx / resolution, idy / resolution, idz / resolution ).multiplyScalar(0.5);
  material.uniforms.posDire.value = new THREE.Vector3();
  const mesh = new THREE.Mesh(geometry, material);
  // mesh.frustumCulled = false;
  meshContainer.add(mesh);
  return mesh;
});
scene.add(meshContainer);

// animate
var SimplexNoise = require('simplex-noise'),
    ysimplex = new SimplexNoise('sgamsaakk'),
    xsimplex = new SimplexNoise('hhdssgsg'),
    zsimplex = new SimplexNoise('egagdaaw');
var timeNow = Date.now();
var scalar = 0;
function animate() {
  requestAnimationFrame( animate );
  renderer.render( scene, camera );

  var dt = (Date.now() - timeNow) / 1000.0;
  timeNow = Date.now();
  meshes.forEach((mesh, i) => {
    mesh.material.uniforms.time.value += dt;
    posDire = mesh.material.uniforms.posDire.value;
    posBias = mesh.material.uniforms.posBias.value;
    newBias = posBias.clone();

    scalar += dt;
    scalar = Math.min(scalar, 10.0);
    posBias.multiplyScalar(1.5 * (1.0 + scalar / 5000.));
    posDire.x = xsimplex.noise3D(posBias.x, posBias.y, posBias.z);
    posDire.y = ysimplex.noise3D(posBias.x, posBias.y, posBias.z);
    posDire.z = zsimplex.noise3D(posBias.x, posBias.y, posBias.z);
    newBias.addScaledVector(posDire, 0.01); 
    mesh.material.uniforms.posBias.value = newBias;
  });
}
animate();