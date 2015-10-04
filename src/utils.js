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
  var h = c.height();
  return [x, h-y]; // flip y axis
}

module.exports.normalizedScreenCoords = function (e) {
  var c = $('#canvas');
  var xy = module.exports.screenCoords(e);
  var x = xy[0];
  var y = xy[1];
  var w = c.width();
  var h = c.height();
  return [x/w, y/h]; // normalize
}

module.exports.clipCoords = function (e) {
  var xy = module.exports.normalizedScreenCoords(e);
  var x = xy[0];
  var y = xy[1];
  return coord = [2*x-1, 2*y-1]; // clip 
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

  // Setup matrix
  var m = mat4.create();

  // Reset p0 on mouse up for smooth rotations
  $('#canvas').mouseup(function () {
    p0 = null;
  });

  return function (coord, r) {

    // Check if x-y is on trackball base-circle
    var d = coord[0] * coord[0] + coord[1] * coord[1];

    // Handle coord inside trackball base-circle
    if (d < r * r) {
      
      // Solve for 'z' on virtual trackball of radius 'r'
      coord[2] = Math.sqrt(r * r - d);

    // Otherwise project onto trackball base-circle edge
    } else {

      // Technique: normalize coord like a direction vector and multiply by radius
      var s = r/d;
      coord[0] *= s;
      coord[1] *= s;
      coord[2] = 0;

    }

    // End point
    var p1 = vec3.fromValues.apply(coord, coord);

    if (p0 === null) {

      // Set intial point
      p0 = vec3.create();
      vec3.copy(p0, p1);

      // Returns identity matrix
      return m;

    } else {

      // Set axis of rotation
      var N = vec3.create();
      
      // CCW rotation about N
      vec3.cross(N, p0, p1);

      // Approximate angle between p0 and p1
      theta = vec3.length(N) / (vec3.length(p0) * vec3.length(p1));

      // Normalize the axis of rotation
      vec3.normalize(N, N);

      // Apply transformation; flip theta for CW rotation to follow cursor
      mat4.rotate(m, m, -theta, N);

      // Set new start point
      vec3.copy(p0, p1);

      // Returns matrix for moving camera
      return m;
    }
  }

}());

module.exports.sceneTrackball = (function () {

  // Maintain closure on this point
  var p0 = null;

  // Setup matrix
  var m = mat4.create();

  // Reset p0 on mouse up for smooth rotations
  $('#canvas').mouseup(function () {
    p0 = null;
  });

  return function (coord, r) {

    // Check if x-y is on trackball base-circle
    var d = coord[0] * coord[0] + coord[1] * coord[1];

    // Handle coord inside trackball base-circle
    if (d < r * r) {
      
      // Solve for 'z' on virtual trackball of radius 'r'
      coord[2] = Math.sqrt(r * r - d);

    // Otherwise project onto trackball base-circle edge
    } else {

      // Technique: normalize coord like a direction vector and multiply by radius
      var s = r/d;
      coord[0] *= s;
      coord[1] *= s;
      coord[2] = 0;

    }

    // End point
    var p1 = vec3.fromValues.apply(coord, coord);

    if (p0 === null) {

      // Set intial point
      p0 = vec3.create();
      vec3.copy(p0, p1);

      // Returns identity matrix
      return m;

    } else {

      // Set axis of rotation
      var N = vec3.create();
      
       // BUG::INCONSISTENCY: should be vec3.cross(p0, p1) for ccw rotation but it is not
      vec3.cross(N, p0, p1);

      // Approximate angle between p0 and p1
      theta = vec3.length(N) / (vec3.length(p0) * vec3.length(p1));

      // Normalize the axis of rotation
      vec3.normalize(N, N);

      // Apply transformation
      mat4.rotate(m, m, theta, N);

      // Set new start point
      vec3.copy(p0, p1);

      // Returns matrix for moving camera
      return m;
    }
  }

}());
