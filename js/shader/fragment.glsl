varying vec2 vUv;
varying float vNoise;

// uniform vec4 uResolution;
uniform sampler2D uOceanTexture;
uniform float uTime;

void main()	{
	// vec3 color1 = vec3(0.0, 0.0, 1.0);
	// vec3 color2 = vec3(1.0, 1.0, 1.0);
	// vec3 finalColor = mix(color1, color2, (vNoise + 1.0) * 0.5);

	// float noise = cnoise(vec3(vUv * 10.0, uTime));

	vec2 newUV = vUv;
	newUV = vec2(newUV.x, newUV.y + 0.01 * sin(newUV.x * 10.0 + uTime));
	// newUV = vec2(newUV.x, newUV.y + noise * 0.04);

	vec4 oceanView = texture2D(uOceanTexture, newUV);
	
	// gl_FragColor = vec4(noise);
	gl_FragColor = oceanView + vec4(vNoise) * 0.5;
}
