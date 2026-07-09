import { useMemo } from "react";
import type { MotionProps, Transition } from "framer-motion";
import useMediaQuery from "./useMediaQuery";

type Options = {
  /** Delay (in seconds) before the entrance animation begins. Useful for staggering. */
  delay?: number;
  /** When true, the animation is disabled and the element renders at its final state. */
  disabled?: boolean;
};

/**
 * Hook returning framer-motion props for an Apple-style entrance animation.
 *
 * The animation pairs a small upward translate with a blur-reveal and fade-in,
 * driven by a gentle spring (stiffness: 100, damping: 20) at the project's
 * slow duration. Respects `prefers-reduced-motion: reduce` by snapping to the
 * final state without any motion.
 *
 * @param options.delay Optional delay in seconds for staggered entrances.
 * @param options.disabled When true, renders the element directly without animation.
 * @returns Motion props to spread onto an `m.*` component.
 */
export function useEntranceAnimation(options: Options = {}): MotionProps {
  const { delay = 0, disabled = false } = options;
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  return useMemo<MotionProps>(() => {
    if (disabled || prefersReducedMotion) {
      return {
        initial: false,
        animate: { opacity: 1, y: 0, filter: "blur(0px)" },
      };
    }

    const transition: Transition = {
      type: "spring",
      stiffness: 100,
      damping: 20,
      delay,
    };

    return {
      initial: { opacity: 0, y: 16, filter: "blur(8px)" },
      animate: { opacity: 1, y: 0, filter: "blur(0px)" },
      transition,
    };
  }, [delay, disabled, prefersReducedMotion]);
}

export default useEntranceAnimation;
