"use client";

import React, { useState, useRef, useEffect } from "react";
import { useShake } from "@/lib/hooks/useShake";
import { useSpeechHotword } from "@/lib/hooks/useSpeechHotword";
import { cn } from "@/lib/utils";
import { Siren, Shield, ShieldAlert } from "lucide-react";

interface DiscreetSOSProps {
  onSOS: () => void;
  locale?: "en" | "hi" | "te";
  safeWord?: string;
  className?: string;
  isEmergencyMode?: boolean;
}

export const DiscreetSOS: React.FC<DiscreetSOSProps> = ({ 
  onSOS, 
  locale = "en", 
  safeWord, 
  className,
  isEmergencyMode = false 
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [pressProgress, setPressProgress] = useState(0);
  const pressTimer = useRef<number | null>(null);
  const progressTimer = useRef<number | null>(null);

  // Trigger via shake gesture
  useShake({ onShake: onSOS, threshold: 18, timeoutMs: 2000 });

  // Trigger via hotword/safe word (if supported)
  useSpeechHotword({ onHotword: onSOS, locale, safeWord, continuous: true });

  // Long-press functionality with visual feedback
  const handlePressStart = () => {
    setIsPressed(true);
    setPressProgress(0);
    
    // Clear any existing timers
    if (pressTimer.current) window.clearTimeout(pressTimer.current);
    if (progressTimer.current) window.clearInterval(progressTimer.current);

    // Start progress animation
    const startTime = Date.now();
    const duration = 1600; // 1.6 seconds
    
    progressTimer.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setPressProgress(progress);
      
      if (progress >= 1) {
        if (progressTimer.current) window.clearInterval(progressTimer.current);
      }
    }, 16); // ~60fps

    // Set timeout for SOS trigger
    pressTimer.current = window.setTimeout(() => {
      onSOS();
      handlePressEnd();
    }, duration);
  };

  const handlePressEnd = () => {
    setIsPressed(false);
    setPressProgress(0);
    
    if (pressTimer.current) {
      window.clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
    if (progressTimer.current) {
      window.clearInterval(progressTimer.current);
      progressTimer.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pressTimer.current) window.clearTimeout(pressTimer.current);
      if (progressTimer.current) window.clearInterval(progressTimer.current);
    };
  }, []);

  const buttonIcon = isEmergencyMode ? ShieldAlert : (isPressed ? Shield : Siren);
  const IconComponent = buttonIcon;

  return (
    <button
      type="button"
      aria-label="Quick SOS - Hold for 1.6 seconds to activate"
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressEnd}
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
      onTouchCancel={handlePressEnd}
      onFocus={(e) => e.currentTarget.blur()} // Stay discreet
      className={cn(
        "fixed bottom-6 right-5 z-40 h-12 w-12 rounded-full",
        "flex items-center justify-center relative overflow-hidden",
        "transition-all duration-200 ease-out",
        "touch-manipulation select-none",
        // Normal mode styling
        !isEmergencyMode && [
          "bg-primary/15 text-primary hover:bg-primary/25",
          "backdrop-blur-sm border border-primary/20 shadow-lg",
          "hover:shadow-xl hover:scale-105",
          // calm heartbeat + soft glow
          "animate-heartbeat glow-soft",
        ],
        // Emergency mode styling
        isEmergencyMode && [
          "bg-destructive/20 text-destructive hover:bg-destructive/30",
          "backdrop-blur-sm border border-destructive/30 shadow-lg",
          // urgent ripple + stronger glow
          "animate-ripple glow-urgent hover:shadow-xl hover:scale-105",
        ],
        // Pressed state
        isPressed && "scale-95 shadow-inner",
        className
      )}
      style={{
        transform: isPressed ? `scale(0.95)` : undefined,
      }}
    >
      {/* Progress ring for long press */}
      {isPressed && (
        <div 
          className="absolute inset-0 rounded-full border-2 border-transparent"
          style={{
            background: `conic-gradient(${isEmergencyMode ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'} ${pressProgress * 360}deg, transparent 0deg)`,
            mask: 'radial-gradient(circle at center, transparent 16px, black 18px)',
            WebkitMask: 'radial-gradient(circle at center, transparent 16px, black 18px)'
          }}
        />
      )}
      
      {/* Icon with subtle animation */}
      <IconComponent 
        className={cn(
          "h-5 w-5 transition-all duration-200",
          isPressed ? "scale-110" : "scale-100",
          isEmergencyMode ? "opacity-90" : "opacity-80"
        )} 
      />
      
      {/* Screen reader text */}
      <span className="sr-only">
        {isEmergencyMode ? "Emergency SOS Active" : "Activate SOS silently - hold for 1.6 seconds"}
      </span>
      
      {/* Subtle glow effect for emergency mode */}
      {isEmergencyMode && (
        <div className="absolute inset-0 rounded-full bg-destructive/10 animate-ping" />
      )}
    </button>
  );
};

export default DiscreetSOS;