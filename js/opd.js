import { db } from "./firebase.js";
import {
collection,
getDocs,
addDoc,
serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


const doctorSelect = document.getElementById("doctorSelect");


/* ================= LOAD DOCTORS ================= */

const loadDoctors = async () => {

const snap = await getDocs(collection(db, "doctors"));

snap.forEach(doc => {

const d = doc.data();

const option = document.createElement("option");

option.value = doc.id;

/* store clean name to avoid "Dr. Smith (General)" mismatch */
option.setAttribute("data-name", d.name);

option.textContent = `${d.name} (${d.department})`;

doctorSelect.appendChild(option);

});

};



/* ================= SAVE OPD VISIT ================= */

window.saveOPD = async function () {

const patientName = document.getElementById("patientName").value;

const doctorId = doctorSelect.value;

const selectedOption = doctorSelect.options[doctorSelect.selectedIndex];

const doctorName = selectedOption ? selectedOption.getAttribute("data-name") : "";


/* external doctor (optional) */
const externalDoctor = document.getElementById("externalDoctor").value;


const symptoms = document.getElementById("symptoms").value;

const bp = document.getElementById("bp").value;

const temp = document.getElementById("temp").value;

const visitDate = document.getElementById("visitDate").value;


/* validation */

if (!patientName || !visitDate) {

alert("Please enter patient name and visit date");

return;

}


try {

await addDoc(collection(db, "opd_visits"), {

patientName,

doctorId: doctorId || "",

doctorName: doctorName || "",

externalDoctor: externalDoctor || "",

symptoms,

bloodPressure: bp,

temperature: temp,

visitDate,

createdAt: serverTimestamp()

});


alert("OPD Visit saved successfully ✅");

location.href = "../staff.html";

}

catch (err) {

alert(err.message);

}

};



/* initialize */

loadDoctors();