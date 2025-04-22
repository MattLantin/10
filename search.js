const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = "zips_db";
const COLLECTION = "places";

let db, collection;

async function start() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db(DB_NAME);
  collection = db.collection(COLLECTION);

  app.use(express.static('public'));

  // Serve the form
  app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/form.html');
  });

  // Handle the form submission
  app.get('/process', async (req, res) => {
    const query = req.query.query.trim();

    let result;
    if (/^\d/.test(query)) {
      // Starts with a number → zip code
      result = await collection.find({ zips: query }).toArray();
    } else {
      // Otherwise, assume it's a place name
      result = await collection.find({ place: new RegExp(`^${query}$`, 'i') }).toArray();
    }

    console.log("Search results for:", query);
    console.log(result);

    // Optional: render as HTML or just show simple response
    res.send(`<pre>${JSON.stringify(result, null, 2)}</pre>`);
  });

  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

start();
