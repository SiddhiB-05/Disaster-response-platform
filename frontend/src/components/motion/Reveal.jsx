import React from 'react';
import { motion } from 'motion/react';
import { itemFadeUp, scaleReveal } from '../../motion/variants';

export default function Reveal({
  children,
  className = '',
  delay = 0,
  variant = 'fadeUp',
  once = true,
  amount = 0.15,
}) {
  const selectedVariant = variant === 'scale' ? scaleReveal : itemFadeUp;

  return (
    <motion.div
      variants={selectedVariant}
      initial="initial"
      whileInView="animate"
      viewport={{ once, amount }}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
