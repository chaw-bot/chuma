export type RootStackParamList = {
  Splash: undefined;
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
        goalId?: string;
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
  Deductions: undefined;
  ExpenseTracking: undefined;
  AddExpense: undefined;
  Profile: undefined;
  EditProfile: undefined;
  NotificationPreferences: undefined;
  LinkedMobileMoney: undefined;
  PrivacyPolicy: undefined;
};
