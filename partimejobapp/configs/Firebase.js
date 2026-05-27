import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyCeAeWejV2ENi5agjaLXn6RNa5FSEOMAC4",
    authDomain: "jobapp-eed63.firebaseapp.com",
    databaseURL: "https://jobapp-eed63-default-rtdb.firebaseio.com",
    projectId: "jobapp-eed63",
    storageBucket: "jobapp-eed63.firebasestorage.app",
    messagingSenderId: "579201000249",
    appId: "1:579201000249:web:151850771464760e3c7ee8",
    measurementId: "G-Z4G7CS6LSN"
};

export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export const database = getDatabase(app);