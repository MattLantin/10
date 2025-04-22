// Import required modules
const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config(); // Load environment variables from .env

const app = express();
const PORT = process.env.PORT || 3000; // Use environment port or default to 3000

// MongoDB connection details from environment variable
const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = "zips_db";             // Database name
const COLLECTION = "places";           // Collection storing places and zip codes

let db, collection; // Declare global variables for DB and collection references

// Start the Express app and connect to MongoDB
async function start() {
  const client = new MongoClient(MONGO_URI);
  await client.connect(); // Connect to MongoDB
  db = client.db(DB_NAME);
  collection = db.collection(COLLECTION);

  // Serve static files from the 'public' directory (e.g., CSS or JS)
  app.use(express.static('public'));

  // Route: GET /
  // Serves the HTML form to the user
  app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/form.html');
  });

  // Route: GET /process
  // Handles the form submission and performs the database query
  app.get('/process', async (req, res) => {
    const query = req.query.query.trim(); // Extract and trim user input

    let result;
    if (/^\d/.test(query)) {
      // If input starts with a digit, treat it as a zip code
      result = await collection.find({ zips: query }).toArray();
    } else {
      // Otherwise, treat input as a place name (case-insensitive exact match)
      result = await collection.find({ place: new RegExp(`^${query}$`, 'i') }).toArray();
    }

    // Log the query and its result to the console
    console.log("Search results for:", query);
    console.log(result);

    // Send the result back to the user as formatted JSON
    res.send(`<pre>${JSON.stringify(result, null, 2)}</pre>`);
  });

  // Start the server
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

// Call the start function to launch everything
start();
