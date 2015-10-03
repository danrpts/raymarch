#define _PI_ 3.1415926535897932384626433832795
precision highp float;  
varying vec2 uv;
uniform vec2 resolution;
uniform vec2 mouse;
uniform vec3 eye;
uniform float phong_alpha;
uniform float fineness;
uniform float focal;
uniform float light_x;
uniform float light_y;
uniform float light_z;
uniform sampler2D image;
uniform mat4 mv;
vec3 light;
vec3 right;
vec3 up;
vec3 forward;
vec3 meye;

// Surface threshold i.e. minimum distance to surface
float ray_EPSILON = 0.01 / fineness;

// Max allowable steps along ray
const int ray_MAX_STEPS = 64;

// Sphere distance estimator
float sphere (vec3 point, vec3 center, float radius) {
  return length(point - center) - radius;
}

// Torus distance estimator
float cube (vec3 point, vec3 center, float lwh) {
  return length(max(abs(point - center) - vec3(lwh), 0.0));
}

// Define the entire scene here
float scene (vec3 point) {
  return cube(point, vec3(0,0,-1), 0.25);
  		 
}

// Get surface normal for a point
vec3 normal (vec3 point) {
  vec3 x = vec3(ray_EPSILON,0,0);
  vec3 y = vec3(0,ray_EPSILON,0);
  vec3 z = vec3(0,0,ray_EPSILON);
  return normalize(vec3(
    scene(point+x) - scene(point-x),
    scene(point+y) - scene(point-y),
    scene(point+z) - scene(point-z)));
}

// Get RGB phong shade for a point
vec3 phongShade (vec3 point) {

  // Get surface normal
  vec3 N = normal(point);

  // Get sphere mapped texture coordinate
  //vec2 texels = vec2(asin(N.x), asin(N.y)) / _PI_ + 0.5;
  //vec4 texture = texture2D(image, texels);

  // Material Properties
  vec3 phong_ka = vec3(0);
  vec3 phong_kd = vec3(0.7);
  vec3 phong_ks = vec3(1);
  
  // Light properties
  vec3 phong_Ia = vec3(0);
  vec3 phong_Id = vec3(0.7);
  vec3 phong_Is = vec3(1);
  
  // Get inicidient ray
  vec3 L = normalize(light - point);
  
  // Get viewer ray
  vec3 V = normalize(meye - point);
  
  // Get reflection ray; Blinn-Phong style
  vec3 H = normalize(L + V);
  
  
  // Sum and return final value
  return 

  // Ambient
  (phong_ka * phong_Ia)
  
  // Diffuse
  + (phong_kd * clamp(dot(N, L), 0.0, 1.0) * phong_Id)
  
  // Specular
  + ((dot(N, L) > 0.0) 
  	? (phong_ks * pow(dot(N, H), 4.0 * phong_alpha) * phong_Is)
  	: vec3(0))
  ;
  
}

// March along a ray defined by an origin and direction
vec4 rayMarch (vec3 pO, vec3 rD) {

	// Default/sky color
	vec4 shade = vec4(0.1, 0.1, 0.3, 1);

	// Marched distance
	float distance = 0.0;

	// Begin marching
	vec3 p1;
	for (int i = 0; i < ray_MAX_STEPS; ++i) {
		
		// Formulate p1 with point-vector addition
		p1 = pO + distance * rD;

		// Check point p1 against CSG surfaces
		float step = scene(p1);
		
		// If within the minimum surface threshold
		if (step < ray_EPSILON) {
			
			// Apply Blinn-Phong shading
			shade = vec4(phongShade(p1), 1);
			break;
		}
		
		// Increment safe distance
		distance += step;
	}

	// Done!
	return shade;
}

mat3 lookat (vec3 from, vec3 at, vec3 up) {
	vec3 n = normalize(at - from);
	vec3 u = normalize(cross(n, up));
	vec3 v = normalize(cross(u, n));
	return mat3(u, v, n);
}

void main () {

	// Define
	light = vec3(light_x, light_y, light_z);
	up = vec3(0,1,0);

    // Look at point
	vec3 at = vec3(mouse, -focal);

	// Aspect ratio
	float aR = resolution.x / resolution.y;

	// Rotate camera
	meye = (mv * vec4(eye, 1)).xyz;

	// Ray origin
	vec3 ray_Origin = meye;

    // Orient the viewer
    mat3 orient = lookat(ray_Origin, at, up);
	
	// Ray directon look around
	vec3 ray_Direction = orient * normalize(vec3(uv.x * aR, uv.y, focal));

	// Ray direction perspective
    //vec3 ray_Direction = normalize((right * uv.x * aR) + (up * uv.y) + (forward * focal));

	// Ray origin orthographic
	//vec3 ray_Origin = (right * uv.x * aR) + (up * uv.y);

	// Ray directon orthographic
	//vec3 ray_Direction = forward;

	// March to implicit surface
	vec4 color = rayMarch(ray_Origin, ray_Direction);
	
	// Final color
	gl_FragColor = color;
	
}