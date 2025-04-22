const fs = require('fs');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = "zips_db";
const COLLECTION = "places";

(async () => {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION);

    // Clear old data (optional for demo)
    await collection.deleteMany({});
    console.log("Collection cleared.");

    const data = fs.readFileSync('zips.csv', 'utf-8').split('\n');
    const placesMap = {};

    for (let line of data) {
        const [placeRaw, zipRaw] = line.split(',');
        if (!placeRaw || !zipRaw) continue;

        const place = placeRaw.trim();
        const zip = zipRaw.trim();

        if (!placesMap[place]) {
            placesMap[place] = new Set();
            console.log(`Added new place: ${place}`);
        } else {
            console.log(`Updated place: ${place}`);
        }

        placesMap[place].add(zip);
    }

    // Convert and insert to MongoDB
    const documents = Object.entries(placesMap).map(([place, zipSet]) => ({
        place,
        zips: Array.from(zipSet)
    }));

    await collection.insertMany(documents);
    console.log("Upload complete.");
    await client.close();
})();
