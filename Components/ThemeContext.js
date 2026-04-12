/* eslint-disable prettier/prettier */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const systemScheme = useColorScheme();
    const [isDarkMode, setIsDarkMode] = useState(systemScheme === 'dark');

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    const theme = {
        isDarkMode,
        toggleTheme,
        colors: isDarkMode ? darkColors : lightColors,
    };

    return (
        <ThemeContext.Provider value={theme}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);

const lightColors = {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#0F172A',
    textMuted: '#64748B',
    primary: '#10233D',
    card: '#FFFFFF',
    border: 'rgba(148, 163, 184, 0.1)',
    buttonBackground: '#10233D',
    buttonText: '#FFFFFF',
    iconBackground: 'rgba(148, 163, 184, 0.1)',
};

const darkColors = {
    background: '#07111F',
    surface: '#0D192B',
    text: '#F8FAFC',
    textMuted: '#94A3B8',
    primary: '#F8FAFC',
    card: '#10233D',
    border: 'rgba(148, 163, 184, 0.12)',
    buttonBackground: '#F8FAFC',
    buttonText: '#0B1220',
    iconBackground: 'rgba(148, 163, 184, 0.15)',
};
