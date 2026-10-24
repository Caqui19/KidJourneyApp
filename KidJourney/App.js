import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Nunito_400Regular, Nunito_700Bold } from '@expo-google-fonts/nunito';
import { Poppins_400Regular, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import Routes from './Routes';
import { AuthProvider } from './src/auth/AuthContext';

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Nunito_400Regular,
    Nunito_700Bold,
    Poppins_400Regular,
    Poppins_600SemiBold,
  });
  
  return (
    <AuthProvider>
      <NavigationContainer>
        <Routes fontsLoaded={fontsLoaded || Boolean(fontError)} />
      </NavigationContainer>
    </AuthProvider>
  );
}
