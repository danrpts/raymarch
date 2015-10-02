module.exports.glinit = function (canvas) {
  var gl = null;
  
  try {    
    // Try to grab the standard context. If it fails, fallback to experimental.
    gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  }
  catch(e) {}
  
  // If we don't have a GL context, give up now
  if (!gl) {
    alert('Unable to initialize WebGL. Your browser may not support it.');
    gl = null;
  }
  
  return gl;
}

module.exports.render = function (canvas, gl) {
  if (!!gl) {
  
    // Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Set the viewport properties
    gl.viewport(0, 0, canvas.width, canvas.height);

    // Render just 2 triangles
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  }
}

module.exports.screenCoords = function (e) {
  var c = $('#canvas');
  var x = e.pageX - c.offset().left;
  var y = e.pageY - c.offset().top;
  return [x, y];
}

module.exports.normalizedCoords = function (e) {
  var c = $('#canvas');
  var x = e.pageX - c.offset().left;
  var y = e.pageY - c.offset().top;
  var w = c.width();
  var h = c.height();
  return [x/w, y/h];
}

module.exports.clipCoords = function (e) {
  var c = $('#canvas');
  var xy = module.exports.screenCoords(e);
  var x = xy[0];
  var y = xy[1];
  var w = c.width();
  var h = c.height();
  return coord = [2*x/w-1, 2*(h-y)/h-1];
}

module.exports.deg2rad = function (deg) {
  return deg*Math.PI/180;
}

module.exports.rad2deg = function (rad) {
  return rad*180/Math.PI;
}

// xy [] 2D coordinates
// r float radius
// TODO: need to fix texture mapping, i.e, when the object is rotated and we raymarch it
/// the value of the hit point is the same because it originated from the same location
//// and so the texture maps to the same location no matter what side of object we view
//// [1] One solution is to rotate the camera instead of the object, clean
//// [2] Somehow keep track of rotations and modify point, ugly
module.exports.trackball = (function () {

  // Maintain closure on this point
  var p0 = null;

  // Setup model-view matrix
  var mv = mat4.create();

  // Reset p0 on mouse up for smooth rotations
  $('#canvas').mouseup(function () {
    p0 = null;
  });

  return function (xy, r) {

    // Extract 2D coordinates
    var x = xy[0];
    var y = xy[1];

    // Solve for 'z' on virtual trackball of radius 'r'
    var z = Math.sqrt(r * r - x * x - y * y);

    // End point
    var p1 = vec3.fromValues(x, y, z);

    if (p0 === null) {

      // Set intial point
      p0 = vec3.create();
      vec3.copy(p0, p1);

      // Return inital identity matrix
      return mv;

    } else {

      // Normalized axis of rotation
      var N = vec3.create();
      vec3.cross(N, p0, p1);
      theta = vec3.len(N);
      console.log("Theta z: ", theta);
      vec3.normalize(N, N);
      
      // Extracting theta_x as counter clockwise rotation
      // 1) Length of vector projected onto yz plane by N
      var d = Math.sqrt(N[1] * N[1] + N[2] * N[2]);

      // 2) Angle from [0, PI] between projection and N
      var theta_x = Math.acos(N[2] / d);
      console.log("Theta x: ", theta_x);
      // 3) Apply x rotation to pull N onto xz plane
      mat4.rotateX(mv, mv, theta_x);

      // Extracting theta_y as clockwise rotation

      var e = Math.sqrt(1 - N[0] * N[0]);
      var theta_y = -Math.acos(e);
      console.log("Theta y: ", theta_y);
      mat4.rotateY(mv, mv, theta_y);

      // Rotate about z
      mat4.rotateZ(mv, mv, theta);

      // Undo alignment with z
      mat4.rotateY(mv, mv, -theta_y);
      mat4.rotateX(mv, mv, -theta_x);

      // Set new start point
      vec3.copy(p0, p1);

      return mv;
    }
  }

}());

// not tested
// map a value from one coordinate axis to another
// from[min, max]
// to[min, max]
module.exports.map2 = function (value, from, to) {
    return (to[1] - to[0]) / (from[1] - from[0]) * value;
}
