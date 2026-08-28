import React, { useRef, useEffect, useState, Component } from 'react';
import { Canvas } from '@react-three/fiber';
import useMotionPreference from '../../hooks/useMotionPreference';
import TacticalScene from './TacticalScene';
import TacticalFallback from './TacticalFallback';

/**
 * Robust Error Boundary to gracefully fall back if WebGL context crashes or fails
 */
class WebGLErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.warn('[Tactical3DBackground] WebGL error caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return <TacticalFallback activeTab={this.props.activeTab} />;
    }
    return this.props.children;
  }
}

/**
 * Tactical3DBackground:
 * Renders the 3D Disaster Intelligence Command Field behind the entire UI.
 * - Single Canvas instance
 * - Zero pointer-event interference (pointer-events: none)
 * - aria-hidden for accessibility
 * - Dynamic tab reactivity without unmounting canvas
 * - Responsive fallback for reduced-motion / non-WebGL / mobile devices
 */
export default function Tactical3DBackground({ activeTab = 'landing' }) {
  const { prefersReducedMotion, hasFinePointer, isWebGLSupported, isVisible } = useMotionPreference();
  const mousePos = useRef({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    if (!hasFinePointer || prefersReducedMotion) return;

    const handleMouseMove = (e) => {
      // Normalize to range [-1, 1]
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      mousePos.current.x = nx;
      mousePos.current.y = ny;
    };

    const handleMouseLeave = () => {
      // Damped return to center
      mousePos.current.x = 0;
      mousePos.current.y = 0;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [hasFinePointer, prefersReducedMotion]);

  // If WebGL is not supported, render high-performance tactical SVG fallback
  if (!isWebGLSupported) {
    return <TacticalFallback activeTab={activeTab} />;
  }

  // Adjust layer opacity slightly depending on activeTab for optimal readability
  let layerOpacityClass = 'opacity-85';
  if (activeTab === 'queue' || activeTab === 'scipy' || activeTab === 'shelters') {
    layerOpacityClass = 'opacity-60';
  } else if (activeTab === 'report' || activeTab === 'chatbot' || activeTab === 'offline') {
    layerOpacityClass = 'opacity-50';
  }

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none transition-opacity duration-700 ${layerOpacityClass}`}
    >
      <WebGLErrorBoundary activeTab={activeTab}>
        {mounted && (
          <Canvas
            camera={{ position: [0, 14, 18], fov: 38, near: 0.1, far: 100 }}
            dpr={[1, 1.5]}
            frameloop={isVisible ? (prefersReducedMotion ? 'demand' : 'always') : 'never'}
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: 'high-performance',
              stencil: false,
              depth: true,
            }}
            style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
          >
            <TacticalScene
              activeTab={activeTab}
              prefersReducedMotion={prefersReducedMotion}
              hasFinePointer={hasFinePointer}
              mousePos={mousePos}
            />
          </Canvas>
        )}
      </WebGLErrorBoundary>

      {/* Subtle background mask preserving paper texture and edge softness */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_55%,rgba(226,232,224,0.45)_95%)]" />
    </div>
  );
}
