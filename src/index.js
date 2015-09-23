var canvas, program, gl, $ = window.$;

function render () {
    gl.clear(gl.COLOR_BUFFER_BIT); // clear screen
	gl.viewport(0, 0, canvas.width, canvas.height); // set viewport properties
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); // render 2 triangles
}

function initialize () {

	canvas = document.getElementById('canvas');
	gl = canvas.getContext('webgl');

	if (!gl) {
		alert("Unable to initialize WebGL. Your browser may not support it.");
	}
    
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

	program = gl.createProgram();
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

	gl.uniform2fv(gl.getUniformLocation(program, 'resolution'), new Float32Array([canvas.width, canvas.height]));
	gl.uniform1f(gl.getUniformLocation(program, 'fineness'), $('#fineness').val());
	gl.uniform1f(gl.getUniformLocation(program, 'phong_alpha'), $('#phong_alpha').val());
	gl.uniform1f(gl.getUniformLocation(program, 'focal'), $('#focal').val());
	gl.uniform1f(gl.getUniformLocation(program, 'light_x'), $('#light_x').val());
	gl.uniform1f(gl.getUniformLocation(program, 'light_y'), $('#light_y').val());
	gl.uniform1f(gl.getUniformLocation(program, 'light_z'), $('#light_z').val());

	// hack
	window.update = function (id, value) {
		gl.uniform1f(gl.getUniformLocation(program, id), value);
	    render();
	}

	gl.clearColor(0, 0, 0, 1); // set canvas color
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); // create new buffer
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1,  1, 1, -1, 1,  1]), gl.STATIC_DRAW); // buffer in data
	gl.vertexAttribPointer(gl.getAttribLocation(program, 'vertex'), 2, gl.FLOAT, false, 8, 0); // describe buffer
	gl.enableVertexAttribArray(gl.getAttribLocation(program, 'vertex')); // enable buffer
    render();
}

$(initialize);
