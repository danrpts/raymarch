var utils = require('./utils.js');
var $ = require('jquery');

module.exports = function (canvas, gl, program) {

  // temporary
  window.update = function (id, value) {
    gl.uniform1f(gl.getUniformLocation(program, id), value);
    utils.render(canvas, gl);
  }

  window.light2coord = function (theta) {
    theta = theta || $('#light').val();
    theta = utils.deg2rad(theta);
    var r = 6;
    return [r*Math.cos(theta), r, r*Math.sin(theta)];
  }

  window.lightHandler = function (value) {
    gl.uniform3fv(gl.getUniformLocation(program, 'light'), light2coord(value));
    utils.render(canvas, gl);
  }

  // mousemove
  //$('#canvas').mousemove(function (e) {
  //  if (e.ctrlKey) {
  //    var coord = utils.clipCoords(e);
  //    coord.push(0);
  //    gl.uniform3fv(gl.getUniformLocation(program, 'mouse'), new Float32Array(coord));
  //    utils.render(canvas, gl);
  //  }
  //});

  // mousedown + mousemove = rotate viewer
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
