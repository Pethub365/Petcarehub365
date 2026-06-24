const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const mongoUri = 'mongodb+srv://LeNgoc_db_user:1234567890@cluster0.sowj9aw.mongodb.net/PetcareHub365DB?retryWrites=true&w=majority&appName=Cluster0';

async function check() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');
    const db = mongoose.connection.db;
    
    const password_hash = await bcrypt.hash('123456', 12);
    const result = await db.collection('users').updateOne(
      { email: 'admin@petcarehub.com' },
      { $set: { password_hash } }
    );
    console.log('Reset password result:', result);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
