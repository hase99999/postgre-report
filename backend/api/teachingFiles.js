const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// GET /api/teachingFiles
router.get('/', async (req, res) => {
  try {
    const teachingFiles = await prisma.teachingFile.findMany();
    res.json(teachingFiles);
  } catch (error) {
    console.error('Error fetching teaching files:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;