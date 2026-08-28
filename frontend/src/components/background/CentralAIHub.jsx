import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

/**
 * CentralAIHub:
 * Represents the 4-agent intelligence pipeline feeding the central command core:
 * - Central dark olive hexagonal plinth (#1E2C1D)
 * - 4 Satellite Agent nodes (NLP, SciPy Allocation, Priority Engine, Alert Router)
 * - Directional vector lines with slow spring-green (#6DBE5A) pulses flowing inward
 */
export default function CentralAIHub({
  prefersReducedMotion = false,
  tabMode = 'landing',
}) {
  const hubGroupRef = useRef();
  const pulsesGroupRef = useRef();

  // Define position of central hub and its 4 agent satellites
  // On landing page, it sits right-biased behind the brain panel area
  const layout = useMemo(() => {
    // Center point for hub
    const center = [5.5, 1.8, -2.0];
    const radius = 2.4;

    // 4 cardinal agent positions
    const agents = [
      { id: 'nlp', label: 'NLP-01', angle: 0 },
      { id: 'scipy', label: 'SCIPY-02', angle: Math.PI / 2 },
      { id: 'priority', label: 'PRIORITY-03', angle: Math.PI },
      { id: 'router', label: 'ROUTER-04', angle: (3 * Math.PI) / 2 },
    ].map(a => {
      const x = center[0] + Math.cos(a.angle) * radius;
      const y = center[1] + Math.sin(a.angle) * radius * 0.7; // perspective foreshortening
      const z = center[2] + Math.sin(a.angle) * 0.4;
      return {
        ...a,
        pos: [x, y, z],
      };
    });

    // Conduits from each agent to center
    const conduits = agents.map(a => {
      const vFrom = new THREE.Vector3(...a.pos);
      const vTo = new THREE.Vector3(...center);
      const points = [vFrom, vTo];
      return {
        from: vFrom,
        to: vTo,
        geometry: new THREE.BufferGeometry().setFromPoints(points),
      };
    });

    return { center, agents, conduits };
  }, []);

  // Shared geometry
  const geometries = useMemo(() => {
    return {
      hubPlinth: new THREE.CylinderGeometry(0.7, 0.75, 0.25, 6),
      hubRing: new THREE.RingGeometry(0.85, 0.95, 6),
      agentPlinth: new THREE.CylinderGeometry(0.28, 0.3, 0.15, 6),
      agentIndicator: new THREE.SphereGeometry(0.12, 10, 10),
      pulseSphere: new THREE.SphereGeometry(0.09, 8, 8),
    };
  }, []);

  // Shared materials
  const materials = useMemo(() => {
    return {
      hubBody: new THREE.MeshLambertMaterial({
        color: '#1E2C1D',
        emissive: '#1E2C1D',
        emissiveIntensity: 0.4,
        flatShading: true,
      }),
      hubAccentRing: new THREE.MeshBasicMaterial({
        color: '#6DBE5A',
        wireframe: true,
      }),
      agentBody: new THREE.MeshLambertMaterial({
        color: '#2C3E2B',
        flatShading: true,
      }),
      agentAccent: new THREE.MeshBasicMaterial({
        color: '#6DBE5A',
      }),
      conduitLine: new THREE.LineBasicMaterial({
        color: '#456942',
        transparent: true,
        opacity: 0.35,
        linewidth: 1.5,
      }),
      pulse: new THREE.MeshBasicMaterial({
        color: '#6DBE5A',
        transparent: true,
        opacity: 0.9,
      }),
    };
  }, []);

  // Animate inward data pulses from agents to central hub
  useFrame((state) => {
    if (prefersReducedMotion || !pulsesGroupRef.current) return;
    const t = state.clock.elapsedTime;

    const pulseMeshes = pulsesGroupRef.current.children;
    for (let i = 0; i < pulseMeshes.length; i++) {
      const mesh = pulseMeshes[i];
      const conduit = layout.conduits[i];
      if (conduit) {
        // Pulses travel inward toward center
        const progress = ((t * 0.45 + i * 0.25) % 1.0);
        mesh.position.lerpVectors(conduit.from, conduit.to, progress);
      }
    }
  });

  return (
    <group ref={hubGroupRef} position={[0, 0, 0]}>
      {/* 1. Central Core Command Hub Plinth */}
      <group position={layout.center}>
        <mesh
          geometry={geometries.hubPlinth}
          material={materials.hubBody}
          position={[0, 0, 0]}
        />
        <mesh
          geometry={geometries.hubRing}
          material={materials.hubAccentRing}
          position={[0, 0.14, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        {/* Core signal beacon */}
        <mesh
          geometry={geometries.agentIndicator}
          material={materials.agentAccent}
          position={[0, 0.2, 0]}
        />
      </group>

      {/* 2. 4 Satellite Agent Nodes */}
      {layout.agents.map((agent, i) => (
        <group key={agent.id} position={agent.pos}>
          <mesh
            geometry={geometries.agentPlinth}
            material={materials.agentBody}
            position={[0, 0, 0]}
          />
          <mesh
            geometry={geometries.agentIndicator}
            material={materials.agentAccent}
            position={[0, 0.12, 0]}
          />
        </group>
      ))}

      {/* 3. Inward Tactical Conduits */}
      {layout.conduits.map((c, i) => (
        <line
          key={`conduit-${i}`}
          geometry={c.geometry}
          material={materials.conduitLine}
        />
      ))}

      {/* 4. Inward Traveling AI Data Packets */}
      <group ref={pulsesGroupRef}>
        {layout.conduits.map((_, i) => (
          <mesh
            key={`hub-pulse-${i}`}
            geometry={geometries.pulseSphere}
            material={materials.pulse}
          />
        ))}
      </group>
    </group>
  );
}
