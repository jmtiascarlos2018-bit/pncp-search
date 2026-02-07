import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Configuração do Firebase usando variáveis de ambiente do Vite
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: "G-8RRMEH4SJW"
};

// Inicializa o Firebase apenas se as variáveis estiverem presentes
let app;
let db;
let analytics;

try {
    // Verifica se pelo menos a API Key está presente antes de inicializar
    if (firebaseConfig.apiKey) {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        analytics = getAnalytics(app);
        console.log("Firebase initialized successfully");
    }
} catch (error) {
    console.error("Error initializing Firebase:", error);
}

export { db };
