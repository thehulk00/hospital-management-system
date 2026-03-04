import { auth, db } from "./firebase.js";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const tableBody = document.getElementById("appointmentsBody");

/* =========================
   WAIT FOR AUTH
========================= */
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    alert("Please login again");
    window.location.href = "../index.html";
    return;
  }

  loadAppointments(user.uid);
});

/* =========================
   LOAD USER APPOINTMENTS
========================= */
async function loadAppointments(patientId) {
  tableBody.innerHTML = `<tr><td colspan="3">Loading...</td></tr>`;

  try {
   const q = query(
  collection(db, "appointments"),
  where("patientId", "==", patientId)
);


    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      tableBody.innerHTML = `<tr><td colspan="3">No appointments found</td></tr>`;
      return;
    }

    tableBody.innerHTML = "";

    snapshot.forEach(doc => {
      const a = doc.data();

      const row = `
        <tr>
          <td>${a.doctorName}</td>
          <td>${a.date}</td>
          <td>
            <span class="status">${a.status}</span>
          </td>
        </tr>
      `;

      tableBody.innerHTML += row;
    });

  } catch (error) {
    console.error("Error loading appointments:", error);
    tableBody.innerHTML = `<tr><td colspan="3">Error loading data</td></tr>`;
  }
}
