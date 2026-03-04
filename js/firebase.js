// js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCkUlwlj80D8Lni1pfy_SphF9exsQ1-P8w",
  authDomain: "hms-firebase-1dae1.firebaseapp.com",
  projectId: "hms-firebase-1dae1",
  storageBucket: "hms-firebase-1dae1.appspot.com",
  messagingSenderId: "186671680927",
  appId: "1:186671680927:web:8e713b5cdec9dee064c1aa"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

console.log("🔥 Firebase initialized");
