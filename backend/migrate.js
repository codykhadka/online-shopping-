const mongoose = require('mongoose');

async function migrate() {
  await mongoose.connect('mongodb://localhost:27017/online-shopping-');
  const Product = mongoose.model('Product', new mongoose.Schema({
    likes: { type: mongoose.Schema.Types.Mixed, default: [] },
    ratings: { type: Array, default: [] },
    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 }
  }, { strict: false }));

  const products = await Product.find();
  for (const p of products) {
    if (!Array.isArray(p.likes)) {
      console.log(`Migrating likes for ${p._id}`);
      p.likes = [];
      p.ratings = [];
      p.ratingAverage = 0;
      p.ratingCount = 0;
      await p.save();
    }
  }
  console.log('Migration complete.');
  process.exit(0);
}

migrate();
