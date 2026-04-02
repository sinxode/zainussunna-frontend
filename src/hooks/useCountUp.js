import { useState, useEffect } from "react";

/**
 * Hook for animating numbers from 0 to target value
 * @param {number} target - The target number to count up to
 * @param {Object} options - Configuration options
 * @param {number} options.duration - Animation duration in milliseconds
 * @param {number} options.startWhen - Boolean to start animation
 * @returns {number} The current animated value
 */
export const useCountUp = (target, options = {}) => {
  const { duration = 2000, startWhen = true } = options;
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!startWhen) return;

    let startTime = null;
    let animationFrame;

    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = easeOutQuart(progress);

      setCount(Math.floor(easeProgress * target));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [target, duration, startWhen]);

  return count;
};

export default useCountUp;
