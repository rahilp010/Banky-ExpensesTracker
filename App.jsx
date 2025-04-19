import { Alert, StatusBar, StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import HomeScreen from './Screens/HomeScreen'
import AppNavigator from './Screens/AppNavigator'

const App = () => {
  return (
    <View style={{flex: 1}}>
      <AppNavigator/>
    </View>
  )
}

export default App

const styles = StyleSheet.create({})