import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const phoneInput = document.getElementById("phone");
const nameInput = document.getElementById("name");

/* =========================
   🚫 INPUT CONTROL
========================= */

// Phone → only numbers, max 10 digits
phoneInput.addEventListener("input", function () {
  this.value = this.value.replace(/\D/g, "").slice(0, 10);
});

// Name → only letters + space
nameInput.addEventListener("input", function () {
  this.value = this.value.replace(/[^a-zA-Z\s]/g, "");
});

/* =========================
   📱 PHONE VALIDATION UI
========================= */

const phoneError = document.createElement("small");
phoneError.style.color = "red";
phoneError.style.display = "none";
phoneError.innerText = "Phone must be exactly 10 digits";
phoneInput.parentNode.appendChild(phoneError);

function validatePhone() {
  const phone = phoneInput.value.trim();

  if (phone.length !== 10) {
    phoneError.style.display = "block";
    phoneInput.style.borderColor = "red";
    return false;
  } else {
    phoneError.style.display = "none";
    phoneInput.style.borderColor = "#e2e8f0";
    return true;
  }
}

/* =========================
   💾 SAVE PATIENT
========================= */

window.savePatient = async function () {

  const name = nameInput.value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = phoneInput.value.trim();
  const gender = document.getElementById("gender").value;
  const age = document.getElementById("age").value.trim();

  if (!name || !email || !phone || !gender || !age) {
    alert("Please fill all fields");
    return;
  }

  // Phone validation
  if (!validatePhone()) {
    alert("Enter valid 10-digit phone number");
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