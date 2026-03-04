import { db } from "./firebase.js";
import { collection, getDocs, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const doctorSelect = document.getElementById("doctorSelect");

const loadDoctors = async () => {
    const snap = await getDocs(collection(db, "doctors"));
    snap.forEach(doc => {
        const d = doc.data();
        const option = document.createElement("option");
        option.value = doc.id;
        // Store clean name to avoid "Dr. Smith (General)" mismatch
        option.setAttribute("data-name", d.name); 
        option.textContent = `${d.name} (${d.department})`;
        doctorSelect.appendChild(option);
    });
};

window.saveOPD = async function () {
    const patientName = document.getElementById("patientName").value;
    const doctorId = doctorSelect.value;
    const selectedOption = doctorSelect.options[doctorSelect.selectedIndex];
    const doctorName = selectedOption.getAttribute("data-name"); 

    const symptoms = document.getElementById("symptoms").value;
    const bp = document.getElementById("bp").value;
    const temp = document.getElementById("temp").value;
    const visitDate = document.getElementById("visitDate").value;

    if (!patientName || !doctorId || !visitDate) {
        alert("Please fill required fields");
        return;
    }

    try {
        await addDoc(collection(db, "opd_visits"), {
            patientName,
            doctorId,
            doctorName, // Clean name saved here
            symptoms,
            bloodPressure: bp,
            temperature: temp,
            visitDate,
            createdAt: serverTimestamp()
        });
        alert("OPD Visit saved successfully ✅");
        location.href = "../staff.html";
    } catch (err) {
        alert(err.message);
    }
};

loadDoctors();