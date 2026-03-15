import { auth, db } from "./firebase.js";

import {
doc,
getDoc,
setDoc,
serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const ageInput = document.getElementById("age");
const genderInput = document.getElementById("gender");


onAuthStateChanged(auth, async (user) => {

if(!user){

window.location.href="../index.html";
return;

}

emailInput.value = user.email;

const ref = doc(db,"patients",user.uid);
const snap = await getDoc(ref);

if(snap.exists()){

const data = snap.data();

nameInput.value = data.name || "";
phoneInput.value = data.phone || "";
ageInput.value = data.age || "";
genderInput.value = data.gender || "";

}

});


document.getElementById("profileForm").addEventListener("submit", async (e)=>{

e.preventDefault();

const user = auth.currentUser;

if(!user) return;

await setDoc(

doc(db,"patients",user.uid),

{

name:nameInput.value,
email:user.email,
phone:phoneInput.value,
age:Number(ageInput.value),
gender:genderInput.value,
updatedAt:serverTimestamp()

},

{merge:true}

);

alert("Profile Updated Successfully ✅");

});