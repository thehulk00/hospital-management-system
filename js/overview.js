console.log("✅ overview.js loaded");

import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

async function loadOverview() {
  console.log("📊 Loading overview data...");

  const patientEl = document.querySelector("#patientCount");
  const appointmentEl = document.querySelector("#appointmentCount");
  const doctorEl = document.querySelector("#doctorCount");
  const labEl = document.querySelector("#labCount");

  if (!patientEl || !appointmentEl || !doctorEl || !labEl) {
    console.error("❌ Overview elements missing in HTML");
    return;
  }

  const patients = await getDocs(collection(db, "patients"));
  const appointments = await getDocs(collection(db, "appointments"));
  const doctors = await getDocs(collection(db, "doctors"));
  const labs = await getDocs(collection(db, "lab_reports"));

  patientEl.textContent = patients.size;
  appointmentEl.textContent = appointments.size;
  doctorEl.textContent = doctors.size;
  labEl.textContent = labs.size;

  console.log("✅ Overview data loaded");
}

// wait for DOM + module safety
window.addEventListener("load", loadOverview);
