// Hollow sphere distance estimator
float sphere (vec3 point, vec3 center, float radius) {

  // Equation of a sphere
  return length(point - center)
         - radius;
}


// Holloe cube distance estimator
float cube (vec3 point, vec3 center, float edgelength) {
  vec3 p = abs(point - center);

  // Equation of a cube
  return max(p.x, max(p.y, p.z))
         - edgelength / 2.0;
}

// Hollow torus distance estimator
float torus (vec3 point, vec3 center, float majorRadius, float minorRadius) {
  
  // Equation of a plane
  return (majorRadius - sqrt(point.x * point.x + point.y * point.y))
  		 * (majorRadius - sqrt(point.x * point.x + point.y * point.y))
  		 + point.z * point.z
  		 - minorRadius * minorRadius;
}

// Plane distance estimator
float plane (vec3 point, vec3 center) {
  
  // Equation of a plane
  return dot(point - center, vec3(0, 1, 0));
}