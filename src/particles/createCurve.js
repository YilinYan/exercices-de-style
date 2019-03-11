// Reference:
// https://github.com/mattdesl/parametric-curves/blob/master/lib/geom/createTubeGeometry.js#L2

module.exports = (sides = 8, segments = 50, openEnded = false) => {
  // create a CylinderGeometry as base
  const radius = 1;
  const length = 1;
  const baseGeometry = new THREE.CylinderGeometry(radius, radius, length, sides, segments, openEnded);  
  baseGeometry.rotateZ(Math.PI / 2);  // put it horizontally

  const angles = [];
  const postions = [];
  const UVS = []
  const vertices = baseGeometry.vertices;
  baseGeometry.faces.forEach((face, i) => {
    const {a, b, c} = face;
    const verts = [vertices[a], vertices[b], vertices[c]];
    const uvs = baseGeometry.faceVertexUvs[0][i];  // the first layer of uvs, and the i-th

    // if(verts[0].y >= 0 && verts[1].y >= 0 && verts[2].y >= 0) {  // cull out the back side
      verts.forEach((pos, j) => {
        const angle = Math.atan2(pos.z, pos.y);
        angles.push(angle);
        postions.push(pos.x + 0.5);  // [-0.5, 0.5] -> [0.0, 1.0]
        UVS.push(uvs[j].toArray());
      })
    // }
  });

  const angleArray = new Float32Array(angles);
  const posArray = new Float32Array(postions);
  const uvArray = new Float32Array(UVS.length * 2);

  for (let i = 0; i < posArray.length; ++i) {
    const [u, v] = UVS[i];
    uvArray[i * 2] = u;
    uvArray[i * 2 + 1] = v;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.addAttribute('position', new THREE.BufferAttribute(posArray, 1));
  geometry.addAttribute('angle', new THREE.BufferAttribute(angleArray, 1));
  geometry.addAttribute('uv', new THREE.BufferAttribute(uvArray, 2));

  baseGeometry.dispose();
  return geometry;
}