/* eslint-disable prettier/prettier */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance } from 'react-native';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const systemTheme = Appearance.getColorScheme(); // 'light' | 'dark'
    const [theme, setTheme] = useState(systemTheme || 'light');

    // Load saved theme
    useEffect(() => {
        (async () => {
            // const savedTheme = await AsyncStorage.getItem('APP_THEME');
            // if (savedTheme) setTheme(savedTheme);
        })();
    }, []);

    // Save theme
    const toggleTheme = async () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
