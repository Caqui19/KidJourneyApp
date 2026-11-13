import React from 'react';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Nunito_400Regular, Nunito_700Bold } from '@expo-google-fonts/nunito';
import { Poppins_400Regular, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { StatusBar } from 'expo-status-bar';
import Routes from './Routes';
import { AuthProvider } from './src/auth/AuthContext';
import { TemaProvider, useTema } from './src/TemaContext';

function AppContent({ fontsLoaded }) {
  const { escuro, cores } = useTema();
  const temaNavegacao = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: cores.acento,
      background: cores.fundo,
      card: cores.cabecalho,
      text: cores.texto,
      border: cores.borda,
      notification: cores.perigo,
    },
  };

  return (
    <>
      <StatusBar style={escuro ? 'light' : 'dark'} />
      <NavigationContainer theme={temaNavegacao}>
        <Routes fontsLoaded={fontsLoaded} />
      </NavigationContainer>
    </>
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Nunito_400Regular,
    Nunito_700Bold,
    Poppins_400Regular,
    Poppins_600SemiBold,
  });
  
  return (
    <TemaProvider>
      <AuthProvider>
        <AppContent fontsLoaded={fontsLoaded || Boolean(fontError)} />
      </AuthProvider>
    </TemaProvider>
  );
}
