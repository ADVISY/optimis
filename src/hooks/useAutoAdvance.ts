import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Auto-advance to next form step when the current step becomes valid.
 *
 * Returns two functions:
 *  - `notify()`        – for instant selections (radio, select, card). Advances after 200ms.
 *  - `notifyDelayed()` – for text inputs (name, email, phone…). Advances after 1500ms of inactivity.
 *
 * Do NOT call either from checkboxes or sliders.
 */
export function useAutoAdvance(
  currentStep: number,
  nextStep: () => void,
  isStepValid: boolean,
  isLastStep: boolean,
  onLastStepComplete?: () => void,
) {
  const [trigger, setTrigger] = useState(0);
  const [delayMs, setDelayMs] = useState(200);
  const textTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastStepFiredRef = useRef(false);

  // Reset trigger when step changes (prevents auto-advance when going back)
  useEffect(() => {
    setTrigger(0);
    lastStepFiredRef.current = false;
  }, [currentStep]);

  // Auto-advance when triggered and step is valid
  useEffect(() => {
    if (trigger === 0 || !isStepValid) return;
    if (isLastStep) {
      if (onLastStepComplete && !lastStepFiredRef.current) {
        lastStepFiredRef.current = true;
        const timer = setTimeout(() => {
          onLastStepComplete();
        }, delayMs);
        return () => clearTimeout(timer);
      }
      return;
    }
    const timer = setTimeout(() => {
      nextStep();
    }, delayMs);
    return () => clearTimeout(timer);
  }, [trigger, isStepValid, isLastStep, nextStep, delayMs, onLastStepComplete]);

  const notify = useCallback(() => {
    setDelayMs(400);
    setTrigger((prev) => prev + 1);
  }, []);

  const notifyDelayed = useCallback(() => {
    // Debounce: restart the 1.5s timer on every keystroke
    if (textTimerRef.current) clearTimeout(textTimerRef.current);
    textTimerRef.current = setTimeout(() => {
      setDelayMs(300);
      setTrigger((prev) => prev + 1);
    }, 1500);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (textTimerRef.current) clearTimeout(textTimerRef.current);
    };
  }, []);

  return { notify, notifyDelayed };
}
