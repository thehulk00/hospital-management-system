import { auth, db } from "./firebase.js";
import { 
    collection, 
    getDocs, 
    query, 
    orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const tableBody = document.getElementById("historyTableBody");
const filterButtons = document.querySelectorAll(".filter-btn");
const activeFilterDisplay = document.getElementById("activeFilterText");
const genDateDisplay = document.getElementById("genDate");

let allRecords = [];

// Set the generation date once on load
const now = new Date();
genDateDisplay.textContent = `${now.toLocaleDateString()} ${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;

auth.onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = "../index.html"; 
        return;
    }
    loadData();
});

async function loadData() {
    tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 40px; color: #64748b;"><i class="fas fa-spinner fa-spin"></i> Loading records...</td></tr>`;

    try {
        const q = query(collection(db, "appointments"), orderBy("date", "desc"));
        const snapshot = await getDocs(q);
        
        allRecords = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        renderTable(allRecords);
    } catch (error) {
        console.error("Fetch Error:", error);
        tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color: #ef4444;">Error loading records.</td></tr>`;
    }
}

function renderTable(data) {
    tableBody.innerHTML = "";
    
    if (data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 40px; color: #64748b;">No records found for this period.</td></tr>`;
        return;
    }

    data.forEach((item, index) => {
        const row = document.createElement("tr");
        
        // Match the "Image 2" styling: First row gets the teal left border
        if (index === 0) row.className = "active-row";

        const dateObj = new Date(item.date);
        const formattedDate = item.date 
            ? dateObj.toISOString().split('T')[0] // Formats as YYYY-MM-DD to match Image 2
            : "—";

        row.innerHTML = `
            <td>
                <a class="patient-name-cell" href="reports/patient_details.html?id=${item.id}">
                    ${item.patientName || "Unknown"}
                </a>
            </td>
            <td>${item.doctorName || "General Staff"}</td>
            <td class="date-cell">${formattedDate}</td>
            <td class="action-btn-col">
                <button class="action-btn" onclick="window.location.href='reports/view_report.html?id=${item.id}'">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Filter Logic
filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const days = btn.getAttribute("data-days");
        
        // Update the header text (e.g., "Filter: MONTH")
        activeFilterDisplay.textContent = btn.textContent;
        
        if (days === "all") {
            renderTable(allRecords);
        } else {
            const cutoff = new Date();
            cutoff.setHours(0, 0, 0, 0); 
            cutoff.setDate(cutoff.getDate() - parseInt(days));
            
            const filtered = allRecords.filter(record => {
                const recordDate = new Date(record.date);
                return recordDate >= cutoff;
            });
            renderTable(filtered);
        }
    });
});