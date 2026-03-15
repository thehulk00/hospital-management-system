import { auth, db } from "./firebase.js";

import {
collection,
addDoc,
getDocs,
serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


/* ===============================
   LOAD DOCTORS INTO DROPDOWN
================================ */

const doctorSelect = document.getElementById("doctorSelect");

async function loadDoctors(){

try{

doctorSelect.innerHTML = `<option value="">Select Doctor</option>`;

const snapshot = await getDocs(collection(db,"doctors"));

snapshot.forEach(docSnap =>{

const d = docSnap.data();

const option = document.createElement("option");

option.value = d.name;
option.dataset.department = d.department || "General";

option.textContent = `${d.name} (${d.department || "General"})`;

doctorSelect.appendChild(option);

});

}catch(error){

console.error("Error loading doctors:",error);

}

}

loadDoctors();


/* ===============================
   BOOK APPOINTMENT
================================ */

document
.getElementById("appointmentForm")
.addEventListener("submit", async (e)=>{

e.preventDefault();

const user = auth.currentUser;

if(!user){

alert("Session expired. Please login again.");
window.location.href="../index.html";
return;

}


/* GET FORM DATA */

const patientName = document.getElementById("patientName").value.trim();
const doctorName = doctorSelect.value;
const date = document.getElementById("date").value;
const timeSlot = document.getElementById("timeSlot").value;
const isEmergency = document.getElementById("isEmergency").checked;

const selectedOption = doctorSelect.selectedOptions[0];

const department = selectedOption
? selectedOption.dataset.department
: "General";


/* VALIDATION */

if(!patientName || !doctorName || !date || !timeSlot){

alert("Please fill all required fields");
return;

}


try{


/* SAVE APPOINTMENT */

await addDoc(collection(db,"appointments"),{

patientId:user.uid,
patientName,
doctorName,
department,
date,
timeSlot,
status:"Booked",
priority:isEmergency ? "Emergency" : "Normal",
createdAt:serverTimestamp()

});


alert("Appointment booked successfully 🎉");


/* RESET FORM */

document.getElementById("appointmentForm").reset();


/* ===============================
   REDIRECT BASED ON ROLE
================================ */

const role = localStorage.getItem("role");


switch(role){

case "patient":
window.location.href="../patient.html";
break;

case "doctor":
case "staff":
window.location.href="../staff.html";
break;

case "admin":
window.location.href="../admin.html";
break;

default:
window.location.href="../index.html";

}


}catch(error){

console.error("Error booking appointment:",error);

alert("Failed to book appointment. Please try again.");

}

});