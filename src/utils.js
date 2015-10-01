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

module.exports.mouse2clip = function (e) {
  var c = $('#canvas');
  var x = e.pageX - c.offset().left;
  var y = e.pageY - c.offset().top;
  var w = c.width();
  var h = c.height();
  return coord = [2*x/w-1, 2*(h-y)/h-1];
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
  var p0 = [0, 0, 0];

  // temp
  var theta = 0;

  // Consider resetting p0 on certain canvas event

  return function (xy, r) {

      // Extract 2D coordinates
      var x = xy[0];
      var y = xy[1];

      // Solve for 'z' on virtual trackball of radius 'r'
      var z = Math.sqrt(r * r - x * x - y * y);

      // End point
      var p1 = [x, y, z];

      // Get axis of rotation
      //var N = utils.cross(p0, p1);
      //x = N[0];
      //y = N[1];
      //z = N[2];

      // project Normal onto each axis with dot product
      // then use cross product to extract rotation amount

      // Approximate angle
      //var theta = sqrt(x * x + y * y + z * z);

      // Solve for alpha, beta and gamma values using N components
      //var alpha = ;
      //var beta = ;
      //var gamma = ;

      // Set new start point
      p0 = p1;

      return [0, theta += 2, 0];
  }

}());

// not tested
// map a value from one coordinate axis to another
// from[min, max]
// to[min, max]
module.exports.map2 = function (value, from, to) {
    return (to[1] - to[0]) / (from[1] - from[0]) * value;
}
