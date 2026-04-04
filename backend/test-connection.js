const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

// Use the URI from .env if available, otherwise use the placeholder provided
const uri = process.env.ATLAS_URI || process.env.MONGO_URI || "mongodb://localhost:27017/danphe_organic";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    console.log("Connecting to MongoDB Atlas...");
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB! ✅");
  } catch (error) {
    console.error("Connection failed! ❌");
    console.dir(error);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run();
