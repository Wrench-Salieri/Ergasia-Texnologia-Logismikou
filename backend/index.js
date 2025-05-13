const express = require('express');
const mariadb = require('mariadb');
const cors = require('cors');

const app = express();
app.use(cors());

const pool = mariadb.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'your_db_name'
});

app.get('/data', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query("SELECT * FROM your_table");
    res.json(rows);
  } catch (err) {
    res.status(500).send(err.message);
  } finally {
    if (conn) conn.release();
  }
});

app.listen(3000, () => console.log('API running at http://localhost:3000'));