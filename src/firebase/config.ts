import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDr3pAJ6F4hep4KOswsRqiEIvuCM88nn6I",
    authDomain: "music-catalogue.firebaseapp.com",
    databaseURL: "https://music-catalogue.firebaseio.com",
    projectId: "music-catalogue",
    storageBucket: "music-catalogue.firebasestorage.app",
    messagingSenderId: "753644242179",
    appId: "1:753644242179:web:843a490d1fa0add6d05536"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
