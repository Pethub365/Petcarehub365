const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { FamilyGroup, FamilyInvitation, User, DailyQuest } = require('../models');
const sendEmail = require('../utils/sendEmail');

// 1. Get the family group the user belongs to
exports.getFamilyGroup = catchAsync(async (req, res) => {
  const group = await FamilyGroup.findOne({ 'members.user_id': req.user._id })
    .populate('members.user_id', 'email profile.full_name profile.avatar_url')
    .populate('pet_ids');

  res.status(httpStatus.OK).json({
    success: true,
    data: group
  });
});

// 2. Create a family group
exports.createFamilyGroup = catchAsync(async (req, res) => {
  const { group_name, pet_ids } = req.body;

  // Check if user is already in a family group
  const existingGroup = await FamilyGroup.findOne({ 'members.user_id': req.user._id });
  if (existingGroup) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Bạn đã tham gia một nhóm gia đình rồi');
  }

  const group = await FamilyGroup.create({
    owner_id: req.user._id,
    group_name,
    members: [{
      user_id: req.user._id,
      role: 'ADMIN',
      joined_at: new Date()
    }],
    pet_ids: pet_ids || []
  });

  const populatedGroup = await FamilyGroup.findById(group._id)
    .populate('members.user_id', 'email profile.full_name profile.avatar_url')
    .populate('pet_ids');

  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'Đã tạo nhóm gia đình thành công 🏠',
    data: populatedGroup
  });
});

// 3. Send email invitation to join the family group
exports.inviteMember = catchAsync(async (req, res) => {
  const { invited_email } = req.body;

  // Find the family group this user is an admin of
  const group = await FamilyGroup.findOne({
    'members.user_id': req.user._id,
    'members.role': 'ADMIN'
  });

  if (!group) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Bạn phải là ADMIN của nhóm gia đình mới có quyền mời thành viên');
  }

  // Generate simple 6-digit alphanumeric invite code
  const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

  // Expire in 3 days
  const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  // Store in DB
  await FamilyInvitation.create({
    group_id: group._id,
    invited_by: req.user._id,
    invited_email: invited_email.toLowerCase(),
    status: 'PENDING',
    token_hash: inviteCode,
    expires_at: expiresAt
  });

  // Send invitation email
  const inviterName = req.user.profile?.full_name || req.user.email;
  try {
    await sendEmail({
      to: invited_email,
      subject: `Lời mời tham gia gia đình chăm sóc Pet trên PetcareHub365 🏠`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4F46E5;">Lời mời gia nhập gia đình chăm sóc thú cưng</h2>
          <p><strong>${inviterName}</strong> đã mời bạn tham gia nhóm gia đình <strong>"${group.group_name}"</strong> để cùng chăm sóc thú cưng trên PetcareHub365.</p>
          <p>Mã mời của bạn là:</p>
          <div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; font-size: 24px; font-weight: bold; text-align: center; color: #4F46E5; letter-spacing: 3px; margin: 20px 0; width: fit-content; margin-left: auto; margin-right: auto; padding-left: 30px; padding-right: 30px;">
            ${inviteCode}
          </div>
          <p>Hãy nhập mã này trong màn hình <strong>Quản lý gia đình</strong> trên ứng dụng PetcareHub365 để gia nhập nhóm nhé!</p>
          <p>Mã có giá trị trong vòng 3 ngày.</p>
          <p>Trân trọng,<br/>Đội ngũ PetcareHub365</p>
        </div>
      `
    });
  } catch (err) {
    console.error('Không thể gửi mail mời tham gia gia đình:', err.message);
  }

  res.status(httpStatus.OK).json({
    success: true,
    message: `Đã gửi mã mời thành viên thành công tới ${invited_email}`
  });
});

// 4. Join family group via invite code
exports.joinFamily = catchAsync(async (req, res) => {
  const { inviteCode } = req.body;

  // Check if user is already in a family group
  const existingGroup = await FamilyGroup.findOne({ 'members.user_id': req.user._id });
  if (existingGroup) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Bạn đã tham gia một nhóm gia đình rồi');
  }

  // Find invitation
  const invitation = await FamilyInvitation.findOne({
    token_hash: inviteCode.toUpperCase(),
    status: 'PENDING',
    expires_at: { $gt: new Date() }
  });

  if (!invitation) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Mã mời không đúng hoặc đã hết hạn');
  }

  // Add user to the family group members
  const group = await FamilyGroup.findById(invitation.group_id);
  if (!group) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy nhóm gia đình tương ứng');
  }

  group.members.push({
    user_id: req.user._id,
    role: 'MEMBER',
    joined_at: new Date()
  });

  await group.save();

  // Mark invitation as accepted
  invitation.status = 'ACCEPTED';
  await invitation.save();

  const populatedGroup = await FamilyGroup.findById(group._id)
    .populate('members.user_id', 'email profile.full_name profile.avatar_url')
    .populate('pet_ids');

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Chào mừng! Bạn đã gia nhập nhóm gia đình thành công 🏠',
    data: populatedGroup
  });
});

// 5. Assign a daily quest to a family member
exports.assignQuest = catchAsync(async (req, res) => {
  const { questId } = req.params;
  const { userId } = req.body; // user_id of the family member, or null to unassign

  // Verify the user is part of the family group that owns the pet of this quest
  const quest = await DailyQuest.findById(questId).populate('pet_id');
  if (!quest) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Nhiệm vụ không tồn tại');
  }

  const group = await FamilyGroup.findOne({
    pet_ids: quest.pet_id._id,
    'members.user_id': req.user._id
  });

  if (!group) {
    // If not in a family group, check if they are the direct pet owner
    if (quest.pet_id.owner_id.toString() !== req.user._id.toString()) {
      throw new ApiError(httpStatus.FORBIDDEN, 'Bạn không có quyền phân công nhiệm vụ này');
    }
  }

  // If assigning to a specific user, verify they are in the family group or they are the pet owner
  if (userId) {
    if (group) {
      const isMember = group.members.some(m => m.user_id.toString() === userId.toString());
      if (!isMember) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Người dùng được phân công không thuộc nhóm gia đình này');
      }
    } else {
      // No family group exists, they can only assign to themselves (the owner)
      if (userId.toString() !== req.user._id.toString()) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Chỉ có thể phân công nhiệm vụ cho bản thân');
      }
    }
  }

  quest.assigned_to = userId || null;
  await quest.save();

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Phân công công việc thành công 📝',
    data: quest
  });
});
