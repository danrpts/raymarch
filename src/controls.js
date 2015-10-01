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

  // drag about implicit axis
  // needs work
  $('#canvas').mousedown(function (e) {
    var dragging = true;
    $('#canvas').mousemove(function (e) {
      if (dragging) {
        var coord = utils.mouse2clip(e);
        var angles = utils.trackball(coord);
        var rotations = utils.rotate(angles);
        gl.uniformMatrix4fv(gl.getUniformLocation(program, 'drag'), gl.FALSE, new Float32Array(rotations));
        utils.render(canvas, gl);
      }
    });
    $('#canvas').mouseup(function (e) {
      dragging = false;
    });
  });

}
