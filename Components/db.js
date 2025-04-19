import SQLite from 'react-native-sqlite-storage';

// Open database connection
const db = SQLite.openDatabase(
    { name: 'transactions.db', location: 'default' },
    () => console.log('Database opened'),
    error => console.log('Database error: ', error)
);

// Create table if not exists
const createTable = () => {
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
};

// Initialize the database
createTable();

export default db;
