import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export function allowOnly(roles) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) return location.href = "login.html";

    const snap = await getDoc(doc(db, "users", user.uid));
    if (!roles.includes(snap.data().role)) {
      alert("Access denied");
      location.href = "patient.html";
    }
  });
}
