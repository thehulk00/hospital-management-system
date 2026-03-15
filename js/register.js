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

registerBtn.addEventListener("click", async () => {

const email = document.getElementById("email").value.trim();
const password = document.getElementById("password").value.trim();
const name = document.getElementById("name").value.trim();
const phone = document.getElementById("phone").value.trim();
const age = document.getElementById("age").value.trim();
const gender = document.getElementById("gender").value;

if(!email || !password || !name){
alert("Please fill required fields");
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

role:"patient",   // ⭐ IMPORTANT FIX

createdAt:serverTimestamp()

});

alert("Registration Successful 🎉");

// redirect to profile page
window.location.href="../patient.html";

}catch(err){

alert(err.message);
console.error(err);

}

});