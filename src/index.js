var utils = require('./utils.js');
var $ = require('jquery');

$(function () {

  var canvas = $('#canvas')[0];
  var gl = utils.glinit(canvas);

  if (!!gl) {

    canvas.width = $('.page-content').width();
    canvas.height = window.innerHeight;

    window.eye = [0,0,0];

    var vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertShader, require('./shaders/vertex.glsl'));
    gl.compileShader(vertShader);
    if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
      console.warn('Vertex shader failed to compile. The error log is: %s.', gl.getShaderInfoLog(vertShader));
      gl.deleteShader(vertShader);
      vertShader = null;
      return false;
    }
    
    var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragShader, require('./shaders/fragment.glsl'));
    gl.compileShader(fragShader);
    if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
      console.warn('Fragment shader failed to compile. The error log is: %s.', gl.getShaderInfoLog(fragShader));
      gl.deleteShader(fragShader);
      fragShader = null;
      return false;
    }
    
    var program = gl.createProgram();
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn('Shader program failed to link. The error log is: %s.', gl.getProgramInfoLog(program));
      gl.detachShader(program, vertShader);
      gl.detachShader(program, fragShader);
      gl.deleteShader(vertShader);
      gl.deleteShader(fragShader);
      gl.deleteProgram(program);
      return false;
    }
    
    gl.useProgram(program);
    
    gl.uniformMatrix4fv(gl.getUniformLocation(program, 'drag'), gl.FALSE, new Float32Array(mat4.create()));
    gl.uniform3fv(gl.getUniformLocation(program, 'eye'), new Float32Array(window.eye));
    gl.uniform2fv(gl.getUniformLocation(program, 'mouse'), new Float32Array([0, 0]));
    gl.uniform2fv(gl.getUniformLocation(program, 'resolution'), new Float32Array([canvas.width, canvas.height]));
    gl.uniform1f(gl.getUniformLocation(program, 'fineness'), $('#fineness').val());
    gl.uniform1f(gl.getUniformLocation(program, 'phong_alpha'), $('#phong_alpha').val());
    gl.uniform1f(gl.getUniformLocation(program, 'focal'), $('#focal').val());
    gl.uniform1f(gl.getUniformLocation(program, 'light_x'), $('#light_x').val());
    gl.uniform1f(gl.getUniformLocation(program, 'light_y'), $('#light_y').val());
    gl.uniform1f(gl.getUniformLocation(program, 'light_z'), $('#light_z').val());

    // temporary 
    require('./controls.js')(canvas, gl, program);
    
    // put texture on gpu
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); 
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, $('#mars')[0]);
    gl.generateMipmap(gl.TEXTURE_2D);
   
    gl.clearColor(0, 0, 0, 1); // set canvas color
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); // create new buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1,  1, 1, -1, 1,  1]), gl.STATIC_DRAW); // buffer in data
    gl.vertexAttribPointer(gl.getAttribLocation(program, 'vertex'), 2, gl.FLOAT, false, 8, 0); // describe buffer
    gl.enableVertexAttribArray(gl.getAttribLocation(program, 'vertex')); // enable buffer
    utils.render(canvas, gl);
  }
  
});
