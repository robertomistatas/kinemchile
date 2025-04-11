// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDd2DbPqo7HsOvDsrTszgLCuU8zJUZdQ6Y",
  authDomain: "kinem-b904e.firebaseapp.com",
  projectId: "kinem-b904e",
  storageBucket: "kinem-b904e.firebasestorage.app",
  messagingSenderId: "30584936443",
  appId: "1:30584936443:web:db51131bbe7a97f5999d5e",
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

export { app, auth, db, storage }
