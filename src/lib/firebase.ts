// /lib/firebase.js or /lib/firebase.ts
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyCsb-0asPnrJywfdzC2kU6B78k9VgUzsvI",
  authDomain: "footage-flow-8247f.firebaseapp.com",
  projectId: "footage-flow-8247f",
  storageBucket: "footage-flow-8247f.firebasestorage.app",
  messagingSenderId: "239089706267",
  appId: "1:239089706267:web:73f3ccdb73ed4527ef9fbe"
};

export const app = initializeApp(firebaseConfig);
