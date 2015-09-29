module.exports = function (canvas, gl) {
  if (!!gl) {
  
    // Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Set the viewport properties
    gl.viewport(0, 0, canvas.width, canvas.height);

    // Render just 2 triangles
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  }
}