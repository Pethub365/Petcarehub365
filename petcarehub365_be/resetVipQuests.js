/**
 * Script xóa nhiệm vụ hôm nay (FREE) cho các user VIP,
 * để hệ thống tự sinh lại nhiệm vụ cá nhân hóa VIP khi truy cập.
 */
const mongoose = require('mongoose');
const moment = require('moment-timezone');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const mongoUri = process.env.MONGO_URI;
const TZ = 'Asia/Ho_Chi_Minh';

async function main() {
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
  console.log('Connected.');
  const db = mongoose.connection.db;

  const now = moment.tz(TZ);
  const startOfDay = now.clone().startOf('day').toDate();
  const endOfDay = now.clone().endOf('day').toDate();

  // Tìm tất cả VIP users
  const vipUsers = await db.collection('users').find({
    $or: [
      { subscription_plan: 'VIP' },
      { is_vip: true }
    ]
  }).toArray();
  console.log(`Found ${vipUsers.length} VIP users.`);

  let totalDeleted = 0;
  for (const u of vipUsers) {
    // Tìm pets của user này
    const pets = await db.collection('pets').find({ owner_id: u._id }).toArray();
    for (const pet of pets) {
      // Xóa tất cả nhiệm vụ hôm nay
      const res = await db.collection('dailyquests').deleteMany({
        pet_id: pet._id,
        assigned_date: { $gte: startOfDay, $lte: endOfDay }
      });
      if (res.deletedCount > 0) {
        console.log(`[${u.email}] Deleted ${res.deletedCount} old quests for pet: ${pet.name}`);
        totalDeleted += res.deletedCount;
      }
    }
  }
  console.log(`\nDone! Total deleted: ${totalDeleted} daily quests. VIP quests will regenerate on next page visit.`);
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
