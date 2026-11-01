import { useState, useCallback, useRef } from "react";

/**
 * Hook for triggering animations when element enters viewport
 * Uses Callback Refs to handle dynamic mounting (e.g. elements rendering after a loading state completes)
 * Automatically sets visible state to true on mobile viewports to prevent layout freeze
 * @param {Object} options - Configuration options
 * @param {number} options.threshold - Visibility threshold (0-1)
 * @param {number} options.triggerOnce - Whether to trigger animation only once
 * @returns [refCallback, isVisible]
 */
export const useScrollAnimation = (options = {}) => {
  const { threshold = 0.2, triggerOnce = true } = options;
  const [isVisible, setIsVisible] = useState(false);
  const observerRef = useRef(null);

  const refCallback = useCallback((element) => {
    // Clean up previous observer if element changes or unmounts
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    if (!element) return;

    // Skip scroll reveal animations on mobile for optimal responsiveness and compatibility
    const checkMobile = () => window.innerWidth <= 768;
    if (checkMobile()) {
      setIsVisible(true);
      element.classList.add("is-visible");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          element.classList.add("is-visible");
          if (triggerOnce) {
            observer.disconnect();
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
          element.classList.remove("is-visible");
        }
      },
      {
        threshold,
        rootMargin: "0px 0px -50px 0px",
      },
    );

    observer.observe(element);
    observerRef.current = observer;
  }, [threshold, triggerOnce]);

  return [refCallback, isVisible];
};

export default useScrollAnimation;
