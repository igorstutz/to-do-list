
//src/services/firebaseConnection.ts
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'


const firebaseConfig = {
  apiKey: "AIzaSyDfE6b1Dxq_lrDMK86nvql5hyFwRuKah0E",
  authDomain: "to-do-list-bfc82.firebaseapp.com",
  projectId: "to-do-list-bfc82",
  storageBucket: "to-do-list-bfc82.appspot.com",
  messagingSenderId: "434951407359",
  appId: "1:434951407359:web:cfa65ad22d9a42ca71aeca"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app)
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };