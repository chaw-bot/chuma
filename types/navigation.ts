export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  CompleteProfile:
    | {
        phoneNumber: string;
      }
    | undefined;
  Dashboard: undefined;
  CreateGoal: undefined;
  AutomatedSavings:
    | {
        goalName?: string;
        targetAmount?: string;
        timeline?: string;
        category?: 'education' | 'emergency' | 'business' | 'housing';
      }
    | undefined;
  SavingsProgress:
    | {
        goalId?: string;
      }
    | undefined;
  InvestmentInsights: undefined;
  Notifications: undefined;
  ExpenseTracking: undefined;
  Profile: undefined;
};
