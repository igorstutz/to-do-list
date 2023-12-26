
//src/services/firebaseConnection.ts
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'


const firebaseConfig = {
  apiKey: "AIzaSyD9uYc3z15bGDSLM3yPYcztNhuxPfoLLUI",
  authDomain: "ldo-list-e814b.firebaseapp.com",
  projectId: "ldo-list-e814b",
  storageBucket: "ldo-list-e814b.appspot.com",
  messagingSenderId: "965168510773",
  appId: "1:965168510773:web:b9fd617be3d3433de83e7c"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app)
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };