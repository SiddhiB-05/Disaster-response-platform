import React from 'react';
import { motion } from 'motion/react';
import { pageVariants } from '../../motion/variants';

export default function PageTransition({ children, className = '' }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
}
