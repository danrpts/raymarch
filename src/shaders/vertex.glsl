precision highp float;
attribute vec2 vertex;
varying vec2 uv;
void main () {
	gl_Position = vec4(vertex, 0, 1);
	uv = gl_Position.xy;
}