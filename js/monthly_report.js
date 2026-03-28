import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const tableBody = document.getElementById("monthlyTable");

async function loadMonthlyReport() {
    if (!tableBody) return;
    tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:50px; color:#64748b;">Crunching numbers...</td></tr>`;

    try {
        const snap = await getDocs(collection(db, "appointments"));
        const monthlyData = {};

        snap.forEach(doc => {
            const data = doc.data();
            const rawDate = data.date || data.appointmentDate; 
            
            if (rawDate) {
                const monthKey = rawDate.substring(0, 7); // Gets "YYYY-MM"

                if (!monthlyData[monthKey]) {
                    monthlyData[monthKey] = { total: 0, completed: 0 };
                }

                monthlyData[monthKey].total++;

                if (data.status?.toLowerCase() === "completed") {
                    monthlyData[monthKey].completed++;
                }
            }
        });

        tableBody.innerHTML = "";
        const sortedMonths = Object.keys(monthlyData).sort((a, b) => b.localeCompare(a));

        if (sortedMonths.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:30px;">No records found in database.</td></tr>`;
            return;
        }

        sortedMonths.forEach(monthKey => {
            const stats = monthlyData[monthKey];
            const rate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
            
            const [year, month] = monthKey.split("-");
            const dateObj = new Date(year, month - 1);
            const formattedMonth = dateObj.toLocaleString('default', { month: 'long', year: 'numeric' });

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>
                    <a href="../today_appointments.html?month=${monthKey}" class="month-link">
                        <i class="fas fa-calendar-alt"></i> ${formattedMonth}
                    </a>
                </td>
                <td><strong>${stats.total}</strong> Bookings</td>
                <td style="color:#059669; font-weight:700;">${stats.completed}</td>
                <td><span class="success-pill">${rate}% Success</span></td>
            `;
            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error("Firebase Error:", error);
        tableBody.innerHTML = `<tr><td colspan="4" style="color:red; text-align:center;">Database connection failed.</td></tr>`;
    }
}

// VIEW PREVIEW
window.openPreview = function() {
    const previewArea = document.getElementById("previewArea");
    let cleanRows = "";
    
    // Convert table rows to plain text for preview (no links)
    const rows = tableBody.querySelectorAll("tr");
    rows.forEach(r => {
        const cells = r.querySelectorAll("td");
        cleanRows += `
            <tr>
                <td style="padding:12px; border:1px solid #eee;">${cells[0].innerText}</td>
                <td style="padding:12px; border:1px solid #eee; text-align:center;">${cells[1].innerText}</td>
                <td style="padding:12px; border:1px solid #eee; text-align:center;">${cells[2].innerText}</td>
                <td style="padding:12px; border:1px solid #eee; text-align:center;">${cells[3].innerText}</td>
            </tr>
        `;
    });

    previewArea.innerHTML = `
        <div style="text-align:center; margin-bottom:20px;">
            <h2 style="color:#f59e0b; margin:0;">Monthly Performance Summary</h2>
            <p style="color:#64748b; font-size:13px;">City Hospital KOlhapur</p>
        </div>
        <table style="width:100%; border-collapse:collapse; font-size:13px;">
            <thead>
                <tr style="background:#fffbeb;">
                    <th style="padding:12px; border:1px solid #fde68a;">Month</th>
                    <th style="padding:12px; border:1px solid #fde68a;">Total</th>
                    <th style="padding:12px; border:1px solid #fde68a;">Completed</th>
                    <th style="padding:12px; border:1px solid #fde68a;">Success Rate</th>
                </tr>
            </thead>
            <tbody>${cleanRows}</tbody>
        </table>
    `;
    document.getElementById("previewModal").style.display = 'block';
};

// EXPORT PDF
window.downloadPDF = function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.setTextColor(245, 158, 11);
    doc.text("Monthly Analytics Report", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`City Hospital Kolhapur | Period: 2026 | Generated: ${new Date().toLocaleDateString()}`, 14, 28);

    doc.autoTable({
        html: "#monthlyReportTable",
        startY: 35,
        theme: 'striped',
        headStyles: { fillColor: [245, 158, 11] },
        styles: { halign: 'center' },
        columnStyles: { 0: { halign: 'left' } } 
    });

    doc.save(`HMS_Monthly_Analysis_${Date.now()}.pdf`);
};

loadMonthlyReport();