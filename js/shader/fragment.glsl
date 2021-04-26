uniform float uTime;
uniform sampler2D uImage;

varying vec2 vUv;
varying float vDist;

void main()	{
	vec4 image = texture2D(uImage, vUv);

	gl_FragColor = image;
	// gl_FragColor = vec4(vDist, 0.0, 0.0, 1.0);
}
