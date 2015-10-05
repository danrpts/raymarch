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
uniform sampler2D earth_texture;
uniform sampler2D moon_texture;
uniform sampler2D mars_texture;
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
float sphere (vec3 point, vec3 center, float radius) {
  return length(point - center) - radius;
}

vec3 earth (vec3 point) {

	// Radius of Earth
	float radius = 0.5;

	vec3 center = origin;

	// Distance to Earth
	float dist = sphere(point, center, radius);

	// Matieral ID for Earth texture
	float material = 0.0;

	return vec3(dist, material, radius);
}

vec3 moon (vec3 point) {

	// Radius of moon
	float radius = 0.3;

	vec3 center = -light / 2.0;

	// Distance to moon
	float dist = sphere(point, center, radius);

	// Matieral ID for Moon texture
	float material = 1.0;

	return vec3(dist, material, radius);
}

vec3 mars (vec3 point) {

	// Radius of Mars
	float radius = 0.45;

	vec3 center = origin;

	// Distance to moon
	float dist = sphere(point, center, radius);

	// Matieral ID for Mars texture
	float material = 2.0;

	return vec3(dist, material, radius);
}

// check which object is closer
vec3 join (vec3 thing, vec3 other) {
	return (thing.x < other.x) ? thing : other;
}

// Define the entire scene here
vec3 scene (vec3 point) {
  return mars(point);
}

vec3 normal (vec3 point) {
  vec3 x = vec3(ray_EPSILON, 0, 0);
  vec3 y = vec3(0, ray_EPSILON, 0);
  vec3 z = vec3(0, 0, ray_EPSILON);
  return normalize(vec3(
    scene(point+x).x - scene(point-x).x,
    scene(point+y).x - scene(point-y).x,
    scene(point+z).x - scene(point-z).x));
}

// Get RGB Phong
vec3 phongify (vec3 point, vec3 normal, vec3 material) {

  // Material Properties
  vec3 phong_ka = vec3(0);
  vec3 phong_kd = material;
  vec3 phong_ks = material;
  
  // Light properties
  vec3 phong_Ia = vec3(0);
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
  + (phong_kd * clamp(dot(normal, L), 0.0, 1.0) * phong_Id)
  
  // Specular
  + (phong_ks * pow(dot(normal, H), 4.0 * phong_alpha) * phong_Is)
  ;
  
}

vec3 materialize (vec3 point, float material, float radius) {

	vec3 normal = normal(point);

	// Need to remove depedence on radius
	vec3 d = radius * normal;
	float theta = atan(d.x, d.z) + _PI_; // theta E [0, 2PI)
	float phi = acos(d.y / radius); // phi E [0, PI]
	vec2 texel = vec2(theta / (2.0 * _PI_), phi / _PI_);

	if (material == 0.0) return phongify(point, normal, texture2D(earth_texture, texel).rgb);
	else if (material == 1.0) return phongify(point, normal, texture2D(moon_texture, texel).rgb);
	else if (material == 2.0) return phongify(point, normal, texture2D(mars_texture, texel).rgb);

}

// March along a ray defined by an origin and direction
vec3 rayMarch (vec3 pO, vec3 v) {

	// Sky color
	vec3 shade = vec3(0);

	// Marched distance
	float dist = 0.0;

	// Begin marching
	vec3 p1;
	for (int i = 0; i < ray_MAX_STEPS; ++i) {
		
		// Formulate p1 with point-vector addition
		p1 = pO + dist * v;

		vec3 primative = scene(p1);

		// Check point p1 against CSG surfaces
		float step = primative.x;
		
		// If within the minimum surface threshold
		if (step < ray_EPSILON) {

			// Set self defined shade of point
			shade = materialize(p1, primative.y, primative.z);
			break;
		}

		// Increment safe-marchable distance
		dist += step;
	}

	// Done!
	return shade;
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