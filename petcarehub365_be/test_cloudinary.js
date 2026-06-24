const cloudinary = require('./config/cloudinary');

async function test() {
  try {
    console.log('Testing Cloudinary upload from Unsplash URL...');
    const result = await cloudinary.uploader.upload('https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150&h=150&fit=crop', {
      folder: 'test_petcarehub',
    });
    console.log('Upload success! Result secure_url:', result.secure_url);
    process.exit(0);
  } catch (err) {
    console.error('Upload failed! Error:', err);
    process.exit(1);
  }
}

test();
