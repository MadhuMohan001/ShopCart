import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

dotenv.config();

// ---- Models (inline to keep seed self-contained) ----
const userSchema = new mongoose.Schema({ name: String, email: { type: String, unique: true }, password: String, role: { type: String, default: 'user' }, isActive: { type: Boolean, default: true }, refreshToken: String }, { timestamps: true });
const productSchema = new mongoose.Schema({ name: String, slug: String, description: String, price: Number, discountPrice: { type: Number, default: 0 }, category: String, brand: String, images: [{ url: String, public_id: String }], stock: Number, sold: { type: Number, default: 0 }, reviews: [], rating: { type: Number, default: 0 }, numReviews: { type: Number, default: 0 }, featured: Boolean, tags: [String], isActive: { type: Boolean, default: true } }, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);

const USERS = [
  { name: 'Admin User', email: 'admin@demo.com', password: 'admin123', role: 'admin' },
  { name: 'Demo User', email: 'user@demo.com', password: 'user123', role: 'user' },
];

const PRODUCTS = [
  { name: 'Wireless Bluetooth Headphones', description: 'Premium wireless headphones with active noise cancellation, 30-hour battery life, and superior sound quality. Perfect for music lovers and remote workers.', price: 4999, discountPrice: 3499, category: 'Electronics', brand: 'SoundMax', stock: 50, featured: true, tags: ['wireless', 'audio', 'noise-cancelling'], images: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', public_id: 'seed1' }] },
  { name: 'Running Sports Shoes', description: 'Lightweight and breathable running shoes designed for long-distance runners. Features advanced cushioning technology for maximum comfort.', price: 3499, discountPrice: 2799, category: 'Footwear', brand: 'SpeedRun', stock: 30, featured: true, tags: ['running', 'sports', 'shoes'], images: [{ url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', public_id: 'seed2' }] },
  { name: 'Minimalist Leather Wallet', description: 'Slim and stylish leather wallet with RFID blocking technology. Holds up to 8 cards and has a secret cash compartment.', price: 1299, discountPrice: 0, category: 'Accessories', brand: 'CraftLeather', stock: 80, featured: false, tags: ['wallet', 'leather', 'rfid'], images: [{ url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600', public_id: 'seed3' }] },
  { name: 'Stainless Steel Water Bottle', description: 'Eco-friendly 1-litre insulated water bottle that keeps drinks cold for 24 hours and hot for 12 hours. BPA-free and leak-proof.', price: 899, discountPrice: 699, category: 'Home & Kitchen', brand: 'EcoFlow', stock: 120, featured: true, tags: ['bottle', 'eco', 'insulated'], images: [{ url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600', public_id: 'seed4' }] },
  { name: 'Mechanical Gaming Keyboard', description: 'RGB mechanical gaming keyboard with Cherry MX switches, anti-ghosting, and programmable macros. Built for serious gamers.', price: 6999, discountPrice: 5499, category: 'Electronics', brand: 'GamePro', stock: 25, featured: true, tags: ['gaming', 'keyboard', 'rgb', 'mechanical'], images: [{ url: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600', public_id: 'seed5' }] },
  { name: 'Yoga Mat Pro', description: 'Non-slip 6mm thick yoga mat made from natural rubber. Includes alignment lines and carrying strap. Perfect for all types of yoga and pilates.', price: 1499, discountPrice: 1199, category: 'Sports', brand: 'ZenFit', stock: 60, featured: false, tags: ['yoga', 'fitness', 'mat'], images: [{ url: 'https://images.unsplash.com/photo-1601925228154-8f8c9d8c2f8f?w=600', public_id: 'seed6' }] },
  { name: 'Smart Watch Series 5', description: 'Feature-packed smartwatch with health monitoring, GPS, 5-day battery, sleep tracking and 50+ workout modes. Water resistant up to 50m.', price: 8999, discountPrice: 7499, category: 'Electronics', brand: 'TechWear', stock: 15, featured: true, tags: ['smartwatch', 'fitness', 'gps'], images: [{ url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600', public_id: 'seed7' }] },
  { name: 'Cotton Casual T-Shirt', description: 'Ultra-soft 100% organic cotton t-shirt available in multiple colors. Breathable, durable, and sustainably sourced.', price: 599, discountPrice: 0, category: 'Clothing', brand: 'EcoWear', stock: 200, featured: false, tags: ['tshirt', 'cotton', 'casual'], images: [{ url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600', public_id: 'seed8' }] },
  { name: 'Portable Laptop Stand', description: 'Adjustable aluminium laptop stand with 6 height levels. Compatible with laptops 10-16 inches. Foldable and lightweight for on-the-go use.', price: 1799, discountPrice: 1399, category: 'Electronics', brand: 'DeskPro', stock: 40, featured: false, tags: ['laptop', 'stand', 'ergonomic'], images: [{ url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600', public_id: 'seed9' }] },
  { name: 'Scented Soy Candle Set', description: 'Set of 3 handmade soy wax candles in relaxing lavender, vanilla, and cedarwood scents. Each burns for up to 40 hours.', price: 799, discountPrice: 0, category: 'Home & Kitchen', brand: 'AromaCraft', stock: 90, featured: false, tags: ['candle', 'aromatherapy', 'home'], images: [{ url: 'https://images.unsplash.com/photo-1602523961358-f9f03dd557db?w=600', public_id: 'seed10' }] },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    for (const u of USERS) {
      const hashed = await bcrypt.hash(u.password, 10);
      await User.create({ ...u, password: hashed });
    }
    console.log('✓ Users seeded (admin@demo.com / admin123, user@demo.com / user123)');

    // Create products
    for (const p of PRODUCTS) {
      const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
      await Product.create({ ...p, slug });
    }
    console.log(`✓ ${PRODUCTS.length} products seeded`);

    console.log('\n🌱 Seed complete! You can now log in with:');
    console.log('  Admin: admin@demo.com / admin123');
    console.log('  User:  user@demo.com  / user123');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
