import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "rimjob-sports.firebaseapp.com",
  projectId: "rimjob-sports",
  storageBucket: "rimjob-sports.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};

const app = initializeApp(firebaseConfig);

export default app;