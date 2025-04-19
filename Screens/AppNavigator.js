import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './HomeScreen';
import TransactionHistoryScreen from './TransactionHistoryScreen';
import { NavigationContainer } from '@react-navigation/native';
import { FunnelIcon } from 'react-native-heroicons/outline';
import { TouchableOpacity } from 'react-native';

const Stack = createStackNavigator();

const AppNavigator = () => (
    <NavigationContainer>
        <Stack.Navigator>
            <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }} />
            <Stack.Screen 
                name="TransactionHistoryScreen" 
                component={TransactionHistoryScreen}
                options={({ navigation }) => ({
                    headerTitle: 'History',
                })} 
            />
        </Stack.Navigator>
    </NavigationContainer>
);

export default AppNavigator;
