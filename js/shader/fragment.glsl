uniform float uTime;
uniform sampler2D uImage;
uniform float uHoverState;

varying vec2 vUv;
varying float vDist;

void main()	{
	vec2 newUv = vUv;

	float hover = uHoverState;
	hover = smoothstep(0.0, 1.0, (uHoverState * 2.0 + newUv.y - 1.0));

	vec4 colorMix = mix(
		texture2D(uImage, (newUv - 0.5) * (1.0 - hover) + 0.5),
		texture2D(uImage, (newUv - 0.5) * hover + 0.5),
		hover
	);

	// gl_FragColor = image;
	gl_FragColor = colorMix;
	gl_FragColor.rgb -= uHoverState * vDist;
}
