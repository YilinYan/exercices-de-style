const scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 10;
var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var curve = createCurve();
// MeshBasicMaterial in THREE.js is like a toon shader (
// good for silouhette, shadow drawing or wireframe) and and is not affected by lights.
// https://stackoverflow.com/a/16624721/7720237
var material = new THREE.MeshPhongMaterial( {color: 0xff1111} );
var cylinder = new THREE.Mesh( curve, material );
scene.add( cylinder );

var light = new THREE.PointLight( 0xfefeee, 1, 100 );
light.position.set( 4, 4, 0 );
scene.add( light );

var light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( light );

function animate() {
  requestAnimationFrame( animate );
  cylinder.rotateZ(0.01);
	renderer.render( scene, camera );
}
animate();