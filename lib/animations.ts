import { Variants, Transition } from "framer-motion";
import { SPRING_CONFIGS, STAGGER_DELAY, ANIMATION_DURATION } from "./constants";

/**
 * Fade in animation variants
 */
export const fadeIn: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: ANIMATION_DURATION.short / 1000,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: ANIMATION_DURATION.micro / 1000,
      ease: "easeIn",
    },
  },
};

/**
 * Fade in with slide up animation
 */
export const fadeInUp: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: SPRING_CONFIGS.gentle,
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: ANIMATION_DURATION.micro / 1000,
    },
  },
};

/**
 * Scale animation for cards and modals
 */
export const scaleIn: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: SPRING_CONFIGS.snappy,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: ANIMATION_DURATION.micro / 1000,
    },
  },
};

/**
 * Staggered container for lists
 */
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: STAGGER_DELAY.medium,
      delayChildren: 0.1,
    },
  },
  exit: {
    transition: {
      staggerChildren: STAGGER_DELAY.fast,
      staggerDirection: -1,
    },
  },
};

/**
 * Child items for staggered animations
 */
export const staggerItem: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: SPRING_CONFIGS.gentle,
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: ANIMATION_DURATION.micro / 1000,
    },
  },
};

/**
 * Chart morphing animation
 * Used for smooth transitions between different data views
 */
export const chartMorph: Variants = {
  initial: (custom: { fromIndex: number; toIndex: number }) => ({
    opacity: 0,
    x: (custom.toIndex - custom.fromIndex) * 10,
    scale: 0.8,
  }),
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      ...SPRING_CONFIGS.smooth,
      duration: ANIMATION_DURATION.long / 1000,
    },
  },
  exit: (custom: { fromIndex: number; toIndex: number }) => ({
    opacity: 0,
    x: (custom.fromIndex - custom.toIndex) * 10,
    scale: 0.8,
    transition: {
      duration: ANIMATION_DURATION.medium / 1000,
    },
  }),
};

/**
 * Bar chart column animation
 * Grows from bottom to top with spring physics
 */
export const barGrowth: Variants = {
  initial: {
    scaleY: 0,
    originY: 1, // Grow from bottom
  },
  animate: (custom: { delay: number }) => ({
    scaleY: 1,
    transition: {
      ...SPRING_CONFIGS.bouncy,
      delay: custom.delay,
    },
  }),
  exit: {
    scaleY: 0,
    transition: {
      duration: ANIMATION_DURATION.short / 1000,
    },
  },
};

/**
 * Line chart path animation
 * Draws path from left to right
 */
export const pathDraw: Variants = {
  initial: {
    pathLength: 0,
    opacity: 0,
  },
  animate: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: {
        duration: ANIMATION_DURATION.long / 1000,
        ease: "easeInOut",
      },
      opacity: {
        duration: ANIMATION_DURATION.short / 1000,
      },
    },
  },
  exit: {
    pathLength: 0,
    opacity: 0,
    transition: {
      duration: ANIMATION_DURATION.medium / 1000,
    },
  },
};

/**
 * Metric card 3D tilt effect
 * Follows cursor position for parallax effect
 */
export const cardTilt: Variants = {
  rest: {
    scale: 1,
    rotateY: 0,
    rotateX: 0,
  },
  hover: (custom: { x: number; y: number }) => ({
    scale: 1.02,
    rotateY: custom.x * 5, // Max 5 degrees
    rotateX: -custom.y * 5,
    transition: SPRING_CONFIGS.snappy,
  }),
  tap: {
    scale: 0.98,
    transition: {
      duration: ANIMATION_DURATION.micro / 1000,
    },
  },
};

/**
 * Number counter animation
 * Smoothly animates between values
 */
export const numberCount: Transition = {
  duration: ANIMATION_DURATION.medium / 1000,
  ease: "easeOut",
};

/**
 * Shimmer loading animation
 * For skeleton screens
 */
export const shimmer: Variants = {
  initial: {
    backgroundPosition: "-1000px 0",
  },
  animate: {
    backgroundPosition: "1000px 0",
    transition: {
      duration: 2,
      ease: "linear",
      repeat: Infinity,
    },
  },
};

/**
 * Pulse animation for live indicators
 */
export const pulse: Variants = {
  animate: {
    scale: [1, 1.2, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
};

/**
 * Slide from side animations
 */
export const slideFromLeft: Variants = {
  initial: {
    x: -100,
    opacity: 0,
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: SPRING_CONFIGS.gentle,
  },
  exit: {
    x: -100,
    opacity: 0,
    transition: {
      duration: ANIMATION_DURATION.short / 1000,
    },
  },
};

export const slideFromRight: Variants = {
  initial: {
    x: 100,
    opacity: 0,
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: SPRING_CONFIGS.gentle,
  },
  exit: {
    x: 100,
    opacity: 0,
    transition: {
      duration: ANIMATION_DURATION.short / 1000,
    },
  },
};

/**
 * Modal backdrop animation
 */
export const modalBackdrop: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: ANIMATION_DURATION.short / 1000,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: ANIMATION_DURATION.short / 1000,
    },
  },
};

/**
 * Modal content animation
 */
export const modalContent: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: SPRING_CONFIGS.snappy,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: ANIMATION_DURATION.short / 1000,
    },
  },
};

/**
 * Tooltip animation
 */
export const tooltip: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9,
    y: 5,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: ANIMATION_DURATION.micro / 1000,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 5,
    transition: {
      duration: ANIMATION_DURATION.micro / 1000,
      ease: "easeIn",
    },
  },
};

/**
 * Button press animation
 */
export const buttonPress: Variants = {
  rest: {
    scale: 1,
  },
  hover: {
    scale: 1.05,
    transition: SPRING_CONFIGS.snappy,
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: ANIMATION_DURATION.micro / 1000,
    },
  },
};

/**
 * Custom easing functions
 */
export const customEasing = {
  // Smooth acceleration and deceleration
  smooth: [0.43, 0.13, 0.23, 0.96],
  
  // Sharp snap
  snap: [0.68, -0.55, 0.265, 1.55],
  
  // Gentle bounce
  bounce: [0.34, 1.56, 0.64, 1],
  
  // Material Design standard
  standard: [0.4, 0.0, 0.2, 1],
  
  // Emphasized (for important actions)
  emphasized: [0.0, 0.0, 0.2, 1],
} as const;

/**
 * Layout transition for shared element animations
 */
export const layoutTransition: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
  mass: 1,
};

/**
 * Page transition variants
 */
export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: ANIMATION_DURATION.medium / 1000,
      ease: customEasing.smooth,
    },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: {
      duration: ANIMATION_DURATION.short / 1000,
      ease: customEasing.smooth,
    },
  },
};
