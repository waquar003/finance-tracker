require('dotenv').config({ path: '.env.local' });
// This script migrates all transactions without a category to have 'Other' category
const { MongoClient } = require('mongodb');

async function migrateCategories() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection('transactions');
    
    // Update all transactions without category to have 'Other' category
    const result = await collection.updateMany(
      { category: { $exists: false } },
      { $set: { category: 'Other' } }
    );
    
    console.log(`Updated ${result.modifiedCount} transactions`);
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await client.close();
  }
}

migrateCategories();