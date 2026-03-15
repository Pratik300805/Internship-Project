
if (typeof firebase === 'undefined') {
    throw new Error("Firebase SDK not loaded. Make sure you include firebase scripts.");
}

// Initialize only if not already initialized
if (!firebase.apps.length) {
    const firebaseConfig = {
        apiKey: "AIzaSyA6_lZ1rlvEeo5bcDMbGYL6DdIUZXr2FhA",
        authDomain: "pathfindr-fdb18.firebaseapp.com",
        projectId: "pathfindr-fdb18",
        storageBucket: "pathfindr-fdb18.firebasestorage.app",
        messagingSenderId: "1071674112230",
        appId: "1:1071674112230:web:2cb09cc9aa0fbe0b4a6327",
        measurementId: "G-BS62R7JJBZ"
    };
    
    firebase.initializeApp(firebaseConfig);
}

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();