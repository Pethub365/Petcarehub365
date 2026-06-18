const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { User } = require('../models');
const cloudinary = require('../config/cloudinary');
const config = require('../config/config');

const isCloudinaryConfigured = () => {
    const { cloudName, apiKey, apiSecret } = config.cloudinary;
    if (!cloudName || !apiKey || !apiSecret) return false;
    if (cloudName.includes('your_') || apiKey.includes('your_') || apiSecret.includes('your_')) {
        return false;
    }
    return true;
};

const fileToBase64DataURI = (file) => {
    const b64 = Buffer.from(file.buffer).toString('base64');
    return `data:${file.mimetype};base64,${b64}`;
};

exports.getProfile = catchAsync(async (req, res) => {
    const user = await User.findById(req.user._id).populate('global_role_ids');
    res.json({ success: true, data: { user } });
});

exports.updateProfile = catchAsync(async (req, res) => {
    const { full_name, phone, gender, dob, bio, address } = req.body;
    const user = await User.findById(req.user._id);

    // Handle avatar upload
    if (req.file) {
        if (isCloudinaryConfigured()) {
            try {
                const b64 = Buffer.from(req.file.buffer).toString('base64');
                const dataURI = `data:${req.file.mimetype};base64,${b64}`;
                const result = await cloudinary.uploader.upload(dataURI, {
                    folder: 'petcarehub365/avatars',
                });
                user.profile.avatar_url = result.secure_url;
            } catch (err) {
                console.error('Cloudinary upload failed, falling back to base64:', err);
                user.profile.avatar_url = fileToBase64DataURI(req.file);
            }
        } else {
            user.profile.avatar_url = fileToBase64DataURI(req.file);
        }
    }

    if (full_name !== undefined) user.profile.full_name = full_name;
    if (phone !== undefined) user.profile.phone = phone;
    if (gender !== undefined) user.profile.gender = gender;
    if (dob !== undefined) user.profile.dob = dob;
    if (bio !== undefined) user.profile.bio = bio;
    if (address !== undefined) user.profile.address = address;

    await user.save();

    res.json({ success: true, message: 'Profile updated', data: { user } });
});
