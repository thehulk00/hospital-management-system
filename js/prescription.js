import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ================= LOAD DOCTORS ================= */
const doctorSelect = document.getElementById("doctorSelect");

const loadDoctors = async () => {
  const snap = await getDocs(collection(db, "doctors"));
  snap.forEach(doc => {
    const d = doc.data();
    const option = document.createElement("option");
    option.value = doc.id;
    option.textContent = `${d.name} (${d.department})`;
    doctorSelect.appendChild(option);
  });
};

loadDoctors();

/* ================= SAVE PRESCRIPTION ================= */
window.savePrescription = async function () {
  const patientName = document.getElementById("patientName").value;
  const doctorId = doctorSelect.value;
  const doctorName = doctorSelect.options[doctorSelect.selectedIndex]?.text;
  const diagnosis = document.getElementById("diagnosis").value;
  const medicines = document.getElementById("medicines").value;
  const advice = document.getElementById("advice").value;
  const visitDate = document.getElementById("visitDate").value;

  if (!patientName || !doctorId || !diagnosis) {
    alert("Please fill required fields");
    return;
  }

  try {
    await addDoc(collection(db, "prescriptions"), {
      patientName,
      doctorId,
      doctorName,
      diagnosis,
      medicines,
      advice,
      visitDate,
      createdAt: serverTimestamp()
    });

    alert("Prescription saved successfully ✅");
    location.href = "../staff.html";
  } catch (err) {
    alert(err.message);
  }
};
