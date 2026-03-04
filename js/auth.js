import { auth, db } from "./firebase.js";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ================= REGISTER (PATIENT ONLY) ================= */
window.register = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    // PATIENT ONLY
    await setDoc(doc(db, "users", cred.user.uid), {
      email,
      role: "patient"
    });

    alert("Patient registered successfully ✅");
    location.href = "index.html";
  } catch (err) {
    alert(err.message);
  }
};

/* ================= LOGIN ================= */
window.login = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const snap = await getDoc(doc(db, "users", cred.user.uid));

    if (!snap.exists()) {
      alert("No role assigned. Contact admin.");
      return;
    }

    const role = snap.data().role;
    console.log("Patient role from Firestore:", role);

    localStorage.removeItem("role");   // clean old junk
localStorage.setItem("role", role);


    if (role === "patient") {
      location.href = "patient.html";
    } 
    else if (role === "doctor" || role === "staff") {
      location.href = "staff.html";
    } 
    else if (role === "admin") {
      location.href = "admin.html";
    }
  } catch (err) {
    alert(err.message);
  }
};


/* ================= LOGOUT ================= */
window.logout = async function () {
  await signOut(auth);
  location.href = "index.html";
};
