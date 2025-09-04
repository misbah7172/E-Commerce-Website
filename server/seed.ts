import 'dotenv/config';
import { db } from './db.js';
import { categories, products } from '../shared/schema.js';

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Insert categories first
    const categoryData = [
      {
        name: 'Electronics',
        description: 'Electronic devices, gadgets, and accessories',
        image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500'
      },
      {
        name: 'Fashion',
        description: 'Clothing, shoes, and fashion accessories',
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500'
      },
      {
        name: 'Home & Garden',
        description: 'Home improvement and garden supplies',
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500'
      },
      {
        name: 'Sports',
        description: 'Sports equipment and athletic wear',
        image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500'
      },
      {
        name: 'Books',
        description: 'Books, e-books, and educational materials',
        image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500'
      },
      {
        name: 'Beauty',
        description: 'Cosmetics, skincare, and beauty products',
        image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500'
      },
      {
        name: 'Automotive',
        description: 'Car parts, accessories, and automotive tools',
        image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500'
      }
    ];

    console.log('Inserting categories...');
    const insertedCategories = await db.insert(categories).values(categoryData).returning();
    console.log(`Inserted ${insertedCategories.length} categories`);

    // Get category IDs for products
    const electronicsCategory = insertedCategories.find(c => c.name === 'Electronics');
    const fashionCategory = insertedCategories.find(c => c.name === 'Fashion');
    const homeCategory = insertedCategories.find(c => c.name === 'Home & Garden');
    const sportsCategory = insertedCategories.find(c => c.name === 'Sports');
    const booksCategory = insertedCategories.find(c => c.name === 'Books');
    const beautyCategory = insertedCategories.find(c => c.name === 'Beauty');

    // Insert products
    const productData = [
      // Electronics
      {
        name: 'iPhone 15 Pro',
        description: 'Latest iPhone with advanced camera system and A17 Pro chip',
        price: '999.99',
        originalPrice: '1099.99',
        sku: 'IPHONE15PRO-001',
        categoryId: electronicsCategory?.id || '',
        images: [
          'https://images.unsplash.com/photo-1592286634757-3ad95c91d2d6?w=500',
          'https://images.unsplash.com/photo-1574319094346-c8b5a26d9d96?w=500'
        ],
        stock: 50,
        features: ['A17 Pro chip', '48MP camera', '6.1-inch display', 'Face ID'],
        specifications: {
          'Display': '6.1-inch Super Retina XDR',
          'Storage': '128GB',
          'Camera': '48MP Main, 12MP Ultra Wide',
          'Battery': 'Up to 23 hours video playback'
        },
        rating: '4.5',
        reviewCount: 128
      },
      {
        name: 'MacBook Air M3',
        description: 'Thin and light laptop with M3 chip and all-day battery life',
        price: '1299.99',
        originalPrice: '1399.99',
        sku: 'MACBOOK-AIR-M3-001',
        categoryId: electronicsCategory?.id || '',
        images: [
          'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500',
          'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500'
        ],
        stock: 30,
        features: ['M3 chip', '13.6-inch display', '18-hour battery', 'MagSafe charging'],
        specifications: {
          'Processor': 'Apple M3 chip',
          'Display': '13.6-inch Liquid Retina',
          'Memory': '8GB unified memory',
          'Storage': '256GB SSD'
        },
        rating: '4.7',
        reviewCount: 89
      },
      {
        name: 'Sony WH-1000XM5 Headphones',
        description: 'Premium noise-canceling wireless headphones',
        price: '349.99',
        originalPrice: '399.99',
        sku: 'SONY-WH1000XM5-001',
        categoryId: electronicsCategory?.id || '',
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
          'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500'
        ],
        stock: 75,
        features: ['Active Noise Canceling', '30-hour battery', 'Quick Charge', 'Voice Assistant'],
        specifications: {
          'Battery Life': '30 hours',
          'Charging': 'USB-C, Quick Charge',
          'Weight': '250g',
          'Connectivity': 'Bluetooth 5.2'
        },
        rating: '4.6',
        reviewCount: 203
      },

      // Fashion
      {
        name: 'Levi\'s 501 Original Jeans',
        description: 'Classic straight-leg jeans with authentic fit and vintage style',
        price: '89.99',
        originalPrice: '109.99',
        sku: 'LEVIS-501-BLUE-32',
        categoryId: fashionCategory?.id || '',
        images: [
          'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500',
          'https://images.unsplash.com/photo-1551803091-e20673f15770?w=500'
        ],
        stock: 120,
        features: ['100% Cotton', 'Classic fit', 'Button fly', 'Machine washable'],
        specifications: {
          'Material': '100% Cotton',
          'Fit': 'Straight',
          'Rise': 'Mid-rise',
          'Closure': 'Button fly'
        },
        rating: '4.3',
        reviewCount: 156
      },
      {
        name: 'Nike Air Max 270',
        description: 'Comfortable running shoes with Max Air cushioning',
        price: '149.99',
        originalPrice: '170.00',
        sku: 'NIKE-AIRMAX270-10',
        categoryId: fashionCategory?.id || '',
        images: [
          'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500',
          'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=500'
        ],
        stock: 85,
        features: ['Max Air cushioning', 'Breathable mesh', 'Durable rubber outsole', 'Lightweight'],
        specifications: {
          'Upper': 'Mesh and synthetic',
          'Midsole': 'Foam with Max Air unit',
          'Outsole': 'Rubber',
          'Weight': '10.2 oz'
        },
        rating: '4.4',
        reviewCount: 92
      },

      // Home & Garden
      {
        name: 'Instant Pot Duo 7-in-1',
        description: 'Multi-functional electric pressure cooker',
        price: '79.99',
        originalPrice: '99.99',
        sku: 'INSTANTPOT-DUO-6QT',
        categoryId: homeCategory?.id || '',
        images: [
          'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=500',
          'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500'
        ],
        stock: 60,
        features: ['7 appliances in 1', '6-quart capacity', '13 one-touch programs', 'Safety features'],
        specifications: {
          'Capacity': '6 quarts',
          'Functions': '7 (Pressure, Slow, Rice, Yogurt, Steam, Sauté, Warm)',
          'Material': 'Stainless steel',
          'Power': '1000W'
        },
        rating: '4.8',
        reviewCount: 234
      },

      // Sports
      {
        name: 'Yoga Mat Premium',
        description: 'Non-slip yoga mat for all types of yoga and exercise',
        price: '29.99',
        originalPrice: '39.99',
        sku: 'YOGA-MAT-PREMIUM-001',
        categoryId: sportsCategory?.id || '',
        images: [
          'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500',
          'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500'
        ],
        stock: 150,
        features: ['Non-slip surface', 'Eco-friendly', '6mm thickness', 'Lightweight'],
        specifications: {
          'Dimensions': '72" x 24"',
          'Thickness': '6mm',
          'Material': 'TPE (Thermoplastic Elastomer)',
          'Weight': '2.2 lbs'
        },
        rating: '4.2',
        reviewCount: 67
      },

      // Books
      {
        name: 'The Psychology of Programming',
        description: 'Essential reading for software developers and programmers',
        price: '24.99',
        originalPrice: '29.99',
        sku: 'BOOK-PSYCH-PROG-001',
        categoryId: booksCategory?.id || '',
        images: [
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
          'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500'
        ],
        stock: 200,
        features: ['Paperback', '320 pages', 'Educational', 'Programming guide'],
        specifications: {
          'Format': 'Paperback',
          'Pages': '320',
          'Publisher': 'Tech Books',
          'Language': 'English'
        },
        rating: '4.6',
        reviewCount: 45
      },

      // Beauty
      {
        name: 'Moisturizing Face Cream',
        description: 'Hydrating face cream for all skin types with SPF 30',
        price: '34.99',
        originalPrice: '44.99',
        sku: 'FACE-CREAM-SPF30-001',
        categoryId: beautyCategory?.id || '',
        images: [
          'https://images.unsplash.com/photo-1556228724-f6f6b8b5b3a3?w=500',
          'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=500'
        ],
        stock: 80,
        features: ['SPF 30', 'All skin types', 'Paraben-free', 'Dermatologist tested'],
        specifications: {
          'Size': '50ml',
          'SPF': '30',
          'Skin Type': 'All types',
          'Ingredients': 'Hyaluronic acid, Vitamin E'
        },
        rating: '4.1',
        reviewCount: 112
      }
    ];

    console.log('Inserting products...');
    const insertedProducts = await db.insert(products).values(productData).returning();
    console.log(`Inserted ${insertedProducts.length} products`);

    console.log('Database seeding completed successfully!');
    console.log(`Total categories: ${insertedCategories.length}`);
    console.log(`Total products: ${insertedProducts.length}`);

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// Run the seeding
seedDatabase()
  .then(() => {
    console.log('Seeding finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
