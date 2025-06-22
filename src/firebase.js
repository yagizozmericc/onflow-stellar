import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCkeetd8rdLDyAx7dd8-QkgKgCQEOagSoc",
  authDomain: "onflow-stellar.firebaseapp.com",
  projectId: "onflow-stellar",
  storageBucket: "onflow-stellar.firebasestorage.app",
  messagingSenderId: "953452810615",
  appId: "1:953452810615:web:d961f7438106195a619172",
  measurementId: "G-W3TGBEWF51"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db }; 