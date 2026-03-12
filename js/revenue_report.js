import { db } from "../js/firebase.js";
import {
collection,
getDocs,
query,
orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const table = document.getElementById("revenueTable");
const totalRevenue = document.getElementById("totalRevenue");
const chartCanvas = document.getElementById("revenueChart");

let allRevenue = [];
let revenueChart = null;

/* LOAD DATA FROM FIRESTORE */

async function loadRevenue(){

const ref = collection(db,"billing");
const q = query(ref, orderBy("billingDate","desc"));

const snapshot = await getDocs(q);

allRevenue = [];

snapshot.forEach(doc=>{

const data = doc.data();

allRevenue.push({
date:data.billingDate,
patient:data.patientName,
doctor:data.doctorName,
amount:Number(data.totalAmount || 0)
});

});

renderRevenue(allRevenue);

}

/* RENDER TABLE + CHART */

function renderRevenue(data){

table.innerHTML = "";

let total = 0;
let labels = [];
let values = [];

data.forEach(r=>{

const row = document.createElement("tr");

row.innerHTML = `
<td>${r.date || "-"}</td>
<td>${r.patient || "-"}</td>
<td>${r.doctor || "-"}</td>
<td>₹ ${r.amount}</td>
`;

table.appendChild(row);

total += r.amount;

labels.push(r.date);
values.push(r.amount);

});

totalRevenue.textContent = total.toLocaleString();

drawChart(labels,values);

}

/* CHART */

function drawChart(labels,values){

if(revenueChart){
revenueChart.destroy();
}

revenueChart = new Chart(chartCanvas,{

type:"line",

data:{
labels:labels,
datasets:[{
label:"Revenue (₹)",
data:values,
borderColor:"#6366f1",
backgroundColor:"rgba(99,102,241,0.2)",
fill:true,
tension:0.3,
pointBackgroundColor: "#6366f1",
pointBorderColor: "#ffffff",
pointBorderWidth: 2,
pointRadius: 4,
pointHoverRadius: 6
}]
},

options:{
responsive:true,
maintainAspectRatio:false,
plugins: {
legend: {
display: true,
position: 'top',
labels: {
usePointStyle: true,
boxWidth: 6
}
},
tooltip: {
callbacks: {
label: function(context) {
let label = context.dataset.label || '';
if (label) {
label += ': ';
}
if (context.parsed.y !== null) {
label += '₹ ' + context.parsed.y.toLocaleString();
}
return label;
}
}
}
},
scales: {
y: {
beginAtZero: true,
ticks: {
callback: function(value) {
return '₹ ' + value;
}
}
}
}
}

});

}

/* FILTER FUNCTION */

window.filterRevenue = function(days){

if(days === "all"){
renderRevenue(allRevenue);
return;
}

const today = new Date();

const filtered = allRevenue.filter(r=>{

const d = new Date(r.date);

const diff = (today - d) / (1000*60*60*24);

return diff <= days;

});

renderRevenue(filtered);

};

/* PREVIEW AND DOWNLOAD PDF FUNCTION */
window.previewAndDownloadPDF = function() {
    // Show loading state on button
    const btn = document.querySelector('.pdf-btn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating Preview...';
    btn.disabled = true;
    
    // Small delay to ensure UI updates
    setTimeout(() => {
        // Get current filter
        const currentFilter = document.querySelector(".filter.active");
        const filterText = currentFilter ? currentFilter.textContent : "All Reports";
        
        // Get current data
        const rows = document.querySelectorAll("#revenueTable tr");
        const total = document.getElementById("totalRevenue").textContent;
        
        // Get chart as image
        const chartImage = revenueChart ? revenueChart.toBase64Image() : null;
        
        // Generate preview in new window
        const previewWindow = window.open('', '_blank');
        generatePDFPreview(previewWindow, filterText, rows, total, chartImage);
        
        // Reset button
        btn.innerHTML = originalText;
        btn.disabled = false;
    }, 100);
};

/* GENERATE PDF PREVIEW */
function generatePDFPreview(previewWindow, filterText, rows, total, chartImage) {
    
    // Generate HTML for preview
    const previewHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Revenue Report - ${filterText}</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Inter', sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 30px 20px;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            
            .preview-wrapper {
                max-width: 1200px;
                width: 100%;
                margin: 0 auto;
            }
            
            .preview-card {
                background: white;
                border-radius: 24px;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                overflow: hidden;
                animation: slideIn 0.5s ease-out;
            }
            
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .preview-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px 40px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .header-left h1 {
                font-size: 28px;
                font-weight: 700;
                margin-bottom: 8px;
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .header-left p {
                font-size: 16px;
                opacity: 0.9;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .filter-badge {
                background: rgba(255, 255, 255, 0.2);
                padding: 8px 16px;
                border-radius: 30px;
                font-size: 14px;
                font-weight: 500;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                backdrop-filter: blur(10px);
            }
            
            .header-right {
                text-align: right;
            }
            
            .header-right .date {
                font-size: 16px;
                margin-bottom: 8px;
                opacity: 0.9;
            }
            
            .download-btn {
                background: white;
                color: #667eea;
                border: none;
                padding: 14px 28px;
                border-radius: 50px;
                font-weight: 600;
                font-size: 16px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 10px;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            }
            
            .download-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
            }
            
            .download-btn i {
                font-size: 18px;
            }
            
            .preview-content {
                padding: 40px;
            }
            
            .summary-cards {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 20px;
                margin-bottom: 30px;
            }
            
            .summary-card {
                background: #f8fafc;
                padding: 20px;
                border-radius: 16px;
                display: flex;
                align-items: center;
                gap: 15px;
                border: 1px solid #e2e8f0;
            }
            
            .card-icon {
                width: 50px;
                height: 50px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 24px;
            }
            
            .card-info h3 {
                font-size: 14px;
                color: #64748b;
                font-weight: 500;
                margin-bottom: 5px;
            }
            
            .card-info .value {
                font-size: 24px;
                font-weight: 700;
                color: #1e293b;
            }
            
            .total-card {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border: none;
            }
            
            .total-card .card-info h3,
            .total-card .card-info .value {
                color: white;
            }
            
            .total-card .card-icon {
                background: rgba(255, 255, 255, 0.2);
            }
            
            .chart-section {
                background: #f8fafc;
                padding: 25px;
                border-radius: 16px;
                margin-bottom: 30px;
                border: 1px solid #e2e8f0;
            }
            
            .chart-section h3 {
                margin-bottom: 20px;
                color: #1e293b;
                font-size: 18px;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .chart-container {
                height: 300px;
                position: relative;
            }
            
            .table-section {
                background: #f8fafc;
                padding: 25px;
                border-radius: 16px;
                border: 1px solid #e2e8f0;
            }
            
            .table-section h3 {
                margin-bottom: 20px;
                color: #1e293b;
                font-size: 18px;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .table-container {
                overflow-x: auto;
                max-height: 400px;
                overflow-y: auto;
            }
            
            table {
                width: 100%;
                border-collapse: collapse;
                min-width: 600px;
            }
            
            th {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 15px;
                font-weight: 600;
                font-size: 14px;
                position: sticky;
                top: 0;
            }
            
            td {
                padding: 15px;
                border-bottom: 1px solid #e2e8f0;
                color: #334155;
            }
            
            tr:last-child td {
                border-bottom: none;
            }
            
            tr:hover td {
                background: #f1f5f9;
            }
            
            .amount {
                font-weight: 600;
                color: #059669;
            }
            
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e2e8f0;
                color: #64748b;
                font-size: 14px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .footer i {
                color: #667eea;
            }
            
            .close-btn {
                position: fixed;
                top: 20px;
                right: 20px;
                background: #ef4444;
                color: white;
                border: none;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                font-size: 20px;
                box-shadow: 0 4px 10px rgba(239, 68, 68, 0.3);
                transition: all 0.3s ease;
                z-index: 1000;
            }
            
            .close-btn:hover {
                transform: scale(1.1);
                background: #dc2626;
            }
            
            .no-data {
                text-align: center;
                padding: 60px;
                color: #64748b;
                font-size: 16px;
            }
            
            .no-data i {
                font-size: 48px;
                margin-bottom: 15px;
                color: #cbd5e1;
            }
        </style>
    </head>
    <body>
        <button class="close-btn" onclick="window.close()">
            <i class="fas fa-times"></i>
        </button>
        
        <div class="preview-wrapper">
            <div class="preview-card">
                <div class="preview-header">
                    <div class="header-left">
                        <h1>
                            <i class="fas fa-chart-line"></i>
                            Revenue Report
                        </h1>
                        <p>
                            <i class="fas fa-calendar-alt"></i>
                            Generated on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        <div class="filter-badge">
                            <i class="fas fa-filter"></i>
                            ${filterText}
                        </div>
                    </div>
                    <div class="header-right">
                        <div class="date">
                            <i class="fas fa-clock"></i>
                            ${new Date().toLocaleTimeString()}
                        </div>
                        <button class="download-btn" onclick="downloadPDF()">
                            <i class="fas fa-file-pdf"></i>
                            Download PDF Report
                        </button>
                    </div>
                </div>
                
                <div class="preview-content" id="pdfContent">
                    <div class="summary-cards">
                        <div class="summary-card total-card">
                            <div class="card-icon">
                                <i class="fas fa-rupee-sign"></i>
                            </div>
                            <div class="card-info">
                                <h3>Total Revenue</h3>
                                <div class="value">₹ ${total}</div>
                            </div>
                        </div>
                        
                        <div class="summary-card">
                            <div class="card-icon">
                                <i class="fas fa-file-invoice"></i>
                            </div>
                            <div class="card-info">
                                <h3>Total Transactions</h3>
                                <div class="value">${rows.length}</div>
                            </div>
                        </div>
                        
                        <div class="summary-card">
                            <div class="card-icon">
                                <i class="fas fa-calendar-check"></i>
                            </div>
                            <div class="card-info">
                                <h3>Report Period</h3>
                                <div class="value">${filterText}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="chart-section">
                        <h3>
                            <i class="fas fa-chart-line" style="color: #667eea;"></i>
                            Revenue Trend
                        </h3>
                        <div class="chart-container">
                            <canvas id="previewChart"></canvas>
                        </div>
                    </div>
                    
                    <div class="table-section">
                        <h3>
                            <i class="fas fa-list" style="color: #667eea;"></i>
                            Transaction Details
                        </h3>
                        <div class="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Patient Name</th>
                                        <th>Doctor Name</th>
                                        <th>Amount (₹)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${Array.from(rows).map(row => `
                                        <tr>
                                            <td>${row.cells[0]?.innerHTML || '-'}</td>
                                            <td>${row.cells[1]?.innerHTML || '-'}</td>
                                            <td>${row.cells[2]?.innerHTML || '-'}</td>
                                            <td class="amount">${row.cells[3]?.innerHTML || '₹ 0'}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div class="footer">
                        <div>
                            <i class="fas fa-hospital"></i>
                            HMS PRO - Healthcare Management System
                        </div>
                        <div>
                            <i class="fas fa-file-pdf"></i>
                            Report ID: REV-${Date.now().toString().slice(-8)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <script>
            // Prepare chart data
            const labels = ${JSON.stringify(Array.from(rows).map(row => row.cells[0]?.textContent || "-"))};
            const values = ${JSON.stringify(Array.from(rows).map(row => {
                const amount = row.cells[3]?.textContent.replace('₹ ', '') || "0";
                return parseFloat(amount);
            }))};
            
            // Create chart
            const ctx = document.getElementById('previewChart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Revenue (₹)',
                        data: values,
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#667eea',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                            labels: {
                                usePointStyle: true,
                                boxWidth: 6
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    let label = context.dataset.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    if (context.parsed.y !== null) {
                                        label += '₹ ' + context.parsed.y.toLocaleString();
                                    }
                                    return label;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return '₹ ' + value;
                                }
                            }
                        }
                    }
                }
            });
            
            // Download PDF function
            function downloadPDF() {
                const element = document.getElementById('pdfContent');
                const opt = {
                    margin: [0.5, 0.5, 0.5, 0.5],
                    filename: 'Revenue_Report_${filterText.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf',
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { 
                        scale: 2, 
                        letterRendering: true,
                        useCORS: true,
                        logging: false
                    },
                    jsPDF: { 
                        unit: 'in', 
                        format: 'a4', 
                        orientation: 'landscape' 
                    }
                };
                
                // Show loading state
                const btn = document.querySelector('.download-btn');
                const originalText = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';
                btn.disabled = true;
                
                // Generate PDF
                html2pdf().set(opt).from(element).save().then(() => {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                });
            }
        <\/script>
    </body>
    </html>
    `;
    
    previewWindow.document.write(previewHTML);
    previewWindow.document.close();
}

/* INITIAL LOAD */

loadRevenue();