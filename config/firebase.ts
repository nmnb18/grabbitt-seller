// firebase.ts
import { initializeApp } from "firebase/app";
import {
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    getAuth,
    PhoneAuthProvider,
    RecaptchaVerifier,
    signInWithCredential,
    signInWithEmailAndPassword,
    signInWithPhoneNumber,
    updateProfile
} from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyD3dWHoeggbnETgpTC45ZfPSFuM6YUtkqo",
    authDomain: "grabbitt-aed50.firebaseapp.com",
    projectId: "grabbitt-aed50",
    storageBucket: "grabbitt-aed50.firebasestorage.app",
    messagingSenderId: "686996955331",
    appId: "1:686996955331:web:506ff599378f01503e8276",
    measurementId: "G-HRVBQ5B38Q",
};
// Initialize Firebase
const app = initializeApp(firebaseConfig, 'grabbitt');
const auth = getAuth(app);

export {
    auth, createUserWithEmailAndPassword, firebaseSignOut, PhoneAuthProvider, RecaptchaVerifier, signInWithCredential, signInWithEmailAndPassword, signInWithPhoneNumber, updateProfile
};

export default app;
