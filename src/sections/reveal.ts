/** Shared scroll-reveal motion settings for landing sections. */
export const REVEAL_EASE = [0.22, 1, 0.36, 1] as const;

export const revealParent = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

export const revealChild = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: REVEAL_EASE } },
};
