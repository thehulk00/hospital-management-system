import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ================= LOAD PENDING LAB REQUESTS ================= */
const requestSelect = document.getElementById("requestSelect");

const loadRequests = async () => {
  const q = query(
    collection(db, "lab_requests"),
    where("status", "==", "pending")
  );

  const snap = await getDocs(q);

  snap.forEach(d => {
    const data = d.data();
    const option = document.createElement("option");
    option.value = d.id;
    option.textContent = `${data.patientName} – ${data.tests}`;
    requestSelect.appendChild(option);
  });
};

loadRequests();

/* ================= SAVE LAB REPORT ================= */
window.saveLabReport = async function () {
  const requestId = requestSelect.value;
  const results = document.getElementById("results").value;
  const remarks = document.getElementById("remarks").value;
  const reportDate = document.getElementById("reportDate").value;

  if (!requestId || !results) {
    alert("Please fill required fields");
    return;
  }

  try {
    // Get request data
    const reqSnap = await getDocs(
      query(collection(db, "lab_requests"), where("__name__", "==", requestId))
    );

    let reqData;
    reqSnap.forEach(doc => reqData = doc.data());

    // Save lab report
    await addDoc(collection(db, "lab_reports"), {
  patientId: reqData.patientId,   // 🔥 pull from request
  patientName: reqData.patientName,
  doctorName: reqData.doctorName,
  tests: reqData.tests,
  results,
  remarks,
  reportDate,
  status: "Completed",
  createdAt: serverTimestamp()
});


    // Update request status
    await updateDoc(doc(db, "lab_requests", requestId), {
      status: "completed"
    });

    alert("Lab report saved successfully ✅");
    location.href = "../staff.html";

  } catch (err) {
    alert(err.message);
  }
};
