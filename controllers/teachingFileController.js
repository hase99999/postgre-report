// filepath: /Users/dj/Documents/JAVAscript/postgre-sql/backend/controllers/teachingFileController.js
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// PostgreSQLの接続プールを設定
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// TeachingFileデータのインポートコントローラー
export const importTeachingFiles = async (req, res) => {
  const records = req.body.records;

  if (!records || !Array.isArray(records)) {
    return res.status(400).json({ error: 'Invalid data format. Expected an array of records.' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const insertQuery = `
      INSERT INTO TeachingFile (column1, column2, column3)
      VALUES ($1, $2, $3)
      RETURNING id
    `;

    for (const record of records) {
      const { field1, field2, field3 } = record;

      // データのバリデーションを追加可能
      if (!field1 || !field2 || !field3) {
        throw new Error('Missing required fields');
      }

      await client.query(insertQuery, [field1, field2, field3]);
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Records imported successfully.' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error importing records:', error);
    res.status(500).json({ error: 'An error occurred while importing records.' });
  } finally {
    client.release();
  }
};