import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

/**
 * RadarSweep:
 * Large, faint tactical radar reticle with slow sweep line behind hero area.
 * Opacity kept strictly between 8% - 12% to preserve high contrast for foreground data cards.
 */
export default function RadarSweep({
  prefersReducedMotion = false,
  tabMode = 'landing',
}) {
  const sweepGroupRef = useRef();

  // Radar reticle geometry
  const { ringsGeometry, crosshairsGeometry, sweepSectorGeometry } = useMemo(() => {
    // 3 concentric tactical rings
    const ringPoints = [];
    const radii = [4.5, 7.5, 10.5];
    radii.forEach(r => {
      for (let i = 0; i <= 64; i++) {
        const theta = (i / 64) * Math.PI * 2;
        ringPoints.push(new THREE.Vector3(Math.cos(theta) * r, Math.sin(theta) * r, 0));
        if (i > 0 && i < 64) {
          ringPoints.push(new THREE.Vector3(Math.cos(theta) * r, Math.sin(theta) * r, 0));
        }
      }
    });
    const ringsGeo = new THREE.BufferGeometry().setFromPoints(ringPoints);

    // Crosshairs
    const crossPoints = [
      new THREE.Vector3(-11, 0, 0),
      new THREE.Vector3(11, 0, 0),
      new THREE.Vector3(0, -11, 0),
      new THREE.Vector3(0, 11, 0),
    ];
    const crossGeo = new THREE.BufferGeometry().setFromPoints(crossPoints);

    // Narrow sweep line & wedge
    const sweepLinePoints = [
      new THREE.Vector3(0, 0, 0.01),
      new THREE.Vector3(10.5, 0, 0.01),
    ];
    const sweepLineGeo = new THREE.BufferGeometry().setFromPoints(sweepLinePoints);

    return {
      ringsGeometry: ringsGeo,
      crosshairsGeometry: crossGeo,
      sweepSectorGeometry: sweepLineGeo,
    };
  }, []);

  // Shared faint materials
  const materials = useMemo(() => {
    return {
      reticle: new THREE.LineSegments(
        ringsGeometry,
        new THREE.LineBasicMaterial({
          color: '#1E2C1D',
          transparent: true,
          opacity: 0.13,
        })
      ),
      crosshairs: new THREE.LineSegments(
        crosshairsGeometry,
        new THREE.LineBasicMaterial({
          color: '#1E2C1D',
          transparent: true,
          opacity: 0.11,
        })
      ),
      sweepLine: new THREE.Line(
        sweepSectorGeometry,
        new THREE.LineBasicMaterial({
          color: '#6DBE5A',
          transparent: true,
          opacity: 0.22,
        })
      ),
    };
  }, [ringsGeometry, crosshairsGeometry, sweepSectorGeometry]);

  // Rotate sweep slowly if motion permitted
  useFrame((state) => {
    if (prefersReducedMotion || !sweepGroupRef.current) return;
    sweepGroupRef.current.rotation.z = -state.clock.elapsedTime * 0.22;
  });

  return (
    <group
      position={[5.5, 1.8, -2.2]}
      rotation={[-Math.PI / 2.35, 0, 0]}
    >
      {/* Static Reticle Rings */}
      <primitive object={materials.reticle} />

      {/* Static Tactical Crosshairs */}
      <primitive object={materials.crosshairs} />

      {/* Slow Radar Sweep */}
      <group ref={sweepGroupRef}>
        <primitive object={materials.sweepLine} />
      </group>
    </group>
  );
}
