const mongoose = require('mongoose');
const { Pet, User } = require('./models');
const mongoUri = 'mongodb+srv://LeNgoc_db_user:1234567890@cluster0.sowj9aw.mongodb.net/PetcareHub365DB?retryWrites=true&w=majority&appName=Cluster0';

async function seed() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    // Count pets
    const currentCount = await Pet.countDocuments();
    console.log(`Current pets count: ${currentCount}`);

    const needed = 45 - currentCount;
    if (needed <= 0) {
      console.log('Already have 45 or more pets.');
      process.exit(0);
    }

    console.log(`Creating ${needed} more pets...`);

    const users = await User.find();
    if (users.length === 0) {
      console.log('No users found in database to assign pets.');
      process.exit(1);
    }

    const dogBreeds = ['Poodle', 'Corgi', 'Husky', 'Golden Retriever', 'Pug', 'Chihuahua', 'Shiba Inu', 'Phú Quốc'];
    const catBreeds = ['Anh lông ngắn', 'Ba Tư', 'Mèo ta', 'Ragdoll', 'Xiêm', 'Bengal', 'Munchkin', 'Sphynx'];
    const otherBreeds = ['Thỏ', 'Hamster', 'Chuột lang', 'Vẹt', 'Rùa'];

    const petNames = [
      'Lucky', 'Max', 'Rocky', 'Toby', 'Oscar', 'Buster', 'Bentley', 'Bruno', 'Rex', 'Leo', 
      'Sam', 'Winnie', 'Ruby', 'Lulu', 'Pepper', 'Gigi', 'Cleo', 'Kitty', 'Mimi', 'Oliver', 
      'Simba', 'Chloe', 'Sophie', 'Nala', 'Sasha', 'Gizmo', 'Cookie', 'Candy', 'Teddy', 'Bông',
      'Milo', 'Lola', 'Charlie', 'Lucy', 'Cooper', 'Sadie', 'Sophie', 'Bailey', 'Jack', 'Nancy',
      'Luna', 'Kiki', 'Miu Miu', 'Bella', 'Coco'
    ];

    for (let i = 0; i < needed; i++) {
      // Pick random user as owner
      const user = users[Math.floor(Math.random() * users.length)];

      // Pick species
      const rand = Math.random();
      let species = 'DOG';
      let breed = '';
      if (rand < 0.45) {
        species = 'DOG';
        breed = dogBreeds[Math.floor(Math.random() * dogBreeds.length)];
      } else if (rand < 0.90) {
        species = 'CAT';
        breed = catBreeds[Math.floor(Math.random() * catBreeds.length)];
      } else {
        species = 'OTHER';
        breed = otherBreeds[Math.floor(Math.random() * otherBreeds.length)];
      }

      // Pick name
      const name = petNames[i % petNames.length] + (i >= petNames.length ? ` ${Math.floor(i / petNames.length) + 1}` : '');

      // Pick dob (random date between 1 and 8 years ago)
      const ageYears = Math.floor(Math.random() * 8) + 1;
      const dob = new Date();
      dob.setFullYear(dob.getFullYear() - ageYears);
      dob.setMonth(Math.floor(Math.random() * 12));
      dob.setDate(Math.floor(Math.random() * 28) + 1);

      // Random weight (between 2 and 30 kg)
      const weight = Math.round((Math.random() * 28 + 2) * 10) / 10;

      // Random gender
      const genders = ['MALE', 'FEMALE'];
      const gender = genders[Math.floor(Math.random() * genders.length)];

      // Random health status
      const statuses = ['NORMAL', 'NORMAL', 'NORMAL', 'OVERWEIGHT', 'UNDERWEIGHT', 'NORMAL'];
      const health_status = statuses[Math.floor(Math.random() * statuses.length)];

      await Pet.create({
        owner_id: user._id,
        name,
        species,
        breed,
        dob,
        weight,
        gender,
        is_neutered: Math.random() > 0.5,
        health_status,
        stats: {
          xp: Math.floor(Math.random() * 400) + 100,
          level: Math.floor(Math.random() * 5) + 1,
          mood: Math.floor(Math.random() * 20) + 80,
          energy: Math.floor(Math.random() * 20) + 80
        }
      });

      console.log(`Created pet #${i + 1}: ${name} (${species} - ${breed}), owned by ${user.username || user.email}`);
    }

    console.log('Additional pets seeding completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding additional pets:', err);
    process.exit(1);
  }
}

seed();
