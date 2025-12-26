// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
// REPLACE THIS WITH YOUR OWN FIREBASE CONFIG FROM FIREBASE CONSOLE
const firebaseConfig = {
    apiKey: "AIzaSyBbgLM72LMAvVv4ij85rrST28Xc4uKlGdg",
    authDomain: "battlevault-28df6.firebaseapp.com",
    projectId: "battlevault-28df6",
    storageBucket: "battlevault-28df6.firebasestorage.app",
    messagingSenderId: "883118498558",
    appId: "1:883118498558:web:5078ea924e036fd588fbaf",
    measurementId: "G-RV8PQ8XML7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
