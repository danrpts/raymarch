#define _PI_ 3.141592653589793238462643383279
#define _MAX_SAMPLES_ 9.0
precision highp float;
varying vec2 uv;
uniform vec2 resolution;
uniform vec3 mouse;
uniform vec3 light;
uniform float epsilon;
uniform float iterations;
uniform float samples;
uniform float phong_alpha;
uniform float focal;
uniform sampler2D mercury_texture;
uniform sampler2D venus_texture;
uniform sampler2D earth_texture;
uniform sampler2D mars_texture;
uniform mat4 rotate_viewer;
uniform mat4 rotate_scene;
vec3 origin;
vec3 eye;
float aspect;

// Surface threshold i.e. minimum distance to surface
float ray_EPSILON = 0.001 / epsilon;

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

vec3 mercury (vec3 point) {
  float radius = 0.2;
  vec3 center = origin + vec3(0,0,3);
  float dist = sphere(point, center, radius);
  float material = 0.0;
  return vec3(dist, material, radius);
}

vec3 venus (vec3 point) {
  float radius = 0.2;
  vec3 center = origin + vec3(0,0,2);
  float dist = sphere(point, center, radius);
  float material = 1.0;
  return vec3(dist, material, radius);
}

vec3 earth (vec3 point) {
  float radius = 0.5;
  vec3 center = origin;
  float dist = sphere(point, center, radius);
  float material = 2.0;
  return vec3(dist, material, radius);
}

vec3 mars (vec3 point) {
  float radius = 0.2;
  vec3 center = origin - vec3(0,0,1);
  float dist = sphere(point, center, radius);
  float material = 3.0;
  return vec3(dist, material, radius);
}

vec3 pointlight (vec3 point) {
  float radius = 0.2;
  vec3 center = light + vec3(0,0.5,0);
  float dist = sphere(point, center, radius);
  float material = 4.0;
  return vec3(dist, material, radius);
}

// check which object is closer
vec3 join (vec3 thing, vec3 other) {
  return (thing.x < other.x) ? thing : other;
}

// Define the entire scene here
vec3 scene (vec3 point) {
  return join(ground(point), earth(point));
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
  
  // Important to start a small distance away from the originating surface
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
      alpha = 0.5;
      break;
    }

    // Increment safe-marchable distance
    distance += step;
  }
  return alpha;
}

vec3 materialize (vec3 point, float material, float radius) {

  vec3 normal = normal(point);
  float alpha = shadow(point);

  // Need to remove depedence on radius
  vec3 d = radius * normal;
  float theta = atan(d.x, d.z) + _PI_; // theta E [0, 2PI)
  float phi = acos(d.y / radius); // phi E [0, PI]
  vec2 texel = vec2(theta / (2.0 * _PI_), phi / _PI_);

  if      (material == 0.0) return alpha * phongify(point, normal, light, texture2D(mercury_texture, texel).rgb);

  else if (material == 1.0) return alpha * phongify(point, normal, light, texture2D(venus_texture, texel).rgb);
  
  else if (material == 2.0) return alpha * phongify(point, normal, light, texture2D(earth_texture, texel).rgb);
  
  else if (material == 3.0) return alpha * phongify(point, normal, light, texture2D(mars_texture, texel).rgb);
  
  else                      return alpha * phongify(point, normal, light, vec3(1));

}

// March along a ray defined by an origin and direction
vec3 rayMarch (vec3 p0, vec3 v) {

  // Sky color
  vec3 shade = vec3(1);

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

// Grid style SSAA
vec3 grid () {

  // Define base color	
  vec3 shade = vec3(0);

  // Define unit of difference for sub pixel
  vec2 delta = vec2(2) / (resolution * samples);

  // Start dividing pixel in x and y directions
  for (float i = 0.0; i < _MAX_SAMPLES_; ++i) {
    if (i >= samples) break;
    for (float j = 0.0; j < _MAX_SAMPLES_; ++j) {
      if (j >= samples) break;
      vec2 ss = uv + delta * vec2(i, j);
      vec3 direction = normalize(vec3(ss.x * aR, ss.y, -focal));
      shade += rayMarch(eye, direction);
    }
  }

  // Average sub pixel colors
  return shade / (samples * samples);
}

void main () {

  // Define origin
  origin = vec3(0, 0, 0);

  // Define and orient the eye
  eye = (rotate_viewer * vec4(0, 0, 1, 1)).xyz;

  // Define aspect ratio
  aspect = resolution.x / resolution.y;

  // Color pixel
  gl_FragColor = vec4(grid(), 1);  
}
