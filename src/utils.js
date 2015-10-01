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

module.exports.rotate = function (x, y, z) {
  var r = Math.PI / 180.0;
  var c = Math.cos;
  var s = Math.sin;
  var xrad = x * r;
  var cx = c(xrad);
  var sx = s(xrad);
  var yrad = y * r;
  var cy = c(yrad);
  var sy = s(yrad);
  var zrad = z * r;
  var cz = c(zrad);
  var sz = s(zrad);
  return [
    cy*cz,           -cy*sz,          sy,     0,
    sx*sy*cz+cx*sz,  -sx*sy*sz+cx*cz, -sx*cy, 0,
    -cx*sy*cz+sx*sz, cx*sy*sz+sx*cz,  cx*cy,  0,
    0,               0,               0,      1    
  ]
}

// not tested
// map a value from one coordinate axis to another
// from[min, max]
// to[min, max]
module.exports.map2 = function (value, from, to) {
    return (to[1] - to[0]) / (from[1] - from[0]) * value;
}
