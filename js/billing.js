import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ================= LOAD DOCTORS ================= */
const doctorSelect = document.getElementById("doctorSelect");

const loadDoctors = async () => {
  const snap = await getDocs(collection(db, "doctors"));
  snap.forEach(doc => {
    const d = doc.data();
    const option = document.createElement("option");
    option.value = doc.id;
    // Fix Double Dr logic: Store clean name
    option.textContent = d.name.startsWith("Dr.") ? d.name : `Dr. ${d.name}`;
    doctorSelect.appendChild(option);
  });
};

loadDoctors();

/* ================= AUTO CALCULATE & PAYMENT LOGIC ================= */
const totalAmountInput = document.getElementById("totalAmount");

const calcTotal = () => {
  const c = Number(document.getElementById("consultationFee").value || 0);
  const l = Number(document.getElementById("labCharges").value || 0);
  const m = Number(document.getElementById("medicineCharges").value || 0);
  const total = c + l + m;
  totalAmountInput.value = total;

  if (document.getElementById("paymentMethod").value === "UPI") {
    generateUPI(total);
  }
};

document.getElementById("consultationFee").addEventListener("input", calcTotal);
document.getElementById("labCharges").addEventListener("input", calcTotal);
document.getElementById("medicineCharges").addEventListener("input", calcTotal);

// Handle Payment UI
document.getElementById("paymentMethod").addEventListener("change", function() {
  const upiBox = document.getElementById("upiSection");
  const cardBox = document.getElementById("cardSection");
  
  upiBox.style.display = (this.value === "UPI") ? "block" : "none";
  cardBox.style.display = (this.value === "Card") ? "block" : "none";

  if (this.value === "UPI") generateUPI(totalAmountInput.value);
});

/* ================= CARD FORMATTING (REAL) ================= */
document.getElementById("cardNumber").addEventListener("input", function(e) {
    let v = e.target.value.replace(/\D/g, '').match(/.{1,4}/g);
    e.target.value = v ? v.join(' ') : '';
});

document.getElementById("cardExpiry").addEventListener("input", function(e) {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length >= 2) e.target.value = v.slice(0, 2) + '/' + v.slice(2, 4);
});

function generateUPI(amt) {
  const output = document.getElementById("qrOutput");
  if (!amt || amt <= 0) {
    output.innerHTML = "Enter amount";
    return;
  }
  const upiUrl = `upi://pay?pa=hospital@upi&pn=CityHospital&am=${amt}&cu=INR`;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(upiUrl)}`;
  output.innerHTML = `<img src="${qrSrc}">`;
  document.getElementById("qrLabel").innerText = `Pay ₹${amt}`;
}

/* ================= SAVE BILL (YOUR ORIGINAL LOGIC) ================= */
window.saveBill = async function () {
  const patientName = document.getElementById("patientName").value;
  const doctorId = doctorSelect.value;
  const doctorName = doctorSelect.options[doctorSelect.selectedIndex]?.text;
  const consultationFee = Number(document.getElementById("consultationFee").value || 0);
  const labCharges = Number(document.getElementById("labCharges").value || 0);
  const medicineCharges = Number(document.getElementById("medicineCharges").value || 0);
  const totalAmount = Number(document.getElementById("totalAmount").value || 0);
  const paymentMethod = document.getElementById("paymentMethod").value;
  const paymentStatus = document.getElementById("paymentStatus").value;
  const billingDate = document.getElementById("billingDate").value;

  if (!patientName || !doctorId || !paymentStatus) {
    alert("Please fill required fields");
    return;
  }

  // Card Credentials Limit Check
  if (paymentMethod === "Card") {
    if (document.getElementById("cardNumber").value.replace(/\s/g, '').length < 16) {
      alert("Please enter a valid 16-digit card number.");
      return;
    }
  }

  try {
    await addDoc(collection(db, "billing"), {
      patientName,
      doctorId,
      doctorName, // This now contains the clean name with single "Dr."
      consultationFee,
      labCharges,
      medicineCharges,
      totalAmount,
      paymentMethod,
      paymentStatus,
      billingDate,
      createdAt: serverTimestamp()
    });

    alert("Billing record saved successfully ✅");
    location.href = "../staff.html";
  } catch (err) {
    alert(err.message);
  }
};