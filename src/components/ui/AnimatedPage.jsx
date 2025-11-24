import { motion } from 'framer-motion'
import { pageTransition } from '../../utils/animations'

/**
 * AnimatedPage - Wrapper for page-level transitions
 * Adds smooth fade-in animation to route changes
 */
const AnimatedPage = ({ children, className = '' }) => {
  return (
    <motion.div
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      exit={pageTransition.exit}
      transition={pageTransition.transition}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default AnimatedPage
