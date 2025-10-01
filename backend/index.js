const express = require('express');
const mariadb = require('mariadb');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
app.use(cors());
app.use(express.json());

// Database connection pool
const pool = mariadb.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'hotel_management',
  connectionLimit: 5
});

// Authentication endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT * FROM accounts WHERE username = ?', [username]);
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, 'secret', { expiresIn: '1h' });
    res.json({ token, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    if (conn) conn.release();
  }
});

// Add new room
app.post('/api/rooms', async (req, res) => {
  const { type, floor, code } = req.body;
  if (!type || !floor || !code) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    const query = 'INSERT INTO rooms (type, floor, code) VALUES (?, ?, ?)';
    await conn.query(query, [type, floor, code]);
    res.json({ success: true, message: 'Room added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    if (conn) conn.release();
  }
});

// Add new price
app.post('/api/prices', async (req, res) => {
  const { category, amount } = req.body;
  if (!category || amount === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (amount < 0) {
    return res.status(400).json({ error: 'Μη αποδεκτή τιμή' });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    const query = 'INSERT INTO prices (category, amount) VALUES (?, ?)';
    await conn.query(query, [category, amount]);
    res.json({ success: true, message: 'Price added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    if (conn) conn.release();
  }
});

// Add new policy with conflict detection
app.post('/api/policies', async (req, res) => {
  const { name, cancellation_hours } = req.body;
  if (!name || cancellation_hours === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    const [conflicts] = await conn.query(`
      SELECT r.id
      FROM reservations r
      JOIN policies p ON r.policy_id = p.id
      WHERE p.cancellation_hours <> ?
    `, [cancellation_hours]);

    if (conflicts.length > 0) {
      return res.status(409).json({ error: 'Υπάρχει σύγκρουση με υπάρχουσες κρατήσεις' });
    }

    const query = 'INSERT INTO policies (name, cancellation_hours) VALUES (?, ?)';
    await conn.query(query, [name, cancellation_hours]);
    res.json({ success: true, message: 'Policy added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    if (conn) conn.release();
  }
});

// Add ability to change room status
app.post('/api/rooms/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query('UPDATE rooms SET status = ? WHERE id = ?', [status, id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  } finally {
    if (conn) conn.release();
  }
});



// Start server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get('/api/rooms', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT id, room_number, type, status FROM rooms');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  } finally {
    if (conn) conn.release();
  }
});

// Get room statuses
app.get('/api/rooms/statuses', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT id, status FROM rooms');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching room statuses:', err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    if (conn) conn.release();
  }
});
