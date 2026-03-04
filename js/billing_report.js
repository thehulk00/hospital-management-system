import { db } from "./firebase.js";
import { collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const table = document.getElementById("billingTable");
let currentFilter = 'all';

// --- FILTER LOGIC ---
window.updateFilter = function(filterType, btn) {
    currentFilter = filterType;
    document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    loadBillingLive();
};

function loadBillingLive() {
    const q = query(collection(db, "billing"), orderBy("billingDate", "desc"));

    onSnapshot(q, (snapshot) => {
        table.innerHTML = "";
        
        const now = new Date();
        const comparisonToday = new Date(now);
        comparisonToday.setHours(23, 59, 59, 999);

        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            const bid = docSnap.id;
            const billingDateStr = data.billingDate || ""; 
            
            const targetDate = new Date(billingDateStr);
            targetDate.setHours(0, 0, 0, 0);
            
            let include = false;

            // --- ROLLING DATE FILTER LOGIC ---
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
                const status = (data.paymentStatus || "Pending").toLowerCase();
                const statusClass = status === 'paid' ? 'status-paid' : 'status-pending';
                
                // Doctor Name Clean
                let rawDoc = data.doctorName || "N/A";
                let cleanDoc = rawDoc.toLowerCase().startsWith("dr.") ? rawDoc : `Dr. ${rawDoc}`;

                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>
                        <a href="invoice_view.html?id=${bid}" class="patient-link" style="color: #2563eb; text-decoration: none; font-weight: 600;">
                            ${data.patientName || "Walk-in"}
                        </a>
                    </td>
                    <td>${cleanDoc}</td>
                    <td class="amount-cell" style="font-weight: 700;">₹ ${Number(data.totalAmount || 0).toLocaleString('en-IN')}</td>
                    <td>${data.paymentMethod || "Cash"}</td>
                    <td><span class="${statusClass}" style="padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 700;">${status.toUpperCase()}</span></td>
                    <td class="date-cell">${data.billingDate || "-"}</td>
                `;
                table.appendChild(row);
            }
        });

        if (table.innerHTML === "") {
            table.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 30px; color: #64748b;">No billing records found for this period.</td></tr>`;
        }
    });
}

// --- PREVIEW LOGIC (FIXED) ---
window.showBillingPreview = function() {
    const tableBodyContent = document.getElementById("billingTable").innerHTML;
    const printArea = document.getElementById("printArea");

    if (tableBodyContent.includes("No billing records")) {
        alert("No records to preview.");
        return;
    }

    printArea.innerHTML = `
        <div id="pdf-content" style="padding: 20px; font-family: 'Inter', sans-serif;">
            <div style="text-align:center; border-bottom:3px solid #2563eb; padding-bottom:15px; margin-bottom:20px;">
                <h1 style="margin:0; color:#2563eb; font-size: 22px;">CITY HOSPITAL FINANCIAL REPORT</h1>
                <p style="margin:5px 0; color:#64748b; font-weight: 600;">Statement Period: ${currentFilter.toUpperCase()}</p>
                <p style="font-size: 11px; color: #94a3b8;">Generated: ${new Date().toLocaleString()}</p>
            </div>
            <table style="width:100%; border-collapse:collapse; text-align:left; font-size: 12px;">
                <thead>
                    <tr style="background:#f8fafc; border-bottom: 2px solid #e2e8f0;">
                        <th style="padding:10px;">Patient</th>
                        <th style="padding:10px;">Consultant</th>
                        <th style="padding:10px;">Total Amount</th>
                        <th style="padding:10px;">Method</th>
                        <th style="padding:10px;">Status</th>
                        <th style="padding:10px;">Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableBodyContent}
                </tbody>
            </table>
        </div>
    `;

    // Remove blue links and icons for the PDF
    const links = printArea.querySelectorAll("a");
    links.forEach(a => { a.style.color = "black"; a.style.textDecoration = "none"; });

    document.getElementById("previewModal").style.display = "block";
};

// --- PDF GENERATION (FIXED) ---
window.generatePDF = function() {
    const element = document.getElementById("pdf-content");
    
    if (!element) {
        alert("Please preview the report first.");
        return;
    }

    const opt = {
        margin: 10,
        filename: `Financial_Report_${currentFilter}_2026.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
        document.getElementById("previewModal").style.display = "none";
    }).catch(err => {
        console.error("PDF Error:", err);
        window.print();
    });
};

loadBillingLive();