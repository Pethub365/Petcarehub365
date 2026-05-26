const mongoose = require('mongoose');

const mongoUri = 'mongodb+srv://LeNgoc_db_user:1234567890@cluster0.sowj9aw.mongodb.net/PetcareHub365DB?retryWrites=true&w=majority&appName=Cluster0';

async function check() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');
    const db = mongoose.connection.db;
    
    const users = await db.collection('users').find({}).toArray();
    console.log('Total users in DB:', users.length);
    console.log('Users list:', users.map(u => ({ id: u._id, email: u.email, name: u.profile?.full_name })));

    const pets = await db.collection('pets').find({}).toArray();
    console.log('Total pets in DB:', pets.length);
    console.log('Pets list:', pets.map(p => ({ id: p._id, name: p.name, owner: p.owner_id, xp: p.stats?.xp, level: p.stats?.level })));
    
    const quests = await db.collection('dailyquests').find({}).toArray();
    console.log('Total quests in DB:', quests.length);
    console.log('Quests list:', quests.map(q => ({ id: q._id, pet_id: q.pet_id, title: q.title, status: q.status, reward_xp: q.reward_xp })));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
