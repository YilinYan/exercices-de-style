// Reference:
// https://github.com/mattdesl/parametric-curves/blob/master/lib/geom/createTubeGeometry.js#L2

var createCurve = (sides = 8, subdivs = 50, openEnded = false) => {
  // create a CylinderGeometry as base
  const radius = 1;
  const length = 1;
  const baseGeometry = new THREE.CylinderGeometry(radius, radius, length, sides, subdivs, openEnded);

 // baseGeometry.rotateZ(Math.PI / 2);

  return baseGeometry;
}