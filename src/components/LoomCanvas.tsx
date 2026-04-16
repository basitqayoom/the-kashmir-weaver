"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function WarpThread({ index, total }: { index: number; total: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const xPos = useMemo(() => ((index / (total - 1)) - 0.5) * 6, [index, total]);
  const phase = useMemo(() => (index / total) * Math.PI * 4, [index, total]);
  const speed = useMemo(() => 0.3 + Math.random() * 0.2, []);

  const geometry = useMemo(() => {
    const points = [];
    for (let i = 0; i <= 40; i++) {
      const t = (i / 40) * 2 - 1;
      points.push(new THREE.Vector3(0, t * 4, 0));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    return new THREE.TubeGeometry(curve, 20, 0.004, 4, false);
  }, []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime() * speed + phase;
    meshRef.current.position.z = Math.sin(t) * 0.15;
    meshRef.current.position.x = xPos + Math.sin(t * 0.3) * 0.02;
  });

  const opacity = useMemo(() => 0.06 + Math.random() * 0.08, []);
  const color = useMemo(() => {
    const c = new THREE.Color("#D4AF37");
    c.offsetHSL(Math.random() * 0.03 - 0.015, 0, Math.random() * 0.15 - 0.05);
    return c;
  }, []);

  return (
    <mesh ref={meshRef} geometry={geometry} position={[xPos, 0, 0]}>
      <meshBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} />
    </mesh>
  );
}

function WeftThread({ index, total }: { index: number; total: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const yPos = useMemo(() => ((index / (total - 1)) - 0.5) * 8, [index, total]);
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);

  const geometry = useMemo(() => {
    const points = [];
    for (let i = 0; i <= 40; i++) {
      const t = (i / 40) * 2 - 1;
      points.push(new THREE.Vector3(t * 4, 0, Math.sin(i * 0.8) * 0.05));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    return new THREE.TubeGeometry(curve, 20, 0.003, 4, false);
  }, []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime() * 0.2 + phase;
    meshRef.current.position.z = Math.sin(t) * 0.1;
  });

  const opacity = useMemo(() => 0.04 + Math.random() * 0.06, []);

  return (
    <mesh ref={meshRef} geometry={geometry} position={[0, yPos, 0]}>
      <meshBasicMaterial color="#D4AF37" transparent opacity={opacity} depthWrite={false} />
    </mesh>
  );
}

function Needle() {
  const groupRef = useRef<THREE.Group>(null);

  const bodyGeom = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.5, 0, 0),
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(1.5, 0, 0),
    ]);
    return new THREE.TubeGeometry(curve, 20, 0.012, 6, false);
  }, []);

  const eyeGeom = useMemo(() => new THREE.RingGeometry(0.02, 0.04, 8), []);
  const threadGeom = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.5, 0, 0),
      new THREE.Vector3(-2.5, 0.3, 0.2),
      new THREE.Vector3(-3.5, -0.2, -0.1),
      new THREE.Vector3(-4.5, 0.1, 0.3),
    ]);
    return new THREE.TubeGeometry(curve, 32, 0.006, 4, false);
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime() * 0.15;
    groupRef.current.position.x = Math.sin(t) * 2;
    groupRef.current.position.y = Math.cos(t * 0.7) * 1;
    groupRef.current.rotation.z = Math.sin(t * 0.5) * 0.15;
  });

  return (
    <group ref={groupRef}>
      <mesh geometry={bodyGeom}>
        <meshBasicMaterial color="#C0C0C0" transparent opacity={0.2} depthWrite={false} />
      </mesh>
      <mesh geometry={eyeGeom} position={[-1.4, 0, 0.02]}>
        <meshBasicMaterial color="#D4AF37" transparent opacity={0.25} depthWrite={false} />
      </mesh>
      <mesh geometry={threadGeom}>
        <meshBasicMaterial color="#D4AF37" transparent opacity={0.15} depthWrite={false} />
      </mesh>
    </group>
  );
}

function LoomScene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      {Array.from({ length: 20 }, (_, i) => (
        <WarpThread key={`warp-${i}`} index={i} total={20} />
      ))}
      {Array.from({ length: 12 }, (_, i) => (
        <WeftThread key={`weft-${i}`} index={i} total={12} />
      ))}
      <Needle />
    </>
  );
}

export default function LoomCanvas() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true" role="presentation">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
        dpr={[1, 1.5]}
      >
        <LoomScene />
      </Canvas>
    </div>
  );
}
