
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD6r1hWRoz8pYo6UhjjLyjFLnO4ImL6mgY",
  authDomain: "skillpath-6ceb9.firebaseapp.com",
  projectId: "skillpath-6ceb9",
  storageBucket: "skillpath-6ceb9.firebasestorage.app",
  messagingSenderId: "318553977242",
  appId: "1:318553977242:web:4e01ec6a684b863c994a23",
  measurementId: "G-Q5H205HK39"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
