const mongoose = require('mongoose');
require('dotenv').config();

const LOCAL_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/danphe_organic';
const ATLAS_URI = process.env.ATLAS_URI;

if (!ATLAS_URI || ATLAS_URI.includes('YOUR_ATLAS_PASSWORD')) {
    console.error("❌ ERROR: Please update ATLAS_URI in backend/.env with your real password first!");
    process.exit(1);
}

async function migrate() {
    let localConn, atlasConn;

    try {
        console.log("Connect to Local MongoDB...");
        localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
        console.log("✅ Local Connected.");

        console.log("Connect to MongoDB Atlas...");
        atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();
        console.log("✅ Atlas Connected.");

        const collections = await localConn.db.listCollections().toArray();
        console.log(`Found ${collections.length} collections to migrate.`);

        for (const colInfo of collections) {
            const colName = colInfo.name;
            console.log(`\n--- Migrating Collection: ${colName} ---`);

            const localCol = localConn.db.collection(colName);
            const atlasCol = atlasConn.db.collection(colName);

            const data = await localCol.find({}).toArray();
            console.log(`   Found ${data.length} documents locally.`);

            if (data.length > 0) {
                // Clear existing data in Atlas for this collection to avoid duplicates
                await atlasCol.deleteMany({});
                console.log(`   Cleaned Atlas collection: ${colName}`);

                // Insert All
                await atlasCol.insertMany(data);
                console.log(`   ✅ Successfully migrated ${data.length} documents to Atlas.`);
            } else {
                console.log(`   Skipping empty collection.`);
            }
        }

        console.log("\n✨ DATABASE MIGRATION COMPLETE! ✨");

    } catch (err) {
        console.error("\n❌ MIGRATION FAILED:", err.message);
    } finally {
        if (localConn) await localConn.close();
        if (atlasConn) await atlasConn.close();
        process.exit(0);
    }
}

migrate();
