
const scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 5;
var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var curve = createCurve();
var material = new THREE.MeshBasicMaterial( {color: 0xff0000} );
var cylinder = new THREE.Mesh( curve, material );
scene.add( cylinder );

function animate() {
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}
animate();