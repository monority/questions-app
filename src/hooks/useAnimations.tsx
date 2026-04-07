import { motion } from 'framer-motion';

export const MotionWrapper = motion.div;

export function AnimatedCard({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedButton({ children, onClick, className = '', disabled = false }: { children: React.ReactNode; onClick: () => void; className?: string; disabled?: boolean }) {
  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </motion.button>
  );
}

export function AnimatedList({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.05 } },
        hidden: {},
      }}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedListItem({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={{
        visible: { opacity: 1, y: 0 },
        hidden: { opacity: 0, y: 10 },
      }}
    >
      {children}
    </motion.div>
  );
}

export const useAnimatedTransition = (isVisible: boolean) => {
  return {
    initial: { opacity: 0, scale: 0.9 },
    animate: isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { duration: 0.2 },
  };
};