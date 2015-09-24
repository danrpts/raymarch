var $ = require('jquery'),
	delta = 0.09;

$('canvas').mouseup(function (e) {
	var pos = [e.pageX - $(this).offset().left, e.pageY - $(this).offset().top]
	window.gl.uniform2fv(gl.getUniformLocation(program, 'mouse'), new Float32Array(pos));
	window.render();
});

$('body').keydown(function (e) {
	switch (e.which) {
		case 87: w(); break;
		case 65: a(); break;
		case 83: s(); break;
		case 68: d(); break;
		default: break;
	}
});

function w() {
	window.eye[2] -= delta;
	window.gl.uniform3fv(gl.getUniformLocation(program, 'eye'), new Float32Array(window.eye));
	window.render();
} 

function a() {
	window.eye[0] -= delta;
	window.gl.uniform3fv(gl.getUniformLocation(program, 'eye'), new Float32Array(window.eye));
	window.render();
} 

function s() {
	window.eye[2] += delta;
	window.gl.uniform3fv(gl.getUniformLocation(program, 'eye'), new Float32Array(window.eye));
	window.render();
} 

function d() {
	window.eye[0] += delta;
	window.gl.uniform3fv(gl.getUniformLocation(program, 'eye'), new Float32Array(window.eye));
	window.render();
}