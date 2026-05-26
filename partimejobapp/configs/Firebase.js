import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyCeAeWejV2ENi5agjaLXn6RNa5FSEOMAC4",
    authDomain: "jobapp-eed63.firebaseapp.com",
    databaseURL: "https://jobapp-eed63-default-rtdb.firebaseio.com",
    projectId: "jobapp-eed63",
    storageBucket: "jobapp-eed63.firebasestorage.app",
    messagingSenderId: "579201000249",
    appId: "1:579201000249:web:151850771464760e3c7ee8",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export const database = getDatabase(app);