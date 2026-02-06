const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

let db = null;

try {
    let credential;

    // Opção 1: Credenciais via variáveis de ambiente (mais seguro para deploy)
    if (process.env.FIREBASE_PRIVATE_KEY) {
        credential = admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            // Corrige a formatação da chave privada vinda de env var
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        });
    } else {
        // Opção 2: Arquivo local (para desenvolvimento)
        // Certifique-se de que este arquivo esteja no .gitignore
        const serviceAccount = require('../serviceAccountKey.json');
        credential = admin.credential.cert(serviceAccount);
    }

    admin.initializeApp({
        credential: credential
    });

    db = admin.firestore();
    console.log('Firebase Admin Initialized successfully');
} catch (error) {
    console.error('Error initializing Firebase Admin:', error.message);
    // Não paramos o servidor se falhar; recursos que dependem do Firestore ficarão indisponíveis
}

module.exports = { admin, db };
