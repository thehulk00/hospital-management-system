import { db } from "./firebase.js";
import { 
    collection, 
    getDocs, 
    updateDoc, 
    doc, 
    query, 
    where 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const listContainer = document.getElementById("appointmentList");
const todayDate = new Date().toISOString().split("T")[0];

/**
 * BULLETPROOF CLEANER
 * Removes all variations of "Dr" and ensures exactly one "Dr. " exists.
 */
function formatDoctorName(name) {
    if (!name) return "No Doctor Assigned";
    let cleanName = name.replace(/dr\.?\s*/gi, "").trim();
    return `Dr. ${cleanName}`;
}

async function loadTodayAppointments() {
    try {
        const q = query(collection(db, "appointments"), where("date", "==", todayDate));
        const snapshot = await getDocs(q);

        let total = 0, done = 0, pending = 0;
        listContainer.innerHTML = "";

        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            const id = docSnap.id;
            
            total++;
            data.status === "Completed" ? done++ : pending++;

            const displayDoctor = formatDoctorName(data.doctorName);

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>
                    <a href="patient_details.html?id=${id}" class="patient-link">
                        ${data.patientName}
                    </a>
                </td>
                <td>${displayDoctor}</td>
                <td>
                    <span class="status ${data.status === "Completed" ? "completed" : "pending"}">
                        ${data.status || "Pending"}
                    </span>
                </td>
                <td>
                    ${data.status !== "Completed" ? 
                    `<button class="btn btn-check" onclick="markDone('${id}')">Complete</button>` : 
                    `<span style="color:#10b981; font-weight:700;"><i class="fas fa-check-double"></i> Done</span>`}
                </td>
            `;
            listContainer.appendChild(row);
        });

        document.getElementById("statTotal").innerText = total;
        document.getElementById("statDone").innerText = done;
        document.getElementById("statPending").innerText = pending;

    } catch (err) { console.error("Load Error:", err); }
}

// 1. Mark Done Logic
window.markDone = async function(id) {
    try {
        await updateDoc(doc(db, "appointments", id), { status: "Completed" });
        loadTodayAppointments();
    } catch (err) { console.error("Update Error:", err); }
};

// 2. Open Preview Logic (Fixes the "Not Working" issue)
window.openReportPreview = function() {
    const printArea = document.getElementById("printArea");
    
    // Generate a clean HTML table for the modal
    let tableRows = "";
    const rows = listContainer.querySelectorAll("tr");
    
    rows.forEach(row => {
        const cells = row.querySelectorAll("td");
        tableRows += `
            <tr>
                <td style="padding:10px; border:1px solid #eee;">${cells[0].innerText}</td>
                <td style="padding:10px; border:1px solid #eee;">${cells[1].innerText}</td>
                <td style="padding:10px; border:1px solid #eee;">${cells[2].innerText}</td>
            </tr>
        `;
    });

    printArea.innerHTML = `
        <div style="text-align:center; margin-bottom:20px;">
            <h2 style="color:#6366f1; margin:0;">Daily Clinic Log</h2>
            <p style="color:#64748b; margin:5px 0;">Date: ${todayDate}</p>
        </div>
        <table style="width:100%; border-collapse:collapse; font-family:sans-serif;">
            <thead style="background:#f8fafc;">
                <tr>
                    <th style="padding:10px; border:1px solid #eee; text-align:left;">Patient</th>
                    <th style="padding:10px; border:1px solid #eee; text-align:left;">Doctor</th>
                    <th style="padding:10px; border:1px solid #eee; text-align:left;">Status</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows || '<tr><td colspan="3" style="text-align:center; padding:20px;">No appointments found.</td></tr>'}
            </tbody>
        </table>
    `;

    document.getElementById("previewModal").style.display = "block";
};

// 3. PDF Download Logic
window.downloadPDF = function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.setTextColor(99, 102, 241);
    doc.text("HMS PRO - Daily Schedule", 14, 20);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${todayDate}`, 14, 28);
    
    // AutoTable uses the table we have in the background or modal
    doc.autoTable({
        html: '#todayTableSource',
        startY: 35,
        columns: [0, 1, 2], // Only Patient, Doctor, Status
        headStyles: { fillColor: [99, 102, 241], fontStyle: 'bold' },
        theme: 'grid'
    });

    doc.save(`HMS_Log_${todayDate}.pdf`);
    document.getElementById("previewModal").style.display = "none";
};

// Initialize the page
loadTodayAppointments();