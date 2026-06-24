const mongoose = require('mongoose');
const { Pet, DailyQuest, WeeklyQuest } = require('./models');
const mongoUri = 'mongodb+srv://LeNgoc_db_user:1234567890@cluster0.sowj9aw.mongodb.net/PetcareHub365DB?retryWrites=true&w=majority&appName=Cluster0';

async function seed() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    const pets = await Pet.find();
    console.log(`Found ${pets.length} pets.`);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    console.log('Clearing completed quests since start of month...');
    const delDaily = await DailyQuest.deleteMany({ completed_at: { $gte: startOfMonth } });
    const delWeekly = await WeeklyQuest.deleteMany({ completed_at: { $gte: startOfMonth } });
    console.log(`Deleted ${delDaily.deletedCount} daily quests and ${delWeekly.deletedCount} weekly quests.`);

    const questCategories = ['DAILY_ROUTINE', 'HEALTH_CARE', 'NUTRITION', 'TRAINING'];
    const questTitles = [
      'Uống nước đầy đủ',
      'Đi dạo buổi sáng',
      'Vệ sinh khay cát',
      'Ăn hạt dinh dưỡng',
      'Chải lông',
      'Uống thuốc bổ',
      'Luyện tập bắt bóng',
      'Khám sức khỏe định kỳ'
    ];

    for (let i = 0; i < pets.length; i++) {
      const pet = pets[i];
      const totalXp = pet.stats?.xp || 0;

      // 1. Current Week XP (Counts for both Week and Month)
      let currentWeekXp = 0;
      if (totalXp > 0) {
        currentWeekXp = Math.floor(Math.min(totalXp * 0.15, 500) + Math.random() * 100 + 100);
      } else {
        currentWeekXp = Math.floor(Math.random() * 100 + 50);
      }

      // Generate current week weekly quest (150 XP)
      const day = now.getDay();
      const diff = now.getDate() - (day === 0 ? 6 : day - 1);
      const weekStart = new Date(now.getFullYear(), now.getMonth(), diff, 0, 0, 0, 0);
      const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000 + 23 * 60 * 60 * 1000 + 59 * 60 * 1000 + 59 * 1000);
      const weeklyCompletedAt = new Date(weekStart.getTime() + 12 * 60 * 60 * 1000); // Monday noon

      await WeeklyQuest.create({
        pet_id: pet._id,
        week_start: weekStart,
        week_end: weekEnd,
        title: 'Hoàn thành thử thách tuần',
        description: 'Chăm sóc thú cưng đầy đủ các ngày trong tuần',
        category: 'HEALTH_CARE',
        reward_xp: 150,
        reward_coin: 30,
        status: 'COMPLETED',
        completed_at: weeklyCompletedAt
      });

      // Generate current week daily quests
      let currentWeekGenerated = 150;
      let qIdx = 0;
      while (currentWeekGenerated < currentWeekXp) {
        const xp = Math.min(50, currentWeekXp - currentWeekGenerated);
        const titleIdx = Math.floor(Math.random() * questTitles.length);
        const catIdx = Math.floor(Math.random() * questCategories.length);

        // Distribute to yesterday or day before
        const dayOffset = (qIdx % 2) + 1;
        const pastDate = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);

        await DailyQuest.create({
          pet_id: pet._id,
          assigned_date: pastDate,
          title: questTitles[titleIdx],
          description: `Nhiệm vụ hàng ngày giúp pet khỏe mạnh: ${questTitles[titleIdx]}`,
          category: questCategories[catIdx],
          reward_xp: xp,
          reward_coin: 10,
          status: 'COMPLETED',
          completed_at: pastDate
        });

        currentWeekGenerated += xp;
        qIdx++;
      }

      // 2. Past Weeks XP (Counts ONLY for Month, NOT current Week)
      // We will place them in the previous weeks of this month (e.g. 7 to 15 days ago)
      let pastWeeksXp = 0;
      if (totalXp > 0) {
        pastWeeksXp = Math.floor(Math.min(totalXp * 0.25, 900) + Math.random() * 200 + 150);
      } else {
        pastWeeksXp = Math.floor(Math.random() * 150 + 50);
      }

      let pastWeeksGenerated = 0;
      let pastQIdx = 0;
      while (pastWeeksGenerated < pastWeeksXp) {
        const xp = Math.min(50, pastWeeksXp - pastWeeksGenerated);
        const titleIdx = Math.floor(Math.random() * questTitles.length);
        const catIdx = Math.floor(Math.random() * questCategories.length);

        // Distribute to past weeks (e.g. 7 to 15 days ago)
        // Check if 7 days ago is still in the current month (June)
        const daysAgo = (pastQIdx % 9) + 8; // 8 to 16 days ago
        const pastDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

        // Ensure it is still in this month (gte startOfMonth)
        const finalPastDate = pastDate >= startOfMonth ? pastDate : new Date(startOfMonth.getTime() + 12 * 60 * 60 * 1000);

        await DailyQuest.create({
          pet_id: pet._id,
          assigned_date: finalPastDate,
          title: questTitles[titleIdx],
          description: `Nhiệm vụ hàng ngày giúp pet khỏe mạnh: ${questTitles[titleIdx]}`,
          category: questCategories[catIdx],
          reward_xp: xp,
          reward_coin: 10,
          status: 'COMPLETED',
          completed_at: finalPastDate
        });

        pastWeeksGenerated += xp;
        pastQIdx++;
      }

      console.log(`Seeded quests for ${pet.name}: Weekly XP = ${currentWeekGenerated}, Monthly XP = ${currentWeekGenerated + pastWeeksGenerated}`);
    }

    console.log('Seeding completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error during seeding:', err);
    process.exit(1);
  }
}

seed();
