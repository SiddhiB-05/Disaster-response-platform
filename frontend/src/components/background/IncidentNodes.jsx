import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

/**
 * IncidentNodes:
 * Renders data-driven and representative disaster tactical nodes:
 * - High-priority incidents (Red #E53E3E) with smooth expanding range rings
 * - Warning incidents (Amber #DD6B20)
 * - Low-priority incidents (Green #6DBE5A)
 * - Rescue resources (Muted teal/blue-green #319795)
 * - Facilities / Shelters (Muted purple #805AD5)
 * - Thin animated dispatch vectors with packet pulses
 */
export default function IncidentNodes({
  prefersReducedMotion = false,
  tabMode = 'landing',
}) {
  const ringsGroupRef = useRef();
  const pulsesGroupRef = useRef();

  // Representative tactical nodes across Rourkela response grid
  const nodeData = useMemo(() => [
    // Incidents: [x, y, z, type, priority, label]
    { pos: [5.2, 1.2, -1.0], type: 'incident', priority: 'high', color: '#E53E3E' },
    { pos: [8.5, 3.8, -4.2], type: 'incident', priority: 'high', color: '#E53E3E' },
    { pos: [2.8, -2.1, 1.5], type: 'incident', priority: 'medium', color: '#DD6B20' },
    { pos: [-6.4, 3.2, -2.8], type: 'incident', priority: 'medium', color: '#DD6B20' },
    { pos: [-4.2, -1.8, 2.0], type: 'incident', priority: 'low', color: '#6DBE5A' },
    { pos: [7.1, -3.5, 0.5], type: 'incident', priority: 'low', color: '#6DBE5A' },

    // Rescue Resources (Ambulance, NDRF, Boat Teams)
    { pos: [1.5, 4.2, -3.0], type: 'resource', color: '#319795' },
    { pos: [-3.0, 1.5, 0.0], type: 'resource', color: '#319795' },
    { pos: [4.0, -4.5, 2.5], type: 'resource', color: '#319795' },

    // Facilities / Shelters / Hospitals
    { pos: [-7.0, -0.5, 3.2], type: 'facility', color: '#805AD5' },
    { pos: [9.2, -1.0, -1.5], type: 'facility', color: '#805AD5' },
  ], []);

  // Dispatch vector routes connecting resources to active incidents
  const routes = useMemo(() => [
    { from: [1.5, 4.2, -3.0], to: [5.2, 1.2, -1.0] },
    { from: [-3.0, 1.5, 0.0], to: [-6.4, 3.2, -2.8] },
    { from: [4.0, -4.5, 2.5], to: [2.8, -2.1, 1.5] },
    { from: [1.5, 4.2, -3.0], to: [8.5, 3.8, -4.2] },
  ], []);

  // Shared geometries
  const { sphereGeo, cylinderGeo, ringGeo, routeGeometries, routeCurves } = useMemo(() => {
    const sphere = new THREE.SphereGeometry(0.24, 12, 12);
    const cylinder = new THREE.CylinderGeometry(0.22, 0.22, 0.15, 6);
    const ring = new THREE.RingGeometry(0.3, 0.42, 24);

    const curves = [];
    const rGeos = routes.map(r => {
      const vFrom = new THREE.Vector3(...r.from);
      const vTo = new THREE.Vector3(...r.to);
      const mid = new THREE.Vector3().addVectors(vFrom, vTo).multiplyScalar(0.5);
      mid.y += 0.6; // slight parabolic tactical arc

      const curve = new THREE.QuadraticBezierCurve3(vFrom, mid, vTo);
      curves.push(curve);
      const points = curve.getPoints(24);
      return new THREE.BufferGeometry().setFromPoints(points);
    });

    return {
      sphereGeo: sphere,
      cylinderGeo: cylinder,
      ringGeo: ring,
      routeGeometries: rGeos,
      routeCurves: curves,
    };
  }, [routes]);

  // Shared materials to minimize draw calls & memory
  const materials = useMemo(() => {
    return {
      high: new THREE.MeshBasicMaterial({ color: '#E53E3E' }),
      medium: new THREE.MeshBasicMaterial({ color: '#DD6B20' }),
      low: new THREE.MeshBasicMaterial({ color: '#6DBE5A' }),
      resource: new THREE.MeshBasicMaterial({ color: '#319795' }),
      facility: new THREE.MeshBasicMaterial({ color: '#805AD5' }),
      ringHigh: new THREE.MeshBasicMaterial({
        color: '#E53E3E',
        transparent: true,
        opacity: 0.45,
        side: THREE.DoubleSide,
      }),
      ringMed: new THREE.MeshBasicMaterial({
        color: '#DD6B20',
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide,
      }),
      routeLine: new THREE.LineBasicMaterial({
        color: '#456942',
        transparent: true,
        opacity: 0.3,
        linewidth: 1,
      }),
      pulse: new THREE.MeshBasicMaterial({
        color: '#6DBE5A',
        transparent: true,
        opacity: 0.85,
      }),
      beaconBase: new THREE.MeshBasicMaterial({
        color: '#1E2C1D',
      }),
    };
  }, []);

  // Frame animation for expanding rings and traveling data pulses
  useFrame((state) => {
    if (prefersReducedMotion) return;
    const t = state.clock.elapsedTime;

    // Smoothly animate expanding rings for high-priority incidents
    if (ringsGroupRef.current) {
      const ringChildren = ringsGroupRef.current.children;
      for (let i = 0; i < ringChildren.length; i++) {
        const ring = ringChildren[i];
        const offset = i * 0.9;
        const progress = ((t * 0.6 + offset) % 2.5) / 2.5; // slow 2.5s loop
        
        const scale = 1.0 + progress * 2.8;
        ring.scale.set(scale, scale, 1);
        ring.material.opacity = (1 - progress) * 0.45;
      }
    }

    // Animate route pulses traveling from resource to incident
    if (pulsesGroupRef.current) {
      const pulseChildren = pulsesGroupRef.current.children;
      for (let i = 0; i < pulseChildren.length; i++) {
        const mesh = pulseChildren[i];
        const curve = routeCurves[i % routeCurves.length];
        if (curve) {
          const u = ((t * 0.35 + i * 0.25) % 1.0);
          const pos = curve.getPoint(u);
          mesh.position.copy(pos);
        }
      }
    }
  });

  // Determine overall node opacity and presence based on active tab
  const isMinimalMode = tabMode === 'report' || tabMode === 'chatbot' || tabMode === 'shelters' || tabMode === 'offline';
  const groupOpacity = isMinimalMode ? 0.4 : 1.0;

  return (
    <group position={[0, -0.5, 0]}>
      {/* 1. Tactical Nodes */}
      {nodeData.map((node, idx) => {
        let mat = materials.low;
        if (node.type === 'incident') {
          if (node.priority === 'high') mat = materials.high;
          else if (node.priority === 'medium') mat = materials.medium;
        } else if (node.type === 'resource') {
          mat = materials.resource;
        } else if (node.type === 'facility') {
          mat = materials.facility;
        }

        return (
          <group key={idx} position={node.pos}>
            {/* Dark neo-brutalist base collar */}
            <mesh
              geometry={cylinderGeo}
              material={materials.beaconBase}
              position={[0, -0.1, 0]}
            />
            {/* Color-coded tactical indicator */}
            <mesh
              geometry={sphereGeo}
              material={mat}
              position={[0, 0.12, 0]}
            />
          </group>
        );
      })}

      {/* 2. Expanding Emergency Location Rings for High Priority */}
      <group ref={ringsGroupRef}>
        {nodeData
          .filter(n => n.type === 'incident' && n.priority === 'high')
          .map((n, i) => (
            <mesh
              key={`ring-${i}`}
              geometry={ringGeo}
              material={materials.ringHigh.clone()}
              position={[n.pos[0], n.pos[1] - 0.05, n.pos[2]]}
              rotation={[-Math.PI / 2.35, 0, 0]}
            />
          ))}
      </group>

      {/* 3. Dispatch Vector Routes */}
      {routeGeometries.map((geo, i) => (
        <line
          key={`route-${i}`}
          geometry={geo}
          material={materials.routeLine}
        />
      ))}

      {/* 4. Flowing Packet Pulses along Routes */}
      <group ref={pulsesGroupRef}>
        {routeCurves.map((_, i) => (
          <mesh
            key={`pulse-${i}`}
            geometry={sphereGeo}
            material={materials.pulse}
            scale={[0.5, 0.5, 0.5]}
          />
        ))}
      </group>
    </group>
  );
}
