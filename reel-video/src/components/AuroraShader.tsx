// : the cinematic-depth background — a real GLSL domain-warped fbm aurora on a fullscreen
// R3F plane, with a slow baked "camera fly" (push-in + drift) driven by useCurrentFrame so it's
// 100% frame-deterministic. Brand colors are uniforms so each story can re-grade. Renders headless
// with --gl=angle. This REPLACES the old flat-orbs+dust look entirely.
import React, { useMemo, useRef } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import * as THREE from 'three';

const hexToVec3 = (hex: string): [number, number, number] => {
  const n = parseInt(hex.replace('#', ''), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

const vert = `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const frag = `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform vec2 uRes;
uniform vec3 uInk;
uniform vec3 uA;
uniform vec3 uB;
uniform float uIntensity;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){ vec2 i=floor(p); vec2 f=fract(p); vec2 u=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),u.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x), u.y); }
float fbm(vec2 p){ float v=0.0, a=0.5; for(int i=0;i<6;i++){ v+=a*noise(p); p*=2.02; a*=0.5; } return v; }
void main(){
  vec2 uv = vUv;
  // slow camera fly: gentle push-in (zoom) + drift = parallax through the volume
  float zoom = 2.30 - uTime * 0.030;
  vec2 center = vec2(0.10 * sin(uTime * 0.05), -0.05 + uTime * 0.012);
  vec2 p = (uv - 0.5) * vec2(uRes.x/uRes.y, 1.0) * zoom + center;
  float t = uTime * 0.10;
  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3 - t)));
  vec2 r = vec2(fbm(p + 4.0*q + vec2(1.7, 9.2) + t*0.5), fbm(p + 4.0*q + vec2(8.3, 2.8) - t*0.5));
  float f = fbm(p + 4.0*r);
  vec3 col = uInk;
  col = mix(col, uA, smoothstep(0.12, 0.95, f) * uIntensity);
  col = mix(col, uB, smoothstep(0.55, 1.02, r.x) * uIntensity);
  // depth haze toward the edges + cinematic vignette
  float vig = smoothstep(0.92, 0.18, length(uv - 0.5));
  col *= 0.40 + 0.60 * vig;
  col *= 0.82 + 0.42 * f;
  // subtle film bloom in the brightest cores
  col += uA * smoothstep(0.85, 1.05, f) * 0.18;
  gl_FragColor = vec4(col, 1.0);
}
`;

const Plane: React.FC<{ ink: string; a: string; b: string; intensity: number }> = ({ ink, a, b, intensity }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const mat = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(width, height) },
      uInk: { value: new THREE.Vector3(...hexToVec3(ink)) },
      uA: { value: new THREE.Vector3(...hexToVec3(a)) },
      uB: { value: new THREE.Vector3(...hexToVec3(b)) },
      uIntensity: { value: intensity },
    }),
    [width, height, ink, a, b, intensity]
  );
  if (mat.current) mat.current.uniforms.uTime.value = frame / fps;
  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial ref={mat} uniforms={uniforms} vertexShader={vert} fragmentShader={frag} />
    </mesh>
  );
};

export const AuroraShader: React.FC<{
  ink?: string;
  accentA?: string;
  accentB?: string;
  intensity?: number;
}> = ({ ink = '#0A0A12', accentA = '#8B5CF6', accentB = '#22D3EE', intensity = 1 }) => {
  const { width, height } = useVideoConfig();
  return (
    <ThreeCanvas width={width} height={height} gl={{ antialias: true }} style={{ position: 'absolute', inset: 0 }}>
      <Plane ink={ink} a={accentA} b={accentB} intensity={intensity} />
    </ThreeCanvas>
  );
};
