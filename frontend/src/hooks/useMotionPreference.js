import { useState, useEffect } from 'react';

/**
 * Checks for user preferences and device capabilities:
 * - prefersReducedMotion: user requested reduced motion in OS/browser
 * - hasFinePointer: mouse/trackpad pointer available for gentle parallax
 * - isWebGLSupported: whether WebGL / WebGL2 context can be initialized
 * - isVisible: whether the tab is currently visible
 */
export function useMotionPreference() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  const [hasFinePointer, setHasFinePointer] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return true;
    return window.matchMedia('(pointer: fine)').matches;
  });

  const [isWebGLSupported, setIsWebGLSupported] = useState(() => {
    if (typeof window === 'undefined') return true;
    try {
      const canvas = document.createElement('canvas');
      return !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl') || canvas.getContext('webgl2'))
      );
    } catch {
      return false;
    }
  });

  const [isVisible, setIsVisible] = useState(() => {
    if (typeof document === 'undefined') return true;
    return document.visibilityState !== 'hidden';
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointerQuery = window.matchMedia('(pointer: fine)');

    const handleMotionChange = (e) => setPrefersReducedMotion(e.matches);
    const handlePointerChange = (e) => setHasFinePointer(e.matches);
    const handleVisibilityChange = () => setIsVisible(document.visibilityState !== 'hidden');

    if (motionQuery.addEventListener) {
      motionQuery.addEventListener('change', handleMotionChange);
      pointerQuery.addEventListener('change', handlePointerChange);
    } else if (motionQuery.addListener) {
      motionQuery.addListener(handleMotionChange);
      pointerQuery.addListener(handlePointerChange);
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (motionQuery.removeEventListener) {
        motionQuery.removeEventListener('change', handleMotionChange);
        pointerQuery.removeEventListener('change', handlePointerChange);
      } else if (motionQuery.removeListener) {
        motionQuery.removeListener(handleMotionChange);
        pointerQuery.removeListener(handlePointerChange);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return {
    prefersReducedMotion,
    hasFinePointer,
    isWebGLSupported,
    isVisible,
  };
}

export default useMotionPreference;
