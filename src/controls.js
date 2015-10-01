var utils = require('./utils.js');
var $ = require('jquery');

module.exports = function (canvas, gl, program) {

  // temporary
  window.update = function (id, value) {
    gl.uniform1f(gl.getUniformLocation(program, id), value);
    render(canvas, gl);
  }

  // ctrl + mousemove = look around
  $('#canvas').mousemove(function (e) {
    if (e.ctrlKey) {
      var coord = utils.mouse2clip(e);
      gl.uniform2fv(gl.getUniformLocation(program, 'mouse'), new Float32Array(coord));
      utils.render(canvas, gl);
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
