export const useAnimatedTransition = (isVisible: boolean) => {
  return {
    initial: { opacity: 0, scale: 0.9 },
    animate: isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { duration: 0.2 },
  };
};