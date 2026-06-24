const mongoose = require('mongoose');
const { Pet, User } = require('./models');
const mongoUri = 'mongodb+srv://LeNgoc_db_user:1234567890@cluster0.sowj9aw.mongodb.net/PetcareHub365DB?retryWrites=true&w=majority&appName=Cluster0';

async function check() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    const pets = await Pet.find();
    let base64Pets = 0;
    pets.forEach(pet => {
      if (pet.avatar_url && pet.avatar_url.startsWith('data:')) {
        base64Pets++;
        console.log(`Pet [${pet.name}] has base64 avatar.`);
      }
    });

    const users = await User.find();
    let base64Users = 0;
    users.forEach(user => {
      if (user.profile && user.profile.avatar_url && user.profile.avatar_url.startsWith('data:')) {
        base64Users++;
        console.log(`User [${user.email}] has base64 avatar.`);
      }
    });

    console.log(`Summary: Found ${base64Pets} pets and ${base64Users} users with base64 avatars.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
