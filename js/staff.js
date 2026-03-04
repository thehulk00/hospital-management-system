import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

window.saveStaff = async function () {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;
  const role = document.getElementById("role").value;
  const department = document.getElementById("department").value;
  const shift = document.getElementById("shift").value;

  if (!name || !role || !department) {
    alert("Please fill required fields");
    return;
  }

  try {
    await addDoc(collection(db, "staff"), {
      name,
      email,
      phone,
      role,
      department,
      shift,
      createdAt: serverTimestamp()
    });

    alert("Staff saved successfully ✅");
    location.href = "../staff.html";
  } catch (err) {
    alert(err.message);
  }
};
