var utils = require('./utils.js');
var $ = require('jquery');

module.exports = function (canvas, gl, program) {

  // temporary
  window.update = function (id, value) {
    gl.uniform1f(gl.getUniformLocation(program, id), value);
    utils.render(canvas, gl);
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
    var dragging = true, delta = 0;
    $('#canvas').mousemove(function (e) {
      
      if (dragging) {

        // Extract information
        var coord = utils.mouse2clip(e);
        var mv = utils.trackball(coord, 1);

        // Apply & render!
        gl.uniformMatrix4fv(gl.getUniformLocation(program, 'mv'), gl.FALSE, new Float32Array(mv));
        utils.render(canvas, gl);

      }

    });
    $('#canvas').mouseup(function (e) {
      dragging = false;
    });
  });

}
