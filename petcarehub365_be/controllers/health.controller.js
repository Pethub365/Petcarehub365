const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { HealthLog, Vaccine, Pet, Notification } = require('../models');

// 1. Get health logs for a specific pet
exports.getHealthLogs = catchAsync(async (req, res) => {
  const { petId } = req.params;
  
  const pet = await Pet.findById(petId);
  if (!pet) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Pet not found');
  }

  // Verify ownership or family membership
  const isOwner = pet.owner_id.toString() === req.user._id.toString();
  if (!isOwner) {
    const { FamilyGroup } = require('../models');
    const familyGroup = await FamilyGroup.findOne({
      pet_ids: pet._id,
      'members.user_id': req.user._id
    });
    if (!familyGroup) {
      throw new ApiError(httpStatus.FORBIDDEN, 'You do not have access to this pet');
    }
  }

  const logs = await HealthLog.find({ pet_id: petId }).sort({ measured_at: 1 });
  res.status(httpStatus.OK).json({
    success: true,
    data: logs
  });
});

// 2. Add a new health log for a specific pet
exports.addHealthLog = catchAsync(async (req, res) => {
  const { petId } = req.params;
  const { weight, height, heart_rate, temperature, measured_at, health_status, note, food_intake, water_intake, sleep_duration, activity_minutes } = req.body;

  const pet = await Pet.findById(petId);
  if (!pet) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Pet not found');
  }

  // Verify ownership or family membership
  const isOwner = pet.owner_id.toString() === req.user._id.toString();
  if (!isOwner) {
    const { FamilyGroup } = require('../models');
    const familyGroup = await FamilyGroup.findOne({
      pet_ids: pet._id,
      'members.user_id': req.user._id
    });
    if (!familyGroup) {
      throw new ApiError(httpStatus.FORBIDDEN, 'You do not have access to this pet');
    }
  }

  const log = await HealthLog.create({
    pet_id: petId,
    weight,
    height,
    heart_rate,
    temperature,
    health_status: health_status || 'NORMAL',
    note: note || '',
    food_intake,
    water_intake,
    sleep_duration,
    activity_minutes,
    measured_at: measured_at || new Date()
  });

  // Update pet weight
  pet.weight = weight;
  await pet.save();

  res.status(httpStatus.CREATED).json({
    success: true,
    data: log
  });
});

// 3. Get vaccines for a specific pet
exports.getVaccines = catchAsync(async (req, res) => {
  const { petId } = req.params;

  const pet = await Pet.findById(petId);
  if (!pet) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Pet not found');
  }

  // Verify ownership or family membership
  const isOwner = pet.owner_id.toString() === req.user._id.toString();
  if (!isOwner) {
    const { FamilyGroup } = require('../models');
    const familyGroup = await FamilyGroup.findOne({
      pet_ids: pet._id,
      'members.user_id': req.user._id
    });
    if (!familyGroup) {
      throw new ApiError(httpStatus.FORBIDDEN, 'You do not have access to this pet');
    }
  }

  const vaccines = await Vaccine.find({ pet_id: petId }).sort({ administered_date: -1 });
  res.status(httpStatus.OK).json({
    success: true,
    data: vaccines
  });
});

// 4. Add a vaccine entry for a specific pet
exports.addVaccine = catchAsync(async (req, res) => {
  const { petId } = req.params;
  const { vaccine_name, administered_date, next_due_date, notes } = req.body;

  const pet = await Pet.findById(petId);
  if (!pet) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Pet not found');
  }

  // Verify ownership or family membership
  const isOwner = pet.owner_id.toString() === req.user._id.toString();
  if (!isOwner) {
    const { FamilyGroup } = require('../models');
    const familyGroup = await FamilyGroup.findOne({
      pet_ids: pet._id,
      'members.user_id': req.user._id
    });
    if (!familyGroup) {
      throw new ApiError(httpStatus.FORBIDDEN, 'You do not have access to this pet');
    }
  }

  const vaccine = await Vaccine.create({
    pet_id: petId,
    vaccine_name,
    administered_date,
    next_due_date,
    notes
  });

  res.status(httpStatus.CREATED).json({
    success: true,
    data: vaccine
  });
});

// 5. Delete health log
exports.deleteHealthLog = catchAsync(async (req, res) => {
  const { logId } = req.params;
  const log = await HealthLog.findById(logId);
  if (!log) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Health log not found');
  }

  const pet = await Pet.findById(log.pet_id);
  if (!pet) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Pet not found');
  }

  // Verify ownership or family membership
  const isOwner = pet.owner_id.toString() === req.user._id.toString();
  if (!isOwner) {
    const { FamilyGroup } = require('../models');
    const familyGroup = await FamilyGroup.findOne({
      pet_ids: pet._id,
      'members.user_id': req.user._id
    });
    if (!familyGroup) {
      throw new ApiError(httpStatus.FORBIDDEN, 'You do not have access to this pet');
    }
  }

  await log.deleteOne();

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Health log deleted successfully'
  });
});

// 6. Delete vaccine
exports.deleteVaccine = catchAsync(async (req, res) => {
  const { vaccineId } = req.params;
  const vaccine = await Vaccine.findById(vaccineId);
  if (!vaccine) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Vaccine not found');
  }

  const pet = await Pet.findById(vaccine.pet_id);
  if (!pet) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Pet not found');
  }

  // Verify ownership or family membership
  const isOwner = pet.owner_id.toString() === req.user._id.toString();
  if (!isOwner) {
    const { FamilyGroup } = require('../models');
    const familyGroup = await FamilyGroup.findOne({
      pet_ids: pet._id,
      'members.user_id': req.user._id
    });
    if (!familyGroup) {
      throw new ApiError(httpStatus.FORBIDDEN, 'You do not have access to this pet');
    }
  }

  await vaccine.deleteOne();

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Vaccine deleted successfully'
  });
});

// 7. Background helper: Check and notify users about upcoming vaccine reminders (next 3 days)
exports.checkVaccineReminders = async () => {
  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  // Find all vaccines where next_due_date is between now and 3 days from now
  const upcomingVaccines = await Vaccine.find({
    next_due_date: { $gt: now, $lte: threeDaysFromNow }
  }).populate('pet_id');

  for (const vac of upcomingVaccines) {
    if (!vac.pet_id) continue;
    const pet = vac.pet_id;
    const ownerId = pet.owner_id;

    // Check if user was already notified about this vaccine reminder in the last 3 days
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const alreadyNotified = await Notification.findOne({
      user_id: ownerId,
      type: 'VACCINE_REMINDER',
      ref_id: vac._id.toString(),
      created_at: { $gte: threeDaysAgo }
    });

    if (!alreadyNotified) {
      const daysRemaining = Math.max(0, Math.ceil((vac.next_due_date - now) / (1000 * 60 * 60 * 24)));
      await Notification.create({
        user_id: ownerId,
        title: `💉 Lịch tiêm nhắc của ${pet.name}`,
        body: `Bé ${pet.name} có lịch tiêm vaccine "${vac.vaccine_name}" vào ngày ${vac.next_due_date.toLocaleDateString('vi-VN')} (còn ${daysRemaining} ngày). Hãy sắp xếp đưa bé đi tiêm nhé!`,
        type: 'VACCINE_REMINDER',
        ref_id: vac._id.toString(),
        ref_type: 'Vaccine'
      });
      console.log(`[Vaccine Reminder Job] Created reminder for user ${ownerId} about pet ${pet.name} vaccine ${vac.vaccine_name}.`);
    }
  }
};


