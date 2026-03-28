import { db } from "./firebase.js";
import { collection, query, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const tableBody = document.getElementById("opdTableBody");
let currentFilter = 'all';

// --- FILTER TOGGLE LOGIC ---
window.updateFilter = function(filterType, btn) {
    currentFilter = filterType;
    document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    loadOPDLive();
};

async function loadOPDLive() {
    tableBody.innerHTML = `<tr><td colspan="3" style="text-align:center; padding:30px;">Processing Sequential Data...</td></tr>`;

    try {
        const snap = await getDocs(collection(db, "opd_visits"));
        
        // Normalize "Now" to the very end of today for accurate comparison
        const now = new Date();
        const comparisonToday = new Date(now);
        comparisonToday.setHours(23, 59, 59, 999);

        let visitList = [];

        snap.forEach(docSnap => {
            const data = docSnap.data();
            const visitDateStr = data.visitDate || ""; // Expected YYYY-MM-DD
            
            // Normalize target date to midnight for "Date-only" comparison
            const targetDate = new Date(visitDateStr);
            targetDate.setHours(0, 0, 0, 0);
            
            let include = false;

            // --- ROLLING DATE FILTER LOGIC ---
            if (currentFilter === "all") {
                include = true;
            } else if (currentFilter === "week") {
                // Exactly 7 days ago from today
                const sevenDaysAgo = new Date(comparisonToday);
                sevenDaysAgo.setDate(comparisonToday.getDate() - 7);
                sevenDaysAgo.setHours(0, 0, 0, 0);
                if (targetDate >= sevenDaysAgo && targetDate <= comparisonToday) include = true;
            } else if (currentFilter === "month") {
                // Exactly 30 days ago from today
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
                visitList.push({ id: docSnap.id, ...data });
            }
        });

        // Sort Newest First
        visitList.sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate));

        // Render Table
        tableBody.innerHTML = "";
        visitList.forEach(data => {
            let rawDoc = data.doctorName || "N/A";
            let cleanDoc = rawDoc.toLowerCase().startsWith("dr.") ? rawDoc : `Dr. ${rawDoc}`;

            const row = document.createElement("tr");
            row.innerHTML = `
                <td style="color: #2563eb; font-weight: 700;">${data.visitDate || "-"}</td>
                <td style="font-weight: 600;">
                    <a href="visit_details.html?id=${data.id}" style="color: #1e293b; text-decoration: none; border-bottom: 1px dashed #cbd5e1;">
                        ${data.patientName || "-"}
                    </a>
                </td>
                <td>${cleanDoc}</td>
            `;
            tableBody.appendChild(row);
        });

        if (visitList.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="3" style="text-align:center; padding:30px; color:#64748b;">No records found for this period.</td></tr>`;
        }
    } catch (error) {
        console.error("Error loading OPD:", error);
        tableBody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:red;">Error loading data.</td></tr>`;
    }
}

// --- PREVIEW LOGIC (FIXED) ---
window.showReportPreview = function() {
    const tableBodyContent = document.getElementById("opdTableBody").innerHTML;
    const previewArea = document.getElementById("previewArea");
    
    // Check if data is loaded
    if (tableBodyContent.includes("Processing")) {
        alert("Please wait for data to load.");
        return;
    }

    // Build fresh content for the PDF engine
    previewArea.innerHTML = `
        <div id="pdf-content" style="padding: 20px; font-family: 'Inter', sans-serif; color: #1e293b;">
            <div style="text-align:center; margin-bottom:30px; border-bottom: 3px solid #2563eb; padding-bottom: 15px;">
                <h1 style="margin:0; color:#2563eb; font-size: 24px;">CITY HOSPITAL KOLHAPUR</h1>
                <p style="margin:5px 0; color:#1e293b; font-weight:700; font-size: 16px;">OPD Consultation Sequential Report</p>
                <p style="font-size:12px; color:#64748b;">Filter: ${currentFilter.toUpperCase()} | Generated: ${new Date().toLocaleString()}</p>
            </div>
            <table style="width:100%; border-collapse:collapse; text-align:left; font-size: 13px;">
                <thead>
                    <tr style="background:#f8fafc; border-bottom: 2px solid #e2e8f0;">
                        <th style="padding:12px; color:#64748b; text-transform:uppercase; font-size:10px;">Visit Date</th>
                        <th style="padding:12px; color:#64748b; text-transform:uppercase; font-size:10px;">Patient Name</th>
                        <th style="padding:12px; color:#64748b; text-transform:uppercase; font-size:10px;">Consulting Doctor</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableBodyContent}
                </tbody>
            </table>
        </div>
    `;

    // Clean up links for PDF
    const links = previewArea.querySelectorAll("a");
    links.forEach(a => {
        a.style.color = "black";
        a.style.textDecoration = "none";
        a.style.pointerEvents = "none";
        a.style.border = "none";
    });

    document.getElementById("reportModal").style.display = "block";
};

// --- PDF DOWNLOAD (FIXED) ---
window.generatePDF = function() {
    const element = document.getElementById("pdf-content");
    
    if (!element) {
        alert("Please click 'View & Print' first.");
        return;
    }

    const opt = {
        margin: [10, 10, 10, 10],
        filename: `OPD_Report_${currentFilter}_${new Date().toISOString().slice(0,10)}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
        console.log("PDF Downloaded");
    }).catch(err => {
        console.error("PDF Library Error:", err);
        alert("Direct download failed. Opening print window instead...");
        window.print();
    });
};

loadOPDLive();