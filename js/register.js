import { auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const registerBtn = document.getElementById("registerBtn");

registerBtn.addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Please fill all fields");
    return;
  }

  try {
    // 1️⃣ Create user in Firebase AUTH
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCred.user;

    // 2️⃣ Save user in Firestore
    await setDoc(doc(db, "users", user.uid), {
      email: email,
      role: "patient",
      createdAt: serverTimestamp()
    });

    alert("Registration successful 🎉");
    window.location.href = "index.html";

  } catch (error) {
    alert(error.message);
    console.error(error);
  }
});
