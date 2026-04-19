import React, { createContext, useContext, useState } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from './ThemeContext';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState({
    title: '',
    message: '',
    type: 'info', // 'success', 'error', 'info', 'warning'
    onConfirm: null,
  });
  const { isDarkMode, colors } = useTheme();

  const showNotification = ({ title, message, type = 'info', onConfirm = null }) => {
    setConfig({ title, message, type, onConfirm });
    setVisible(true);
  };

  const hideNotification = () => {
    setVisible(false);
    if (config.onConfirm) {
      config.onConfirm();
    }
  };

  const getIcon = () => {
    switch (config.type) {
      case 'success': return 'check-circle';
      case 'error': return 'error';
      case 'warning': return 'warning';
      default: return 'info';
    }
  };

  const getColor = () => {
    switch (config.type) {
      case 'success': return '#10B981';
      case 'error': return '#EF4444';
      case 'warning': return '#F59E0B';
      default: return '#3B82F6';
    }
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <Modal
        transparent
        visible={visible}
        animationType="fade"
        onRequestClose={hideNotification}
      >
        <View style={styles.overlay}>
          <View style={[
            styles.container,
            { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF' }
          ]}>
            <View style={[styles.iconContainer, { backgroundColor: `${getColor()}20` }]}>
              <Icon name={getIcon()} size={40} color={getColor()} />
            </View>
            
            <Text style={[styles.title, { color: colors.text }]}>
              {config.title || config.type.charAt(0).toUpperCase() + config.type.slice(1)}
            </Text>
            
            <Text style={[styles.message, { color: colors.textMuted }]}>
              {config.message}
            </Text>

            <Pressable
              style={[styles.button, { backgroundColor: getColor() }]}
              onPress={hideNotification}
            >
              <Text style={styles.buttonText}>Dismiss</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </NotificationContext.Provider>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  button: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
