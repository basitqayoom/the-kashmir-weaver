"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Thread({
  index,
  total,
  horizontal,
}: {
  index: number;
  total: number;
  horizontal: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const phase = useMemo(() => (index / total) * Math.PI * 2, [index, total]);
  const speed = useMemo(() => 0.08 + Math.random() * 0.12, []);
  const spread = 7;
  const pos = useMemo(
    () => ((index / (total - 1)) - 0.5) * spread,
    [index, total]
  );

  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const segments = 60;
    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * 2 - 1;
      const weaveOffset =
        Math.sin(t * Math.PI * (2 + Math.random())) * 0.04;
      if (horizontal) {
        points.push(new THREE.Vector3(t * 5, weaveOffset, 0));
      } else {
        points.push(new THREE.Vector3(weaveOffset, t * 4, 0));
      }
    }
    const curve = new THREE.CatmullRomCurve3(points);
    const radius = 0.006 + Math.random() * 0.008;
    return new THREE.TubeGeometry(curve, 40, radius, 5, false);
  }, [horizontal]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime() * speed + phase;
    if (horizontal) {
      meshRef.current.position.y = pos + Math.sin(t) * 0.08;
      meshRef.current.position.z = Math.sin(t * 0.6) * 0.05;
    } else {
      meshRef.current.position.x = pos + Math.sin(t) * 0.08;
      meshRef.current.position.z = Math.cos(t * 0.6) * 0.05;
    }
  });

  const opacity = useMemo(() => 0.08 + Math.random() * 0.14, []);
  const color = useMemo(() => {
    const colors = ["#D4AF37", "#C9A84C", "#B8941F", "#E0C068", "#A68523"];
    const base = new THREE.Color(
      colors[Math.floor(Math.random() * colors.length)]
    );
    base.offsetHSL(Math.random() * 0.02 - 0.01, 0, Math.random() * 0.08 - 0.04);
    return base;
  }, []);

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      position={horizontal ? [0, pos, 0] : [pos, 0, 0]}
    >
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </mesh>
  );
}

function FloatingNeedle() {
  const groupRef = useRef<THREE.Group>(null);

  const bodyGeom = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.2, 0, 0),
      new THREE.Vector3(-0.3, 0, 0),
      new THREE.Vector3(0.8, 0, 0),
      new THREE.Vector3(1.2, -0.02, 0),
    ]);
    return new THREE.TubeGeometry(curve, 16, 0.015, 6, false);
  }, []);

  const eyeGeom = useMemo(() => new THREE.TorusGeometry(0.03, 0.008, 6, 12), []);

  const trailingThread = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.2, 0, 0),
      new THREE.Vector3(-1.8, 0.15, 0.1),
      new THREE.Vector3(-2.6, -0.1, -0.05),
      new THREE.Vector3(-3.4, 0.2, 0.15),
      new THREE.Vector3(-4.2, -0.05, 0.05),
    ]);
    return new THREE.TubeGeometry(curve, 40, 0.005, 4, false);
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime() * 0.12;
    groupRef.current.position.x = Math.sin(t) * 2.5;
    groupRef.current.position.y = Math.cos(t * 0.8) * 1.5;
    groupRef.current.rotation.z = Math.sin(t * 0.4) * 0.2 + Math.atan2(
      Math.cos(t * 0.8) * 1.5 * 0.8,
      Math.cos(t) * 2.5
    ) * 0.3;
  });

  return (
    <group ref={groupRef}>
      <mesh geometry={bodyGeom}>
        <meshBasicMaterial color="#C0C0C0" transparent opacity={0.25} depthWrite={false} />
      </mesh>
      <mesh geometry={eyeGeom} position={[-1.15, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <meshBasicMaterial color="#D4AF37" transparent opacity={0.3} depthWrite={false} />
      </mesh>
      <mesh geometry={trailingThread}>
        <meshBasicMaterial color="#D4AF37" transparent opacity={0.18} depthWrite={false} />
      </mesh>
    </group>
  );
}

function WeaveScene() {
  const warpCount = 28;
  const weftCount = 18;

  return (
    <>
      <ambientLight intensity={0.4} />
      {Array.from({ length: warpCount }, (_, i) => (
        <Thread key={`warp-${i}`} index={i} total={warpCount} horizontal={false} />
      ))}
      {Array.from({ length: weftCount }, (_, i) => (
        <Thread key={`weft-${i}`} index={i} total={weftCount} horizontal />
      ))}
      <FloatingNeedle />
    </>
  );
}

export default function FiberCanvas() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true" role="presentation">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
        dpr={[1, 1.5]}
      >
        <WeaveScene />
      </Canvas>
    </div>
  );
}
