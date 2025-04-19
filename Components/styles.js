import { StyleSheet } from 'react-native';

const commonStyles = {
    profileContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        overflow: 'hidden',
    },
    profile: {
        width: 45,
        height: 45,
        borderRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    headerNav: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        margin: 15,
    },
    headerIcons: {
        flexDirection: 'row',
        gap: 20,
    },
    toggleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    toggleText: {
        fontSize: 16,
        marginRight: 10,
    },
    box: {
        borderRadius: 10,
        height: 180,
        shadowColor: '#ccc',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    totalBalance: {
        fontSize: 35,
        fontWeight: '700',
        letterSpacing: 2,
    },
    miniText: {
        fontSize: 17,
        fontWeight: '500',
        marginHorizontal: 20,
        marginTop: 20,
        marginBottom: 5,
        letterSpacing: 1,
    },
    AddButton: {
        padding: 10,
        paddingHorizontal: 18,
        borderRadius: 10,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        padding: 20,
        borderRadius: 15,
        width: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center'
    },
    inputContainer: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        width: '100%',
        marginBottom: 20,
        alignItems: 'center',
    },
    input: {
        flex: 1,
        padding: 5,
        height: 40,
        borderColor: 'gray',
        borderWidth: 0,
        borderRadius: 5,
        padding: 10,
    },
    button: {
        backgroundColor: '#007BFF',
        color: 'white',
        padding: 15,
        borderRadius: 5,
        textAlign: 'center',
        fontWeight: 'bold',
        width: '100%',
        marginBottom: 20,
    },
    cardContainer: {
        flex: 1,
        borderRadius: 10,
        paddingVertical: 15,
        paddingHorizontal: 10,
        margin: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
        justifyContent: 'center',
        // alignItems: 'center',
    },
    cardText: {
        fontSize: 16,
        marginBottom: 0,
        paddingHorizontal: 5,
        paddingVertical: 5,
    },
};

export const createStyles = (isDarkMode) => StyleSheet.create({
    mainContainer: {
        backgroundColor: isDarkMode ? '#0c0e13' : '#efefef',
        flex: 1,
    },
    headerText: {
        color: isDarkMode ? 'white' : 'black',
        fontSize: 20,
        alignItems: 'center',
    },
    profileContainer: commonStyles.profileContainer,
    profile: {
        ...commonStyles.profile,
        shadowColor: isDarkMode ? '#fff' : '#000',
    },
    headerNav: commonStyles.headerNav,
    headerIcons: commonStyles.headerIcons,
    toggleContainer: commonStyles.toggleContainer,
    toggleText: {
        ...commonStyles.toggleText,
        color: isDarkMode ? 'white' : 'black',
    },
    box: {
        ...commonStyles.box,
        backgroundColor: isDarkMode ? '#1c1e25' : '#fff',
    },
    totalBalance: {
        ...commonStyles.totalBalance,
        color: isDarkMode ? 'white' : 'black',
    },
    miniText: {
        ...commonStyles.miniText,
        color: isDarkMode ? 'white' : '#b2b8c4',
    },
    salaryImage: commonStyles.salaryImage,
    AddButton: {
        ...commonStyles.AddButton,
        backgroundColor: isDarkMode ? '#2b61e3' : '#2b61e3',
    },
    modalContainer: commonStyles.modalContainer,
    modalContent: {
        ...commonStyles.modalContent,
        backgroundColor: isDarkMode ? '#3D4151' : '#ffffff',
    },
    modalTitle: {
        ...commonStyles.modalTitle,
        color: isDarkMode ? 'white' : 'black'
    },
    inputContainer: commonStyles.inputContainer,
    input: {
        ...commonStyles.input,
        color: isDarkMode ? 'white' : 'black'
    },
    button: {
        ...commonStyles.button,
        backgroundColor: isDarkMode ? 'red' : '#2b61e3',
    },
    modalImage: {
        width: 60,
        height: 60,
    },
    boxContainer: commonStyles.boxContainer,
    cardContainer: {
        ...commonStyles.cardContainer,
    },
    cardText: {
        ...commonStyles.cardText,
        color: isDarkMode ? 'white' : 'black',
    },
    cardIcon: {
        alignSelf: 'flex-start',
        marginBottom: 3
    },
    closeButton: {
        alignSelf: 'flex-end',
        backgroundColor: 'red',
        borderRadius: 20,
        padding: 1
    },
    eyeButton: {
        marginRight:10,
        borderRadius: 20,
        padding: 1
    },
    image: {
        width: 120,
        height: 120,
    },
    passInput:{
        borderColor: '#ccc',
        borderWidth: 1,
        color: isDarkMode ? 'white' : 'black',
        padding:7,
        borderRadius:10,
        marginBottom:20,
    }
    
});
