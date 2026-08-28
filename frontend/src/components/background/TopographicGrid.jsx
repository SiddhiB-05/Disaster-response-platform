import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

/**
 * TopographicGrid:
 * 1. Low-poly flat-shaded disaster terrain referencing the Brahmani & Koel river basin.
 * 2. Perspective tactical wireframe grid with subtle forward drift and edge-fading.
 */
export default function TopographicGrid({
  prefersReducedMotion = false,
  tabMode = 'landing',
}) {
  const gridRef = useRef();
  const riverRef = useRef();

  // Create procedural low-poly terrain geometry with Brahmani-Koel river valley
  const { terrainGeometry, riverGeometry, gridLinesGeometry } = useMemo(() => {
    const width = 120;
    const height = 120;
    const segmentsW = 40;
    const segmentsH = 40;

    const planeGeo = new THREE.PlaneGeometry(width, height, segmentsW, segmentsH);
    const pos = planeGeo.attributes.position;

    // Perturb vertices to create a low-elevation tactical basin and river channel
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i); // in plane geometry, y is length

      // River channel curve: S-curve through the terrain representing Brahmani/Koel confluence
      const riverCenter = Math.sin(y * 0.18) * 3.5 + (y * 0.1);
      const distToRiver = Math.abs(x - riverCenter);

      // Low tactical elevation profile
      let z = 0;
      if (distToRiver < 3.0) {
        // River valley depression
        z = -0.35 * Math.cos((distToRiver / 3.0) * (Math.PI / 2));
      } else {
        // Gentle undulating ridges around the command field
        const ridge1 = Math.sin(x * 0.35) * Math.cos(y * 0.25) * 0.6;
        const ridge2 = Math.sin((x + y) * 0.2) * 0.35;
        z = Math.max(0, ridge1 + ridge2);
      }

      // Edge falloff to keep edges flush with baseline
      const edgeFactorX = Math.cos((x / (width / 2)) * (Math.PI / 2));
      const edgeFactorY = Math.cos((y / (height / 2)) * (Math.PI / 2));
      const falloff = Math.max(0, edgeFactorX * edgeFactorY);

      pos.setZ(i, z * falloff);
    }

    planeGeo.computeVertexNormals();

    // Procedural tactical river path line
    const riverPoints = [];
    for (let y = -60; y <= 60; y += 1.0) {
      const x = Math.sin(y * 0.18) * 3.5 + (y * 0.1);
      riverPoints.push(new THREE.Vector3(x, y, -0.15));
    }
    const riverGeo = new THREE.BufferGeometry().setFromPoints(riverPoints);

    // Procedural tactical grid lines (fine monospaced tactical coordinates)
    const linePoints = [];
    const step = 3.0;
    for (let x = -60; x <= 60; x += step) {
      linePoints.push(new THREE.Vector3(x, -60, 0.02), new THREE.Vector3(x, 60, 0.02));
    }
    for (let y = -60; y <= 60; y += step) {
      linePoints.push(new THREE.Vector3(-60, y, 0.02), new THREE.Vector3(60, y, 0.02));
    }
    const linesGeo = new THREE.BufferGeometry().setFromPoints(linePoints);

    return {
      terrainGeometry: planeGeo,
      riverGeometry: riverGeo,
      gridLinesGeometry: linesGeo,
    };
  }, []);


  // Shared tactical materials
  const materials = useMemo(() => {
    // Flat-shaded dark olive terrain material
    const terrain = new THREE.MeshLambertMaterial({
      color: new THREE.Color('#D6E2D4'),
      emissive: new THREE.Color('#1E2C1D'),
      emissiveIntensity: 0.2,
      flatShading: true,
      transparent: true,
      opacity: 0.88,
    });

    // Dark olive wireframe overlay
    const wireframe = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#1E2C1D'),
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });

    // Brahmani & Koel River channel accent line
    const river = new THREE.LineBasicMaterial({
      color: new THREE.Color('#456942'),
      transparent: true,
      opacity: 0.75,
      linewidth: 2,
    });

    // Outer tactical coordinate grid lines
    const gridLines = new THREE.LineSegments(
      gridLinesGeometry,
      new THREE.LineBasicMaterial({
        color: new THREE.Color('#1E2C1D'),
        transparent: true,
        opacity: 0.18,
      })
    );

    return { terrain, wireframe, river, gridLines };
  }, [gridLinesGeometry]);

  // Subtle continuous drift if motion allowed
  useFrame((state, delta) => {
    if (prefersReducedMotion || !gridRef.current) return;
    
    // Very gentle drift (speed is intentionally slow and tactical)
    gridRef.current.position.y = (Math.sin(state.clock.elapsedTime * 0.15) * 0.15);
  });

  return (
    <group
      ref={gridRef}
      rotation={[-Math.PI / 2.15, 0, 0]}
      position={[0, -4, -10]}
    >

      {/* 1. Low-poly shaded terrain */}
      <mesh geometry={terrainGeometry} material={materials.terrain} receiveShadow />

      {/* 2. Wireframe terrain contour overlay */}
      <mesh geometry={terrainGeometry} material={materials.wireframe} position={[0, 0, 0.01]} />

      {/* 3. Brahmani & Koel River Basin Vector Line */}
      <line ref={riverRef} geometry={riverGeometry} material={materials.river} />

      {/* 4. Fine Tactical Grid Line Overlay */}
      <primitive object={materials.gridLines} />
    </group>
  );
}
