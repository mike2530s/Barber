// FASE 2: Configuración de Firebase Client
// Este archivo inicializa la conexión con Firebase Firestore

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Configuración de Firebase usando variables de entorno públicas
const firebaseConfig = {
    apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
    authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.PUBLIC_FIREBASE_APP_ID,
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firestore
export const db = getFirestore(app);

// Exportar la app para otros usos si es necesario
export default app;
