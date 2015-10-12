#define MAX_SAMPLES 9.0

vec3 grid () {
  vec3 shade = vec3(0);
  vec2 delta = vec2(2) / (resolution * samples);
  for (float i = 0.0; i < _MAX_SAMPLES_; ++i) {
    if (i >= samples) break;
    for (float j = 0.0; j < _MAX_SAMPLES_; ++j) {
      if (j >= samples) break;
      vec2 ss = uv + delta * vec2(i, j);
      vec3 direction = normalize(vec3(ss.x * aR, ss.y, -focal));
      shade += rayMarch(eye, direction);
    }
  }
  return shade / samples * samples;
}