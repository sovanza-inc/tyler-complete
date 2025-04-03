const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const prisma = require('../lib/prisma');
// const multer = require('multer');

// Configure multer for memory storage (for serverless)
// const storage = multer.memoryStorage();
// const upload = multer({ 
//     storage: storage,
//     limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
//     fileFilter: (req, file, cb) => {
//         const allowedTypes = /jpeg|jpg|png/;
//         const extname = allowedTypes.test(file.originalname.toLowerCase());
//         const mimetype = allowedTypes.test(file.mimetype);
//         if (extname && mimetype) {
//             return cb(null, true);
//         }
//         cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
//     }
// });

// Get user profile
router.get('/', authMiddleware, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId }
        });
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Remove password from response
        const { password: _, ...userProfile } = user;
        res.json(userProfile);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Error fetching profile' });
    }
});

// Update profile
router.put('/', authMiddleware, async (req, res) => {
    try {
        const { fullName, bio, phone } = req.body;
        const userId = req.user.userId;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                fullName,
                bio,
                phone
            }
        });

        // Remove password from response
        const { password: _, ...userProfile } = updatedUser;
        res.json(userProfile);
    } catch (error) {
        console.error('Update profile error:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(500).json({ error: 'Error updating profile' });
    }
});

// Upload profile image
// router.post('/upload', authMiddleware, upload.single('profileImage'), async (req, res) => {
//     try {
//         if (!req.file) {
//             return res.status(400).json({ error: 'No file uploaded' });
//         }

//         // Here you would typically:
//         // 1. Upload the file to a cloud storage (e.g., AWS S3, Cloudinary)
//         // 2. Get the URL of the uploaded file
//         // For now, we'll just simulate it
//         const imageUrl = `https://your-cloud-storage.com/${req.file.originalname}`;

//         // Update user's profile image URL
//         const updatedUser = await prisma.user.update({
//             where: { id: req.user.userId },
//             data: { profileImage: imageUrl }
//         });

//         // Remove password from response
//         const { password: _, ...userProfile } = updatedUser;
//         res.json(userProfile);
//     } catch (error) {
//         console.error('Upload profile image error:', error);
//         if (error.code === 'P2025') {
//             return res.status(404).json({ error: 'User not found' });
//         }
//         res.status(500).json({ error: 'Error uploading profile image' });
//     }
// });

module.exports = router;
