import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCkSfGKFiU61SjnOojaxDVOTgkcfYply_M',
  authDomain: 'beyond-the-classroom-e2097.firebaseapp.com',
  projectId: 'beyond-the-classroom-e2097',
  storageBucket: 'beyond-the-classroom-e2097.appspot.com',
  messagingSenderId: '976897710549',
  appId: '1:976897710549:web:0b4d12bc1c7d9bbdd8055c'
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, setDoc, doc, getDoc };
