const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');
const catchAsync = require('../utils/catchAsync');

/**
 * POST /api/v1/upload/image
 * Upload a single image to Cloudinary
 */
router.post('/image', auth(), upload.single('image'), catchAsync(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'petcarehub365',
        resource_type: 'image',
    });

    res.status(200).json({
        success: true,
        data: {
            url: result.secure_url,
            public_id: result.public_id,
        },
    });
}));

module.exports = router;
