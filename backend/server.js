const express = require("express");
const admin = require("firebase-admin");
const serviceAccount = require("./firebase-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello from the backend!");
});

// Example endpoint using Firebase
app.get("/tournaments", async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection("tournaments").get();
    const tournaments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json(tournaments);
  } catch (error) {
    res.status(500).json({ error: "Error fetching tournaments" });
  }
});

app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});
