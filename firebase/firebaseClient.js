import 'firebase'
import 'firebase/auth';
import "firebase/storage";
import "firebase/firestore";

const firebase = require('firebase')

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAiM9QZHv5VXeZOFVudazEHk8p53dsEOZ8",
  authDomain: "bora-pas-super-alpha.firebaseapp.com",
  projectId: "bora-pas-super-alpha",
  storageBucket: "bora-pas-super-alpha.appspot.com",
  messagingSenderId: "149955503360",
  appId: "1:149955503360:web:3f33920b747671ddb9ffe5",
  measurementId: "G-4PK02L8CG2",
};

export default function firebaseClient() {
  if(!firebase.default.apps.length) {
    firebase.default.initializeApp(FIREBASE_CONFIG)
  }
}

/*
export const auth = app.auth();
export const storage = app.storage();
export const firestore = app.firestore();
export default app;*/
