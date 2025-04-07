const express = require('express');
const cors = require('cors');
const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const paymentRouter = require('./routes/payments');
const prisma = require('./lib/prisma');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

// const prisma = new PrismaClient();
const app = express();

// Middleware
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://tyler-complete.vercel.app', 'https://tyler-complete-slvb.vercel.app']
        : ['http://localhost:5000', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['set-cookie']
}));

// Stripe webhook needs raw body 
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }));

// For all other routes, then parse JSON
app.use(express.json());

// Configure multer for memory storage (for serverless)
const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'));
        }
    }
});

app.post('/api/files/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // For now, we'll store the file data in base64 format in the URL field
        // In production, you should use a cloud storage service like AWS S3
        const base64File = req.file.buffer.toString('base64');
        const fileUrl = `data:${req.file.mimetype};base64,${base64File}`;

        // Save file metadata to the database
        const newFile = await prisma.file.create({
            data: {
                name: req.file.originalname,
                url: fileUrl
            }
        });

        // Extract table data from Python server
        try {
            const formData = new FormData();
            formData.append('file', new Blob([req.file.buffer], { type: req.file.mimetype }), req.file.originalname);
            
            const pythonServerResponse = await axios.post('http://127.0.0.1:5000/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            // Store the extracted table data in the database
            if (pythonServerResponse.data) {
                await prisma.tableData.create({
                    data: {
                        fileId: newFile.id,
                        content: JSON.stringify(pythonServerResponse.data)
                    }
                });
            }
        } catch (extractionError) {
            console.error('Table extraction error:', extractionError);
            // We continue even if extraction fails
        }

        res.status(201).json(newFile);
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: 'Failed to upload file' });
    }
});

// Fetch all files endpoint
app.get('/api/files/files', async (req, res) => {
    try {
        const files = await prisma.file.findMany();
        res.status(200).json(files);
    } catch (error) {
        console.error('Error fetching files:', error);
        res.status(500).json({ error: 'Failed to fetch files' });
    }
});

// Get table data for a specific file
app.get('/api/files/:id/table', async (req, res) => {
    try {
        const { id } = req.params;
        const tableData = await prisma.tableData.findFirst({
            where: { fileId: parseInt(id) }
        });
        
        if (!tableData) {
            return res.status(404).json({ error: 'No table data found for this file' });
        }
        
        res.status(200).json(JSON.parse(tableData.content));
    } catch (error) {
        console.error('Error fetching table data:', error);
        res.status(500).json({ error: 'Failed to fetch table data' });
    }
});

// Update file endpoint for file
app.put('/api/files/:id', upload.single('file'), async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Convert file to base64
        const base64File = req.file.buffer.toString('base64');
        const fileUrl = `data:${req.file.mimetype};base64,${base64File}`;

        // Update file metadata in the database
        const updatedFile = await prisma.file.update({
            where: { id: parseInt(id) },
            data: {
                name: req.file.originalname,
                url: fileUrl
            }
        });

        // Re-extract table data from Python server
        try {
            const formData = new FormData();
            formData.append('file', new Blob([req.file.buffer], { type: req.file.mimetype }), req.file.originalname);
            
            const pythonServerResponse = await axios.post('http://127.0.0.1:5000/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            // Update or create the table data in the database
            if (pythonServerResponse.data) {
                await prisma.tableData.upsert({
                    where: { fileId: parseInt(id) },
                    update: {
                        content: JSON.stringify(pythonServerResponse.data)
                    },
                    create: {
                        fileId: parseInt(id),
                        content: JSON.stringify(pythonServerResponse.data)
                    }
                });
            }
        } catch (extractionError) {
            console.error('Table extraction error:', extractionError);
            // We continue even if extraction fails
        }

        res.status(200).json(updatedFile);
    } catch (error) {
        console.error('Error updating file:', error);
        res.status(500).json({ error: 'Failed to update file' });
    }
});

// Delete file endpoint
app.delete('/api/files/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Delete associated table data first
        await prisma.tableData.deleteMany({
            where: { fileId: parseInt(id) },
        });

        // Delete file metadata from the database
        await prisma.file.delete({
            where: { id: parseInt(id) },
        });

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ error: 'Failed to delete file' });
    }
});

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root route
app.get('/', (req, res) => {
    res.json({ 
        message: 'Tyler Backend API',
        status: 'running',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({ 
            status: 'healthy', 
            timestamp: new Date().toISOString(),
            database: 'connected'
        });
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(500).json({ 
            status: 'unhealthy', 
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);
app.use('/api/payments', paymentRouter);

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Cannot ${req.method} ${req.path}`,
        timestamp: new Date().toISOString()
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    // Handle Prisma errors
    if (err.code?.startsWith('P')) {
        return res.status(400).json({
            error: 'Database Error',
            message: err.message,
            code: err.code
        });
    }

    res.status(err.status || 500).json({ 
        error: 'Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
        timestamp: new Date().toISOString()
    });
});

// Handle Prisma connection errors
process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
});

// Only listen when not in Vercel
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app;