import React, { useState, useEffect } from 'react';
import { Image, Text, View, TouchableOpacity, StatusBar, Modal, TextInput, ToastAndroid, TouchableWithoutFeedback, FlatList, } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import { createStyles } from '../Components/styles';
import db from '../Components/db';
import { Bars3CenterLeftIcon, BellIcon, EyeIcon, EyeSlashIcon } from "react-native-heroicons/solid";
import { useNavigation } from '@react-navigation/native';
import { trigger } from "react-native-haptic-feedback";
import CalendarIcon from '../Components/CalendarIcon';

const options = {
    enableVibrateFallback: true,
    ignoreAndroidSystemSettings: false,
};


const HomeScreen = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [formValue, setFormValue] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [balance, setBalance] = useState(0);
    const [outCome, setOutCome] = useState(0);
    const [savings, setSavings] = useState(0);
    const [income, setIncome] = useState(0);
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);
    const [password, setPassword] = useState('');
    const [secureTextEntry, setSecureTextEntry] = useState(true)
    const navigation = useNavigation();

    const navigateToHistory = () => {
        navigation.navigate('TransactionHistoryScreen');
    };

    const toggleDarkMode = () => setIsDarkMode(previousState => !previousState);

    const styles = createStyles(isDarkMode);

    useEffect(() => {
        db.transaction(tx => {
            tx.executeSql(
                `CREATE TABLE IF NOT EXISTS transactions (
                    id INTEGER PRIMARY KEY NOT NULL,
                    amount REAL NOT NULL,
                    date TEXT NOT NULL,
                    type TEXT
                );`
            );
        });
    
        db.transaction(tx => {
            tx.executeSql(
                'PRAGMA table_info(transactions);',
                [],
                (tx, result) => {
                    const columns = result.rows.raw();
                    const hasTypeColumn = columns.some(col => col.name === 'type');
                    if (!hasTypeColumn) {
                        tx.executeSql(
                            'ALTER TABLE transactions ADD COLUMN type TEXT;',
                            [],
                            () => console.log('Added type column to transactions table'),
                            error => console.log('Failed to add type column:', error)
                        );
                    }
                },
                error => console.log('Failed to check table info:', error)
            );
        });
    
        fetchBalance();
        fetchOutcome();
        fetchSavings();
        fetchIncome();
        fetchTransactions(); // Fetch transactions on component mount
    }, []);
    
    

    const fetchBalance = () => {
        db.transaction(tx => {
            tx.executeSql(
                'SELECT SUM(amount) as total FROM transactions WHERE type = ?',
                ['income'],
                (tx, result) => {
                    const incomeTotal = result.rows.item(0).total || 0;
                    tx.executeSql(
                        'SELECT SUM(amount) as total FROM transactions WHERE type IN (?, ?, ?,?)',
                        ['outcome', 'petrol', 'food','other'],
                        (tx, outcomeResult) => {
                            const outcomeTotal = outcomeResult.rows.item(0).total || 0;
                            setBalance(incomeTotal - outcomeTotal);
                        },
                        error => console.log('Failed to fetch outcome total:', error)
                    );
                },
                error => console.log('Failed to fetch income total:', error)
            );
        });
    };
    
    


    const fetchOutcome = () => {
        db.transaction(tx => {
            tx.executeSql(
                "SELECT SUM(amount) as total FROM transactions WHERE type IN ('outcome', 'petrol', 'food','other')",
                [],
                (tx, result) => {
                    const total = result.rows.item(0).total || 0;
                    setOutCome(total);
                },
                error => console.log('Failed to fetch outcome:', error)
            );
        });
    };
    

    const fetchSavings = () => {
        db.transaction(tx => {
            tx.executeSql(
                "SELECT SUM(amount) as total FROM transactions WHERE type='savings'",
                [],
                (tx, result) => {
                    const total = result.rows.item(0).total || 0;
                    setSavings(total);
                },
                error => console.log('Failed to fetch savings:', error)
            );
        });
    };

    const fetchIncome = () => {
        db.transaction(tx => {
            tx.executeSql(
                "SELECT SUM(amount) as total FROM transactions WHERE type='income'",
                [],
                (tx, result) => {
                    const total = result.rows.item(0).total || 0;
                    setIncome(total);
                },
                error => console.log('Failed to fetch income:', error)
            );
        });
    };

    const fetchTransactions = () => {
        db.transaction(tx => {
            tx.executeSql(
                'SELECT * FROM transactions ORDER BY date DESC',
                [],
                (tx, result) => {
                    const transactions = [];
                    for (let i = 0; i < result.rows.length; i++) {
                        transactions.push(result.rows.item(i));
                    }
                    setTransactions(transactions);
                },
                error => console.log('Failed to fetch transactions:', error)
            );
        });
    };
    
    


    const handleOpenModal = (item) => {
        setFormValue('');
        setModalVisible(true);
        setSelectedItem(item);
        trigger("impactLight", options);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setFormValue('');
        setSelectedItem(null);
    };

    const handleFormSubmit = () => {
        const amount = parseFloat(formValue);
        if (!isNaN(amount) && amount > 0) {
            let type = 'income';
            if (selectedItem?.name === 'Petrol') {
                type = 'petrol';
            } else if (selectedItem?.name === 'Food') {
                type = 'food';
            } else if (selectedItem?.name === 'Others') {
                type = 'other';
            } else if (selectedItem?.name === 'Savings') {
                type = 'savings';
            } else if (selectedItem?.name === 'Salary') {
                type = 'salary';
            }
    
            db.transaction(tx => {
                tx.executeSql(
                    'INSERT INTO transactions (amount, date, type) VALUES (?, ?, ?)',
                    [amount, new Date().toISOString(), type],
                    () => {
                        ToastAndroid.show('Transaction added successfully', ToastAndroid.SHORT);
                        fetchBalance(); // Ensure balance is updated after adding the transaction
                        if (type === 'income') {
                            fetchIncome();
                        } else if (type === 'outcome' || type === 'food' || type === 'petrol' || type === 'other') {
                            fetchOutcome(); // Update outcome total
                        } else if (type === 'savings') {
                            fetchSavings();
                        }
                        handleCloseModal();
                    },
                    error => console.log('Failed to insert transaction:', error)
                );
            });
        } else {
            ToastAndroid.show('Please Enter a Valid Amount', ToastAndroid.SHORT);
        }
    };
    


    const handlePasswordSubmit = () => {
        const correctPassword = '1009'; // Set your desired password here
        if (password === correctPassword) {
            resetTransactions();
            setPasswordModalVisible(false);
            setPassword('');
        } else {
            ToastAndroid.show('Incorrect Password', ToastAndroid.SHORT);
            setPassword('');
            trigger("notificationWarning", options);
        }
    };

    const resetTransactions = () => {
        db.transaction(tx => {
            tx.executeSql(
                'DELETE FROM transactions',
                [],
                () => {
                    console.log('Transactions reset successfully');
                    ToastAndroid.show('Transactions reset successfully', ToastAndroid.SHORT);
                    setBalance(0); // Reset balance state to 0
                    setOutCome(0); // Reset outcome state to 0
                    setSavings(0); // Reset savings state to 0
                    setIncome(0); // Reset income state to 0
                },
                error => console.error('Failed to delete transactions:', error)
            );
        });
    };

    const data = [
        { key: 'header' },
        { key: 'balance' },
        {
            key: '1',
            icon: 'attach-money',
            title: 'Total Income',
            amount: income,
            backgroundColor: '#8884ff',
            image: require('../assets/image/income.jpg')
        },
        {
            key: '2',
            icon: 'money-off',
            title: 'Total Outcome',
            amount: outCome,
            backgroundColor: '#d7bce8',
            image: require('../assets/image/outcome.jpg')
        },
        {
            key: '3',
            icon: 'account-balance-wallet',
            title: 'Savings',
            amount: savings,
            backgroundColor: '#e8cee4',
            image: require('../assets/image/savings.jpg')
        },
        { key: 'expensesTitle' },
        { key: 'expenses' }
    ];

    const renderItem = ({ item }) => {
        if (item.key === 'header') {
            return (
                <View style={styles.headerNav}>
                    <View style={styles.headerIcons}>
                        <TouchableOpacity>
                            <Bars3CenterLeftIcon size={27} color={isDarkMode ? '#f5dd4b' : '#000'} />
                        </TouchableOpacity>
                    </View>
                    <View>
                        <Text style={[styles.headerText, { fontFamily: 'PlaywriteBEVLG-Regular' }]}>Banky</Text>
                    </View>
                    <View style={styles.headerIcons}>
                        <TouchableOpacity>
                            {/* <Icon name='notifications' size={27} color={isDarkMode ? '#f5dd4b' : '#000'} /> */}
                            <CalendarIcon />
                        </TouchableOpacity>
                    </View>
                </View>
            );
        } else if (item.key === 'balance') {
            return (
                <View style={[styles.box, { margin: 15 }]}>
                    <Text style={styles.miniText}>Your Balance</Text>
                    <View style={{ flexDirection: 'row', marginHorizontal: 20, justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{ fontSize: 20, marginTop: 7, marginRight: 5, color: isDarkMode ? 'white' : 'black' }}>₹</Text>
                            <Text style={styles.totalBalance}>{balance}</Text>
                        </View>
                        <TouchableOpacity onLongPress={() => setPasswordModalVisible(true)}>
                            <IconFontAwesome name='credit-card' size={35} color={isDarkMode ? '#f5dd4b' : '#3D4151'} />
                        </TouchableOpacity>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-start', gap: 20, marginTop: 20, marginHorizontal: 15 }}>
                        {/* <TouchableOpacity>
                            <Text style={[styles.AddButton, { backgroundColor: '#8884ff' }]}>
                                <Icon name='south-west' size={25} color={isDarkMode ? 'white' : 'black'} />
                            </Text>
                        </TouchableOpacity> */}
                        <TouchableOpacity onPress={() => handleOpenModal({ name: 'Income', image: require('../assets/image/6.jpg') })}>
                            <Text style={[styles.AddButton, { backgroundColor: '#8884ff' }]}>
                                <Icon name='add' size={25} color={isDarkMode ? 'white' : 'black'} />
                            </Text>
                        </TouchableOpacity>
                        {/* <TouchableOpacity>
                            <Text style={[styles.AddButton, { backgroundColor: '#d7bce8' }]}>
                                <Icon name='north-east' size={25} color={isDarkMode ? 'white' : 'black'} />
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleOpenModal({ name: 'Income', image: require('../assets/image/6.jpg') })}>
                            <Text style={[styles.AddButton, { backgroundColor: '#e8cee4' }]}>
                                <Icon name='add' size={25} color={isDarkMode ? 'white' : 'black'} />
                            </Text>
                        </TouchableOpacity> */}
                        <TouchableOpacity onPress={navigateToHistory}>
                            <Text style={[styles.AddButton, { backgroundColor: '#fde2ff' }]}>
                                <Icon name='history' size={25} color={isDarkMode ? 'white' : 'black'} />
                            </Text>
                        </TouchableOpacity>
                        {/* <TouchableOpacity onPress={resetTransactions}>
                            <Text style={[styles.AddButton, { backgroundColor: '#fde2ff' }]}>
                                <Icon name='restart-alt' size={25} color={isDarkMode ? 'white' : 'black'} />
                            </Text>
                        </TouchableOpacity> */}
                    </View>
                </View>
            );
        } else if (item.key === 'expensesTitle') {
            return (
                <View>
                    <Text style={{ fontSize: 30, color: isDarkMode ? 'white' : 'black', fontWeight: 'bold', margin: 15 }}>Expenses</Text>
                </View>
            );
        } else if (item.key === 'expenses') {
            const allExpenses = [
                { id: 1, name: 'Petrol', image: require('../assets/image/3.jpg') },
                { id: 2, name: 'Food', image: require('../assets/image/4.jpg') },
                { id: 3, name: 'Salary', image: require('../assets/image/6.jpg'), link: () => handleOpenModal({ name: 'Income' }) },
                { id: 4, name: 'Savings', image: require('../assets/image/7.jpg') },
                { id: 5, name: 'Others', image: require('../assets/image/other.jpg') },
            ];
            return (
                <FlatList
                    data={allExpenses}
                    renderItem={({ item }) => (
                        <View style={[styles.cardContainer, { backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }]}>
                            <TouchableOpacity onPress={() => handleOpenModal(item)}>
                                <Image source={item.image} style={styles.image} />
                                <Text style={[styles.miniText, { fontWeight: 'bold', color: '#5d576b', textAlign: 'center', letterSpacing: 0 }]}>{item.name}</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    horizontal={false}
                />
            );
        } else {
            return (
                <View style={[styles.cardContainer, { backgroundColor: item.backgroundColor, flexDirection: 'row', justifyContent: 'space-between' }]}>
                    <View>
                        <Icon name={item.icon} size={25} color='black' style={styles.cardIcon} />
                        <Text style={styles.cardText}>{item.title}</Text>
                        <View style={{ flexDirection: 'row', marginLeft: 10, marginTop: -3 }}>
                            <Text style={{ fontSize: 15, marginTop: 5, marginRight: 2, color: 'black' }}>₹</Text>
                            <Text style={[styles.totalBalance, { fontSize: 30, color: 'black' }]}>{item.amount}</Text>
                        </View>
                    </View>
                    <View>
                        <Image
                            source={item.image}
                            style={{ width: 100, height: 100, borderRadius: 50 }}
                        />
                    </View>
                </View>
            );
        }
    };

    return (
        <View style={styles.mainContainer}>
            <StatusBar
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                backgroundColor={isDarkMode ? '#0c0e13' : '#efefef'}
            />
            <FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={(item) => item.key}
            />
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={handleCloseModal}
            >
                <TouchableWithoutFeedback onPress={handleCloseModal}>
                    <View style={styles.modalContainer}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContent}>
                                <TouchableOpacity style={styles.closeButton} onPress={handleCloseModal}>
                                    <Icon name="close" size={20} color='white' />
                                </TouchableOpacity>
                                <Text style={styles.modalTitle}>{selectedItem?.name}</Text>
                                <View style={styles.inputContainer}>
                                    <Image source={selectedItem?.image} style={styles.modalImage} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter Amount (₹)"
                                        placeholderTextColor={isDarkMode ? 'white' : 'black'}
                                        value={formValue}
                                        onChangeText={setFormValue}
                                        keyboardType='number-pad'
                                    />
                                </View>
                                <TouchableOpacity onPress={handleFormSubmit}>
                                    <Text style={styles.button}>Add Amount</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            <Modal
                visible={passwordModalVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setPasswordModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setPasswordModalVisible(false)}>
                    <View style={styles.modalOverlay} />
                </TouchableWithoutFeedback>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity style={styles.closeButton} onPress={() => setPasswordModalVisible(false)}>
                            <Icon name="close" size={20} color='white' />
                        </TouchableOpacity>
                        <Text style={[styles.miniText, { fontWeight: 'bold', color: '#5d576b', textAlign: 'center', letterSpacing: 0, marginTop: 0, marginBottom: 20 }]}>Reset Transaction</Text>
                        <View style={styles.inputContainer}>
                            <Image source={require('../assets/image/key.jpg')} style={styles.modalImage} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter Password"
                                placeholderTextColor='#ccc'
                                value={password}
                                onChangeText={setPassword}
                                keyboardType='number-pad'
                                maxLength={4}
                                secureTextEntry={secureTextEntry}
                            />
                            <TouchableOpacity
                                style={styles.eyeButton}
                                onPress={() => setSecureTextEntry(!secureTextEntry)}
                            >
                                <IconFontAwesome
                                    name={secureTextEntry ? 'eye-slash' : 'eye'}
                                    size={20}
                                    color='black'
                                />
                            </TouchableOpacity>

                        </View>
                        <View>
                            <TouchableOpacity onPress={handlePasswordSubmit}>
                                <Text style={[styles.button, { marginBottom: 10 }]}>Submit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        </View >
    );
};

export default HomeScreen;
