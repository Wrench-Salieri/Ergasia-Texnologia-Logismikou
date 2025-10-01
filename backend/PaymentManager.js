// PaymentManager.js
const mariadb = require('mariadb');

// Create a MariaDB connection pool
const pool = mariadb.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // adjust if needed
  database: 'hotel_management',
  connectionLimit: 5
});

// =====================
// GET PENDING PAYMENTS
// =====================
const getPendingPayments = async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(`
      SELECT r.id, r.customer_id, r.room_id, r.start_date, r.end_date,
             r.payment_status, r.payment_amount, r.payment_date,
             c.name AS customer_name, c.email AS customer_email,
             rm.type AS room_type, rm.code AS room_code,
             p.name AS policy_name
      FROM reservations r
      JOIN customers c ON r.customer_id = c.id
      JOIN rooms rm ON r.room_id = rm.id
      JOIN policies p ON r.policy_id = p.id
      WHERE r.payment_status IN ('pending', 'rejected')
      ORDER BY r.start_date ASC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Error fetching pending payments:', err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    if (conn) conn.release();
  }
};

// =====================
// UPDATE PAYMENT STATUS
// =====================
const updatePaymentStatus = async (req, res) => {
  const { reservation_id, payment_status, payment_method, transaction_id, notes } = req.body;

  if (!reservation_id || !payment_status) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!['paid', 'rejected'].includes(payment_status)) {
    return res.status(400).json({ error: 'Invalid payment status' });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // Get reservation
    const [reservation] = await conn.query('SELECT * FROM reservations WHERE id = ?', [reservation_id]);
    if (!reservation) {
      await conn.rollback();
      return res.status(404).json({ error: 'Reservation not found' });
    }

    // Update reservation payment status
    await conn.query('UPDATE reservations SET payment_status = ?, payment_date = NOW() WHERE id = ?',
      [payment_status, reservation_id]
    );

    // Insert payment record
    await conn.query(`
      INSERT INTO payments (reservation_id, amount, payment_method, payment_status, transaction_id, payment_date, notes)
      VALUES (?, ?, ?, ?, ?, NOW(), ?)
    `,
      [reservation_id, reservation.payment_amount, payment_method || 'cash', payment_status, transaction_id, notes]
    );

    await conn.commit();
    res.json({ success: true, message: 'Payment updated successfully' });
  } catch (err) {
    console.error('Error updating payment:', err);
    if (conn) await conn.rollback();
    res.status(500).json({ error: 'Database error' });
  } finally {
    if (conn) conn.release();
  }
};

// =====================
// PAYMENT HISTORY
// =====================
const getPaymentHistory = async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT * FROM payments ORDER BY payment_date DESC');
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Error fetching payment history:', err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    if (conn) conn.release();
  }
};

module.exports = {
  getPendingPayments,
  updatePaymentStatus,
  getPaymentHistory
};
