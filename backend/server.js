import express from 'express';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import cors from 'cors';

const firebaseConfig = {
  apiKey: "AIzaSyCJeZvWfWYoJW71P63WqQxve5FwF0l-QyA",
  authDomain: "beer-olympics-tournament-2024.firebaseapp.com",
  projectId: "beer-olympics-tournament-2024",
  storageBucket: "beer-olympics-tournament-2024.appspot.com",
  messagingSenderId: "347415345072",
  appId: "1:347415345072:web:9e58d02d63325d65cec875",
  measurementId: "G-0SCD6G5Y6H"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

// Example endpoint to fetch tournaments
app.get('/api/tournaments', async (req, res) => {
  try {
    const tournamentsRef = collection(db, 'tournaments');
    const tournamentsSnapshot = await getDocs(tournamentsRef);
    const tournaments = tournamentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json(tournaments);
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    res.status(500).json({ error: 'Failed to fetch tournaments' });
  }
});

app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});