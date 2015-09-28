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

	var glinit = __webpack_require__(1);
	var render = __webpack_require__(2);
	var $ = __webpack_require__(3);

	$(function () {

	  var canvas = $('#canvas')[0];
	  var gl = glinit(canvas);

	  if (!!gl) {

	    // temporary 
	  	__webpack_require__(4)(gl, controls);

	    canvas.width = $('.page-content').width();
	    canvas.height = window.innerHeight;

	    window.eye = [0,0,0];

	    var vertShader = gl.createShader(gl.VERTEX_SHADER);
	    gl.shaderSource(vertShader, __webpack_require__(5));
	    gl.compileShader(vertShader);
	    if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
	      console.warn('Vertex shader failed to compile. The error log is: %s.', gl.getShaderInfoLog(vertShader));
	      gl.deleteShader(vertShader);
	      vertShader = null;
	      return false;
	    }
	    
	    var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
	    gl.shaderSource(fragShader, __webpack_require__(6));
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
	    render(gl, canvas);
	  }
	  
	});


/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = function (canvas) {
	  gl = null;
	  
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

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = function (gl, canvas) {
	  if (!!gl) {
	  
	    // Clear the canvas
	    gl.clear(gl.COLOR_BUFFER_BIT);

	    // Set the viewport properties
	    gl.viewport(0, 0, canvas.width, canvas.height);

	    // Render just 2 triangles
	    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

	  }
	}

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = jQuery;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var render = __webpack_require__(2);
	var $ = __webpack_require__(3);

	module.exports = function (gl, canvas) {

	  // temporary
	  window.update = function (id, value) {
	    gl.uniform1f(gl.getUniformLocation(program, id), value);
	    render(gl, canvas);
	  }


	  rotate = function rotate (x, y, z) {
	    var r = Math.PI / 180.0,
	      c = Math.cos,
	      s = Math.sin,
	      xrad = x * r,
	      cx = c(xrad),
	      sx = s(xrad),
	      yrad = y * r,
	      cy = c(yrad),
	      sy = s(yrad),
	      zrad = z * r,
	      cz = c(zrad),
	      sz = s(zrad);
	    return [
	      cy*cz,           -cy*sz,          sy,    
	      sx*sy*cz+cx*sz,  -sx*sy*sz+cx*cz, -sx*cy,
	      -cx*sy*cz+sx*sz, cx*sy*sz+sx*cz,  cx*cy    
	    ]
	  }

	  // ctrl + mousemove = look around
	  $('#canvas').mousemove(function (e) {
	    if (e.ctrlKey) {
	      var x = e.pageX - $(this).offset().left;
	      var y = e.pageY - $(this).offset().top;
	      var w = $(this).width();
	      var h = $(this).height();
	      var coord = [2*x/w-1, 2*(h-y)/h-1];
	      gl.uniform2fv(gl.getUniformLocation(program, 'mouse'), new Float32Array(coord));
	      render(gl, canvas);
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


/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = "precision highp float;\r\nattribute vec2 vertex;\r\nvarying vec2 uv;\r\nvoid main () {\r\n\tgl_Position = vec4(vertex, 0, 1);\r\n\tuv = gl_Position.xy;\r\n}"

/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = "#define _PI_ 3.1415926535897932384626433832795\r\nprecision highp float;  \r\nvarying vec2 uv;\r\nuniform vec2 resolution;\r\nuniform vec2 mouse;\r\nuniform vec3 eye;\r\nuniform float phong_alpha;\r\nuniform float fineness;\r\nuniform float focal;\r\nuniform float light_x;\r\nuniform float light_y;\r\nuniform float light_z;\r\nuniform sampler2D mars;\r\nuniform mat3 rot;\r\nvec3 light;\r\nvec3 right;\r\nvec3 up;\r\nvec3 forward;\r\n\r\n// Surface threshold i.e. minimum distance to surface\r\nconst float ray_EPSILON = 0.001;\r\n\r\n// Max allowable steps along ray\r\nconst int ray_MAX_STEPS = 64;\t\t\r\n\r\n// Sphere distance estimator\r\nfloat sphere (vec3 point, vec3 center, float radius) {\r\n\treturn length(point - center) - radius;\r\n}\r\n\r\n// Define the entire scene here\r\nfloat scene (vec3 point) {\r\n\treturn min(sphere(point, vec3(0,0,-1), 0.5), sphere(point, vec3(0,0,5), 0.5));\r\n}\r\n\r\n// Get surface normal for a point\r\nvec3 normal (vec3 point) {\r\n\treturn vec3(scene(point+vec3(1,0,0)) - scene(point-vec3(1,0,0)),\r\n            \tscene(point+vec3(0,1,0)) - scene(point-vec3(0,1,0)),\r\n           \t \tscene(point+vec3(0,0,1)) - scene(point-vec3(0,0,1)));\r\n}\r\n\r\n// Get RGB phong shade for a point\r\nvec3 phongShade (vec3 point) {\r\n\r\n    // Get surface normal\r\n    vec3 N = normal(point);\r\n\t\r\n    // Get sphere mapped texture coordinate\r\n    vec4 texture = texture2D(mars, vec2(asin(N.x)/_PI_ + 0.5, asin(N.y)/_PI_ + 0.5));\r\n\r\n\t// Material Properties\r\n\tvec3 phong_ka = texture.xyz;\r\n\tvec3 phong_kd = texture.xyz;\r\n\tvec3 phong_ks = texture.xyz;\r\n\t\r\n\t// Light properties\r\n\tvec3 phong_Ia = vec3(0.3);\r\n\tvec3 phong_Id = vec3(0.7);\r\n\tvec3 phong_Is = vec3(1);\r\n\t\r\n\t// Get inicidient ray\r\n\tvec3 L = normalize(light - point);\r\n\t\r\n\t// Get viewer ray\r\n\tvec3 V = normalize(eye.xyz - point);\r\n\t\r\n\t// Get reflection ray; Blinn-Phong style\r\n\tvec3 H = normalize(V+L);\r\n\t\r\n\t// Ambient\r\n\treturn (phong_ka * phong_Ia)\r\n\t\r\n\t// Diffuse\r\n\t+ (phong_kd * clamp(dot(N, L), 0.0, 1.0) * phong_Id)\r\n\t\r\n\t// Specular\r\n\t+ ((dot(N, L) > 0.0) \r\n\t\t? (phong_ks * pow(dot(N, H), 4.0 * phong_alpha) * phong_Is)\r\n\t\t: vec3(0))\r\n\t;\r\n\t\r\n}\r\n\r\n// March along a ray defined by an origin and direction\r\nvec4 rayMarch (vec3 rO, vec3 rD) {\r\n\r\n\t// Default/sky color\r\n\tvec4 shade = vec4(0, 0, 0, 1);\r\n\r\n\t// Marched distance\r\n\tfloat distance = 0.0;\r\n\r\n\t// Begin marching\r\n\tvec3 ray;\r\n\tfor (int i = 0; i < ray_MAX_STEPS; ++i) {\r\n\t\t\r\n\t\t// Formulate the ray\r\n\t\tray = rO + distance * rD;\r\n\r\n\t\t// Cast ray into scene\r\n\t\tfloat step = scene(ray);\r\n\t\t\r\n\t\t// If within the surface threshold\r\n\t\tif (step < ray_EPSILON / fineness) {\r\n\t\t\t\r\n\t\t\t// Apply Blinn-Phong shading or use `distance` to shade\r\n\t\t\tshade = vec4(phongShade(ray), 1);\r\n\t\t\tbreak;\r\n\t\t}\r\n\t\t\r\n\t\t// Increment safe distance\r\n\t\tdistance += step;\r\n\t}\r\n\r\n\t// Done!\r\n\treturn shade;\r\n}\r\n\r\nmat3 lookat (vec3 eye, vec3 at, vec3 up) {\r\n\tvec3 n = normalize(at - eye);\r\n\tvec3 u = normalize(cross(n, up));\r\n\tvec3 v = normalize(cross(u, n));\r\n\treturn mat3(u, v, n);\r\n}\r\n\r\nvoid main () {\r\n\r\n\t// Define\r\n\tlight = vec3(light_x, light_y, light_z);\r\n\tup = vec3(0,1,0);\r\n\t//right = vec3(1,0,0);\r\n\t//forward = vec3(0,0,-1);\r\n\r\n    // Look at point\r\n\tvec3 at = vec3(mouse, -focal);\r\n\r\n\t// Aspect ratio\r\n\tfloat aR = resolution.x / resolution.y;\r\n\r\n\t// Ray origin\r\n\tvec3 ray_Origin = eye;\r\n\r\n    // Orient the viewer\r\n    mat3 orient = lookat(ray_Origin, at, up);\r\n\t\r\n\t// Ray directon look around\r\n\tvec3 ray_Direction = orient * normalize(vec3(uv.x * aR, uv.y, focal));\r\n\r\n\t// Ray direction perspective\r\n    //vec3 ray_Direction = normalize((right * uv.x * aR) + (up * uv.y) + (forward * focal));\r\n\r\n\t// Ray origin orthographic\r\n\t//vec3 ray_Origin = (right * uv.x * aR) + (up * uv.y);\r\n\r\n\t// Ray directon orthographic\r\n\t//vec3 ray_Direction = forward;\r\n\r\n\t// March to implicit surface\r\n\tvec4 color = rayMarch(ray_Origin, ray_Direction);\r\n\t\r\n\t// Final color\r\n\tgl_FragColor = color;\r\n\t\r\n}"

/***/ }
/******/ ]);