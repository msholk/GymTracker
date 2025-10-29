import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAcw46PGpKVaTfigBDvO_N7kBydn7EdB9s",
  authDomain: "gymtracker-9f77d.firebaseapp.com",
  projectId: "gymtracker-9f77d",
  storageBucket: "gymtracker-9f77d.firebasestorage.app",
  messagingSenderId: "1073899532807",
  appId: "1:1073899532807:web:772da824ad3894c357f0a2",
  measurementId: "G-HZND37Q9R6"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };