import { useState, useEffect, useRef } from 'react';

export function useCountUp(target, duration = 1000) {
  const [count, setCount] = useState(0);
  const startTimeRef = useRef(null);

  useEffect(() => {
    let animationFrameId;

    const animate = (currentTime) => {
      if (target === 0) {
        setCount(0);
        return;
      }

      if (!startTimeRef.current) startTimeRef.current = currentTime;
      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      const currentCount = Math.floor(progress * target);
      setCount(currentCount);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      startTimeRef.current = null;
    };
  }, [target, duration]);

  return count;
}
