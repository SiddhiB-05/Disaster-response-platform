import React from 'react';
import { motion } from 'motion/react';
import { containerStagger, itemFadeUp } from '../../motion/variants';

export function StaggerContainer({
  children,
  className = '',
  stagger = 0.045,
  delay = 0,
  as = 'div',
  ...props
}) {
  const Component = motion[as] || motion.div;

  return (
    <Component
      variants={containerStagger(stagger, delay)}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
      {...props}
    >
      {children}
    </Component>
  );
}

export function StaggerItem({
  children,
  className = '',
  as = 'div',
  ...props
}) {
  const Component = motion[as] || motion.div;

  return (
    <Component
      variants={itemFadeUp}
      className={className}
      {...props}
    >
      {children}
    </Component>
  );
}
