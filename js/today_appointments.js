import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const tableBody = document.getElementById("appointmentsTable");
const urlParams = new URLSearchParams(window.location.search);
const filterMonth = urlParams.get('month');

async function loadAppointments() {
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:50px;">Organizing Sequence...</td></tr>`;
    
    try {
        const snap = await getDocs(collection(db, "appointments"));
        const today = new Date().toISOString().split('T')[0];
        let appointmentList = [];

        snap.forEach(docSnap => {
            const data = docSnap.data();
            const id = docSnap.id;
            const appDate = data.date || data.appointmentDate || "";
            const appTime = data.time || "00:00";

            // Monthly vs Today Filter
            if (filterMonth) {
                if (!appDate.startsWith(filterMonth)) return;
                document.getElementById("filterIndicator").style.display = "flex";
                document.getElementById("filterText").innerText = `Viewing Month: ${filterMonth}`;
            } else {
                if (appDate !== today) return;
            }

            appointmentList.push({ id, ...data, appDate, appTime });
        });

        // SORT SEQUENCE-WISE (Date then Time)
        appointmentList.sort((a, b) => {
            const dateA = new Date(`${a.appDate}T${a.appTime}`);
            const dateB = new Date(`${b.appDate}T${b.appTime}`);
            return dateA - dateB;
        });

        tableBody.innerHTML = "";
        appointmentList.forEach(item => {
            const statusClass = (item.status?.toLowerCase() === 'completed') ? 'status-completed' : 'status-pending';

            const row = document.createElement("tr");
            row.innerHTML = `
                <td><strong>${item.appDate}</strong><br><small style="color:#2563eb;">${item.appTime}</small></td>
                <td>
                    <a href="patient_details.html?id=${item.id}" class="patient-link">
                        ${item.patientName}
                    </a>
                </td>
                <td>Dr. ${item.doctorName.replace(/dr\.?\s*/gi, "")}</td>
                <td>${item.department || "General"}</td>
                <td><span class="badge ${statusClass}">${item.status || 'Pending'}</span></td>
            `;
            tableBody.appendChild(row);
        });

        if (appointmentList.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:40px;">No appointments for this selection.</td></tr>`;
        }
    } catch (e) {
        console.error(e);
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red;">Database Error.</td></tr>`;
    }
}

// VIEW PREVIEW (RETAINS LOOK BUT REMOVES ACTIVE LINKS FOR CLEANER PRINT)
window.openAppointmentPreview = function() {
    const previewArea = document.getElementById("previewArea");
    const headerTitle = filterMonth ? `Archive Report: ${filterMonth}` : "Today's Clinical Schedule";
    
    // We clone the table body text so links don't distract in the preview
    let rowsHtml = "";
    const rows = tableBody.querySelectorAll("tr");
    rows.forEach(row => {
        const cells = row.querySelectorAll("td");
        rowsHtml += `
            <tr>
                <td>${cells[0].innerText}</td>
                <td style="font-weight:700;">${cells[1].innerText}</td>
                <td>${cells[2].innerText}</td>
                <td>${cells[3].innerText}</td>
                <td>${cells[4].innerText}</td>
            </tr>
        `;
    });

    previewArea.innerHTML = `
        <div style="text-align:center; border-bottom: 2px solid #2563eb; padding-bottom:15px; margin-bottom:20px;">
            <h2 style="color:#2563eb; margin:0;">${headerTitle}</h2>
            <p style="color:#64748b; margin:5px 0;">Official Hospital Document | HMS PRO System</p>
        </div>
        <table>
            <thead>
                <tr>
                    <th>Schedule</th>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Dept</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
        </table>
    `;
    document.getElementById("previewModal").style.display = 'block';
};

// DOWNLOAD PDF
window.downloadAppointmentPDF = function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    doc.setFontSize(18);
    doc.setTextColor(37, 99, 235);
    doc.text("HMS Appointment Schedule", 14, 20);
    
    doc.autoTable({
        html: '#mainTable',
        startY: 30,
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235] },
        styles: { fontSize: 9 }
    });
    
    doc.save(`HMS_Schedule_${Date.now()}.pdf`);
};

loadAppointments();