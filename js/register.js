import { auth, db } from "./firebase.js";

import {
createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
doc,
setDoc,
serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const registerBtn = document.getElementById("registerBtn");

const phoneInput = document.getElementById("phone");
const nameInput = document.getElementById("name");

/* =========================
   🚫 INPUT CONTROL
========================= */

// Phone → only numbers, max 10 digits
phoneInput.addEventListener("input", function () {
    this.value = this.value.replace(/\D/g, "").slice(0, 10);
});

// Name → only letters and spaces
nameInput.addEventListener("input", function () {
    this.value = this.value.replace(/[^a-zA-Z\s]/g, "");
});

/* =========================
   📱 PHONE VALIDATION UI
========================= */

const phoneError = document.createElement("small");
phoneError.style.color = "red";
phoneError.style.display = "none";
phoneError.innerText = "Phone must be exactly 10 digits";
phoneInput.parentNode.appendChild(phoneError);

function validatePhone() {
    const phone = phoneInput.value.trim();

    if (phone.length !== 10) {
        phoneError.style.display = "block";
        phoneInput.style.borderColor = "red";
        return false;
    } else {
        phoneError.style.display = "none";
        phoneInput.style.borderColor = "#e2e8f0";
        return true;
    }
}

/* =========================
   🔘 REGISTER BUTTON
========================= */

registerBtn.addEventListener("click", async () => {

const email = document.getElementById("email").value.trim();
const password = document.getElementById("password").value.trim();
const name = nameInput.value.trim();
const phone = phoneInput.value.trim();
const age = document.getElementById("age").value.trim();
const gender = document.getElementById("gender").value;

// Required fields
if(!email || !password || !name){
alert("Please fill required fields");
return;
}

// Phone validation
if(!validatePhone()){
alert("Enter a valid 10-digit phone number");
return;
}

try{

const userCred = await createUserWithEmailAndPassword(auth,email,password);
const user = userCred.user;

await setDoc(doc(db,"patients",user.uid),{

name:name,
email:email,
phone:phone,
age:Number(age),
gender:gender,

role:"patient",

createdAt:serverTimestamp()

});

alert("Registration Successful 🎉");

// redirect
window.location.href="../patient.html";

}catch(err){

alert(err.message);
console.error(err);

}

});