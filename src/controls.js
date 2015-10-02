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
      var coord = utils.clipCoords(e);
      gl.uniform2fv(gl.getUniformLocation(program, 'mouse'), new Float32Array(coord));
      utils.render(canvas, gl);
    }
  });

  // drag about implicit axis
  // needs work
  $('#canvas').mousedown(function (e) {
    var dragging = true, delta = 0;

    $('#canvas').mouseout(function (e) {
      dragging = false;
    });

    $('#canvas').mousemove(function (e) {

      if (dragging) {

        // Extract rotation matrix from coordinates
        var coord = utils.clipCoords(e);
        console.log(coord);
        var mv = utils.trackball(coord, 1);

        // Apply & render!
        gl.uniformMatrix4fv(gl.getUniformLocation(program, 'mv'), gl.FALSE, new Float32Array(mv));
        utils.render(canvas, gl);

      }

    });

    // Stop calculating motion
    $('#canvas').mouseup(function (e) {
      dragging = false;
    });

  });

}
