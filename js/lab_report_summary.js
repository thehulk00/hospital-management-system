import { db } from "./firebase.js";
import { 
    collection, query, orderBy, onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const table = document.getElementById("labTable");
let currentFilter = 'all';

// --- FILTER TOGGLE LOGIC ---
window.updateFilter = function(filterType, btn) {
    currentFilter = filterType;
    document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    loadReportsLive();
};

function loadReportsLive() {
    const q = query(collection(db, "lab_reports"), orderBy("reportDate", "desc"));

    onSnapshot(q, (snapshot) => {
        table.innerHTML = ""; 
        
        // Normalize "Now" to the very end of today
        const now = new Date();
        const comparisonToday = new Date(now);
        comparisonToday.setHours(23, 59, 59, 999);

        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            const docId = docSnap.id;
            const repDateStr = data.reportDate || ""; 
            
            // Normalize target date to midnight for date-only comparison
            const targetDate = new Date(repDateStr);
            targetDate.setHours(0, 0, 0, 0);
            
            let include = false;

            // --- ROLLING DATE FILTER LOGIC ---
            if (currentFilter === "all") {
                include = true;
            } else if (currentFilter === "week") {
                const sevenDaysAgo = new Date(comparisonToday);
                sevenDaysAgo.setDate(comparisonToday.getDate() - 7);
                sevenDaysAgo.setHours(0, 0, 0, 0);
                if (targetDate >= sevenDaysAgo && targetDate <= comparisonToday) include = true;
            } else if (currentFilter === "month") {
                const thirtyDaysAgo = new Date(comparisonToday);
                thirtyDaysAgo.setDate(comparisonToday.getDate() - 30);
                thirtyDaysAgo.setHours(0, 0, 0, 0);
                if (targetDate >= thirtyDaysAgo && targetDate <= comparisonToday) include = true;
            } else if (currentFilter === "sixMonths") {
                const sixMonthsAgo = new Date(comparisonToday);
                sixMonthsAgo.setMonth(comparisonToday.getMonth() - 6);
                if (targetDate >= sixMonthsAgo && targetDate <= comparisonToday) include = true;
            } else if (currentFilter === "year") {
                const oneYearAgo = new Date(comparisonToday);
                oneYearAgo.setFullYear(comparisonToday.getFullYear() - 1);
                if (targetDate >= oneYearAgo && targetDate <= comparisonToday) include = true;
            }

            if (include) {
                let rawDoc = data.doctorName || "-";
                let cleanDoc = rawDoc.toLowerCase().startsWith("dr.") ? rawDoc : `Dr. ${rawDoc}`;

                const row = document.createElement("tr");
                row.innerHTML = `
                    <td style="font-weight: 600;">
                        <a href="lab_details.html?id=${docId}" style="color: #0d9488; text-decoration: none;">
                            ${data.patientName || "-"}
                        </a>
                    </td>
                    <td>${cleanDoc}</td>
                    <td style="color: #64748b;">${data.tests || "-"}</td>
                    <td style="font-weight: bold; color: #0d9488;">${data.reportDate || "-"}</td>
                `;
                table.appendChild(row);
            }
        });

        if (table.innerHTML === "") {
            table.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:30px; color:#64748b;">No lab records found for this period.</td></tr>`;
        }
    });
}

// --- PREVIEW LOGIC (FIXED) ---
window.showLabPreview = function() {
    const tableBodyContent = document.getElementById("labTable").innerHTML;
    const previewArea = document.getElementById("previewArea");
    
    if (!tableBodyContent || tableBodyContent.includes("No lab records")) {
        alert("No data available to preview.");
        return;
    }

    // Build a clean, static container for the PDF tool
    previewArea.innerHTML = `
        <div id="pdf-content" style="padding: 20px; font-family: 'Inter', sans-serif;">
            <div style="text-align:center; margin-bottom:30px; border-bottom: 3px solid #0d9488; padding-bottom: 15px;">
                <h2 style="margin:0; color:#0d9488;">CITY HOSPITAL - LABORATORY SERVICES</h2>
                <p style="margin:5px 0; color:#64748b;">Daily Diagnostic Summary Report</p>
                <p style="font-size:12px;">Generated: ${new Date().toLocaleString()} | Filter: ${currentFilter.toUpperCase()}</p>
            </div>
            <table style="width:100%; border-collapse:collapse; text-align:left; font-size: 13px;">
                <thead>
                    <tr style="background:#f8fafc; border-bottom: 2px solid #e2e8f0;">
                        <th style="padding:12px;">Patient</th>
                        <th style="padding:12px;">Doctor</th>
                        <th style="padding:12px;">Tests Performed</th>
                        <th style="padding:12px;">Report Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableBodyContent}
                </tbody>
            </table>
        </div>
    `;

    // Clean up links for PDF look
    const links = previewArea.querySelectorAll("a");
    links.forEach(a => {
        a.style.color = "black";
        a.style.textDecoration = "none";
        a.style.pointerEvents = "none";
    });

    document.getElementById("reportModal").style.display = "block";
};

// --- PDF GENERATION (FIXED) ---
window.generatePDF = function() {
    const element = document.getElementById("pdf-content");
    
    if (!element) {
        alert("Please click 'View & Print' first.");
        return;
    }

    const opt = {
        margin: 10,
        filename: `LabSummary_${currentFilter}_${new Date().toISOString().slice(0,10)}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
        closeModal();
    }).catch(err => {
        console.error("PDF Error:", err);
        window.print(); // Reliable fallback
    });
};

loadReportsLive();