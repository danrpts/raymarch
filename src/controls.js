var utils = require('./utils.js');
var $ = require('jquery');

module.exports = function (canvas, gl, program) {

  // temporary
  window.update = function (id, value) {
    gl.uniform1f(gl.getUniformLocation(program, id), value);
    utils.render(canvas, gl);
  }

  // ctrl + mousemove = look around
  //$('#canvas').mousemove(function (e) {
  //  if (e.ctrlKey) {
  //    var coord = utils.clipCoords(e);
  //    coord.push(0);
  //    gl.uniform3fv(gl.getUniformLocation(program, 'mouse'), new Float32Array(coord));
  //    utils.render(canvas, gl);
  //  }
  //});

  // drag about implicit axis
  // needs work
  $('#canvas').mousedown(function (e) {
    var dragging = true;

    $('#canvas').mouseout(function (e) {
      dragging = false;
    });

    $('#canvas').mousemove(function (e) {

      if (dragging) {

        // Extract clip coordinates
        var coord = utils.clipCoords(e);

        // Generate rotation matrix; Radius of trackball depends on focal length here
        var m = utils.trackball(coord, $("#focal").val());

        // Apply & render!
        gl.uniformMatrix4fv(gl.getUniformLocation(program, 'rotate_viewer'), gl.FALSE, new Float32Array(m));
        utils.render(canvas, gl);

      }

    });

    // Stop calculating motion
    $('#canvas').mouseup(function (e) {
      dragging = false;
    });

  });


}
