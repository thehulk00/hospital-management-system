import { auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  collection,
  addDoc,
  setDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

window.registerDoctor = async function () {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const phone = document.getElementById("phone").value;
  const department = document.getElementById("department").value;

  if (!name || !email || !password || !department) {
    alert("Please fill all required fields");
    return;
  }

  try {
    // 1️⃣ Create Auth account
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;

    // 2️⃣ Save role in users
    await setDoc(doc(db, "users", uid), {
      email,
      role: "doctor"
    });

    // 3️⃣ Save doctor details
    await addDoc(collection(db, "doctors"), {
      name,
      email,
      phone,
      department,
      role: "doctor",
      uid,
      createdAt: serverTimestamp()
    });

    alert("Doctor registered successfully ✅");
    location.href = "../staff.html";

  } catch (error) {
    alert(error.message);
  }
};
