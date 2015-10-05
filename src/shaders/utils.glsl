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