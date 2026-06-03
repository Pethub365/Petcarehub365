const mongoose = require('mongoose');

const mongoUri = 'mongodb+srv://LeNgoc_db_user:1234567890@cluster0.sowj9aw.mongodb.net/PetcareHub365DB?retryWrites=true&w=majority&appName=Cluster0';

async function check() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');
    const db = mongoose.connection.db;

    const weeklyQuests = await db.collection('weeklyquests').find({}).toArray();
    console.log('Total weekly/monthly/annual quests in DB:', weeklyQuests.length);
    for (const q of weeklyQuests) {
      console.log('WeeklyQuest:', {
        id: q._id,
        title: q.title,
        status: q.status,
        period: q.period,
        reward_xp: q.reward_xp,
        pet_id: q.pet_id,
        completed_at: q.completed_at
      });
    }

    const dailyQuests = await db.collection('dailyquests').find({ pet_id: new mongoose.Types.ObjectId('6a1fb3e8e83b891b662747f7') }).toArray();
    console.log('Total daily quests for Ruby in DB:', dailyQuests.length);
    for (const q of dailyQuests) {
      console.log('DailyQuest:', {
        id: q._id,
        title: q.title,
        status: q.status,
        reward_xp: q.reward_xp,
        completed_at: q.completed_at
      });
    }

    const achievements = await db.collection('achievements').find({}).toArray();
    console.log('Total achievements in DB:', achievements.length);
    for (const a of achievements) {
      console.log('Achievement:', {
        key: a.key,
        title: a.title,
        reward_xp: a.reward_xp,
        reward_coin: a.reward_coin
      });
    }

    const pets = await db.collection('pets').find({}).toArray();
    console.log('Pets stats:');
    for (const p of pets) {
      console.log(`Pet "${p.name}" (${p._id}):`, p.stats);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
