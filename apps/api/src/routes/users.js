const express = require('express');
const router = express.Router();
const connectToDatabase = require('../db');

router.get('/', async (req, res) => {
  try {
    const connection = await connectToDatabase();

    // Execute a query
    const [rows] = await connection.execute('SELECT * FROM users');
    console.log('Query results:', rows);

    // Close the connection
    await connection.end();

    res.json(rows);
  } catch (error) {
    console.error('Error performing the query:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
