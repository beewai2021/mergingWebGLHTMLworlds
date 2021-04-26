uniform float uTime;
uniform sampler2D uImage;
uniform float uHoverState;

varying vec2 vUv;
varying float vDist;

void main()	{
	vec4 image = texture2D(uImage, vUv);

	gl_FragColor = image;
	gl_FragColor.b += uHoverState * sin(uTime * 3.0) * 0.3;
}
