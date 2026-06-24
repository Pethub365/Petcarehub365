const mongoose = require('mongoose');
const { Pet } = require('./models');
const cloudinary = require('./config/cloudinary');
const mongoUri = 'mongodb+srv://LeNgoc_db_user:1234567890@cluster0.sowj9aw.mongodb.net/PetcareHub365DB?retryWrites=true&w=majority&appName=Cluster0';

const dogAvatars = [
  'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1537151608828-ea2b117b62e4?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1608096299260-db34684c6a1e?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1552053831-71594a27632d?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=150&h=150&fit=crop'
];

const catAvatars = [
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1513360309081-36f5e878fc11?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1548247416-ec66f4900b2e?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1571566882372-1598d83abb8f?w=150&h=150&fit=crop'
];

const otherAvatars = [
  'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1552152370-fb03b2eef792?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1544733422-251e532ca221?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=150&h=150&fit=crop'
];

async function updateAvatars() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    const pets = await Pet.find();
    console.log(`Uploading and updating avatars for ${pets.length} pets...`);

    let dogIdx = 0;
    let catIdx = 0;
    let otherIdx = 0;

    for (let i = 0; i < pets.length; i++) {
      const pet = pets[i];
      let sourceUrl = null;

      if (pet.species === 'DOG') {
        sourceUrl = dogAvatars[dogIdx % dogAvatars.length];
        dogIdx++;
      } else if (pet.species === 'CAT') {
        sourceUrl = catAvatars[catIdx % catAvatars.length];
        catIdx++;
      } else {
        sourceUrl = otherAvatars[otherIdx % otherAvatars.length];
        otherIdx++;
      }

      try {
        console.log(`[${i + 1}/${pets.length}] Uploading ${pet.name}'s avatar to Cloudinary...`);
        const uploadResult = await cloudinary.uploader.upload(sourceUrl, {
          folder: 'petcarehub365/avatars',
        });
        
        pet.avatar_url = uploadResult.secure_url;
        await pet.save();
        console.log(`  Success! -> ${uploadResult.secure_url}`);
      } catch (uploadErr) {
        console.error(`  Failed to upload avatar for ${pet.name}, using raw URL as fallback.`, uploadErr);
        pet.avatar_url = sourceUrl;
        await pet.save();
      }
    }

    console.log('Pet avatars update to Cloudinary completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error in main update script:', err);
    process.exit(1);
  }
}

updateAvatars();
