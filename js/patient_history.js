import { auth, db } from "./firebase.js";
import { 
    collection, 
    getDocs, 
    query, 
    orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const tableBody = document.getElementById("historyTableBody");

/**
 * Listens for Auth state and populates the table
 * For Staff/Admin view: we fetch all records from the 'appointments' collection
 */
auth.onAuthStateChanged(async (user) => {
    if (!user) {
        // Redirect to login if session is lost
        window.location.href = "../index.html"; 
        return;
    }

    // Show a clean loading state
    tableBody.innerHTML = `
        <tr>
            <td colspan="6" style="text-align:center; padding: 40px; color: #64748b;">
                <i class="fas fa-spinner fa-spin"></i> Fetching medical records...
            </td>
        </tr>
    `;

    try {
        // We query all appointments, ordered by date (newest first)
        const appointmentsRef = collection(db, "appointments");
        const q = query(appointmentsRef, orderBy("date", "desc"));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center; padding: 40px; color: #64748b;">
                        No patient records found in the database.
                    </td>
                </tr>
            `;
            return;
        }

        // Clear the loading row
        tableBody.innerHTML = "";

        snapshot.forEach(doc => {
            const data = doc.data();
            const row = document.createElement("tr");

            // Format Date safely
            const formattedDate = data.date 
                ? new Date(data.date).toLocaleDateString('en-GB', {
                    day: '2-digit', month: 'short', year: 'numeric'
                  })
                : "—";

            // Determine Status Badge Class
            const status = data.status ? data.status.toLowerCase() : "booked";
            
            // Build Row HTML
            row.innerHTML = `
                <td style="font-weight: 600; color: #1e293b;">${data.patientName || "Unknown"}</td>
                <td>${data.doctorName || "General Staff"}</td>
                <td>${formattedDate}</td>
                <td>${data.admissionDate || "—"}</td>
                <td>${data.dischargeDate || "—"}</td>
                <td>
                    <span class="badge ${status}">
                        ${data.status || "Booked"}
                    </span>
                </td>
            `;
            
            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error("Error loading patient history:", error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; color: #ef4444; padding: 20px;">
                    <i class="fas fa-exclamation-triangle"></i> Error loading records. Please check database permissions.
                </td>
            </tr>
        `;
    }
});