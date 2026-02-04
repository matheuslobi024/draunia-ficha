// ========== FIREBASE CONFIGURATION ==========

const firebaseConfig = {
    apiKey: "AIzaSyBJDULmnNKm6grQW4XVoPL8wvaAK5FAWFs",
    authDomain: "draunia-fichas.firebaseapp.com",
    projectId: "draunia-fichas",
    storageBucket: "draunia-fichas.firebasestorage.app",
    messagingSenderId: "224003343632",
    appId: "1:224003343632:web:4f819bdc910f1489b69195",
    measurementId: "G-46EL0VBL4W"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get references to services
const auth = firebase.auth();
const db = firebase.firestore();

// Enable offline persistence
db.enablePersistence().catch((err) => {
    if (err.code === 'failed-precondition') {
        console.log('Múltiplas abas abertas, persistência desabilitada');
    } else if (err.code === 'unimplemented') {
        console.log('Navegador não suporta persistência');
    }
});

console.log('🔥 Firebase inicializado!');
