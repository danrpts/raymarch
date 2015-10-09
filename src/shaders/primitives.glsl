// Hollow sphere distance estimator
float sphere (vec3 point, vec3 center, float radius) {

 vec3 p = point - center;

  // Equation of a sphere
  return length(p) - radius;
}

// Hollow cube distance estimator
float cube (vec3 point, vec3 center, float edgelength) {
  
  vec3 p = abs(point - center);

  // Equation of a cube
  return max(p.x, max(p.y, p.z))
         - edgelength / 2.0;
}

// Hollow cone distance estimator
// Not working yet
float cone (vec3 point, vec3 center, float radius, float height) {
  
  vec3 p = point - center;
  float c = radius / height;
  float y = p.y * c;

  // Equation of a cone
  return (p.x * p.x + p.z * p.z) - (y * y);
}

// Hollow torus distance estimator
float torus (vec3 point, vec3 center, float majorRadius, float minorRadius) {

  vec3 p = point - center;

  // Equation of a torus
  return (majorRadius - length(p.xz))
  		 * (majorRadius - length(p.xz))
  		 + p.y * p.y
  		 - minorRadius * minorRadius;
}


// Plane distance estimator
float plane (vec3 point, vec3 center) {
  
  vec3 p = point - center;
  vec3 up = vec3(0, 1, 0);

  // Equation of a plane
  return dot(p, up);
}
