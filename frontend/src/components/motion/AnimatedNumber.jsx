import React, { useEffect, useRef } from 'react';
import { useMotionValue, useSpring, useTransform, motion } from 'motion/react';

export default function AnimatedNumber({
  value,
  decimals = 0,
  formatter = (v) => v,
  className = '',
}) {
  const numericValue = typeof value === 'number' ? value : parseFloat(value) || 0;
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 120, damping: 20 });
  const isInitial = useRef(true);

  useEffect(() => {
    motionVal.set(numericValue);
    isInitial.current = false;
  }, [numericValue, motionVal]);

  const display = useTransform(spring, (latest) => {
    const formattedNum = decimals > 0 ? latest.toFixed(decimals) : Math.round(latest).toString();
    return formatter(formattedNum);
  });

  return (
    <motion.span className={className}>
      {display}
    </motion.span>
  );
}
