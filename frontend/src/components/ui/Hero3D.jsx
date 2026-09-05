import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, Float, PerformanceMonitor } from '@react-three/drei';
import { Bloom, DepthOfField, EffectComposer, N8AO } from '@react-three/postprocessing';
import * as THREE from 'three';

function PlannerCore({ reducedMotion }) {
  const group = useRef();
  const { camera, pointer } = useThree();
  const scrollTarget = useRef(0);

  useEffect(() => {
    const updateScroll = () => {
      scrollTarget.current = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 2.5);
    };
    updateScroll();
    window.addEventListener('scroll', updateScroll, { passive: true });
    return () => window.removeEventListener('scroll', updateScroll);
  }, []);

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime;
    const scroll = scrollTarget.current;
    const motionScale = reducedMotion ? 0.08 : 1;
    if (group.current) {
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, pointer.y * -0.18 + scroll * 0.08, 0.04);
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, pointer.x * 0.28 + elapsed * 0.12 * motionScale + scroll * 0.2, 0.04);
      group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, Math.sin(elapsed * 0.7) * 0.12 * motionScale - scroll * 0.25, 0.04);
    }
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, 7.5 + scroll * 0.9, 0.03);
    camera.lookAt(0, -scroll * 0.1, 0);
  });

  const bars = useMemo(() => [0.8, 1.2, 1.6, 1.05, 1.85, 1.35, 1.7], []);

  return (
    <group ref={group}>
      <Float speed={reducedMotion ? 0.15 : 1.2} rotationIntensity={reducedMotion ? 0.05 : 0.35} floatIntensity={reducedMotion ? 0.08 : 0.35}>
        <mesh position={[0, 0.15, 0]} castShadow>
          <icosahedronGeometry args={[1.05, 1]} />
          <meshPhysicalMaterial color="#16104c" emissive="#4c1d95" emissiveIntensity={0.35} roughness={0.24} metalness={0.68} clearcoat={1} clearcoatRoughness={0.14} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.15, 0.03]}>
          <torusGeometry args={[1.38, 0.025, 8, 64]} />
          <meshBasicMaterial color="#67e8f9" transparent opacity={0.65} />
        </mesh>
        <mesh rotation={[0.5, 0.2, 0.8]} position={[0, 0.15, 0.03]}>
          <torusGeometry args={[1.58, 0.018, 8, 64]} />
          <meshBasicMaterial color="#c084fc" transparent opacity={0.42} />
        </mesh>
      </Float>

      <group position={[-2.05, -1.1, 0.2]}>
        {bars.map((height, index) => (
          <mesh key={index} position={[index * 0.28, height / 2, 0]} castShadow>
            <boxGeometry args={[0.16, height, 0.16]} />
            <meshStandardMaterial color={index === 4 ? '#67e8f9' : '#7c3aed'} emissive={index === 4 ? '#22d3ee' : '#4c1d95'} emissiveIntensity={0.55} roughness={0.28} metalness={0.62} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Scene({ reducedMotion, dpr, onDecline, onIncline }) {
  return (
    <Canvas camera={{ position: [0, 0, 7.5], fov: 42 }} dpr={dpr} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }} shadows={{ type: THREE.PCFSoftShadowMap }} fallback={<div aria-hidden="true" />}>
      <PerformanceMonitor onDecline={onDecline} onIncline={onIncline}>
        <color attach="background" args={['#05050a']} />
        <ambientLight intensity={0.35} />
        <hemisphereLight args={['#a5b4fc', '#09051d', 0.7]} />
        <spotLight position={[4, 6, 5]} angle={0.45} penumbra={1} intensity={32} color="#67e8f9" castShadow shadow-mapSize={[1024, 1024]} />
        <pointLight position={[-4, -2, 2]} intensity={15} color="#a855f7" />
        <Suspense fallback={null}>
          <Environment preset="city" background={false} blur={0.8} />
          <PlannerCore reducedMotion={reducedMotion} />
          <ContactShadows position={[0, -2.05, 0]} opacity={0.45} scale={5} blur={2.6} far={4} color="#6d28d9" />
        </Suspense>
        <EffectComposer multisampling={0}>
          <Bloom intensity={0.7} luminanceThreshold={0.55} luminanceSmoothing={0.25} mipmapBlur />
          <N8AO distanceFalloff={1.8} aoRadius={0.18} intensity={1.25} />
          <DepthOfField focusDistance={0.02} focalLength={0.08} bokehScale={1.4} height={480} />
        </EffectComposer>
      </PerformanceMonitor>
    </Canvas>
  );
}

export function Hero3D() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [dpr, setDpr] = useState(() => Math.min(window.devicePixelRatio || 1, 1.5));

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setReducedMotion(media.matches);
    updateMotion();
    media.addEventListener?.('change', updateMotion);
    const updateDpr = () => setDpr(Math.min(window.devicePixelRatio || 1, 1.5));
    window.addEventListener('resize', updateDpr, { passive: true });
    return () => {
      media.removeEventListener?.('change', updateMotion);
      window.removeEventListener('resize', updateDpr);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-0 opacity-75" aria-hidden="true">
      <Scene reducedMotion={reducedMotion} dpr={dpr} onDecline={() => setDpr(1)} onIncline={() => setDpr((value) => Math.min(Math.max(value, 1), 1.5))} />
    </div>
  );
}
