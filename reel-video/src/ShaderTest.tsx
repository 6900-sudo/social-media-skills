// : R3F headless-render de-risk. A fullscreen domain-warped fbm aurora shader (the real
// "cinematic depth" background lever). If this renders headless, the cinematic story builds on it.
import React, { useMemo, useRef } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import * as THREE from 'three';

const vert = `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const frag = `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform vec2 uRes;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){ vec2 i=floor(p); vec2 f=fract(p); vec2 u=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),u.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x), u.y); }
float fbm(vec2 p){ float v=0.0, a=0.5; for(int i=0;i<6;i++){ v+=a*noise(p); p*=2.0; a*=0.5; } return v; }
void main(){
  vec2 uv = vUv;
  vec2 p = uv * vec2(uRes.x/uRes.y, 1.0) * 2.2;
  float t = uTime * 0.10;
  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3 - t)));
  vec2 r = vec2(fbm(p + 4.0*q + vec2(1.7, 9.2) + t*0.5), fbm(p + 4.0*q + vec2(8.3, 2.8) - t*0.5));
  float f = fbm(p + 4.0*r);
  vec3 ink = vec3(0.039, 0.039, 0.071);
  vec3 purple = vec3(0.545, 0.361, 0.965);
  vec3 cyan = vec3(0.133, 0.827, 0.933);
  vec3 col = ink;
  col = mix(col, purple, smoothstep(0.15, 0.95, f));
  col = mix(col, cyan, smoothstep(0.55, 1.0, r.x));
  float vig = smoothstep(0.85, 0.2, length(uv - 0.5));
  col *= 0.45 + 0.55 * vig;
  col *= 0.85 + 0.4 * f;
  gl_FragColor = vec4(col, 1.0);
}
`;

const Plane: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const mat = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uRes: { value: new THREE.Vector2(width, height) } }),
    [width, height]
  );
  if (mat.current) mat.current.uniforms.uTime.value = frame / fps;
  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial ref={mat} uniforms={uniforms} vertexShader={vert} fragmentShader={frag} />
    </mesh>
  );
};

export const ShaderTest: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: '#0A0A12' }}>
      <ThreeCanvas width={width} height={height} gl={{ antialias: true }}>
        <Plane />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
