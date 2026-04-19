/* eslint-disable prettier/prettier */
import React, { useEffect } from 'react';
import {StyleSheet, View} from 'react-native';
import AppNavigator from './Screens/AppNavigator';
import { scheduleAllReminders } from './Components/NotificationService';
import { ThemeProvider } from './Components/ThemeContext';
import { NotificationProvider } from './Components/NotificationContext';

const App = () => {
  useEffect(() => {
    scheduleAllReminders();
  }, []);

  return (
    <ThemeProvider>
      <NotificationProvider>
        <View style={styles.container}>
          <AppNavigator />
        </View>
      </NotificationProvider>
    </ThemeProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
