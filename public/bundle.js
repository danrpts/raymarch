/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var canvas, program, gl;

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
		gl.shaderSource(vertShader, __webpack_require__(1));
		gl.compileShader(vertShader);
		if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
			console.warn('Vertex shader failed to compile. The error log is: %s.', gl.getShaderInfoLog(vertShader));
			gl.deleteShader(vertShader);
			vertShader = null;
			return false;
		}

		var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(fragShader, __webpack_require__(2));
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
		gl.uniform1f(gl.getUniformLocation(program, 'focal'), document.getElementById('focal').getAttribute('value'));
		gl.uniform1f(gl.getUniformLocation(program, 'light_x'), document.getElementById('light_x').getAttribute('value'));
		gl.uniform1f(gl.getUniformLocation(program, 'light_y'), document.getElementById('light_y').getAttribute('value'));
		gl.uniform1f(gl.getUniformLocation(program, 'light_z'), document.getElementById('light_z').getAttribute('value'));

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

	document.onreadystatechange = function () {
		(document.readyState == "complete") && initialize();
	}


/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = "precision highp float;\nattribute vec2 vertex;\nvarying vec2 uv;\nvoid main () {\n\tgl_Position = vec4(vertex, 0, 1);\n\tuv = gl_Position.xy;\n}"

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = "#define _PI_ 3.1415926535897932384626433832795\nprecision highp float;  \nvarying vec2 uv;\nuniform mat4 rot;\nuniform vec2 resolution;\nuniform float phong_alpha;\nuniform float fineness;\nuniform float focal;\nuniform float light_x;\nuniform float light_y;\nuniform float light_z;\nvec3 eye;\nvec3 light;\nvec3 right;\nvec3 up;\nvec3 forward;\n\n// Surface threshold i.e. minimum distance to surface\nconst float ray_EPSILON = 0.001;\n\n// Max allowable steps along ray\nconst int ray_MAX_STEPS = 64;\t\t\n\n// Sphere distance estimator\nfloat sphere (vec3 point, vec3 center, float radius) {\n\treturn length(point - center) - radius;\n}\n\n// Define the entire scene here\nfloat scene (vec3 point) {\n\treturn sphere(point, vec3(0, 0, -1), 0.5);\n}\n\n// Get surface normal for a point\nvec3 normal (vec3 point) {\n\treturn vec3(scene(point+vec3(1,0,0)) - scene(point-vec3(1,0,0)),\n            \tscene(point+vec3(0,1,0)) - scene(point-vec3(0,1,0)),\n           \t \tscene(point+vec3(0,0,1)) - scene(point-vec3(0,0,1)));\n}\n\n// Get RGB phong shade for a point\nvec3 phongShade (vec3 point) {\n\t\n\t// Material Properties\n\tvec3 phong_ka = vec3(0.6, 0.3, 0);\n\tvec3 phong_kd = vec3(1, 0.5, 0);\n\tvec3 phong_ks = vec3(0.7);\n\t\n\t// Light properties\n\tvec3 phong_Ia = vec3(0.2);\n\tvec3 phong_Id = vec3(0.7);\n\tvec3 phong_Is = vec3(1);\n\t \n\t// Get surface normal\n\tvec3 N = normal(point);\n\t\n\t// Get inicidient ray\n\tvec3 L = normalize(light - point);\n\t\n\t// Get viewer ray\n\tvec3 V = normalize(eye.xyz - point);\n\t\n\t// Get reflection ray; Blinn-Phong style\n\tvec3 H = normalize(V+L);\n\t\n\t// Ambient\n\treturn (phong_ka * phong_Ia)\n\t\n\t// Diffuse\n\t+ (phong_kd * clamp(dot(N, L), 0.0, 1.0) * phong_Id)\n\t\n\t// Specular\n\t+ ((dot(N, L) > 0.0) \n\t\t? (phong_ks * pow(dot(N, H), 4.0 * phong_alpha) * phong_Is)\n\t\t: vec3(0))\n\t;\n\t\n}\n\n// March along a ray defined by an origin and direction\nvec3 rayMarch (vec3 rO, vec3 rD) {\n\n\t// Default/sky color\n\tvec3 shade = vec3(0);\n\n\t// Marched distance\n\tfloat distance = 0.0;\n\n\t// Begin marching\n\tvec3 ray;\n\tfor (int i = 0; i < ray_MAX_STEPS; ++i) {\n\t\t\n\t\t// Formulate the ray\n\t\tray = rO + distance * rD;\n\n\t\t// Cast ray into scene\n\t\tfloat step = scene(ray);\n\t\t\n\t\t// If within the surface threshold\n\t\tif (step < ray_EPSILON / fineness) {\n\t\t\t\n\t\t\t// Apply Blinn-Phong shading or use `distance` to shade\n\t\t\tshade = phongShade(ray);\n\t\t\tbreak;\n\t\t}\n\t\t\n\t\t// Increment safe distance\n\t\tdistance += step;\n\t}\n\n\t// Done!\n\treturn shade;\n}\n\nvoid main () {\n\n\t// Define orientation\n\teye = vec3(0, 0, 1);\n\tlight = vec3(light_x, light_y, light_z);\n\tup = vec3(0,1,0);\n\tright = vec3(1,0,0);\n\tforward = vec3(0,0,-1);\n\t\n\t// Aspect ratio\n\tfloat aR = resolution.x / resolution.y;\n\n\t// Ray origin perspective\n\tvec3 ray_Origin = eye;\n\t\n\t// Ray directon perspective\n\tvec3 ray_Direction = normalize((forward * focal) + (right * uv.x * aR) + (up * uv.y));\n\n\t// Ray origin orthographic\n\t//vec3 ray_Origin = (right * uv.x * aR) + (up * uv.y);\n\n\t// Ray directon orthographic\n\t//vec3 ray_Direction = forward;\n\n\t// March to implicit surface\n\tvec3 color = rayMarch(ray_Origin, ray_Direction);\n\t\n\t// Final color\n\tgl_FragColor = vec4(color, 1);\n\t\n}"

/***/ }
/******/ ]);