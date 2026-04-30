import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

import { AppDataProvider } from './context/AppDataContext';
import { RootStackParamList } from './types/navigation';

import Onboarding from './screens/Onboarding';
import Login from './screens/Login';
import CompleteProfile from './screens/CompleteProfile';
import Dashboard from './screens/Dashboard';
import CreateGoal from './screens/CreateGoal';
import AutomatedSavings from './screens/AutomatedSaving';
import SavingsProgress from './screens/SavingsProgress';
import InvestmentInsights from './screens/InvestmentInsights';
import Notifications from './screens/Notifications';
import ExpenseTracking from './screens/ExpenseTracking';
import Profile from './screens/Profile';
import { colors } from './theme/colors';

const Stack = createNativeStackNavigator<RootStackParamList>();
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
  return (
    <AppDataProvider>
      <NavigationContainer theme={navigationTheme}>
        <LinearGradient
          colors={[colors.background, '#FBFBF8']}
          style={styles.container}
        >
          <Stack.Navigator
            initialRouteName="Onboarding"
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: 'transparent' },
            }}
          >
            <Stack.Screen name="Onboarding" component={Onboarding} />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="CompleteProfile" component={CompleteProfile} />
            <Stack.Screen name="Dashboard" component={Dashboard} />
            <Stack.Screen name="CreateGoal" component={CreateGoal} />
            <Stack.Screen name="AutomatedSavings" component={AutomatedSavings} />
            <Stack.Screen name="SavingsProgress" component={SavingsProgress} />
            <Stack.Screen name="InvestmentInsights" component={InvestmentInsights} />
            <Stack.Screen name="Notifications" component={Notifications} />
            <Stack.Screen name="ExpenseTracking" component={ExpenseTracking} />
            <Stack.Screen name="Profile" component={Profile} />
          </Stack.Navigator>
        </LinearGradient>
      </NavigationContainer>
    </AppDataProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
