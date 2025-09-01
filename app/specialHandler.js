// Special handler for chat.js
// Import the necessary dependencies
import mdojoFullFlow from './mdojo_full_flow.json';

// Export a function that can be safely imported
export function handleFrustrationManager(currentFlow, currentStep, optionText, setMadReasonKey) {
  // Special handler for the Mad flow "Frustration with manager" case
  if (currentFlow === mdojoFullFlow.Mad && currentStep === 'step1' &&
      optionText.includes('Frustration with manager')) {
    console.log('[DEBUG] Special handler for Frustration with manager');
    setMadReasonKey('step3_frustration_with_manager_or_leadership_decisions');
    return true;
  }
  return false;
}
