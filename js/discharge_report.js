import { db } from "./firebase.js";
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const tableBody = document.getElementById("dischargeTable");
let currentFilter = 'all';

// --- FILTER LOGIC ---
window.updateFilter = function(filterType, btn) {
    currentFilter = filterType;
    document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById("filterLabel").innerText = btn.innerText;
    loadDischargeReport();
};

function formatDoctorName(name) {
    if (!name) return "No Doctor Assigned";
    let cleanName = name.replace(/dr\.?\s*/gi, "").trim();
    return `Dr. ${cleanName}`;
}

async function loadDischargeReport() {
    try {
        const q = query(collection(db, "discharge_summaries"), orderBy("dischargeDate", "desc"));
        const snapshot = await getDocs(q);
        tableBody.innerHTML = "";
        let count = 0;

        const now = new Date();
        const comparisonToday = new Date(now);
        comparisonToday.setHours(23, 59, 59, 999);

        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            const id = docSnap.id;
            const dateStr = data.dischargeDate || "";
            const targetDate = new Date(dateStr);
            targetDate.setHours(0, 0, 0, 0);

            let include = false;

            // --- ROLLING DATE FILTER ---
            if (currentFilter === "all") {
                include = true;
            } else if (currentFilter === "week") {
                const sevenDaysAgo = new Date(comparisonToday);
                sevenDaysAgo.setDate(comparisonToday.getDate() - 7);
                if (targetDate >= sevenDaysAgo && targetDate <= comparisonToday) include = true;
            } else if (currentFilter === "month") {
                const thirtyDaysAgo = new Date(comparisonToday);
                thirtyDaysAgo.setDate(comparisonToday.getDate() - 30);
                if (targetDate >= thirtyDaysAgo && targetDate <= comparisonToday) include = true;
            } else if (currentFilter === "year") {
                const oneYearAgo = new Date(comparisonToday);
                oneYearAgo.setFullYear(comparisonToday.getFullYear() - 1);
                if (targetDate >= oneYearAgo && targetDate <= comparisonToday) include = true;
            }

            if (include) {
                count++;
                const cleanDoctor = formatDoctorName(data.doctorName);
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td><a href="../patient_details.html?id=${id}" class="patient-link">${data.patientName || "Unknown"}</a></td>
                    <td>${cleanDoctor}</td>
                    <td style="font-weight:600;">${data.dischargeDate || "-"}</td>
                    <td><span class="badge">${data.diagnosis || "-"}</span></td>
                    <td style="color:#64748b; font-size:12px;">${data.treatment || "-"}</td>
                    <td style="color:#64748b; font-size:12px;">${data.advice || "-"}</td>
                `;
                tableBody.appendChild(row);
            }
        });

        document.getElementById("totalCount").innerText = count;
        if (count === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:30px; color:#64748b;">No discharge records found for this period.</td></tr>`;
        }
    } catch (error) {
        console.error("Error loading reports:", error);
    }
}

// --- PREVIEW LOGIC (NOW INCLUDES ADVICE) ---
window.openDischargePreview = function() {
    // We get the actual rows from the table
    const rows = document.querySelectorAll("#dischargeTable tr");
    const printArea = document.getElementById("printArea");

    if (rows.length === 0 || rows[0].innerText.includes("No discharge records")) {
        alert("No data available to print.");
        return;
    }

    // Build the table rows for the PDF manually to ensure all columns are included
    let tableBodyHtml = "";
    rows.forEach(row => {
        const cells = row.querySelectorAll("td");
        tableBodyHtml += `
            <tr>
                <td style="padding:8px; border:1px solid #ddd;">${cells[0].innerText}</td>
                <td style="padding:8px; border:1px solid #ddd;">${cells[1].innerText}</td>
                <td style="padding:8px; border:1px solid #ddd;">${cells[2].innerText}</td>
                <td style="padding:8px; border:1px solid #ddd;">${cells[3].innerText}</td>
                <td style="padding:8px; border:1px solid #ddd;">${cells[4].innerText}</td>
                <td style="padding:8px; border:1px solid #ddd;">${cells[5].innerText}</td>
            </tr>
        `;
    });

    printArea.innerHTML = `
        <div id="pdf-wrapper" style="padding:10px; font-family: 'Plus Jakarta Sans', sans-serif;">
            <div style="text-align:center; border-bottom: 3px solid #2563eb; padding-bottom: 15px; margin-bottom: 20px;">
                <h2 style="color:#2563eb; margin:0; text-transform:uppercase;">Hospital Discharge Summary Report</h2>
                <p style="margin:5px 0; color:#64748b; font-weight:600;">Statement Period: ${currentFilter.toUpperCase()}</p>
                <p style="font-size:11px; color:#94a3b8;">Report Generated: ${new Date().toLocaleString()}</p>
            </div>
            <table style="width:100%; border-collapse:collapse; font-size:10px;">
                <thead>
                    <tr style="background:#2563eb; color:white;">
                        <th style="padding:10px; border:1px solid #ddd; text-align:left;">Patient</th>
                        <th style="padding:10px; border:1px solid #ddd; text-align:left;">Doctor</th>
                        <th style="padding:10px; border:1px solid #ddd; text-align:left;">Date</th>
                        <th style="padding:10px; border:1px solid #ddd; text-align:left;">Diagnosis</th>
                        <th style="padding:10px; border:1px solid #ddd; text-align:left;">Treatment</th>
                        <th style="padding:10px; border:1px solid #ddd; text-align:left;">Advice</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableBodyHtml}
                </tbody>
            </table>
            <div style="margin-top:30px; font-size:10px; color:#64748b; text-align:right;">
                <p>Authorized Electronic Signature</p>
                <p>__________________________</p>
            </div>
        </div>
    `;

    document.getElementById("previewModal").style.display = 'block';
};
// --- PDF DOWNLOAD ---
window.downloadPDF = function() {
    const element = document.getElementById("pdf-wrapper");
    const opt = {
        margin: 10,
        filename: `Discharge_Report_${currentFilter}_${new Date().toISOString().slice(0,10)}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
        window.closeModal();
    });
};

loadDischargeReport();