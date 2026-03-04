import { auth, db } from "./firebase.js";
import { 
  collection, 
  query, 
  where, 
  getDocs 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const tableBody = document.getElementById("historyBody");

async function loadHistory() {
  const user = auth.currentUser;
  if (!user) return;

  // Query both collections based on the logged-in user's UID
  const qAppt = query(collection(db, "appointments"), where("patientId", "==", user.uid));
  const qLabs = query(collection(db, "lab_requests"), where("patientId", "==", user.uid));

  try {
    const [apptSnap, labSnap] = await Promise.all([getDocs(qAppt), getDocs(qLabs)]);
    tableBody.innerHTML = "";

    // 1. Render Appointments
    apptSnap.forEach(docSnap => {
      const data = docSnap.data();
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${data.doctorName || "-"}</td>
        <td>${data.date || "-"}</td>
        <td><span class="status-badge">${data.status || "Booked"}</span></td>
        <td>${data.admission || "Not Admitted"}</td>
        <td>${data.admittedAt ? data.admittedAt.toDate().toLocaleDateString() : "-"}</td>
        <td>${data.discharge || "Not Discharged"}</td>
        <td>Appointment Record</td> 
      `;
      tableBody.appendChild(row);
    });

    // 2. Render Lab Results
    labSnap.forEach(docSnap => {
      const data = docSnap.data();
      const row = document.createElement("tr");
      row.style.backgroundColor = "#f0f7ff"; // Light highlight for Lab rows
      row.innerHTML = `
        <td>${data.doctorName || "-"} (Lab)</td>
        <td>${data.requestDate || "-"}</td>
        <td style="color: ${data.status === 'completed' ? 'green' : '#d68910'}; font-weight: bold;">
          ${data.status.toUpperCase()}
        </td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td><strong>Tests: ${data.tests}</strong></td>
      `;
      tableBody.appendChild(row);
    });

  } catch (error) {
    console.error("Error loading history:", error);
  }
}

// Automatically load when user is authenticated
auth.onAuthStateChanged(user => {
  if (user) {
    loadHistory();
  } else {
    console.log("No user authenticated.");
  }
});
// Example for Appointments
apptSnap.forEach(docSnap => {
    const data = docSnap.data();
    const row = document.createElement("tr");
    
    // Set class based on status for the badge
    const statusClass = data.status === "Booked" ? "status-booked" : "status-completed";

    row.innerHTML = `
        <td data-label="Doctor"><strong>${data.doctorName || "-"}</strong></td>
        <td data-label="Date">${data.date || "-"}</td>
        <td data-label="Status"><span class="badge ${statusClass}">${data.status || "Booked"}</span></td>
        <td data-label="Admission">${data.admission || "Not Admitted"}</td>
        <td data-label="Admit Date">${data.admittedAt ? data.admittedAt.toDate().toLocaleDateString() : "-"}</td>
        <td data-label="Discharge">${data.discharge || "Not Discharged"}</td>
        <td data-label="Info"><small>Appointment Record</small></td>
    `;
    tableBody.appendChild(row);
});