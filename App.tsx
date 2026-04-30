import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import {
  NavigationContainer,
  DefaultTheme,
  useNavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppDataProvider } from './context/AppDataContext';
import { RootStackParamList } from './types/navigation';
import { BottomNav, BottomNavRoute } from './components/BottomVav';

import Splash from './screens/Splash';
import Onboarding from './screens/Onboarding';
import Login from './screens/Login';
import CompleteProfile from './screens/CompleteProfile';
import Dashboard from './screens/Dashboard';
import CreateGoal from './screens/CreateGoal';
import AutomatedSavings from './screens/AutomatedSaving';
import SavingsProgress from './screens/SavingsProgress';
import InvestmentInsights from './screens/InvestmentInsights';
import Notifications from './screens/Notifications';
import Deductions from './screens/Deductions';
import ExpenseTracking from './screens/ExpenseTracking';
import AddExpense from './screens/AddExpense';
import Profile from './screens/Profile';
import EditProfile from './screens/EditProfile';
import NotificationPreferences from './screens/NotificationPreferences';
import LinkedMobileMoney from './screens/LinkedMobileMoney';
import PrivacyPolicy from './screens/PrivacyPolicy';
import { colors } from './theme/colors';

const Stack = createNativeStackNavigator<RootStackParamList>();
const routesWithoutNav: Array<keyof RootStackParamList> = [
  'Splash',
  'Onboarding',
  'Login',
  'CompleteProfile',
  'CreateGoal',
  'AutomatedSavings',
  'AddExpense',
  'EditProfile',
  'NotificationPreferences',
  'LinkedMobileMoney',
  'PrivacyPolicy',
];
const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    primary: colors.primary,
    text: colors.text,
    border: colors.border,
  },
};

export default function App() {
  const navigationRef = useNavigationContainerRef<RootStackParamList>();
  const [activeRoute, setActiveRoute] = useState<keyof RootStackParamList>('Splash');
  const showBottomNav = !routesWithoutNav.includes(activeRoute);

  const navigateFromBottomNav = (routeName: BottomNavRoute) => {
    navigationRef.navigate(routeName);
  };

  return (
    <SafeAreaProvider>
      <AppDataProvider>
        <NavigationContainer
          ref={navigationRef}
          theme={navigationTheme}
          onReady={() => {
            setActiveRoute(navigationRef.getCurrentRoute()?.name ?? 'Splash');
          }}
          onStateChange={() => {
            setActiveRoute(navigationRef.getCurrentRoute()?.name ?? 'Splash');
          }}
        >
          <LinearGradient
            colors={[colors.background, '#FBFBF8']}
            style={styles.container}
          >
            <StatusBar
              style="dark"
              backgroundColor={colors.surface}
              translucent={false}
            />
            <Stack.Navigator
              initialRouteName="Splash"
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: 'transparent' },
              }}
            >
              <Stack.Screen name="Splash" component={Splash} />
              <Stack.Screen name="Onboarding" component={Onboarding} />
              <Stack.Screen name="Login" component={Login} />
              <Stack.Screen name="CompleteProfile" component={CompleteProfile} />
              <Stack.Screen name="Dashboard" component={Dashboard} />
              <Stack.Screen name="CreateGoal" component={CreateGoal} />
              <Stack.Screen name="AutomatedSavings" component={AutomatedSavings} />
              <Stack.Screen name="SavingsProgress" component={SavingsProgress} />
              <Stack.Screen name="InvestmentInsights" component={InvestmentInsights} />
              <Stack.Screen name="Notifications" component={Notifications} />
              <Stack.Screen name="Deductions" component={Deductions} />
              <Stack.Screen name="ExpenseTracking" component={ExpenseTracking} />
              <Stack.Screen name="AddExpense" component={AddExpense} />
              <Stack.Screen name="Profile" component={Profile} />
              <Stack.Screen name="EditProfile" component={EditProfile} />
              <Stack.Screen name="NotificationPreferences" component={NotificationPreferences} />
              <Stack.Screen name="LinkedMobileMoney" component={LinkedMobileMoney} />
              <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
            </Stack.Navigator>
            {showBottomNav ? (
              <BottomNav
                activeRoute={activeRoute}
                onNavigate={navigateFromBottomNav}
              />
            ) : null}
          </LinearGradient>
        </NavigationContainer>
      </AppDataProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
