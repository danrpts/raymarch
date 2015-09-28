var render = require('./render.js');
var $ = require('jquery');

module.exports = function (gl, canvas) {

  // temporary
  window.update = function (id, value) {
    gl.uniform1f(gl.getUniformLocation(program, id), value);
    render(gl, canvas);
  }


  rotate = function rotate (x, y, z) {
    var r = Math.PI / 180.0,
      c = Math.cos,
      s = Math.sin,
      xrad = x * r,
      cx = c(xrad),
      sx = s(xrad),
      yrad = y * r,
      cy = c(yrad),
      sy = s(yrad),
      zrad = z * r,
      cz = c(zrad),
      sz = s(zrad);
    return [
      cy*cz,           -cy*sz,          sy,    
      sx*sy*cz+cx*sz,  -sx*sy*sz+cx*cz, -sx*cy,
      -cx*sy*cz+sx*sz, cx*sy*sz+sx*cz,  cx*cy    
    ]
  }

  // ctrl + mousemove = look around
  $('#canvas').mousemove(function (e) {
    if (e.ctrlKey) {
      var x = e.pageX - $(this).offset().left;
      var y = e.pageY - $(this).offset().top;
      var w = $(this).width();
      var h = $(this).height();
      var coord = [2*x/w-1, 2*(h-y)/h-1];
      gl.uniform2fv(gl.getUniformLocation(program, 'mouse'), new Float32Array(coord));
      render(gl, canvas);
    }
  });

  $('#canvas').mousedown(function (e) {

  });

  $('#canvas').keydown(function (e) {
    switch (e.which) {
      case 87: w(); break;
      case 65: a(); break;
      case 83: s(); break;
      case 68: d(); break;
      default: break;
    }
  });

  function w() {} 

  function a() {} 

  function s() {} 

  function d() {}

}
