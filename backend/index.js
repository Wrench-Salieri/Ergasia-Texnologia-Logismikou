const express = require('express');
const mariadb = require('mariadb');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const paymentManager = require('./PaymentManager'); // payment functions

const app = express();
app.use(cors());
app.use(express.json());

// Database connection pool
const pool = mariadb.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // adjust if needed
  database: 'hotel_management',
  connectionLimit: 5
});

// Payments
app.get('/api/payments/pending', paymentManager.getPendingPayments);
app.post('/api/payments/update', paymentManager.updatePaymentStatus);

// Optional: payment history
app.get('/api/payments/history', paymentManager.getPaymentHistory);


// ----------------- AUTHENTICATION -----------------
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username & password required' });

  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT * FROM accounts WHERE username = ?', [username]);

    if (!rows || rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, 'secret', { expiresIn: '1h' });
    res.json({ token, role: user.role, userId: user.id, username: user.username });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    if (conn) conn.release();
  }
});

// ----------------- ROOMS -----------------
app.post('/api/rooms', async (req, res) => {
  const { type, floor, code } = req.body;
  if (!type || !floor || !code) return res.status(400).json({ error: 'Missing required fields' });

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query('INSERT INTO rooms (type, floor, code) VALUES (?, ?, ?)', [type, floor, code]);
    res.json({ success: true, message: 'Room added successfully' });
  } catch (err) {
    console.error('Add room error:', err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    if (conn) conn.release();
  }
});

app.post('/api/rooms/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Status is required' });

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query('UPDATE rooms SET status = ? WHERE id = ?', [status, id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Update room status error:', err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    if (conn) conn.release();
  }
});

app.get('/api/rooms/statuses', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT id, status FROM rooms');
    res.json(rows);
  } catch (err) {
    console.error('Get room statuses error:', err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    if (conn) conn.release();
  }
});

// ----------------- CUSTOMERS -----------------
app.get('/api/customers/statuses', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT id, name, email, status FROM customers');
    res.json(rows);
  } catch (err) {
    console.error('Get customers error:', err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    if (conn) conn.release();
  }
});

app.post('/api/customers/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!['check-in','check-out','left'].includes(status)) return res.status(400).json({ error: 'Invalid status' });

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query('UPDATE customers SET status = ? WHERE id = ?', [status, id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Update customer status error:', err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    if (conn) conn.release();
  }
});

// ----------------- PRICES -----------------
app.post('/api/prices', async (req, res) => {
  const { category, amount } = req.body;
  if (!category || amount === undefined) return res.status(400).json({ error: 'Missing required fields' });
  if (amount < 0) return res.status(400).json({ error: 'Μη αποδεκτή τιμή' });

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query('INSERT INTO prices (category, amount) VALUES (?, ?)', [category, amount]);
    res.json({ success: true, message: 'Price added successfully' });
  } catch (err) {
    console.error('Add price error:', err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    if (conn) conn.release();
  }
});

// ----------------- POLICIES -----------------
app.post('/api/policies', async (req, res) => {
  const { name, cancellation_hours } = req.body;
  if (!name || cancellation_hours === undefined) return res.status(400).json({ error: 'Missing required fields' });

  let conn;
  try {
    conn = await pool.getConnection();
    const [conflicts] = await conn.query(`
      SELECT r.id
      FROM reservations r
      JOIN policies p ON r.policy_id = p.id
      WHERE p.cancellation_hours <> ?
    `, [cancellation_hours]);

    if (conflicts.length > 0) return res.status(409).json({ error: 'Conflict with existing reservations' });

    await conn.query('INSERT INTO policies (name, cancellation_hours) VALUES (?, ?)', [name, cancellation_hours]);
    res.json({ success: true, message: 'Policy added successfully' });
  } catch (err) {
    console.error('Add policy error:', err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    if (conn) conn.release();
  }
});

// ----------------- BOOKING -----------------
app.post('/api/book-room', async (req, res) => {
  const { roomId, customerEmail } = req.body;
  if (!roomId || !customerEmail) return res.status(400).json({ error: 'Missing fields' });

  let conn;
  try {
    conn = await pool.getConnection();

    // Update room status
    await conn.query('UPDATE rooms SET status = ? WHERE id = ?', ['occupied', roomId]);

    // Update customer status
    await conn.query('UPDATE customers SET status = ? WHERE email = ?', ['check-in', customerEmail]);

    res.json({ success: true, message: 'Room booked successfully' });
  } catch (err) {
    console.error('Book room error:', err);
    res.status(500).json({ error: 'Booking failed' });
  } finally {
    if (conn) conn.release();
  }
});

// ----------------- RESERVATIONS -----------------
app.post('/api/reservations', async (req, res) => {
  const { userId, roomId, checkIn, checkOut } = req.body;
  if (!userId || !roomId || !checkIn || !checkOut) return res.status(400).json({ error: 'Missing fields' });

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query(
      'INSERT INTO reservations (user_id, room_id, check_in, check_out) VALUES (?, ?, ?, ?)',
      [userId, roomId, checkIn, checkOut]
    );
    res.json({ success: true, message: 'Reservation created successfully' });
  } catch (err) {
    console.error('Create reservation error:', err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    if (conn) conn.release();
  }
});
// ----------------- PAYMENT ROUTES (no token required) -----------------
app.get('/api/payments/pending', paymentManager.getPendingPayments);
app.post('/api/payments/update', paymentManager.updatePaymentStatus);
app.get('/api/payments/history', paymentManager.getPaymentHistory);

// ----------------- START SERVER -----------------
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
