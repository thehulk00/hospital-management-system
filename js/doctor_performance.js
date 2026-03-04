import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

async function loadDoctorReport() {
    const tableBody = document.getElementById("doctorTable");
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:40px;">Crunching Data...</td></tr>`;

    try {
        const [docsSnap, apptSnap, opdSnap, labSnap] = await Promise.all([
            getDocs(collection(db, "doctors")),
            getDocs(collection(db, "appointments")),
            getDocs(collection(db, "opd_visits")),
            getDocs(collection(db, "lab_reports"))
        ]);

        const appointments = apptSnap.docs.map(d => d.data());
        const opdVisits = opdSnap.docs.map(d => d.data());
        const labRequests = labSnap.docs.map(d => d.data());

        tableBody.innerHTML = "";

        docsSnap.forEach(docSnap => {
            const dr = docSnap.data();
            const drId = docSnap.id;
            const drName = dr.name || "Unknown Doctor";
            
            // Logic to match names across collections
            const clean = (s) => s ? s.toString().toLowerCase().replace(/^dr\.?\s*/, "").trim() : "";
            const target = clean(drName);
            const isMatch = (record) => Object.values(record).some(v => clean(v) === target);

            const drAppts = appointments.filter(isMatch);
            const completed = drAppts.filter(a => ["completed", "done"].includes(a.status?.toLowerCase())).length;
            const opdCount = opdVisits.filter(isMatch).length;
            const labCount = labRequests.filter(isMatch).length;

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>
                    <a href="doctor_details.html?id=${drId}" class="dr-link">
                        <i class="fas fa-user-circle"></i>
                        ${drName.startsWith("Dr.") ? drName : "Dr. " + drName}
                    </a>
                </td>
                <td align="center"><span class="metric-badge">${drAppts.length}</span></td>
                <td align="center">${completed}</td>
                <td align="center">${opdCount}</td>
                <td align="center">${labCount}</td>
            `;
            tableBody.appendChild(row);
        });
    } catch (e) {
        tableBody.innerHTML = `<tr><td colspan="5" style="color:red; text-align:center;">Error: ${e.message}</td></tr>`;
    }
}

window.showPerformancePreview = function() {
    const content = document.getElementById("performanceTableMain").outerHTML;
    document.getElementById("previewArea").innerHTML = `
        <div style="text-align:center; border-bottom:2px solid #4f46e5; padding-bottom:15px; margin-bottom:20px;">
            <h2 style="margin:0; color:#4f46e5;">HMS PERFORMANCE REPORT 2026</h2>
            <p style="margin:5px 0; color:#64748b;">Generated on: ${new Date().toLocaleString()}</p>
        </div>
        ${content}
    `;
    document.getElementById("reportModal").style.display = "block";
};

window.generatePDF = function() {
    const element = document.getElementById("previewArea");
    html2pdf().set({
        margin: 10,
        filename: 'Staff_Performance_Summary.pdf',
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).from(element).save().then(() => closeModal());
};

loadDoctorReport();