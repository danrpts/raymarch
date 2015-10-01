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

	var utils = __webpack_require__(1);
	var $ = __webpack_require__(2);

	$(function () {

	  var canvas = $('#canvas')[0];
	  var gl = utils.glinit(canvas);

	  if (!!gl) {

	    canvas.width = $('.page-content').width();
	    canvas.height = window.innerHeight;

	    window.eye = [0,0,0];

	    var vertShader = gl.createShader(gl.VERTEX_SHADER);
	    gl.shaderSource(vertShader, __webpack_require__(3));
	    gl.compileShader(vertShader);
	    if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
	      console.warn('Vertex shader failed to compile. The error log is: %s.', gl.getShaderInfoLog(vertShader));
	      gl.deleteShader(vertShader);
	      vertShader = null;
	      return false;
	    }
	    
	    var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
	    gl.shaderSource(fragShader, __webpack_require__(4));
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
	    __webpack_require__(5)(canvas, gl, program);
	    
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


/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports.glinit = function (canvas) {
	  var gl = null;
	  
	  try {    
	    // Try to grab the standard context. If it fails, fallback to experimental.
	    gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
	  }
	  catch(e) {}
	  
	  // If we don't have a GL context, give up now
	  if (!gl) {
	    alert('Unable to initialize WebGL. Your browser may not support it.');
	    gl = null;
	  }
	  
	  return gl;
	}

	module.exports.render = function (canvas, gl) {
	  if (!!gl) {
	  
	    // Clear the canvas
	    gl.clear(gl.COLOR_BUFFER_BIT);

	    // Set the viewport properties
	    gl.viewport(0, 0, canvas.width, canvas.height);

	    // Render just 2 triangles
	    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

	  }
	}

	module.exports.mouse2clip = function (e) {
	  var c = $('#canvas');
	  var x = e.pageX - c.offset().left;
	  var y = e.pageY - c.offset().top;
	  var w = c.width();
	  var h = c.height();
	  return coord = [2*x/w-1, 2*(h-y)/h-1];
	}

	module.exports.rotate = function (x, y, z) {
	  var r = Math.PI / 180.0;
	  var c = Math.cos;
	  var s = Math.sin;
	  var xrad = x * r;
	  var cx = c(xrad);
	  var sx = s(xrad);
	  var yrad = y * r;
	  var cy = c(yrad);
	  var sy = s(yrad);
	  var zrad = z * r;
	  var cz = c(zrad);
	  var sz = s(zrad);
	  return [
	    cy*cz,           -cy*sz,          sy,     0,
	    sx*sy*cz+cx*sz,  -sx*sy*sz+cx*cz, -sx*cy, 0,
	    -cx*sy*cz+sx*sz, cx*sy*sz+sx*cz,  cx*cy,  0,
	    0,               0,               0,      1    
	  ]
	}

	// not tested
	// map a value from one coordinate axis to another
	// from[min, max]
	// to[min, max]
	module.exports.map2 = function (value, from, to) {
	    return (to[1] - to[0]) / (from[1] - from[0]) * value;
	}


/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = jQuery;

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = "precision highp float;\nattribute vec2 vertex;\nvarying vec2 uv;\nvoid main () {\n\tgl_Position = vec4(vertex, 0, 1);\n\tuv = gl_Position.xy;\n}"

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = "#define _PI_ 3.1415926535897932384626433832795\nprecision highp float;  \nvarying vec2 uv;\nuniform vec2 resolution;\nuniform vec2 mouse;\nuniform vec3 eye;\nuniform float phong_alpha;\nuniform float fineness;\nuniform float focal;\nuniform float light_x;\nuniform float light_y;\nuniform float light_z;\nuniform sampler2D mars;\nuniform mat3 rot;\nvec3 light;\nvec3 right;\nvec3 up;\nvec3 forward;\n\n// Surface threshold i.e. minimum distance to surface\nconst float ray_EPSILON = 0.001;\n\n// Max allowable steps along ray\nconst int ray_MAX_STEPS = 64;\t\t\n\n// Sphere distance estimator\nfloat sphere (vec3 point, vec3 center, float radius) {\n\treturn length(point - center) - radius;\n}\n\n// Define the entire scene here\nfloat scene (vec3 point) {\n\treturn min(sphere(point, vec3(0,0,-1), 0.5), sphere(point, vec3(0,0,5), 0.5));\n}\n\n// Get surface normal for a point\nvec3 normal (vec3 point) {\n\treturn vec3(scene(point+vec3(1,0,0)) - scene(point-vec3(1,0,0)),\n            \tscene(point+vec3(0,1,0)) - scene(point-vec3(0,1,0)),\n           \t \tscene(point+vec3(0,0,1)) - scene(point-vec3(0,0,1)));\n}\n\n// Get RGB phong shade for a point\nvec3 phongShade (vec3 point) {\n\n    // Get surface normal\n    vec3 N = normal(point);\n\t\n    // Get sphere mapped texture coordinate\n    vec4 texture = texture2D(mars, vec2(asin(N.x)/_PI_ + 0.5, asin(N.y)/_PI_ + 0.5));\n\n\t// Material Properties\n\tvec3 phong_ka = texture.xyz;\n\tvec3 phong_kd = texture.xyz;\n\tvec3 phong_ks = texture.xyz;\n\t\n\t// Light properties\n\tvec3 phong_Ia = vec3(0.3);\n\tvec3 phong_Id = vec3(0.7);\n\tvec3 phong_Is = vec3(1);\n\t\n\t// Get inicidient ray\n\tvec3 L = normalize(light - point);\n\t\n\t// Get viewer ray\n\tvec3 V = normalize(eye.xyz - point);\n\t\n\t// Get reflection ray; Blinn-Phong style\n\tvec3 H = normalize(V+L);\n\t\n\t// Ambient\n\treturn (phong_ka * phong_Ia)\n\t\n\t// Diffuse\n\t+ (phong_kd * clamp(dot(N, L), 0.0, 1.0) * phong_Id)\n\t\n\t// Specular\n\t+ ((dot(N, L) > 0.0) \n\t\t? (phong_ks * pow(dot(N, H), 4.0 * phong_alpha) * phong_Is)\n\t\t: vec3(0))\n\t;\n\t\n}\n\n// March along a ray defined by an origin and direction\nvec4 rayMarch (vec3 rO, vec3 rD) {\n\n\t// Default/sky color\n\tvec4 shade = vec4(0, 0, 0, 1);\n\n\t// Marched distance\n\tfloat distance = 0.0;\n\n\t// Begin marching\n\tvec3 ray;\n\tfor (int i = 0; i < ray_MAX_STEPS; ++i) {\n\t\t\n\t\t// Formulate the ray\n\t\tray = rO + distance * rD;\n\n\t\t// Cast ray into scene\n\t\tfloat step = scene(ray);\n\t\t\n\t\t// If within the surface threshold\n\t\tif (step < ray_EPSILON / fineness) {\n\t\t\t\n\t\t\t// Apply Blinn-Phong shading or use `distance` to shade\n\t\t\tshade = vec4(phongShade(ray), 1);\n\t\t\tbreak;\n\t\t}\n\t\t\n\t\t// Increment safe distance\n\t\tdistance += step;\n\t}\n\n\t// Done!\n\treturn shade;\n}\n\nmat3 lookat (vec3 eye, vec3 at, vec3 up) {\n\tvec3 n = normalize(at - eye);\n\tvec3 u = normalize(cross(n, up));\n\tvec3 v = normalize(cross(u, n));\n\treturn mat3(u, v, n);\n}\n\nvoid main () {\n\n\t// Define\n\tlight = vec3(light_x, light_y, light_z);\n\tup = vec3(0,1,0);\n\t//right = vec3(1,0,0);\n\t//forward = vec3(0,0,-1);\n\n    // Look at point\n\tvec3 at = vec3(mouse, -focal);\n\n\t// Aspect ratio\n\tfloat aR = resolution.x / resolution.y;\n\n\t// Ray origin\n\tvec3 ray_Origin = eye;\n\n    // Orient the viewer\n    mat3 orient = lookat(ray_Origin, at, up);\n\t\n\t// Ray directon look around\n\tvec3 ray_Direction = orient * normalize(vec3(uv.x * aR, uv.y, focal));\n\n\t// Ray direction perspective\n    //vec3 ray_Direction = normalize((right * uv.x * aR) + (up * uv.y) + (forward * focal));\n\n\t// Ray origin orthographic\n\t//vec3 ray_Origin = (right * uv.x * aR) + (up * uv.y);\n\n\t// Ray directon orthographic\n\t//vec3 ray_Direction = forward;\n\n\t// March to implicit surface\n\tvec4 color = rayMarch(ray_Origin, ray_Direction);\n\t\n\t// Final color\n\tgl_FragColor = color;\n\t\n}"

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var utils = __webpack_require__(1);
	var $ = __webpack_require__(2);

	module.exports = function (canvas, gl, program) {

	  // temporary
	  window.update = function (id, value) {
	    gl.uniform1f(gl.getUniformLocation(program, id), value);
	    render(canvas, gl);
	  }

	  // ctrl + mousemove = look around
	  $('#canvas').mousemove(function (e) {
	    if (e.ctrlKey) {
	      var coord = utils.mouse2clip(e);
	      gl.uniform2fv(gl.getUniformLocation(program, 'mouse'), new Float32Array(coord));
	      utils.render(canvas, gl);
	    }
	  });

	  $('#canvas').mousedown(function (e) {

	  });

	  $('#canvas').keydown(function (e) {
	    switch (e.which) {
	      case 87: w(); break;
	      case 65: a(); break;
	      case 83: s(); break;
	      case 68: d(); break;
	      default: break;
	    }
	  });

	  function w() {} 

	  function a() {} 

	  function s() {} 

	  function d() {}

	}


/***/ }
/******/ ]);