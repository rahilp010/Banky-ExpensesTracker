import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const CalendarIcon = () => {
    const today = new Date();
    const date = today.getDate();

    return (
        <View style={styles.container}>
            <Icon name="calendar" size={30} color="#000" />
            <View style={styles.dateContainer}>
                <Text style={styles.dateText}>{date}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 30,
        height: 30,
    },
    dateContainer: {
        position: 'absolute',
        top: 9,
        left: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 8,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dateText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#000',
    },
});

export default CalendarIcon;
