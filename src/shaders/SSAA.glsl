#define MAX_SAMPLES 9.0

// Grid style SSAA
vec3 grid () {

  // Define base color  
  vec3 shade = vec3(0);

  // Define sub-pixel dimension
  vec2 delta = vec2(2.0 / (resolution * samples));

  // Start dividing pixel in x and y directions
  for (float i = 0.0; i < _MAX_SAMPLES_; ++i) {

    if (i >= samples) break;
    for (float j = 0.0; j < _MAX_SAMPLES_; ++j) {
      if (j >= samples) break;

      // Define x, y coordinate of subpixel TODO: about center uv
      vec2 ss = uv + delta * vec2(i, j);

      // Define rotated and normalized direction vector
      vec3 direction = (rotate_viewer * vec4(normalize(vec3(ss.x * aspect, ss.y, -focal)), 1)).xyz;

      // Shoot ray at sub-pixel
      shade += rayMarch(eye, direction);
    }
  }

  // Average sub pixel colors
  return shade / (samples * samples);
}