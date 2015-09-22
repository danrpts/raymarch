#define _PI_ 3.1415926535897932384626433832795
precision highp float;  
varying vec2 uv;
uniform vec2 resolution;
uniform float phong_alpha;
uniform float fineness;
uniform float eye_x;
uniform float eye_y;
uniform float eye_z;
uniform float eye_f;
uniform float light_x;
uniform float light_y;
uniform float light_z;
vec3 eye;
vec3 light;
vec3 right;
vec3 up;
vec3 forward;

// Surface threshold i.e. minimum distance to surface
const float ray_EPSILON = 0.001;

// Max allowable steps along ray
const int ray_MAX_STEPS = 64;		

// Sphere distance estimator
float sphere (vec3 point, float radius) {
	return length(point) - radius;
}

// Define the entire scene here
float scene (vec3 point) {
	return sphere(point, 0.5);
}

// Get surface normal for a point
vec3 normal (vec3 point) {
	return vec3(scene(point+vec3(1,0,0)) - scene(point-vec3(1,0,0)),
            	scene(point+vec3(0,1,0)) - scene(point-vec3(0,1,0)),
           	 	scene(point+vec3(0,0,1)) - scene(point-vec3(0,0,1)));
}

// Get RGB phong shade for a point
vec3 phongShade (vec3 point) {
	
	// Material Properties
	vec3 phong_ka = vec3(0.6, 0.3, 0);
	vec3 phong_kd = vec3(1, 0.5, 0);
	vec3 phong_ks = vec3(0.7);
	
	// Light properties
	vec3 phong_Ia = vec3(0.2);
	vec3 phong_Id = vec3(0.7);
	vec3 phong_Is = vec3(1);
	 
	// Get surface normal
	vec3 N = normal(point);
	
	// Get inicidient ray
	vec3 L = normalize(light - point);
	
	// Get viewer ray
	vec3 V = normalize(eye - point);
	
	// Get reflection ray; Blinn-Phong style
	vec3 H = normalize(V+L);
	
	// Ambient
	return (phong_ka * phong_Ia)
	
	// Diffuse
	+ (phong_kd * clamp(dot(N, L), 0.0, 1.0) * phong_Id)
	
	// Specular
	+ ((dot(N, L) > 0.0) 
		? (phong_ks * pow(dot(N, H), 4.0 * phong_alpha) * phong_Is)
		: vec3(0))
	;
	
}

// March along a ray defined by an origin and direction
vec3 rayMarch (vec3 rO, vec3 rD) {

	// Default/sky color
	vec3 shade = vec3(0);

	// Marched distance
	float distance = 0.0;

	// Begin marching
	vec3 ray;
	for (int i = 0; i < ray_MAX_STEPS; ++i) {
		
		// Formulate the ray
		ray = rO + distance * rD;

		// Cast ray into scene
		float step = scene(ray);
		
		// If within the surface threshold
		if (step < ray_EPSILON / fineness) {
			
			// Apply Blinn-Phong shading or use `distance` to shade
			shade = phongShade(ray);
			break;
		}
		
		// Increment safe distance
		distance += step;
	}

	// Done!
	return shade;
}

void main () {

	// Define orientation
	eye = vec3(eye_x, eye_y, eye_z);
	light = vec3(light_x, light_y, light_z);
	right = vec3(1,0,0);
	up = vec3(0,1,0);
	forward = vec3(0,0,1);
	
	// Aspect ratio
	float aR = resolution.x / resolution.y;

	// Ray origin perspective
	vec3 ray_Origin = eye;
	
	// Ray directon perspective
	vec3 ray_Direction = normalize((forward * eye_f) + (right * uv.x * aR) + (up * uv.y));

	// Ray origin orthographic
	//vec3 ray_Origin = (right * uv.x * aR) + (up * uv.y);

	// Ray directon orthographic
	//vec3 ray_Direction = forward;

	// March to implicit surface
	vec3 color = rayMarch(ray_Origin, ray_Direction);
	
	// Final color
	gl_FragColor = vec4(color, 1);
	
}