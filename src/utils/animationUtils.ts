import type { Variants } from 'framer-motion';

export const cardVariants: Variants = {
  initial: { scale: 0.8, opacity: 0, y: 20 },
  animate: { scale: 1, opacity: 1, y: 0 },
  exit: { scale: 0.8, opacity: 0, y: -20 },
  hover: { y: -12, scale: 1.05, transition: { duration: 0.15 } },
  tap: { scale: 0.95 },
};

export const cardPlayVariants: Variants = {
  initial: { scale: 1, x: 0, y: 0 },
  play: {
    scale: [1, 1.2, 0.9],
    y: [0, -40, 0],
    transition: { duration: 0.4, times: [0, 0.4, 1] },
  },
};

export const cardDrawVariants: Variants = {
  initial: { scale: 0, rotate: -15, x: 100 },
  animate: {
    scale: 1,
    rotate: 0,
    x: 0,
    transition: { type: 'spring', stiffness: 300, damping: 20 },
  },
};

export const playerJoinVariants: Variants = {
  initial: { opacity: 0, x: -30 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 400, damping: 25 },
  },
  exit: {
    opacity: 0,
    x: 30,
    transition: { duration: 0.2 },
  },
};

export const modalVariants: Variants = {
  initial: { opacity: 0, scale: 0.85, y: 20 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 400, damping: 30 },
  },
  exit: {
    opacity: 0,
    scale: 0.85,
    y: 20,
    transition: { duration: 0.2 },
  },
};

export const backdropVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const chatMessageVariants: Variants = {
  initial: { opacity: 0, y: 10, x: -10 },
  animate: {
    opacity: 1,
    y: 0,
    x: 0,
    transition: { type: 'spring', stiffness: 500, damping: 30 },
  },
  exit: { opacity: 0, x: 20 },
};

export const staggerContainerVariants: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export const floatingCardVariants = (delay: number = 0, amplitude: number = 20): Variants => ({
  animate: {
    y: [0, -amplitude, -amplitude / 2, 0],
    rotate: [0, 3, -2, 0],
    transition: {
      duration: 5 + delay,
      repeat: Infinity,
      repeatType: 'loop',
      ease: 'easeInOut',
      delay,
    },
  },
});

export const turnHighlightVariants: Variants = {
  inactive: { boxShadow: '0 0 0 0px transparent' },
  active: {
    boxShadow: [
      '0 0 0 2px rgba(233,196,106,0.4)',
      '0 0 0 4px rgba(233,196,106,0.8)',
      '0 0 0 2px rgba(233,196,106,0.4)',
    ],
    transition: { duration: 2, repeat: Infinity },
  },
};

export const directionArrowVariants: Variants = {
  clockwise: { rotate: 0 },
  counterclockwise: { rotate: 180, transition: { duration: 0.5 } },
};

export const winScreenVariants: Variants = {
  initial: { opacity: 0, scale: 0.5, rotate: -10 },
  animate: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 15,
      delay: 0.2,
    },
  },
};
