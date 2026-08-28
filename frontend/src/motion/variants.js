/**
 * Centralized motion definitions for Rourkela Tactical Disaster Command
 * Built on tactile neo-brutalist principles: crisp, restrained, responsive.
 */

export const tactileSpring = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
  mass: 0.8
};

export const pageVariants = {
  initial: {
    opacity: 0,
    y: 12,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.24,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: {
      duration: 0.14,
      ease: [0.7, 0, 0.84, 0],
    },
  },
};

export const containerStagger = (staggerChildren = 0.045, delayChildren = 0.02) => ({
  initial: {},
  animate: {
    transition: {
      staggerChildren: Math.min(staggerChildren, 0.08),
      delayChildren,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.02,
      staggerDirection: -1,
    },
  },
});

export const itemFadeUp = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.22,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: {
      duration: 0.12,
    },
  },
};

export const itemSlideRight = {
  initial: {
    opacity: 0,
    x: -12,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.24,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export const itemSlideLeft = {
  initial: {
    opacity: 0,
    x: 12,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.24,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.12 } },
};

export const scaleReveal = {
  initial: { opacity: 0, scale: 0.96 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
  },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.12 } },
};

export const wipeX = {
  initial: { scaleX: 0, originX: 0 },
  animate: {
    scaleX: 1,
    transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] },
  },
};

export const toastVariants = {
  initial: { opacity: 0, y: -8, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, y: -6, scale: 0.98, transition: { duration: 0.14 } },
};
