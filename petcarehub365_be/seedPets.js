const mongoose = require('mongoose');

const mongoUri = 'mongodb+srv://LeNgoc_db_user:1234567890@cluster0.sowj9aw.mongodb.net/PetcareHub365DB?retryWrites=true&w=majority&appName=Cluster0';

async function seed() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');
    const db = mongoose.connection.db;
    const petsCollection = db.collection('pets');

    // Define pets to seed
    const mockPets = [
      {
        owner_id: new mongoose.Types.ObjectId('6a02c1e2e4a7c354594b5c9d'), // Test User
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
        owner_id: new mongoose.Types.ObjectId('6a02c1e2e4a7c354594b5c9d'), // Test User
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
        owner_id: new mongoose.Types.ObjectId('6a02c1e2e4a7c354594b5c9d'), // Test User
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
        owner_id: new mongoose.Types.ObjectId('6a02c2d1e4a7c354594b5ca0'), // Le Ngoc
        name: 'Oliver',
        species: 'CAT',
        breed: 'American Shorthair',
        dob: new Date('2023-03-01'),
        weight: 5,
        gender: 'MALE',
        is_neutered: true,
        health_status: 'NORMAL',
        avatar_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=200',
        stats: { xp: 2840, level: 11, mood: 92, energy: 88 }
      },
      {
        owner_id: new mongoose.Types.ObjectId('6a02c2d1e4a7c354594b5ca0'), // Le Ngoc
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
        owner_id: new mongoose.Types.ObjectId('6a02c2d1e4a7c354594b5ca0'), // Le Ngoc
        name: 'Milo',
        species: 'DOG',
        breed: 'Corgi',
        dob: new Date('2024-01-01'),
        weight: 10,
        gender: 'MALE',
        is_neutered: true,
        health_status: 'NORMAL',
        avatar_url: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?q=80&w=200',
        stats: { xp: 2380, level: 7, mood: 90, energy: 92 }
      },
      {
        owner_id: new mongoose.Types.ObjectId('6a02c2d1e4a7c354594b5ca0'), // Le Ngoc
        name: 'Bibi',
        species: 'OTHER',
        breed: 'Parrot',
        dob: new Date('2023-11-01'),
        weight: 0.3,
        gender: 'UNKNOWN',
        is_neutered: false,
        health_status: 'NORMAL',
        avatar_url: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?q=80&w=200',
        stats: { xp: 2100, level: 6, mood: 85, energy: 80 }
      }
    ];

    for (const pet of mockPets) {
      // Check if pet already exists by name and owner to prevent duplicate seed runs
      const existing = await petsCollection.findOne({ name: pet.name, owner_id: pet.owner_id });
      if (!existing) {
        await petsCollection.insertOne(pet);
        console.log(`Seeded pet: ${pet.name}`);
      } else {
        console.log(`Pet already exists: ${pet.name}`);
      }
    }

    console.log('Seeding completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
