// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCsb-0asPnrJywfdzC2kU6B78k9VgUzsvI",
  authDomain: "footage-flow-8247f.firebaseapp.com",
  projectId: "footage-flow-8247f",
  storageBucket: "footage-flow-8247f.firebasestorage.app",
  messagingSenderId: "239089706267",
  appId: "1:239089706267:web:73f3ccdb73ed4527ef9fbe"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
