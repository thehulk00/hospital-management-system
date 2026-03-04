import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ================= LOAD DOCTORS ================= */
const doctorSelect = document.getElementById("doctorSelect");

const loadDoctors = async () => {
  const snap = await getDocs(collection(db, "doctors"));
  snap.forEach(d => {
    const data = d.data();
    const option = document.createElement("option");
    option.value = d.id;
    option.textContent = `${data.name} (${data.department})`;
    doctorSelect.appendChild(option);
  });
};

loadDoctors();

/* ================= SAVE ADMISSION ================= */
window.saveAdmission = async function () {

  const urlParams = new URLSearchParams(window.location.search);
  const appointmentId = urlParams.get("id");  // 🔥 IMPORTANT

  const patientName = document.getElementById("patientName").value;
  const doctorId = doctorSelect.value;
  const doctorName = doctorSelect.options[doctorSelect.selectedIndex]?.text;
  const ward = document.getElementById("ward").value;
  const bedNumber = document.getElementById("bedNumber").value;
  const reason = document.getElementById("reason").value;
  const admissionDate = document.getElementById("admissionDate").value;

  if (!patientName || !doctorId || !ward || !admissionDate) {
    alert("Please fill required fields");
    return;
  }

  try {

    /* 1️⃣ Save admission record */
    await addDoc(collection(db, "admissions"), {
      patientName,
      doctorId,
      doctorName,
      ward,
      bedNumber,
      reason,
      admissionDate,
      status: "Admitted",
      createdAt: serverTimestamp()
    });

    /* 2️⃣ Update appointment record */
    if (appointmentId) {
      await updateDoc(doc(db, "appointments", appointmentId), {
        admission: "Admitted",
        status: "Admitted",
        admittedAt: serverTimestamp()
      });
    }

    alert("Patient admitted successfully ✅");
    location.href = "../staff.html";

  } catch (err) {
    alert(err.message);
  }
};
