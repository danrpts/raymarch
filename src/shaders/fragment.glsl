#define _PI_ 3.141592653589793238462643383279
precision highp float;  
varying vec2 uv;
uniform vec2 resolution;
uniform vec3 mouse;
uniform float phong_alpha;
uniform float fineness;
uniform float focal;
uniform float light_x;
uniform float light_y;
uniform float light_z;
uniform sampler2D image;
uniform mat4 rotate_viewer;
uniform mat4 rotate_scene;
vec3 origin;
vec3 light;
vec3 eye;

// Surface threshold i.e. minimum distance to surface
float ray_EPSILON = 0.001 / fineness;

// Max allowable steps along ray
const int ray_MAX_STEPS = 64;

// Sphere distance estimator
float sphere (vec3 point, vec3 position, float radius) {
  return length(point - position) - radius;
}

// Torus distance estimator
float cube (vec3 point, vec3 position, float lwh) {
  return length(max(abs(point - position) - vec3(lwh), 0.0));
}

// Define the entire scene here
float scene (vec3 point) {
  return min(sphere(point, origin, 0.5),
			 sphere(point, light, 0.1));
}

// Get surface normal for a point
vec3 normal (vec3 point) {
  vec3 x = vec3(ray_EPSILON, 0, 0);
  vec3 y = vec3(0, ray_EPSILON, 0);
  vec3 z = vec3(0, 0, ray_EPSILON);
  return normalize(vec3(
    scene(point+x) - scene(point-x),
    scene(point+y) - scene(point-y),
    scene(point+z) - scene(point-z)));
}

// Get RGB phong shade for a point
vec3 phongShade (vec3 point) {

  // Get surface normal
  vec3 N = normal(point);

  float r = 0.5;
  vec3 d = r * N;
  float theta = atan(d.x, d.z) + _PI_; // theta E [0, 2PI)
  float u = theta / (2.0 * _PI_);
  float phi = acos(d.y / r); // phi E [0, PI]
  float v = phi / _PI_;

  vec2 texel = vec2(u, v);

  // Material Properties
  vec3 phong_ka = texture2D(image, texel).rgb;//vec(0);
  vec3 phong_kd = texture2D(image, texel).rgb;//vec3(0.7);
  vec3 phong_ks = texture2D(image, texel).rgb;//vec3(1);
  
  // Light properties
  vec3 phong_Ia = vec3(0.5);
  vec3 phong_Id = vec3(0.7);
  vec3 phong_Is = vec3(1);
  
  // Get inicidient ray
  vec3 L = normalize(light - point);
  
  // Get viewer ray
  vec3 V = normalize(eye - point);
  
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

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

// March along a ray defined by an origin and direction
vec3 rayMarch (vec3 pO, vec3 v) {

	// Sky color
	vec3 shade = vec3(0.1);

	// Marched distance
	float distance = 0.0;

	// Begin marching
	vec3 p1;
	for (int i = 0; i < ray_MAX_STEPS; ++i) {
		
		// Formulate p1 with point-vector addition
		p1 = pO + distance * v;

		// Check point p1 against CSG surfaces
		float step = scene(p1);
		
		// If within the minimum surface threshold
		if (step < ray_EPSILON) {

			// Apply Blinn-Phong shading
			shade = vec3(phongShade(p1));
			break;
		}

		// Increment safe distance
		distance += step;
	}

	// Done!
	return shade;
}

mat3 lookAtRH (vec3 eye, vec3 at, vec3 up) {
	vec3 z = normalize(eye - at);
	vec3 x = normalize(cross(up, z));
	vec3 y = normalize(cross(z, x));
	vec3 o = -eye;
	return mat3(x,y,z);
}

mat3 lookAtLH (vec3 eye, vec3 at, vec3 up) {
	vec3 z = normalize(eye - at);
	vec3 x = normalize(cross(up, z));
	vec3 y = normalize(cross(z, x));
	vec3 o = -eye;
	return mat3(z,y,x);
}

void main () {

	// Define origin
	origin = vec3(0, 0, 0);

	// Define point light position
	light = vec3(light_x, light_y, light_z);

	// Define eye position
	eye = (rotate_viewer * vec4(0, 0, 1 ,1)).xyz;

	// Aspect ratio
	float aR = resolution.x / resolution.y;

	// Ray direction normal
    vec3 direction = (rotate_viewer * vec4(normalize(vec3(uv.x * aR, uv.y, -focal)),1)).xyz;

	// March to implicit surface
	vec3 color = rayMarch(eye, direction);
	
	// Final color
	gl_FragColor = vec4(color, 1);
	
}