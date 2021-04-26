uniform vec2 uHover;
uniform float uTime;
uniform float uHoverState;

varying vec2 vUv;
varying float vDist;

void main() {
  vUv = uv;
  vDist = distance(vUv, uHover);

  vec3 newPos = position;
  newPos.z += sin(vDist * 4.0) * 12.0 * uHoverState;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
}
