#define _PI_ 3.141592653589793238462643383279
precision highp float;
varying vec2 uv;
uniform vec2 resolution;
uniform vec3 mouse;
uniform float phong_alpha;
uniform float fineness;
uniform float iterations;
uniform float focal;
uniform float light_x;
uniform float light_y;
uniform float light_z;
uniform sampler2D sun_texture;
uniform sampler2D earth_texture;
uniform sampler2D mars_texture;
uniform mat4 rotate_viewer;
uniform mat4 rotate_scene;
vec3 origin;
vec3 light;
vec3 eye;

// Surface threshold i.e. minimum distance to surface
float ray_EPSILON = 0.001 / fineness;

// Max allowable steps along ray
float ray_MAX_STEPS = 10.0 * iterations;

// Hollow sphere distance estimator
float sphere (vec3 point, vec3 center, float radius) {

 vec3 p = point - center;

  // Equation of a sphere
  return length(p) - radius;
}

// Plane distance estimator
float plane (vec3 point, vec3 center, vec3 up) {
  
  vec3 p = point - center;

  // Equation of a plane
  return dot(p, up);
}

vec3 ground (vec3 point) {
	float dist = plane(point, origin - vec3(0, 1, 0), vec3(0, 1, 0));
	float material = 3.0;
	return vec3(dist, material, 0.0);
}

vec3 earth (vec3 point) {

	// Radius of the Earth
	float radius = 0.50;

	// Location of the Earth
	vec3 center = origin;

	// Distance to Earth
	float dist = sphere(point, center, radius);

	// Matieral ID for Earth texture
	float material = 1.0;

	return vec3(dist, material, radius);
}

vec3 mars (vec3 point) {

	float radius = 0.45;
	vec3 center = origin + vec3(0,0,-2);
	float dist = sphere(point, center, radius);
	float material = 2.0;
	return vec3(dist, material, radius);
}

// check which object is closer
vec3 join (vec3 thing, vec3 other) {
	return (thing.x < other.x) ? thing : other;
}

// Define the entire scene here
vec3 scene (vec3 point) {
  return join(ground(point), join(mars(point), earth(point)));
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
vec3 phongify (vec3 point, vec3 normal, vec3 light, vec3 material) {

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

float shadow (vec3 p0) {
	
	// Start small distancs away from originating surface
	float distance = 0.1;
	vec3 p1;
	float alpha = 1.0;
	vec3 v = normalize(light - p0);
	float maxDistance = length(light - p0);
	for (float i = 0.0; i < 101.0; ++i) {
		
		// Hack to allow variable iteration depth
		if (distance >= maxDistance) break;

		// Formulate p1 with point-vector addition
		p1 = p0 + distance * v;

		// Attempt to intersect a surface
		vec3 intersection = scene(p1);

		// Check intersection within threshold
		float step = intersection.x;
		if (step <= ray_EPSILON) {
			alpha = 0.0;
			break;
		}

		// Increment safe-marchable distance
		distance += step;
	}

	return alpha;

}

vec4 materialize (vec3 point, float material, float radius) {

  vec3 normal = normal(point);
  float shadow = shadow(point);

  // Need to remove depedence on radius
  vec3 d = radius * normal;
  float theta = atan(d.x, d.z) + _PI_; // theta E [0, 2PI)
  float phi = acos(d.y / radius); // phi E [0, PI]
  vec2 texel = vec2(theta / (2.0 * _PI_), phi / _PI_);

  if      (material == 0.0) return texture2D(sun_texture, texel);
  
  else if (material == 1.0) return vec4(phongify(point, normal, light, texture2D(earth_texture, texel).rgb), shadow);
  
  else if (material == 2.0) return vec4(phongify(point, normal, light, texture2D(mars_texture, texel).rgb), shadow);
  
  else                      return vec4(phongify(point, normal, light, vec3(1)), shadow);

}

// March along a ray defined by an origin and direction
vec4 rayMarch (vec3 p0, vec3 v) {

	// Sky color
	vec4 shade = vec4(0,0,0,1);

	// Marched distance
	float distance = 0.0;

	// Begin marching
	vec3 p1;
	for (float i = 0.0; i < 101.0; ++i) {
		
		// Hack to allow variable iteration depth
		if (i > ray_MAX_STEPS) break;

		// Formulate p1 with point-vector addition
		p1 = p0 + distance * v;

		// Attempt to intersect a surface
		vec3 intersection = scene(p1);

		// Check intersection within threshold
		float step = intersection.x;
		if (step <= ray_EPSILON) {

			// Set self defined shade of point
			shade = materialize(p1, intersection.y, intersection.z);
			break;
		}

		// Increment safe-marchable distance
		distance += step;
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
	
	// Intersect surfaces
	gl_FragColor = rayMarch(eye, direction);
	
}