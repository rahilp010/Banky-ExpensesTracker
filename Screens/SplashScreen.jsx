/* eslint-disable prettier/prettier */
import React, {useEffect} from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import BootSplash from 'react-native-bootsplash';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useTheme} from '../Components/ThemeContext';

const SplashScreen = ({navigation}) => {
  const {isDarkMode, colors} = useTheme();

  useEffect(() => {
    BootSplash.hide({fade: true}).catch(() => {});

    const timer = setTimeout(() => {
      navigation.replace('HomeScreen');
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView
      style={[
        styles.container,
        {backgroundColor: isDarkMode ? '#000000' : '#FFFFFF'},
      ]}>
      <StatusBar
        backgroundColor={isDarkMode ? '#000000' : '#FFFFFF'}
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
      />

      <View style={styles.content}>
        <View
          style={[
            styles.logoWrapper,
            {
              backgroundColor: isDarkMode ? colors.surface : '#FFFFFF',
              shadowColor: isDarkMode ? '#000000' : '#0F172A',
              borderColor: isDarkMode
                ? 'rgba(255,255,255,0.06)'
                : 'rgba(15, 23, 42, 0.08)',
            },
          ]}>
          <Icon
            name="account-balance-wallet"
            size={54}
            color={isDarkMode ? '#F8FAFC' : colors.primary}
          />
        </View>

        <Text
          style={[styles.title, {color: isDarkMode ? '#F8FAFC' : '#0F172A'}]}>
          Banky
        </Text>

        <ActivityIndicator
          size="small"
          color={isDarkMode ? '#F8FAFC' : colors.primary}
          style={styles.loader}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoWrapper: {
    width: 124,
    height: 124,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowOffset: {
      width: 0,
      height: 16,
    },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 14,
  },
  title: {
    marginTop: 20,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  loader: {
    marginTop: 18,
  },
});

export default SplashScreen;
