// Reference:
// https://github.com/mattdesl/parametric-curves/blob/master/lib/geom/createTubeGeometry.js#L2

var createCurve = (sides = 8, subdivs = 50, openEnded = false) => {
  // create a CylinderGeometry as base
  const radius = 1;
  const length = 1;
  const baseGeometry = new THREE.CylinderGeometry(radius, radius, length, sides, subdivs, openEnded);

  // put it horizontally
  baseGeometry.rotateZ(Math.PI / 2);

  const angles = [];
  const postions = [];
  const vertices = baseGeometry.vertices;

  baseGeometry.faces.forEach((face, i) => {
    const {a, b, c} = face;
    const verts = [vertices[a], vertices[b], vertices[c]];
    // the first layer of uvs, and the i-th
    const uvs = baseGeometry.faceVertexUvs[0][i];

//    console.log("verts", verts);

    verts.forEach((v, j) => {
      // maybe need normalize ? (seems to be the same)
      // count the radial angle
      const angle = Math.atan2(v.z, v.y);
      angles.push(angle);

      postions.push(v.x);

//      console.log("angle", angle, "v.x", v.x);
    })
  });

  const angleArray = new Float32Array(angles);
  const posArray = new Float32Array(postions);

  console.log(angleArray);
  console.log(posArray);

  const geometry = new THREE.BufferGeometry();
  geometry.addAttribute('position', new THREE.BufferAttribute(posArray, 1));
  geometry.addAttribute('angle', new THREE.BufferAttribute(angleArray, 1));

  baseGeometry.dispose();
  return geometry;
}