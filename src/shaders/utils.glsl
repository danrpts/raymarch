
vec3 normal (vec3 point, primative) {
  vec3 x = vec3(ray_EPSILON, 0, 0);
  vec3 y = vec3(0, ray_EPSILON, 0);
  vec3 z = vec3(0, 0, ray_EPSILON);
  return normalize(vec3(
    scene(point+x) - scene(point-x),
    scene(point+y) - scene(point-y),
    scene(point+z) - scene(point-z)));
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