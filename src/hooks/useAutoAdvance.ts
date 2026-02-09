import { useState, useEffect, useCallback } from "react";

/**
 * Auto-advance to next form step when a selection-type input (radio, select, card)
 * makes the current step valid.
 *
 * Call the returned `notify()` function from onValueChange/onClick handlers
 * of radio buttons, selects, and clickable cards.
 * Do NOT call it from text inputs, checkboxes, or sliders.
 */
export function useAutoAdvance(
  currentStep: number,
  nextStep: () => void,
  isStepValid: boolean,
  isLastStep: boolean,
) {
  const [trigger, setTrigger] = useState(0);

  // Reset trigger when step changes (prevents auto-advance when going back)
  useEffect(() => {
    setTrigger(0);
  }, [currentStep]);

  // Auto-advance when triggered and step is valid
  useEffect(() => {
    if (trigger === 0 || !isStepValid || isLastStep) return;
    const timer = setTimeout(() => {
      nextStep();
    }, 200);
    return () => clearTimeout(timer);
  }, [trigger, isStepValid, isLastStep, nextStep]);

  return useCallback(() => {
    setTrigger((prev) => prev + 1);
  }, []);
}
