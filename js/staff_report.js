import { db } from "./firebase.js";
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const tableBody = document.getElementById("staffTableBody");

async function loadStaffData() {
    try {
        const q = query(collection(db, "staff"), orderBy("name", "asc"));
        const snapshot = await getDocs(q);
        
        const depts = new Set();
        tableBody.innerHTML = "";

        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            const sid = docSnap.id;
            if(data.department) depts.add(data.department);

            const row = document.createElement("tr");
            row.innerHTML = `
                <td><a href="staff_details.html?id=${sid}" class="staff-link">${data.name || "N/A"}</a></td>
                <td><span class="role-pill">${data.role || "Staff"}</span></td>
                <td>${data.department || "General"}</td>
                <td><strong>${data.shift || "Morning"}</strong></td>
                <td style="color: #64748b;">${data.email || "-"}</td>
            `;
            tableBody.appendChild(row);
        });

        // Update Stats
        document.getElementById("countTotal").innerText = snapshot.size;
        document.getElementById("countDepts").innerText = depts.size;

    } catch (err) {
        console.error("Load Error:", err);
    }
}

window.openStaffPreview = function() {
    const tableHTML = document.getElementById("mainStaffTable").outerHTML;
    document.getElementById("printArea").innerHTML = `
        <div style="text-align:center; border-bottom:3px solid #2563eb; padding-bottom:15px; margin-bottom:20px;">
            <h1 style="margin:0; color:#2563eb; font-size:24px;">HMS PRO STAFF DIRECTORY</h1>
            <p style="margin:5px 0; color:#64748b;">Generated on: ${new Date().toLocaleDateString()}</p>
        </div>
        ${tableHTML}
    `;
    document.getElementById("previewModal").style.display = "block";
};

window.downloadStaffPDF = function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setTextColor(37, 99, 235);
    doc.text("Official Staff Report - HMS PRO", 14, 20);

    doc.autoTable({
        html: "#mainStaffTable",
        startY: 30,
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235] },
        // Clean up the table for PDF (remove link styling)
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 0) {
                data.cell.styles.textColor = [0, 0, 0];
                data.cell.styles.fontStyle = 'bold';
            }
        }
    });

    doc.save("HMS_Staff_Report.pdf");
    closeModal();
};

loadStaffData();