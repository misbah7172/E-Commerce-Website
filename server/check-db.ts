import 'dotenv/config';
import { db } from './db.js';
import { categories, products } from '../shared/schema.js';

async function checkDatabase() {
  try {
    console.log('Checking database contents...');

    const existingCategories = await db.select().from(categories);
    console.log(`Found ${existingCategories.length} categories:`);
    existingCategories.forEach(cat => console.log(`  - ${cat.name}`));

    const existingProducts = await db.select().from(products);
    console.log(`\nFound ${existingProducts.length} products:`);
    existingProducts.forEach(prod => console.log(`  - ${prod.name} (${prod.sku})`));

  } catch (error) {
    console.error('Error checking database:', error);
  }
}

checkDatabase();
