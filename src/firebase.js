import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCji6w7wWb8hAf_tX1m-J2351Yu3Zy-1Mg",
  authDomain: "vegas-bingo-2026.firebaseapp.com",
  projectId: "vegas-bingo-2026",
  storageBucket: "vegas-bingo-2026.firebasestorage.app",
  messagingSenderId: "564974056663",
  appId: "1:564974056663:web:68a8434c4cb4623eba6c92"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
