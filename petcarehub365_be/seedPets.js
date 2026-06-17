const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const mongoUri = 'mongodb+srv://LeNgoc_db_user:1234567890@cluster0.sowj9aw.mongodb.net/PetcareHub365DB?retryWrites=true&w=majority&appName=Cluster0';

async function seed() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');
    const db = mongoose.connection.db;
    const petsCollection = db.collection('pets');
    const usersCollection = db.collection('users');

    const hashedPassword = await bcrypt.hash('123456', 10);

    // 1. Seed or Update Test User (VIP)
    const testUserId = new mongoose.Types.ObjectId('6a02c1e2e4a7c354594b5c9d');
    const existingTestUser = await usersCollection.findOne({ _id: testUserId });
    const vipUser = {
      _id: testUserId,
      email: 'test@petcarehub.com',
      password_hash: hashedPassword,
      is_email_verified: true,
      status: 'ACTIVE',
      coins: 200,
      is_vip: true,
      vip_expires_at: new Date('2030-01-01'),
      subscription_plan: 'VIP',
      subscription_expires_at: new Date('2030-01-01'),
      profile: {
        full_name: 'Test User',
        phone: '0987654321',
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200'
      },
      created_at: new Date(),
      updated_at: new Date()
    };

    if (existingTestUser) {
      await usersCollection.updateOne({ _id: testUserId }, { $set: { is_vip: true, subscription_plan: 'VIP', vip_expires_at: new Date('2030-01-01'), subscription_expires_at: new Date('2030-01-01') } });
      console.log('Updated existing Test User to VIP.');
    } else {
      await usersCollection.insertOne(vipUser);
      console.log('Inserted Test User (VIP).');
    }

    // 2. Seed or Update Le Ngoc User (FREE)
    const leNgocUserId = new mongoose.Types.ObjectId('6a02c2d1e4a7c354594b5ca0');
    const existingLeNgocUser = await usersCollection.findOne({ _id: leNgocUserId });
    const freeUser = {
      _id: leNgocUserId,
      email: 'lengoc@petcarehub.com',
      password_hash: hashedPassword,
      is_email_verified: true,
      status: 'ACTIVE',
      coins: 100,
      is_vip: false,
      vip_expires_at: null,
      subscription_plan: 'FREE',
      subscription_expires_at: null,
      profile: {
        full_name: 'Le Ngoc',
        phone: '0123456789',
        avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200'
      },
      created_at: new Date(),
      updated_at: new Date()
    };

    if (existingLeNgocUser) {
      await usersCollection.updateOne({ _id: leNgocUserId }, { $set: { is_vip: false, subscription_plan: 'FREE', vip_expires_at: null, subscription_expires_at: null } });
      console.log('Updated existing Le Ngoc User to FREE.');
    } else {
      await usersCollection.insertOne(freeUser);
      console.log('Inserted Le Ngoc User (FREE).');
    }

    // 3. Clean and Seed Pets
    console.log('Clearing existing pets...');
    await petsCollection.deleteMany({});

    // Define pets to seed
    const mockPets = [
      {
        owner_id: testUserId, // Test User (VIP)
        name: 'Cooper',
        species: 'DOG',
        breed: 'Corgi',
        dob: new Date('2023-01-01'),
        weight: 12,
        gender: 'MALE',
        is_neutered: true,
        health_status: 'NORMAL',
        avatar_url: 'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?q=80&w=200',
        stats: { xp: 3120, level: 12, mood: 95, energy: 90 }
      },
      {
        owner_id: testUserId, // Test User (VIP)
        name: 'Bella',
        species: 'DOG',
        breed: 'Golden Retriever',
        dob: new Date('2022-05-01'),
        weight: 28,
        gender: 'FEMALE',
        is_neutered: true,
        health_status: 'NORMAL',
        avatar_url: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?q=80&w=200',
        stats: { xp: 2450, level: 8, mood: 90, energy: 85 }
      },
      {
        owner_id: testUserId, // Test User (VIP)
        name: 'Rocky',
        species: 'DOG',
        breed: 'Husky',
        dob: new Date('2023-06-01'),
        weight: 22,
        gender: 'MALE',
        is_neutered: false,
        health_status: 'NORMAL',
        avatar_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=200',
        stats: { xp: 1950, level: 5, mood: 88, energy: 80 }
      },
      {
        owner_id: testUserId, // Test User (VIP)
        name: 'Chico',
        species: 'DOG',
        breed: 'Chihuahua',
        dob: new Date('2024-01-15'),
        weight: 3.2,
        gender: 'MALE',
        is_neutered: true,
        health_status: 'NORMAL',
        avatar_url: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=200',
        stats: { xp: 1200, level: 3, mood: 92, energy: 85 }
      },
      {
        owner_id: testUserId, // Test User (VIP)
        name: 'Milo',
        species: 'DOG',
        breed: 'Poodle',
        dob: new Date('2024-01-01'),
        weight: 10,
        gender: 'MALE',
        is_neutered: true,
        health_status: 'NORMAL',
        avatar_url: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?q=80&w=200',
        stats: { xp: 2380, level: 7, mood: 90, energy: 92 }
      },
      {
        owner_id: leNgocUserId, // Le Ngoc (FREE)
        name: 'Coco',
        species: 'CAT',
        breed: 'Sphynx',
        dob: new Date('2024-02-01'),
        weight: 4,
        gender: 'FEMALE',
        is_neutered: true,
        health_status: 'NORMAL',
        avatar_url: 'https://images.unsplash.com/photo-1526336028075-c3584014f3cf?q=80&w=200',
        stats: { xp: 1500, level: 4, mood: 90, energy: 95 }
      },
      {
        owner_id: leNgocUserId, // Le Ngoc (FREE)
        name: 'Oliver',
        species: 'CAT',
        breed: 'Scottish Fold',
        dob: new Date('2023-03-01'),
        weight: 5,
        gender: 'MALE',
        is_neutered: true,
        health_status: 'NORMAL',
        avatar_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=200',
        stats: { xp: 2840, level: 11, mood: 92, energy: 88 }
      },
      {
        owner_id: leNgocUserId, // Le Ngoc (FREE)
        name: 'Luna',
        species: 'CAT',
        breed: 'British Shorthair',
        dob: new Date('2022-10-01'),
        weight: 4.5,
        gender: 'FEMALE',
        is_neutered: true,
        health_status: 'NORMAL',
        avatar_url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=200',
        stats: { xp: 2610, level: 9, mood: 94, energy: 90 }
      },
      {
        owner_id: leNgocUserId, // Le Ngoc (FREE)
        name: 'Lucy',
        species: 'CAT',
        breed: 'British Longhair',
        dob: new Date('2023-05-10'),
        weight: 4.8,
        gender: 'FEMALE',
        is_neutered: false,
        health_status: 'NORMAL',
        avatar_url: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?q=80&w=200',
        stats: { xp: 1800, level: 5, mood: 89, energy: 87 }
      },
      {
        owner_id: leNgocUserId, // Le Ngoc (FREE)
        name: 'Simbah',
        species: 'CAT',
        breed: 'Persian',
        dob: new Date('2023-07-20'),
        weight: 5.2,
        gender: 'MALE',
        is_neutered: true,
        health_status: 'NORMAL',
        avatar_url: 'https://images.unsplash.com/photo-1618826411640-d6df44dd3f7a?q=80&w=200',
        stats: { xp: 2020, level: 6, mood: 91, energy: 86 }
      }
    ];

    // Normalize stats to ensure level and XP are always in sync according to the progression formula
    mockPets.forEach(pet => {
      if (pet.stats) {
        let xpNeeded = pet.stats.level * 100 + 800;
        while (pet.stats.xp >= xpNeeded) {
          pet.stats.level += 1;
          pet.stats.xp -= xpNeeded;
          xpNeeded = pet.stats.level * 100 + 800;
        }
      }
    });

    await petsCollection.insertMany(mockPets);
    console.log(`Seeded and normalized ${mockPets.length} pets.`);

    console.log('Seeding completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
