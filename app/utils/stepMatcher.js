/**
 * Utility function to help match text options to the correct step keys
 */

// Helper function to match text in option selections
export const matchStepFromText = (optionText, flow) => {
  console.log('[DEBUG] Trying to match step from text:', optionText);
  
  // Match for Sad flow
  if (flow === 'Sad') {
    if (optionText.includes('Manager') || optionText.includes('manager')) {
      return 'step3_manager_related_challenges';
    } else if (optionText.includes('colleague') || optionText.includes('Difficult')) {
      return 'step3_difficult_interactions_with_colleagues';
    } else if (optionText.includes('culture') || optionText.includes('policies')) {
      return 'step3_company_culture_or_policies';
    } else if (optionText.includes('role') || optionText.includes('clarity')) {
      return 'step3_lack_of_role_clariy_or_direction';
    } else if (optionText.includes('Workspace') || optionText.includes('workspace') || 
               optionText.includes('tools') || optionText.includes('infrastructure')) {
      return 'step3_workspace_tools_or_infrastructure_issues';
    } else if (optionText.includes('balance') || optionText.includes('life')) {
      return 'step3_struggling_with_work_life_balance';
    } else if (optionText.includes('exhausted') || optionText.includes('overwhelmed')) {
      return 'step3_feeling_emotionally_exhausted_or_overwhelmed';
    }
  }
  
  // Match for Mad flow
  if (flow === 'Mad') {
    if (optionText.includes('manager') || optionText.includes('leadership')) {
      return 'step3_frustration_with_manager_or_leadership_decisions';
    } else if (optionText.includes('Tension') || optionText.includes('conflict')) {
      return 'step3_tension_or_conflict_with_colleagues';
    } else if (optionText.includes('workload') || optionText.includes('recognition')) {
      return 'step3_unfair_workload_or_lack_of_recognition';
    } else if (optionText.includes('deadlines') || optionText.includes('miscommunication')) {
      return 'step3_missed_deadlines_or_miscommunication';
    } else if (optionText.includes('policies') || optionText.includes('red tape')) {
      return 'step3_frustration_with_company_policies_or_red_tape';
    } else if (optionText.includes('stuck') || optionText.includes('blocked')) {
      return 'step3_feeling_stuck_or_blocked_in_your_work';
    } else if (optionText.includes('change') || optionText.includes('unclear')) {
      return 'step3_too_much_change_or_unclear_direction';
    } else if (optionText.includes('Infrastructure') || optionText.includes('facility')) {
      return 'step3_infrastructure_or_facility_related_issues';
    }
  }
  
  // No match found
  return null;
};
