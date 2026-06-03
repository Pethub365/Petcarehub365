const mongoose = require('mongoose');
const { WeeklyQuest, Pet, User } = require('./models');

const mongoUri = 'mongodb+srv://LeNgoc_db_user:1234567890@cluster0.sowj9aw.mongodb.net/PetcareHub365DB?retryWrites=true&w=majority&appName=Cluster0';

async function run() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    // Find the completed weekly quest for ruby
    const questId = '6a1fc4179db6703c0e175169'; // Cắt móng & Vệ sinh tai cho ruby (WEEKLY)
    const quest = await WeeklyQuest.findById(questId);
    if (!quest) {
      console.log('Quest not found');
      process.exit(1);
    }

    console.log('Before Reset Quest:', { id: quest._id, status: quest.status });
    
    // Reset to PENDING so we can test completing it
    quest.status = 'PENDING';
    quest.completed_at = null;
    await quest.save();
    console.log('Reset Quest to PENDING.');

    // Fetch Pet before completion
    const pet = await Pet.findById(quest.pet_id);
    console.log('Pet before complete:', { name: pet.name, stats: pet.stats });

    // Emulate completion logic
    console.log('--- Emulating completeWeeklyQuest ---');
    quest.status = 'COMPLETED';
    quest.completed_at = new Date();
    await quest.save();
    console.log('Saved quest completed status.');

    const originalLevel = pet.stats.level;
    pet.stats.xp += quest.reward_xp;
    
    let xpNeeded = pet.stats.level * 100 + 800;
    while (pet.stats.xp >= xpNeeded) {
        pet.stats.level += 1;
        pet.stats.xp -= xpNeeded;
        xpNeeded = pet.stats.level * 100 + 800;
    }
    
    pet.stats.mood = Math.min(100, pet.stats.mood + 15);
    pet.markModified('stats');

    console.log('Pet modified stats:', pet.stats);

    const user = await User.findById(pet.owner_id);
    if (user) {
        console.log('Saving pet and user...');
        const userRes = await user.save();
        console.log('User saved.');
        const petRes = await pet.save();
        console.log('Pet saved res stats:', petRes.stats);
    }

    // Refetch from DB to see if it persisted
    const refetchedPet = await Pet.findById(quest.pet_id);
    console.log('Refetched Pet from DB:', { name: refetchedPet.name, stats: refetchedPet.stats });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
