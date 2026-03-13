import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

Chart.register(ChartDataLabels);

async function loadDashboard() {

let cash = 0;
let upi = 0;
let card = 0;

let revenueByDate = {};

const snap = await getDocs(collection(db,"billing"));

snap.forEach(doc => {

const d = doc.data();
const amount = Number(d.totalAmount || 0);

if(d.paymentMethod === "Cash") cash += amount;
if(d.paymentMethod === "UPI") upi += amount;
if(d.paymentMethod === "Card") card += amount;

const date = d.billingDate;

if(!revenueByDate[date]) revenueByDate[date] = 0;
revenueByDate[date] += amount;

});

drawPaymentChart(cash,upi,card);
drawWeeklyChart(revenueByDate);

}

function drawPaymentChart(cash,upi,card){

const ctx = document.getElementById("deptChart");

new Chart(ctx,{
type:"doughnut",

data:{
labels:["Cash","UPI","Card"],
datasets:[{
data:[cash,upi,card],

backgroundColor:[
"#6366f1",
"#22c55e",
"#f59e0b"
],

borderWidth:2
}]
},

options:{
responsive:true,
plugins:{
legend:{position:"top"},

datalabels:{
color:"#fff",
font:{weight:"bold",size:16},
formatter:(v)=>"₹"+v
}
}
},

plugins:[ChartDataLabels]

});

}
function drawWeeklyChart(data){

const ctx = document.getElementById("patientChart");

/* sort dates properly */
const sortedDates = Object.keys(data).sort((a,b)=> new Date(a)-new Date(b));
const values = sortedDates.map(d => data[d]);

new Chart(ctx,{
type:"line",

data:{
labels:sortedDates,

datasets:[{
label:"Revenue (₹)",
data:values,

borderColor:"#6366f1",
backgroundColor:"rgba(99,102,241,0.15)",

borderWidth:3,
tension:0.35,
fill:true,

pointRadius:5,
pointBackgroundColor:"#6366f1",
pointBorderColor:"#fff",
pointBorderWidth:2
}]
},

options:{
responsive:true,

plugins:{
legend:{
display:true,
labels:{
font:{size:13}
}
},

tooltip:{
callbacks:{
label:(ctx)=>" ₹"+ctx.raw.toLocaleString()
}
}
},

scales:{

x:{
grid:{
display:false
},
ticks:{
maxRotation:0,
autoSkip:true,
maxTicksLimit:7
}
},

y:{
grid:{
color:"rgba(0,0,0,0.05)"
},
ticks:{
callback:(v)=>"₹ "+v.toLocaleString()
}
}

}

}

});
}

loadDashboard();