import { db } from "../js/firebase.js"; // Adjust this path to your firebase.js location
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

async function fetchReportDetails() {
    // 1. Get the ID from the URL (?id=xxxx)
    const urlParams = new URLSearchParams(window.location.search);
    const reportId = urlParams.get('id');

    if (!reportId) {
        alert("No Report ID found.");
        return;
    }

    try {
        // 2. Fetch the specific document from the 'appointments' collection
        const docRef = doc(db, "appointments", reportId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();

            // 3. Update the HTML elements with database data
            document.getElementById("repPatientName").innerText = data.patientName || "N/A";
            document.getElementById("repDoctorName").innerText = data.doctorName || "N/A";
            document.getElementById("repStatus").innerText = data.status || "N/A";
            
            // Format Date
            if(data.date) {
                const dateObj = new Date(data.date);
                document.getElementById("repVisitDate").innerText = dateObj.toLocaleDateString('en-GB', {
                    day: '2-digit', month: 'short', year: 'numeric'
                });
            }

            // Optional fields
            document.getElementById("repAdmission").innerText = data.admissionDate || "—";
            document.getElementById("repDischarge").innerText = data.dischargeDate || "—";

        } else {
            console.log("No such document!");
            document.body.innerHTML = "<h2>Report not found in database.</h2>";
        }
    } catch (error) {
        console.error("Error fetching report:", error);
    }
}

// Run the function when the page loads
fetchReportDetails();