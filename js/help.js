import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let currentType = "";

window.openModal = function(type){
  currentType = type;
  document.getElementById("modal").style.display = "flex";
  document.getElementById("modalTitle").innerText =
    type === "feedback" ? "Submit Feedback" : "File a Complaint";
};

window.submitData = async function(){
  const message = document.getElementById("message").value.trim();

  if(!message){
    alert("Please write something");
    return;
  }

  await addDoc(collection(db, "feedback"), {
    type: currentType,
    message: message,
    createdAt: serverTimestamp()
  });

  alert("Submitted successfully ✅");
  document.getElementById("message").value = "";
  document.getElementById("modal").style.display = "none";
};
