// : REAL motion graphics ($0, no Higgsfield) — a flowing domain-warped aurora GLSL shader + a 3D particle
// field streaming toward the camera (additive glow, depth) + a pulsing core. NOT text. Frame-deterministic so it
// renders headless. The "without Higgsfield" half of the creator's A/B. 1080x1920, ~6s @ 30fps.
import React, {useMemo, useRef} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';

const vert = `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.0,1.0); }`;
const frag = `precision highp float; varying vec2 vUv; uniform float uTime; uniform vec2 uRes;
float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float noise(vec2 p){ vec2 i=floor(p),f=fract(p),u=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y); }
float fbm(vec2 p){ float v=0.0,a=0.5; for(int i=0;i<6;i++){ v+=a*noise(p); p*=2.0; a*=0.5; } return v; }
void main(){ vec2 uv=vUv; vec2 p=uv*vec2(uRes.x/uRes.y,1.0)*2.4; float t=uTime*0.12;
  vec2 q=vec2(fbm(p+vec2(0.0,t)),fbm(p+vec2(5.2,1.3-t)));
  vec2 r=vec2(fbm(p+4.0*q+vec2(1.7,9.2)+t*0.5),fbm(p+4.0*q+vec2(8.3,2.8)-t*0.5));
  float f=fbm(p+4.0*r);
  vec3 ink=vec3(0.027,0.027,0.055), purple=vec3(0.545,0.361,0.965), cyan=vec3(0.133,0.827,0.933);
  vec3 col=ink; col=mix(col,purple,smoothstep(0.15,0.95,f)); col=mix(col,cyan,smoothstep(0.55,1.0,r.x));
  float vig=smoothstep(0.95,0.15,length(uv-0.5)); col*=0.4+0.6*vig; col*=0.8+0.45*f;
  gl_FragColor=vec4(col,1.0); }`;

const Aurora: React.FC = () => {
  const frame = useCurrentFrame(); const {fps, width, height} = useVideoConfig();
  const mat = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => ({uTime: {value: 0}, uRes: {value: new THREE.Vector2(width, height)}}), [width, height]);
  if (mat.current) mat.current.uniforms.uTime.value = frame / fps;
  return <mesh><planeGeometry args={[2, 2]} /><shaderMaterial ref={mat} uniforms={uniforms} vertexShader={vert} fragmentShader={frag} depthWrite={false} /></mesh>;
};

const COUNT = 1500;
const Particles: React.FC = () => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const t = frame / fps;
  const ref = useRef<THREE.Points>(null);
  const {base, colors, sizes} = useMemo(() => {
    const base = new Float32Array(COUNT * 3), colors = new Float32Array(COUNT * 3), sizes = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      base[i * 3] = (Math.random() - 0.5) * 10; base[i * 3 + 1] = (Math.random() - 0.5) * 18; base[i * 3 + 2] = Math.random() * 24;
      const c = Math.random() > 0.5 ? [0.6, 0.45, 1.0] : [0.2, 0.85, 0.95];
      colors[i * 3] = c[0]; colors[i * 3 + 1] = c[1]; colors[i * 3 + 2] = c[2];
      sizes[i] = 0.04 + Math.random() * 0.10;
    }
    return {base, colors, sizes};
  }, []);
  // frame-deterministic stream toward camera (z wraps 24→0), with gentle lateral drift
  const pos = useMemo(() => new Float32Array(COUNT * 3), []);
  for (let i = 0; i < COUNT; i++) {
    let z = base[i * 3 + 2] - t * 4.0; z = ((z % 24) + 24) % 24; // wrap into [0,24]
    pos[i * 3] = base[i * 3] + Math.sin(t * 0.6 + i) * 0.25;
    pos[i * 3 + 1] = base[i * 3 + 1] + Math.cos(t * 0.5 + i) * 0.25;
    pos[i * 3 + 2] = z;
  }
  if (ref.current) { ref.current.geometry.attributes.position.array.set(pos); ref.current.geometry.attributes.position.needsUpdate = true; }
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[pos, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial vertexColors size={0.09} sizeAttenuation transparent opacity={0.95} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
};

const Core: React.FC = () => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const t = frame / fps;
  const s = 1.1 + 0.18 * Math.sin(t * 2.2);
  return (
    <mesh position={[0, 0, 8]} scale={[s, s, s]}>
      <icosahedronGeometry args={[1, 1]} />
      <meshBasicMaterial color={'#a78bfa'} wireframe transparent opacity={0.5} blending={THREE.AdditiveBlending} />
    </mesh>
  );
};

const Scene: React.FC = () => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const t = frame / fps;
  const camZ = 14 - t * 0.8; // slow forward push
  return (
    <>
      <perspectiveCamera makeDefault position={[0, 0, camZ]} fov={70} />
      <Particles />
      <Core />
    </>
  );
};

export const ShaderMGReel: React.FC = () => {
  const {width, height} = useVideoConfig();
  return (
    <AbsoluteFill style={{backgroundColor: '#070710'}}>
      {/* aurora shader background (its own full-screen canvas) */}
      <ThreeCanvas width={width} height={height} gl={{antialias: true}} orthographic camera={{position: [0, 0, 1]}}>
        <Aurora />
      </ThreeCanvas>
      {/* 3D particle field + core (perspective) layered on top */}
      <AbsoluteFill style={{mixBlendMode: 'screen'}}>
        <ThreeCanvas width={width} height={height} gl={{antialias: true, alpha: true}}>
          <Scene />
        </ThreeCanvas>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
