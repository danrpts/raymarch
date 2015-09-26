var $ = require('jquery');

$('canvas').mousemove(function (e) {
    var x = e.pageX - $(this).offset().left,
        y = e.pageY - $(this).offset().top,
        w = $(this).width(),
        h = $(this).height();
	var coord = [2*x/w-1, 2*(h-y)/h-1];
    // console.log(coord); // potential debug info
	window.gl.uniform2fv(gl.getUniformLocation(program, 'mouse'), new Float32Array(coord));
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

} 

function a() {

} 

function s() {

} 

function d() {

}