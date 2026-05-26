const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { HealthLog, Vaccine, Pet } = require('../models');

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
  const { weight, height, heart_rate, temperature, measured_at } = req.body;

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
