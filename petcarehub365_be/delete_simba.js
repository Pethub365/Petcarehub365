const mongoose = require('mongoose');
const mongoUri = 'mongodb+srv://LeNgoc_db_user:1234567890@cluster0.sowj9aw.mongodb.net/PetcareHub365DB?retryWrites=true&w=majority&appName=Cluster0';

async function removeSimba() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    const db = mongoose.connection.db;

    // Find Simba's ID
    const simba = await db.collection('pets').findOne({ name: 'Simba' });
    if (!simba) {
      console.log('No pet named Simba found in the database.');
      process.exit(0);
    }

    console.log(`Found Simba with ID: ${simba._id}`);

    // Delete from pets
    const deletePet = await db.collection('pets').deleteOne({ _id: simba._id });
    console.log(`Deleted pet: ${deletePet.deletedCount}`);

    // Delete daily quests
    const deleteDaily = await db.collection('dailyquests').deleteMany({ pet_id: simba._id });
    console.log(`Deleted daily quests: ${deleteDaily.deletedCount}`);

    // Delete weekly quests
    const deleteWeekly = await db.collection('weeklyquests').deleteMany({ pet_id: simba._id });
    console.log(`Deleted weekly quests: ${deleteWeekly.deletedCount}`);

    // Remove from family group pet_ids
    const updateFamily = await db.collection('familygroups').updateMany(
      { pet_ids: simba._id },
      { $pull: { pet_ids: simba._id } }
    );
    console.log(`Updated family groups: ${updateFamily.modifiedCount}`);

    console.log('Simba has been successfully removed from the database.');
    process.exit(0);
  } catch (err) {
    console.error('Error removing Simba:', err);
    process.exit(1);
  }
}

removeSimba();
