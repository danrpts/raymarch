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
  return max(p.x, max(p.y, p.z)) - edgelength / 2.0;
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
float plane (vec3 point, vec3 center, vec3 up) {
  
  vec3 p = point - center;

  // Equation of a plane
  return dot(p, up);
}

// Hollow cylinder distance estimator
// Not working yet
float cylinder (vec3 point, vec3 center, vec2 ab) {
  
  vec3 p = point - center;

  // Equation of a cylinder
  return (p.x * p.x) / (ab.x * ab.x)
       + (p.z * p.z) / (ab.y * ab.y)
       - 1.0;
}

// Hollow cone distance estimator
// Not working yet
float cone (vec3 point, vec3 center, vec3 abc) {
  
  vec3 p = point - center;

  // Equation of a cone
  return (p.x * p.x) / (abc.x * abc.x)
       + (p.y * p.y) / (abc.y * abc.y)
       - (p.z * p.z) / (abc.z * abc.z);
}

// Ellipsoid distance estimator
// Not working yet
float ellipsoid (vec3 point, vec3 center, vec3 abc) {
  
  vec3 p = point - center;

  // Equation of an ellipsoid
  return (p.x * p.x) / (abc.x * abc.x)
       + (p.y * p.y) / (abc.y * abc.y)
       + (p.z * p.z) / (abc.z * abc.z)
       - 1.0;
}
