// Import required modules
const fs = require('fs');
const { MongoClient } = require('mongodb');
require('dotenv').config(); // Load environment variables from .env

// MongoDB connection details
const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = "zips_db";         // Name of the database
const COLLECTION = "places";       // Collection to store place-zip mappings

// Immediately-invoked async function to run the upload logic
(async () => {
    // Connect to MongoDB
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION);

    // Clear the existing data in the collection (for demo/demo repeatability)
    await collection.deleteMany({});
    console.log("Collection cleared.");

    // Read the CSV file and split into lines
    const data = fs.readFileSync('zips.csv', 'utf-8').split('\n');
    const placesMap = {}; // Object to group zip codes by place

    // Parse each line in the CSV
    for (let line of data) {
        const [placeRaw, zipRaw] = line.split(',');
        if (!placeRaw || !zipRaw) continue; // Skip malformed lines

        const place = placeRaw.trim();
        const zip = zipRaw.trim();

        // If place is new, initialize a Set and log it
        if (!placesMap[place]) {
            placesMap[place] = new Set();
            console.log(`Added new place: ${place}`);
        } else {
            // If place already exists, log the update
            console.log(`Updated place: ${place}`);
        }

        // Add the zip to the set (avoids duplicates)
        placesMap[place].add(zip);
    }

    // Convert the map to an array of documents for MongoDB insertion
    const documents = Object.entries(placesMap).map(([place, zipSet]) => ({
        place,
        zips: Array.from(zipSet) // Convert Set to array
    }));

    // Insert all documents into the MongoDB collection
    await collection.insertMany(documents);
    console.log("Upload complete.");

    // Close the MongoDB connection
    await client.close();
})();
