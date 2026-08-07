// Firebase Configuration - EVLYFE
// https://console.firebase.google.com/u/3/project/evlyfe-e54fb/overview

const firebaseConfig = {
  apiKey: "AIzaSyAniN95p8J1kd7V5KTOb3LebFPtsc0YqEY",
  authDomain: "evlyfe-e54fb.firebaseapp.com",
  projectId: "evlyfe-e54fb",
  storageBucket: "evlyfe-e54fb.firebasestorage.app",
  messagingSenderId: "111170059261",
  appId: "1:111170059261:web:d0374e12ce51906b3e7794",
  measurementId: "G-4Y69EN12KH"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Auth providers
const googleProvider = new firebase.auth.GoogleAuthProvider();
const facebookProvider = new firebase.auth.FacebookAuthProvider();
