import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import TopographicGrid from './TopographicGrid';
import IncidentNodes from './IncidentNodes';
import CentralAIHub from './CentralAIHub';
import RadarSweep from './RadarSweep';

/**
 * TacticalScene:
 * Renders the 3D isometric command surface with smooth camera parallax and tab transitions.
 */
export default function TacticalScene({
  activeTab = 'landing',
  prefersReducedMotion = false,
  hasFinePointer = true,
  mousePos = { current: { x: 0, y: 0 } },
}) {
  const { camera } = useThree();
  const sceneGroupRef = useRef();
  const targetCamPos = useRef(new THREE.Vector3(0, 14, 18));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));

  // Determine camera target based on activeTab
  useEffect(() => {
    switch (activeTab) {
      case 'architecture':
      case 'pipeline':
        targetCamPos.current.set(2.5, 13, 16);
        targetLookAt.current.set(2.0, 1.0, -1.0);
        break;
      case 'queue':
      case 'scipy':
        targetCamPos.current.set(-1.0, 15, 19);
        targetLookAt.current.set(0, -0.5, 0);
        break;
      case 'weather':
        targetCamPos.current.set(1.0, 16, 17);
        targetLookAt.current.set(1.5, 0, -1.5);
        break;
      case 'report':
      case 'chatbot':
      case 'shelters':
      case 'offline':
      case 'map':
        targetCamPos.current.set(0, 16, 20);
        targetLookAt.current.set(0, 0, 0);
        break;
      case 'landing':
      default:
        targetCamPos.current.set(0, 14, 18);
        targetLookAt.current.set(0, 0, 0);
        break;
    }
  }, [activeTab]);

  useFrame((_, delta) => {
    // Parallax offsets (max ~1.5 degrees, smooth damped lerp)
    let offsetX = 0;
    let offsetY = 0;
    if (hasFinePointer && !prefersReducedMotion && mousePos.current) {
      offsetX = mousePos.current.x * 0.8;
      offsetY = mousePos.current.y * 0.5;
    }

    // Smoothly interpolate camera position and lookAt
    const lerpFactor = prefersReducedMotion ? 1.0 : Math.min(1, delta * 3.5);
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCamPos.current.x + offsetX, lerpFactor);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamPos.current.y + offsetY, lerpFactor);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCamPos.current.z, lerpFactor);

    currentLookAt.current.lerp(targetLookAt.current, lerpFactor);
    camera.lookAt(currentLookAt.current);
  });

  return (
    <>
      {/* Lighting configured for flat-shaded neo-brutalist geometry */}
      <ambientLight color="#E2E8E0" intensity={0.9} />
      <directionalLight
        position={[12, 22, 14]}
        intensity={1.2}
        color="#FFFFFF"
        castShadow={false}
      />
      <directionalLight
        position={[-12, 10, -8]}
        intensity={0.4}
        color="#456942"
      />

      <group ref={sceneGroupRef}>
        {/* 1. Low-poly terrain and perspective grid */}
        <TopographicGrid
          prefersReducedMotion={prefersReducedMotion}
          tabMode={activeTab}
        />

        {/* 2. Large subtle radar sweep */}
        <RadarSweep
          prefersReducedMotion={prefersReducedMotion}
          tabMode={activeTab}
        />

        {/* 3. Central AI Intelligence Hub & 4-Agent Satellite Conduits */}
        <CentralAIHub
          prefersReducedMotion={prefersReducedMotion}
          tabMode={activeTab}
        />

        {/* 4. Incident nodes, resource beacons, and dispatch routes */}
        <IncidentNodes
          prefersReducedMotion={prefersReducedMotion}
          tabMode={activeTab}
        />
      </group>
    </>
  );
}
