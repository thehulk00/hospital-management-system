import { db } from "./firebase.js";

import {
collection,
getDocs,
doc,
updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const tableBody = document.getElementById("appointmentsTable");

async function loadAppointments(){

tableBody.innerHTML =
`<tr><td colspan="6" style="text-align:center;padding:50px;">Loading...</td></tr>`;

try{

const snap = await getDocs(collection(db,"appointments"));

const today = new Date().toISOString().split('T')[0];

let appointmentList = [];

snap.forEach(docSnap=>{

const data = docSnap.data();
const id = docSnap.id;

const appDate = data.date || "";
const appTime = data.timeSlot || "Not set";

if(appDate !== today) return;

appointmentList.push({
id,
...data,
appDate,
appTime
});

});

appointmentList.sort((a,b)=>{

return a.appTime.localeCompare(b.appTime);

});

tableBody.innerHTML = "";

appointmentList.forEach(item=>{

const statusClass =
(item.status?.toLowerCase()==="completed")
? "status-completed"
: "status-pending";

const row = document.createElement("tr");

row.innerHTML = `

<td>
<strong>${item.appDate}</strong><br>
<small style="color:#2563eb">${item.appTime}</small>
</td>

<td>
<a href="patient_details.html?id=${item.id}" class="patient-link">
${item.patientName}
</a>
</td>

<td>
Dr. ${item.doctorName.replace(/dr\.?\s*/gi,"")}
</td>

<td>
${item.department || "General"}
</td>

<td>
<span class="badge ${statusClass}">
${item.status || "Pending"}
</span>
</td>

<td>
${
item.status?.toLowerCase()==="completed"
? `<span style="color:#16a34a;font-weight:700;">✔ Done</span>`
: `<button class="complete-btn"
onclick="markCompleted('${item.id}')">
Complete
</button>`
}
</td>

`;

tableBody.appendChild(row);

});

if(appointmentList.length===0){

tableBody.innerHTML =
`<tr><td colspan="6" style="text-align:center;padding:40px;">
No appointments today.
</td></tr>`;

}

}catch(e){

console.error(e);

tableBody.innerHTML =
`<tr><td colspan="6" style="text-align:center;color:red;">
Database Error
</td></tr>`;

}

}

window.markCompleted = async function(id){

try{

const ref = doc(db,"appointments",id);

await updateDoc(ref,{
status:"completed"
});

loadAppointments();

}catch(err){

console.error(err);
alert("Failed to update status");

}

};

loadAppointments();