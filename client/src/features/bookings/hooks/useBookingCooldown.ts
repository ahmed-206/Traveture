import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_COOLDOWN_MS = 10_000;

export const useBookingCooldown = (cooldownMs = DEFAULT_COOLDOWN_MS) => {
  const [isCooldown, setIsCooldown] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startCooldown = useCallback(() => {
    setIsCooldown(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsCooldown(false);
      timeoutRef.current = null;
    }, cooldownMs);
  }, [cooldownMs]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return { isCooldown, startCooldown };
};