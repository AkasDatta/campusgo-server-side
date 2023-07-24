const express = require('express');
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const cors = require('cors');
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cv3dsgq.mongodb.net/?retryWrites=true&w=majority`;

let collegeCollection;

async function run() {
  try {
    const client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });

    await client.connect();
    collegeCollection = client.db('campusGo').collection('college');
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

run().catch(console.dir);

app.get('/college', async (req, res) => {
  try {
    const cursor = collegeCollection.find();
    const result = await cursor.toArray();
    res.send(result);
  } catch (error) {
    console.error("Error fetching colleges:", error);
    res.status(500).json({ error: "Failed to fetch colleges" });
  }
});

app.get('/', (req, res) => {
  res.send('campus is running');
});

app.listen(port, () => {
  console.log(`Campus API is running on port: ${port}`);
});
