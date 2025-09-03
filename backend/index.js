const express = require('express');
const mariadb = require('mariadb');
const cors = require('cors');
const app = express();
app.use(cors());
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
app.use(express.json());

const pool = mariadb.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'hotel_management'
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

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT * FROM accounts WHERE username = ?', [username]);
    if (rows.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, 'secret', { expiresIn: '1h' });
    res.json({ token, role: user.role });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  } finally {
    if (conn) conn.release();
  }
});


app.listen(5000, () => console.log('API running at http://localhost:5000'));