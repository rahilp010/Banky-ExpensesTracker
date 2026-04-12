/* eslint-disable prettier/prettier */
import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import Animated, {
    useAnimatedProps,
    useSharedValue,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { useTheme } from './ThemeContext';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const DonutSlice = ({ item, total, circumference, radius, strokeWidth, progress, offset }) => {
    const slicePercentage = total === 0 ? 0 : item.value / total;
    const strokeDasharray = `${circumference} ${circumference}`;

    const animatedProps = useAnimatedProps(() => {
        const animatedPercentage = slicePercentage * progress.value;
        return {
            strokeDashoffset: circumference - animatedPercentage * circumference,
        };
    });

    const rotation = (offset / circumference) * 360;

    return (
        <G rotation={rotation} origin="100, 100">
            <AnimatedCircle
                cx="100"
                cy="100"
                r={radius}
                stroke={item.color}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={strokeDasharray}
                animatedProps={animatedProps}
                strokeLinecap="round"
            />
        </G>
    );
};

const DonutChart = ({ data, total }) => {
    const { colors } = useTheme();
    const radius = 70;
    const strokeWidth = 20;
    const circumference = 2 * Math.PI * radius;

    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = 0;
        progress.value = withTiming(1, {
            duration: 1500,
            easing: Easing.out(Easing.cubic),
        });
    }, [data, total, progress]);

    let currentOffset = 0;

    return (
        <View style={styles.container}>
            <Svg height="200" width="200" viewBox="0 0 200 200">
                <G rotation="-90" origin="100, 100">
                    <Circle
                        cx="100"
                        cy="100"
                        r={radius}
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                    />
                    {data.map((item, index) => {
                        const offset = currentOffset;
                        const slicePercentage = total === 0 ? 0 : item.value / total;
                        currentOffset += slicePercentage * circumference;

                        return (
                            <DonutSlice
                                key={index}
                                item={item}
                                total={total}
                                circumference={circumference}
                                radius={radius}
                                strokeWidth={strokeWidth}
                                progress={progress}
                                offset={offset}
                            />
                        );
                    })}
                </G>
            </Svg>
            <View style={styles.centerTextContainer}>
               <Text style={[styles.centerLabel, { color: colors.textMuted }]}>Total</Text>
               <Text style={[styles.centerValue, { color: colors.text }]}>
                   {total > 0 ? 'Rs ' + total.toLocaleString('en-IN') : '0'}
               </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 16,
        position: 'relative'
    },
    centerTextContainer: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerLabel: {
        color: '#94A3B8',
        fontSize: 12,
    },
    centerValue: {
        color: '#F8FAFC',
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default DonutChart;
