import { db } from "./firebase.js";
import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const revenueChartCanvas = document.getElementById("patientChart");
const paymentChartCanvas = document.getElementById("deptChart");

let revenueChart;
let paymentChart;

onSnapshot(collection(db, "billing"), (snapshot) => {

let weeklyRevenue = [0,0,0,0,0,0,0];
let paymentMethods = { Cash:0, UPI:0, Card:0 };

snapshot.forEach(doc => {

const data = doc.data();

const amount = Number(data.totalAmount || 0);
const date = new Date(data.billingDate);

if (!isNaN(date)) {
    const day = date.getDay();
    weeklyRevenue[day] += amount;
}

const method = data.paymentMethod || "Cash";

if(paymentMethods[method] !== undefined){
paymentMethods[method] += amount;
}

});

renderCharts(weeklyRevenue,paymentMethods);

});

function renderCharts(weeklyRevenue,paymentMethods){

if(revenueChart) revenueChart.destroy();
if(paymentChart) paymentChart.destroy();

revenueChart = new Chart(revenueChartCanvas,{
type:"line",
data:{
labels:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],
datasets:[{
label:"Revenue",
data:weeklyRevenue,
borderColor:"#6366f1",
backgroundColor:"rgba(99,102,241,0.2)",
fill:true,
tension:0.4
}]
},
options:{
responsive:true,
plugins:{legend:{display:false}}
}
});

paymentChart = new Chart(paymentChartCanvas,{
type:"doughnut",
data:{
labels:Object.keys(paymentMethods),
datasets:[{
data:Object.values(paymentMethods),
backgroundColor:["#6366f1","#22c55e","#f59e0b"]
}]
},
options:{
responsive:true,
cutout:"65%"
}
});

}