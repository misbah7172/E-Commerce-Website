import 'dotenv/config';
import { db } from './db.js';
import { categories, products } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

async function debugProducts() {
  try {
    console.log('=== DEBUGGING PRODUCTS API ===\n');

    // Get all categories
    const allCategories = await db.select().from(categories);
    console.log('All categories:');
    allCategories.forEach(cat => console.log(`  - ${cat.name} (ID: ${cat.id})`));

    // Get Electronics category specifically
    const electronicsCategories = allCategories.filter(cat => cat.name === 'Electronics');
    console.log('\nElectronics categories found:', electronicsCategories.length);
    electronicsCategories.forEach(cat => console.log(`  - ${cat.name} (ID: ${cat.id})`));

    if (electronicsCategories.length > 0) {
      const firstElectronicsId = electronicsCategories[0].id;
      
      // Get products in electronics category
      console.log(`\nLooking for products with categoryId: ${firstElectronicsId}`);
      const electronicsProducts = await db.select().from(products).where(eq(products.categoryId, firstElectronicsId));
      console.log(`Found ${electronicsProducts.length} products in Electronics category:`);
      electronicsProducts.forEach(prod => console.log(`  - ${prod.name} (Category ID: ${prod.categoryId})`));
    }

    // Get all products
    console.log('\nAll products:');
    const allProducts = await db.select().from(products);
    allProducts.forEach(prod => {
      const category = allCategories.find(cat => cat.id === prod.categoryId);
      console.log(`  - ${prod.name} (Category: ${category?.name || 'Unknown'}, ID: ${prod.categoryId})`);
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

debugProducts();
