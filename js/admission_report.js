import { db } from "./firebase.js";
import { 
  collection, query, orderBy, onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const table = document.getElementById("admissionTable");
let currentFilter = 'all';

// --- FILTER LOGIC ---
window.updateFilter = function(filterType, btn) {
    currentFilter = filterType;
    document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    loadAdmissionsLive();
};

function loadAdmissionsLive() {
  const admRef = collection(db, "admissions");
  const q = query(admRef, orderBy("admissionDate", "desc"));

  onSnapshot(q, (snapshot) => {
    table.innerHTML = "";
    
    // Normalize "Now" to end of today
    const now = new Date();
    const comparisonToday = new Date(now);
    comparisonToday.setHours(23, 59, 59, 999);

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const docId = docSnap.id;
      const admDateStr = data.admissionDate || ""; // Expected YYYY-MM-DD
      
      const targetDate = new Date(admDateStr);
      targetDate.setHours(0,0,0,0);
      
      let include = false;

      // --- ROLLING DATE FILTER LOGIC ---
      if (currentFilter === "all") {
          include = true;
      } else if (currentFilter === "week") {
          const sevenDaysAgo = new Date(comparisonToday);
          sevenDaysAgo.setDate(comparisonToday.getDate() - 7);
          sevenDaysAgo.setHours(0,0,0,0);
          if (targetDate >= sevenDaysAgo && targetDate <= comparisonToday) include = true;
      } else if (currentFilter === "month") {
          const thirtyDaysAgo = new Date(comparisonToday);
          thirtyDaysAgo.setDate(comparisonToday.getDate() - 30);
          thirtyDaysAgo.setHours(0,0,0,0);
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
            <td style="font-weight:600;">
                <a href="admission_details.html?id=${docId}" style="color: #2563eb; text-decoration: none;">
                    ${data.patientName || "-"}
                </a>
            </td>
            <td>${cleanDoc}</td>
            <td>
                <span style="color:#64748b;">${data.ward || "-"}</span> / 
                <strong>${data.bedNumber || "-"}</strong>
            </td>
            <td class="date-text">${data.admissionDate || "-"}</td>
            <td><span class="status-badge">${data.status || "Active"}</span></td>
          `;
          table.appendChild(row);
      }
    });

    if (table.innerHTML === "") {
        table.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:30px; color:#64748b;">No records found for this period.</td></tr>`;
    }
  });
}

// --- PREVIEW LOGIC (FIXED) ---
window.showAdmissionPreview = function() {
    const tableBodyContent = document.getElementById("admissionTable").innerHTML;
    const previewArea = document.getElementById("previewArea");
    
    if (!tableBodyContent || tableBodyContent.includes("No records")) {
        alert("No data available to preview.");
        return;
    }

    previewArea.innerHTML = `
        <div id="pdf-content" style="padding: 20px; font-family: 'Inter', sans-serif;">
            <div style="text-align:center; margin-bottom:30px; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
                <h2 style="margin:0; color:#2563eb;">CITY HOSPITAL KOLHAPUR- INPATIENT RECORD</h2>
                <p style="margin:5px 0; color:#64748b;">Daily Admission Summary Report</p>
                <p style="font-size:12px;">Generated: ${new Date().toLocaleString()} | Filter: ${currentFilter.toUpperCase()}</p>
            </div>
            <table style="width:100%; border-collapse:collapse; text-align:left; font-size: 12px;">
                <thead>
                    <tr style="background:#f8fafc; border-bottom: 2px solid #e2e8f0;">
                        <th style="padding:10px;">Patient</th>
                        <th style="padding:10px;">Doctor</th>
                        <th style="padding:10px;">Ward/Bed</th>
                        <th style="padding:10px;">Admission Date</th>
                        <th style="padding:10px;">Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableBodyContent}
                </tbody>
            </table>
        </div>
    `;

    // Visual cleanup for PDF
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
        filename: `Admissions_${currentFilter}_${new Date().toISOString().slice(0,10)}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
        document.getElementById("reportModal").style.display = "none";
    }).catch(err => {
        console.error("PDF Error:", err);
        window.print();
    });
};

loadAdmissionsLive();