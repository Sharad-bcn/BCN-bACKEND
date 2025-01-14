const express = require('express');
const Busboy = require('busboy');
const path = require('path');
const fs = require('fs');
const $router = express.Router();
const controller = require("./controller");
const { checkOrigin } = require("../../../helpers/middlewares");
const { uploadFile } = require("../../../helpers/utils/s3");

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Debug middleware
$router.use((req, res, next) => {
  console.log('=== New Request ===');
  console.log('Origin:', req.get('origin'));
  console.log('Backend Access Key:', req.get('backendaccesskey') ? 'Present' : 'Missing');
  console.log('Content-Type:', req.get('content-type'));
  next();
});

// Use checkOrigin middleware
$router.use(checkOrigin);

// Add CORS headers
$router.use((req, res, next) => {
  res.set({
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Backendaccesskey',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
    'Connection': 'keep-alive'
  });
  next();
});

// Test route with improved error handling
$router.post("/test", (req, res) => {
  let hasError = false;
  
  try {
    const busboy = Busboy({ 
      headers: req.headers,
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 1
      }
    });

    // Handle file upload
    busboy.on('file', (fieldname, fileStream, filename, encoding, mimetype) => {
      console.log('Starting file upload:', filename);
      
      if (fieldname !== 'photo') {
        fileStream.resume();
        return;
      }

      const chunks = [];
      let fileSize = 0;

      fileStream.on('data', (chunk) => {
        chunks.push(chunk);
        fileSize += chunk.length;
        console.log(`Received chunk: ${chunk.length} bytes (Total: ${fileSize} bytes)`);
      });

      fileStream.on('limit', () => {
        hasError = true;
        res.status(413).json({ error: 'File too large' });
        fileStream.resume();
      });

      fileStream.on('error', (err) => {
        console.error('File stream error:', err);
        hasError = true;
        res.status(500).json({ error: 'File upload failed' });
      });

      fileStream.on('end', async () => {
        if (hasError) return;

        try {
          if (fileSize === 0) {
            throw new Error('Empty file');
          }

          const fileBuffer = Buffer.concat(chunks);
          console.log('File received:', fileSize, 'bytes');

          const s3Result = await uploadFile({
            name: filename,
            data: fileBuffer,
            mimetype: mimetype
          }, 'matrimonial');

          if (!res.headersSent) {
            res.status(200).json({
              status: 'success',
              message: 'File uploaded successfully',
              file: {
                originalName: filename,
                url: s3Result.Location,
                size: fileSize,
                mimetype: mimetype
              }
            });
          }
        } catch (error) {
          console.error('Upload error:', error);
          if (!res.headersSent) {
            res.status(500).json({
              status: 'error',
              message: error.message || 'File upload failed'
            });
          }
        }
      });
    });

    // Handle busboy errors
    busboy.on('error', (err) => {
      console.error('Busboy error:', err);
      hasError = true;
      if (!res.headersSent) {
        res.status(500).json({ error: 'File upload failed' });
      }
    });

    // Handle request errors
    req.on('error', (err) => {
      console.error('Request error:', err);
      hasError = true;
      if (!res.headersSent) {
        res.status(500).json({ error: 'Upload failed' });
      }
    });

    // Pipe request to busboy
    req.pipe(busboy);

  } catch (error) {
    console.error('Upload error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        status: 'error',
        message: error.message || 'File upload failed'
      });
    }
  }
});

// Main routes
$router.post("/save", controller.submitMatrimonialForm);
$router.get("/search", controller.searchMatrimonialProfiles);

module.exports = $router;