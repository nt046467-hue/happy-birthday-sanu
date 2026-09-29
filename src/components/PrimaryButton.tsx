import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { buzzShort } from '../engine/haptics';

interface PrimaryButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

export default function PrimaryButton({
  variant = 'primary',
  children,
  onClick,
  className = '',
  ...props
}: PrimaryButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    buzzShort();
    onClick?.(e);
  };

  const baseClass = variant === 'primary' ? 'btn-primary' : 'btn-secondary';

  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
      onClick={handleClick}
      className={`${baseClass} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
