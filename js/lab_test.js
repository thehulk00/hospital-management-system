import { db, auth } from "./firebase.js";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const doctorSelect = document.getElementById("doctorSelect");
const patientSelect = document.getElementById("patientSelect");

/* ================= LOAD DOCTORS ================= */
const loadDoctors = async () => {
  const snap = await getDocs(collection(db, "doctors"));
  snap.forEach(doc => {
    const d = doc.data();
    const option = document.createElement("option");
    option.value = doc.id;
    // We store the clean name in a data attribute to keep it separate from the display text
    option.setAttribute("data-name", d.name || "Dr. Unknown"); 
    option.textContent = `${d.name || "Dr. Unknown"} (${d.department || "General"})`;
    doctorSelect.appendChild(option);
  });
};

/* ================= LOAD PATIENTS ================= */
const loadPatients = async () => {
  const snap = await getDocs(collection(db, "patients"));
  patientSelect.innerHTML = `<option value="">Select Patient</option>`;

  snap.forEach(docSnap => {
    const data = docSnap.data();
    const option = document.createElement("option");
    option.value = docSnap.id;
    option.textContent = data.patientName || data.name || data.fullName || "Unnamed Patient";
    patientSelect.appendChild(option);
  });
};

loadDoctors();
loadPatients();

/* ================= SAVE LAB REQUEST ================= */
window.saveLabRequest = async function () {
  const patientId = patientSelect.value;
  const patientName = patientSelect.options[patientSelect.selectedIndex]?.text;
  
  const doctorId = doctorSelect.value;
  // FIX: Get the clean name (Dr. Smith) instead of the display name (Dr. Smith (General))
  const selectedDoctorOption = doctorSelect.options[doctorSelect.selectedIndex];
  const doctorName = selectedDoctorOption.getAttribute("data-name"); 

  const tests = document.getElementById("tests").value;
  const notes = document.getElementById("notes").value;
  const testDate = document.getElementById("requestDate").value;

  if (!patientId || !doctorId || !tests) {
    alert("Please fill in the Patient, Doctor, and Test details.");
    return;
  }

  try {
    // We add the record to "lab_requests"
    await addDoc(collection(db, "lab_requests"), {
      patientId,
      patientName,
      doctorId,      // Added doctorId for better data integrity
      doctorName,    // Now saved as "Dr. John Doe" (matches doctors collection)
      tests,
      notes,
      testDate,
      status: "pending",
      createdAt: serverTimestamp()
    });

    alert("Lab test requested successfully ✅");
    location.href = "../staff.html";
  } catch (err) {
    console.error("Error saving request:", err);
    alert("Error: " + err.message);
  }
};