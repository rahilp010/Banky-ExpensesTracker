import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, StyleSheet, Button, Image } from 'react-native';
import db from '../Components/db';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRoute } from '@react-navigation/native';
import { FunnelIcon } from 'react-native-heroicons/outline';
import { TextInput } from 'react-native-gesture-handler';

const defaultImages = {
    income: require('../assets/image/income.jpg'),
    outcome: require('../assets/image/outcome.jpg'),
    savings: require('../assets/image/7.jpg'),
    default: require('../assets/image/6.jpg'),
    petrol: require('../assets/image/3.jpg'),
    food: require('../assets/image/4.jpg'),
    other: require('../assets/image/other.jpg'),
};

const TransactionHistoryScreen = () => {
    const [history, setHistory] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [filterType, setFilterType] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [showFilterOptions, setShowFilterOptions] = useState(false);
    

    useEffect(() => {
        fetchTransactionHistory();
    }, [filterType, startDate, endDate]);

    const fetchTransactionHistory = () => {
        let query = 'SELECT * FROM transactions WHERE 1=1';
        const params = [];

        // Only add the filter condition if filterType is not 'all'
        if (filterType && filterType !== 'all') {
            query += ' AND type = ?';
            params.push(filterType);
        }

        if (startDate) {
            query += ' AND date >= ?';
            params.push(startDate.toISOString().split('T')[0]);
        }

        if (endDate) {
            query += ' AND date <= ?';
            params.push(endDate.toISOString().split('T')[0]);
        }

        query += ' ORDER BY date DESC';

        db.transaction(tx => {
            tx.executeSql(
                query,
                params,
                (tx, result) => {
                    const history = result.rows.raw().map(item => {
                        const formattedDate = new Date(item.date).toLocaleDateString();
                        return { ...item, date: formattedDate };
                    });
                    setHistory(history);
                },
                error => {
                    console.log('Failed to fetch transaction history:', error);
                    setHistory([]);
                }
            );
        });
    };


    const handleOpenModal = (transaction) => {
        setSelectedTransaction(transaction);
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setSelectedTransaction(null);
    };

    const getImage = (type) => {
        return defaultImages[type] || defaultImages.default;
    };

    const renderTransactionItem = ({ item }) => (
        <TouchableOpacity style={styles.transactionItem} onPress={() => handleOpenModal(item)}>
            <Image
                source={getImage(item.type)}
                style={styles.transactionImage}
            />
            <View style={styles.transactionDetails}>
                <Text style={styles.transactionText}>Date: {item.date}</Text>
                <Text style={styles.transactionText}>Amount: ₹{item.amount}</Text>
                <Text style={styles.transactionText}>Type: {item.type}</Text>
            </View>
        </TouchableOpacity>
    );

    const renderFilterUI = () => (

        // showFilterOptions ? (
        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start'}}>
           

            <View style={styles.filterContainer}>

                <Picker
                    selectedValue={filterType}
                    onValueChange={(itemValue) => setFilterType(itemValue)}
                    style={{ color: 'black' }}
                    itemStyle={{borderColor:'black',borderWidth:1}}
                >
                    <Picker.Item label="All" value='all' />
                    <Picker.Item label="Income" value="income" />
                    <Picker.Item label="Petrol" value="petrol" />
                    <Picker.Item label="Food" value="food" />
                    <Picker.Item label="Savings" value="savings" />
                    <Picker.Item label="Salary" value="salary" />
                    <Picker.Item label="Others" value="other" />
                </Picker>

                {/* <Text style={styles.filterLabel}>Filter by Date Range:</Text>
                <Button title="Select Start Date" onPress={() => setShowStartDatePicker(true)} />
                    <TextInput onChangeText={() => setShowStartDatePicker(true)}/>
                <Text>{startDate ? startDate.toDateString() : 'No date selected'}</Text>
                <Button title="Select End Date" onPress={() => setShowEndDatePicker(true)} />
                <Text>{endDate ? endDate.toDateString() : 'No date selected'}</Text>
        
                <Button
                    title="Apply Filters"
                    onPress={() => {
                        fetchTransactionHistory();
                        setShowFilterOptions(false);
                    }}
                /> */}

                {showStartDatePicker && (
                    <DateTimePicker
                        value={startDate || new Date()}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                            setShowStartDatePicker(false);
                            if (selectedDate) setStartDate(selectedDate);
                        }}
                    />
                )}
                {showEndDatePicker && (
                    <DateTimePicker
                        value={endDate || new Date()}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                            setShowEndDatePicker(false);
                            if (selectedDate) setEndDate(selectedDate);
                        }}
                    />
                )}
            </View>
            <View>
                <TouchableOpacity style={styles.filterIconContainer} onPress={() => setShowFilterOptions(true)}>
                    <FunnelIcon size={30} color="#8884ff" />
                </TouchableOpacity>
            </View>
        </View>

    );

    return (
        <View style={styles.container}>
            {renderFilterUI()}
            {history.length > 0 ? (
                <FlatList
                    data={history}
                    renderItem={renderTransactionItem}
                    keyExtractor={(item) => item.id.toString()}
                />
            ) : (
                <Text style={styles.noDataText}>No data found</Text>
            )}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType='fade'
                onRequestClose={handleCloseModal}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        {selectedTransaction && (
                            <View>
                                <Image
                                    source={getImage(selectedTransaction.type)}
                                    style={styles.modalImage}
                                />
                                <Text style={styles.modalText}>Date : {selectedTransaction.date}</Text>
                                <Text style={styles.modalText}>Amount : ₹{selectedTransaction.amount}</Text>
                                <Text style={styles.modalText}>Type : {selectedTransaction.type}</Text>
                            </View>
                        )}
                        <TouchableOpacity onPress={handleCloseModal}>
                            <Text style={[styles.AddButton, { backgroundColor: '#8884ff' }]}>
                                Close
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    filterIconContainer: {
        alignItems: 'flex-end',
        padding: 16,
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginBottom: 8,
        backgroundColor: '#f0f0f0',
        borderRadius: 4,
    },
    modalText: {
        color: '#8884ff',
        fontWeight: '800',
        textAlign: 'center',
        fontSize: 17,
    },
    transactionImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 16,
    },
    transactionDetails: {
        flex: 1,
    },
    transactionText: {
        fontSize: 16,
        color: 'black',
    },
    noDataText: {
        fontSize: 18,
        color: 'gray',
        textAlign: 'center',
        marginTop: -50,
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: 300,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
    },
    modalImage: {
        width: '80%',
        marginHorizontal: 30,
        height: 200,
        borderRadius: 10,
        marginBottom: 16,
    },
    AddButton: {
        textAlign: 'center',
        padding: 7,
        fontSize: 17,
        borderRadius: 10,
        marginTop: 20,
    },
    filterContainer: {
       marginBottom:20,
        width: 150,
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
    },
    filterLabel: {
        fontSize: 16,
        marginBottom: 8,
        color: 'black'
    },
});

export default TransactionHistoryScreen;
