/* eslint-disable prettier/prettier */
import React, { useEffect } from 'react';
import { StyleSheet, Dimensions, View } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    runOnJS,
    Easing,
    interpolate,
    Extrapolate,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');
const CIRCLE_SIZE = Math.sqrt(width * width + height * height) * 2;

const ThemeTransitionOverlay = ({ isDarkMode, onAnimationComplete }) => {
    const scale = useSharedValue(0);
    const opacity = useSharedValue(0);
    const iconScale = useSharedValue(0);
    const iconRotation = useSharedValue(0);

    useEffect(() => {
        scale.value = 0;
        opacity.value = 1;
        iconScale.value = 0;
        iconRotation.value = 0;

        // Animate circle expansion
        scale.value = withTiming(1, {
            duration: 1000,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
        }, (finished) => {
            if (finished) {
                opacity.value = withTiming(0, { duration: 400 }, () => {
                    runOnJS(onAnimationComplete)();
                });
            }
        });

        // Animate icon appearance
        iconScale.value = withTiming(1, {
            duration: 600,
            easing: Easing.back(1.5),
        });

        iconRotation.value = withTiming(1, {
            duration: 800,
            easing: Easing.out(Easing.quad),
        });

    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
            opacity: opacity.value,
            backgroundColor: isDarkMode ? '#07111F' : '#F8FAFC',
        };
    });

    const iconAnimatedStyle = useAnimatedStyle(() => {
        const rotate = interpolate(
            iconRotation.value,
            [0, 1],
            [0, 360],
            Extrapolate.CLAMP
        );

        return {
            transform: [
                { scale: iconScale.value },
                { rotate: `${rotate}deg` }
            ],
            opacity: opacity.value,
        };
    });

    return (
        <View style={styles.container} pointerEvents="none">
            <Animated.View style={[styles.overlay, animatedStyle]} />
            <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
                <Icon 
                    name={isDarkMode ? "dark-mode" : "light-mode"} 
                    size={80} 
                    color={isDarkMode ? "#F8FAFC" : "#0F172A"} 
                />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
    },
    overlay: {
        position: 'absolute',
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        borderRadius: CIRCLE_SIZE / 2,
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default ThemeTransitionOverlay;
