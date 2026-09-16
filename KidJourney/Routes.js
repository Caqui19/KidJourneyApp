import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './screens/Login';
import SignupScreen from './screens/Signup';
import EsqueceuScreen from './screens/Esqueceu';

const Stack = createNativeStackNavigator();

export default function Routes() {
    return (
        <Stack.Navigator initialRouteName="Signup" screenOptions={{ headerShown: false, }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="Esqueceu" component={EsqueceuScreen} />
        </Stack.Navigator>
    );
}