var canvas, program, gl;

function render () {
    gl.clear(gl.COLOR_BUFFER_BIT); // clear screen
	gl.viewport(0, 0, canvas.width, canvas.height); // set viewport properties
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); // render 2 triangles
}

function update (id, value) {
	gl.uniform1f(gl.getUniformLocation(program, id), value);
    render();
}

function initialize () {
	canvas = document.getElementById('canvas');
	gl = canvas.getContext('webgl');

	if (!gl) {
		alert("Unable to initialize WebGL. Your browser may not support it.");
	}
    
	var vertShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertShader, document.getElementById('vertex-shader').innerHTML);
	gl.compileShader(vertShader);
	if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
		console.warn('Vertex shader failed to compile. The error log is: %s.', gl.getShaderInfoLog(vertShader));
		gl.deleteShader(vertShader);
		vertShader = null;
		return false;
	}

	var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragShader, document.getElementById('fragment-shader').innerHTML);
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
	gl.uniform1f(gl.getUniformLocation(program, 'fineness'), document.getElementById('fineness').getAttribute('value'));
	gl.uniform1f(gl.getUniformLocation(program, 'phong_alpha'), document.getElementById('phong_alpha').getAttribute('value'));
	gl.uniform1f(gl.getUniformLocation(program, 'eye_x'), document.getElementById('eye_x').getAttribute('value'));
	gl.uniform1f(gl.getUniformLocation(program, 'eye_y'), document.getElementById('eye_y').getAttribute('value'));
	gl.uniform1f(gl.getUniformLocation(program, 'eye_z'), document.getElementById('eye_z').getAttribute('value'));
	gl.uniform1f(gl.getUniformLocation(program, 'eye_f'), document.getElementById('eye_f').getAttribute('value'));
	gl.uniform1f(gl.getUniformLocation(program, 'light_x'), document.getElementById('light_x').getAttribute('value'));
	gl.uniform1f(gl.getUniformLocation(program, 'light_y'), document.getElementById('light_y').getAttribute('value'));
	gl.uniform1f(gl.getUniformLocation(program, 'light_z'), document.getElementById('light_z').getAttribute('value'));

	gl.clearColor(0, 0, 0, 1); // set canvas color
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); // create new buffer
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1,  1, 1, -1, 1,  1]), gl.STATIC_DRAW); // buffer in data
	gl.vertexAttribPointer(gl.getAttribLocation(program, 'vertex'), 2, gl.FLOAT, false, 8, 0); // describe buffer
	gl.enableVertexAttribArray(gl.getAttribLocation(program, 'vertex')); // enable buffer
    render();
}

document.onreadystatechange = function () {
  (document.readyState == "complete") && initialize();
}
