/* eslint-disable prettier/prettier */
import React from 'react';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import SplashScreen from './SplashScreen';
import HomeScreen from './HomeScreen';
import TransactionHistoryScreen from './TransactionHistoryScreen';
import { useTheme } from '../Components/ThemeContext';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isDarkMode, colors } = useTheme();

  const appTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: colors.background,
      card: colors.background,
      text: colors.text,
    },
  };

  const screenOptions = {
    headerStyle: {
      backgroundColor: colors.background,
      elevation: 0,
      shadowOpacity: 0,
      borderBottomWidth: isDarkMode ? 0 : 1,
      borderBottomColor: colors.border,
    },
    headerTintColor: colors.text,
    headerTitleStyle: {
      fontWeight: '700',
    },
    headerBackTitleVisible: false,
    cardStyle: {
      backgroundColor: colors.background,
    },
  };

  return (
    <NavigationContainer theme={appTheme}>
      <Stack.Navigator
        initialRouteName="SplashScreen"
        screenOptions={screenOptions}>
        <Stack.Screen
          name="SplashScreen"
          component={SplashScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="TransactionHistoryScreen"
          component={TransactionHistoryScreen}
          options={{headerTitle: 'Reports & History'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
