"use client";

import { useEffect, useRef } from "react";

// Lightweight shake detector using devicemotion; thresholds tuned for subtle shakes
export const useShake = (options: { onShake: () => void; threshold?: number; timeoutMs?: number }) => {
  const { onShake, threshold = 17, timeoutMs = 1500 } = options;
  const lastTimeRef = useRef(0);

  useEffect(() => {
    const handler = (e: DeviceMotionEvent) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;
      const magnitude = Math.sqrt((acc.x || 0) ** 2 + (acc.y || 0) ** 2 + (acc.z || 0) ** 2);
      const now = Date.now();
      if (magnitude > threshold && now - lastTimeRef.current > timeoutMs) {
        lastTimeRef.current = now;
        onShake();
      }
    };

    window.addEventListener("devicemotion", handler as EventListener, { passive: true });
    return () => window.removeEventListener("devicemotion", handler as EventListener);
  }, [onShake, threshold, timeoutMs]);
};