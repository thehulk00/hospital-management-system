import { auth, db } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* =========================
   LOAD DOCTORS INTO DROPDOWN
========================= */
const doctorSelect = document.getElementById("doctorSelect");

async function loadDoctors() {
  try {
    doctorSelect.innerHTML = `<option value="">Select Doctor</option>`;
    const snapshot = await getDocs(collection(db, "doctors"));

    snapshot.forEach(docSnap => {
      const d = docSnap.data();
      const option = document.createElement("option");
      option.value = d.name;
      option.dataset.department = d.department || "General";
      option.textContent = `${d.name} (${d.department || "General"})`;
      doctorSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error loading doctors:", error);
  }
}

loadDoctors();

/* =========================
   BOOK APPOINTMENT
========================= */
document.getElementById("appointmentForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const user = auth.currentUser;
  if (!user) {
    alert("Session expired. Please login again.");
    return;
  }

  const patientName = document.getElementById("patientName").value.trim();
  const doctorName = doctorSelect.value;
  const date = document.getElementById("date").value;
  const isEmergency = document.getElementById("isEmergency").checked;

  // Safety check for department data
  const selectedOption = doctorSelect.selectedOptions[0];
  const department = selectedOption ? selectedOption.dataset.department : "General";

  if (!patientName || !doctorName || !date) {
    alert("Please fill all required fields");
    return;
  }

  try {
    // Save appointment with patientId for History tracking
    await addDoc(collection(db, "appointments"), {
      patientId: user.uid, // Links appointment to the logged-in user
      patientName,
      doctorName,
      department,
      date,
      status: "Booked",
      priority: isEmergency ? "Emergency" : "Normal",
      createdAt: serverTimestamp()
    });

    alert("Appointment booked successfully ✅");

    // Retrieve user role for redirection
    const userDoc = await getDoc(doc(db, "users", user.uid));
    
    if (userDoc.exists()) {
      const role = userDoc.data().role;
      console.log("Redirecting user with role:", role);

      switch (role) {
        case "patient":
          window.location.href = "../patient.html";
          break;
        case "doctor":
        case "staff":
          window.location.href = "../staff.html";
          break;
        case "admin":
          window.location.href = "../admin.html";
          break;
        default:
          window.location.href = "../index.html";
      }
    } else {
      window.location.href = "../index.html";
    }

  } catch (error) {
    console.error("Error booking appointment:", error);
    alert("Failed to book appointment: " + error.message);
  }
});