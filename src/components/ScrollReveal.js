import { useEffect, useRef, useState } from "react";

/**
 * ScrollReveal wrapper component
 * Wraps children and adds 'is-visible' class when element enters viewport
 * Automatically disables animation on mobile devices
 */
const ScrollReveal = ({
  children,
  threshold = 0.2,
  triggerOnce = true,
  className = "",
  as: Component = "div",
  ...props
}) => {
  const ref = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    // Skip animation on mobile - immediately show content
    if (isMobile) {
      if (ref.current) {
        ref.current.classList.add("is-visible");
      }
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.add("is-visible");
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          element.classList.remove("is-visible");
        }
      },
      {
        threshold,
        rootMargin: "0px 0px -50px 0px",
      },
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold, triggerOnce, isMobile]);

  return (
    <Component ref={ref} data-reveal className={className} {...props}>
      {children}
    </Component>
  );
};

export default ScrollReveal;
