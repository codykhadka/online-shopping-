const { MongoClient } = require('mongodb');
require('dotenv').config();

// Fallback to localhost if ATLAS fails
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/danphe_organic";

async function migrate() {
  console.log(`Connecting to: ${uri}`);
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('danphe_organic');
    const products = db.collection('products');
    
    // Process all products that are likely USD prices (< 500)
    const result = await products.find({ price: { $lt: 500 } }).toArray();
    console.log(`Found ${result.length} products to migrate.`);
    
    for (const p of result) {
      const newPrice = Math.round(p.price * 133);
      const updateData = { price: newPrice };
      
      if (p.discountPrice && p.discountPrice < 500) {
        updateData.discountPrice = Math.round(p.discountPrice * 133);
      }
      
      await products.updateOne({ _id: p._id }, { $set: updateData });
      console.log(`Migrated: ${p.name} (${p.price} -> ${newPrice})`);
    }
    
    console.log("Migration complete!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.close();
  }
}

migrate();
