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

    // TODO: Project out of bounds xy coordinate

    // Solve for 'z' on virtual trackball of radius 'r'
    var z = Math.sqrt(r * r - x * x - y * y);

    // End point
    var p1 = vec3.fromValues(x, y, z);

    if (p0 === null) {

      // Set intial point
      p0 = vec3.create();
      vec3.copy(p0, p1);

      // Returns identity matrix
      return mv;

    } else {

      // Set axis of rotation
      var N = vec3.create();
       // BUG::INCONSISTENCY: should be vec3.cross(p0, p1) for ccw rotation but it is not
      vec3.cross(N, p1, p0);

      // Approximate angle between p0 and p1
      theta = vec3.len(N) / (vec3.len(p0) * vec3.len(p1));

      // Normalize the axis of rotation
      vec3.normalize(N, N);
      
      // Move camera to object frame
      mat4.translate(mv, mv, [0,0,-1]);

      // Apply transformation
      mat4.rotate(mv, mv, theta, N);

      // Move camera from object frame
      mat4.translate(mv, mv, [0,0,1]);

      // Set new start point
      vec3.copy(p0, p1);

      return mv;
    }
  }

}());
