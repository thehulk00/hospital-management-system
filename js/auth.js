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

const cred = await signInWithEmailAndPassword(auth,email,password);
const uid = cred.user.uid;
/* CHECK PATIENTS FIRST */
let snap = await getDoc(doc(db,"patients",uid));

if(snap.exists()){

const role = snap.data().role;

localStorage.setItem("role",role);

// redirect to patient dashboard
location.href="./patient.html";

return;

}

/* CHECK STAFF / DOCTORS */
snap = await getDoc(doc(db,"users",uid));

if(snap.exists()){

const role = snap.data().role;

localStorage.setItem("role",role);

if(role === "admin"){
location.href="admin.html";
}
else if(role === "doctor"){
location.href="staff.html";
}
else if(role === "staff"){
location.href="staff.html";
}

return;
}

/* CHECK ADMINS */
snap = await getDoc(doc(db,"users",uid));

if(snap.exists()){

const role = snap.data().role;

if(role === "admin"){
location.href="admin.html";
return;
}

}

alert("No role assigned. Contact admin.");

} catch(err){

alert(err.message);

}

};


/* ================= LOGOUT ================= */
window.logout = async function () {
  await signOut(auth);
  location.href = "index.html";
};
