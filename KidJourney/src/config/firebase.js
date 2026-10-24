import { Platform } from 'react-native';
import { getApps, initializeApp } from 'firebase/app';
import {
    getAuth,
    getReactNativePersistence,
    initializeAuth,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCh5WDMu3jHoyQ3HzmBOnBaKBDVYusl7kw",
    authDomain: "kidjourney-3cc97.firebaseapp.com",
    databaseURL: "https://kidjourney-3cc97-default-rtdb.firebaseio.com",
    projectId: "kidjourney-3cc97",
    storageBucket: "kidjourney-3cc97.firebasestorage.app",
    messagingSenderId: "370542903917",
    appId: "1:370542903917:web:3b7319fce633575280b564",
    measurementId: "G-KJP4CCYTYW"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

let auth;

if (Platform.OS === 'web') {
    auth = getAuth(app);
} else {
    try {
        auth = initializeAuth(app, {
            persistence: getReactNativePersistence(AsyncStorage),
        });
    } catch (error) {
        if (error.code !== 'auth/already-initialized') {
            throw error;
        }

        auth = getAuth(app);
    }
}

const db = getFirestore(app);

export { auth, db };
