import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Nunito_400Regular, Nunito_700Bold } from '@expo-google-fonts/nunito';
import { Poppins_400Regular, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { View, ActivityIndicator } from 'react-native';
import Routes from './Routes';

export default function App() {
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_700Bold,
    Poppins_400Regular,
    Poppins_600SemiBold,
  });
  
  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Routes />
    </NavigationContainer>
  );
}