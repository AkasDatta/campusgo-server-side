const express = require('express');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const cors = require('cors');
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cv3dsgq.mongodb.net/?retryWrites=true&w=majority`;

let collegeCollection;
let bookingCollection; // Add this line

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
    bookingCollection = client.db('campusGo').collection('apply'); // Move this line here
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
    console.log(result);
    res.send(result);
  } catch (error) {
    console.error("Error fetching colleges:", error);
    res.status(500).json({ error: "Failed to fetch colleges" });
  }
});

app.get('/college/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await collegeCollection.findOne(query);
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch college details' });
  }
});

app.get('/apply/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };

    const options = {
      projection: { collegeImage: 1, admissionDates: 1, collegeName: 1, description: 1},
    }
    const result = await collegeCollection.findOne(query);
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch college details' });
  }
});

// apply
app.get('/apply', async(req, res) => {
  console.log(req.query.email);
  let query = {};
  if(req.query?.email) {
    query = {email: req.query.email}
  }
  const result = await bookingCollection.find({}).toArray();
  res.send(result);
})

app.post('/apply', async (req, res) => {
  const applys = req.body;
  console.log(applys);
  const result = await bookingCollection.insertOne(applys);
  res.send(result);
});

app.delete('/apply/:id', async(req, res) =>{
  const id = req.params.id;
  const query = {_id: new ObjectId(id)}
  const result = await bookingCollection.deleteOne(query);
  res.send(result);
})

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('campus is running');
});

app.listen(port, () => {
  console.log(`Campus API is running on port: ${port}`);
});
