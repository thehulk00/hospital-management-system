import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

window.savePatient = async function () {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;
  const gender = document.getElementById("gender").value;
  const age = document.getElementById("age").value;

  if (!name || !email || !phone || !gender || !age) {
    alert("Please fill all fields");
    return;
  }

  try {
    await addDoc(collection(db, "patients"), {
      name,
      email,
      phone,
      gender,
      age: Number(age),
      createdAt: serverTimestamp()
    });

    alert("Patient registered successfully ✅");

    // clear form
    document.getElementById("name").value = "";
    document.getElementById("email").value = "";
    document.getElementById("phone").value = "";
    document.getElementById("gender").value = "";
    document.getElementById("age").value = "";

  } catch (err) {
    alert(err.message);
  }
};
