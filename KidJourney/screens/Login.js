import { View, Text, TouchableOpacity, TextInput, Alert, StyleSheet } from 'react-native';
import React, { useState } from 'react';

export default function LoginScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => { navigation.navigate('Esqueceu'); }}>
                <Text>Go to Esqueceu a Senha</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
    }
});