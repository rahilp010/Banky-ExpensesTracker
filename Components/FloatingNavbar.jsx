/* eslint-disable prettier/prettier */
import React from 'react';
import {View, Pressable, StyleSheet, Text, Platform} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useTheme} from './ThemeContext';
import {useNavigation, useNavigationState} from '@react-navigation/native';
import Animated, {FadeInDown, LinearTransition} from 'react-native-reanimated';

// Create an animated version of Pressable to accept Reanimated props
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const FloatingNavbar = () => {
  const {isDarkMode, colors} = useTheme();
  const navigation = useNavigation();

  const state = useNavigationState(state => state);
  const routeName = state ? state.routes[state.index].name : 'HomeScreen';

  const tabs = [
    {name: 'HomeScreen', icon: 'home', label: 'Home'},
    {name: 'TransactionHistoryScreen', icon: 'history', label: 'History'},
    {name: 'Settings', icon: 'settings', label: 'Settings'},
  ];

  const handlePress = tabName => {
    if (routeName !== tabName) {
      // LayoutAnimation removed! Reanimated handles it automatically now.
      navigation.navigate(tabName);
    }
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(1000).duration(800)}
      style={[
        styles.container,
        {
          backgroundColor: isDarkMode
            ? 'rgba(15, 23, 42, 0.8)'
            : 'rgba(255, 255, 255, 0.85)',
          borderColor: isDarkMode
            ? 'rgba(255, 255, 255, 0.1)'
            : 'rgba(0, 0, 0, 0.05)',
        },
      ]}>
      <View style={styles.content}>
        {tabs.map(tab => {
          const isActive = routeName === tab.name;
          return (
            <AnimatedPressable
              key={tab.name}
              onPress={() => handlePress(tab.name)}
              // This is where the magic happens: a springy layout transition
              layout={LinearTransition.springify()
                .damping(14)
                .stiffness(150)
                .mass(0.8)}
              style={[
                styles.tab,
                isActive && [
                  styles.activeTab,
                  {
                    backgroundColor: isDarkMode
                      ? '#F8FAFC'
                      : colors.buttonBackground,
                  },
                ],
              ]}>
              <View style={styles.iconWrapper}>
                <Icon
                  name={tab.icon}
                  size={24}
                  color={
                    isActive
                      ? isDarkMode
                        ? '#0F172A'
                        : '#FFFFFF'
                      : colors.textMuted
                  }
                />
              </View>
              {isActive && (
                <Animated.Text
                  entering={FadeInDown.springify().damping(14).stiffness(150)}
                  numberOfLines={1}
                  style={[
                    styles.label,
                    {color: isDarkMode ? '#0F172A' : '#FFFFFF'},
                  ]}>
                  {tab.label}
                </Animated.Text>
              )}
            </AnimatedPressable>
          );
        })}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
    left: '8%',
    right: '8%',
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 10},
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 30,
    height: 48,
    minWidth: 48,
    justifyContent: 'center',
  },
  activeTab: {
    flex: 1.2,
    marginHorizontal: 4,
  },
  iconWrapper: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '800',
  },
});

export default FloatingNavbar;
