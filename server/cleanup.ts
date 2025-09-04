import 'dotenv/config';
import { db } from './db.js';
import { categories, products } from '../shared/schema.js';
import { eq, inArray } from 'drizzle-orm';

async function cleanupCategories() {
  try {
    console.log('Cleaning up duplicate categories...');

    // Get all categories
    const allCategories = await db.select().from(categories);
    console.log(`Found ${allCategories.length} total categories`);

    // Group by name to find duplicates
    const categoryGroups = new Map<string, typeof allCategories>();
    allCategories.forEach(cat => {
      if (!categoryGroups.has(cat.name)) {
        categoryGroups.set(cat.name, []);
      }
      categoryGroups.get(cat.name)!.push(cat);
    });

    // For each category name, keep the first one and update products to use it
    for (const [name, cats] of Array.from(categoryGroups.entries())) {
      if (cats.length > 1) {
        console.log(`\nProcessing duplicates for "${name}" (${cats.length} found)`);
        
        const keepCategory = cats[0]; // Keep the first one
        const removeCategories = cats.slice(1); // Remove the rest
        
        console.log(`  Keeping category ID: ${keepCategory.id}`);
        console.log(`  Removing category IDs: ${removeCategories.map((c: any) => c.id).join(', ')}`);
        
        // Update products that use the duplicate categories
        for (const removeCategory of removeCategories) {
          const productsToUpdate = await db.select().from(products).where(eq(products.categoryId, removeCategory.id));
          console.log(`  Moving ${productsToUpdate.length} products from ${removeCategory.id} to ${keepCategory.id}`);
          
          if (productsToUpdate.length > 0) {
            await db.update(products)
              .set({ categoryId: keepCategory.id })
              .where(eq(products.categoryId, removeCategory.id));
          }
        }
        
        // Delete the duplicate categories
        const idsToDelete = removeCategories.map((c: any) => c.id);
        await db.delete(categories).where(inArray(categories.id, idsToDelete));
        console.log(`  Deleted ${idsToDelete.length} duplicate categories`);
      }
    }

    // Verify cleanup
    const finalCategories = await db.select().from(categories);
    console.log(`\nCleanup complete! Now have ${finalCategories.length} categories:`);
    finalCategories.forEach(cat => console.log(`  - ${cat.name} (ID: ${cat.id})`));

  } catch (error) {
    console.error('Error cleaning up categories:', error);
  }
}

cleanupCategories();
