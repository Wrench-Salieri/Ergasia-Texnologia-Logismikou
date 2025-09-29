const mariadb = require('mariadb');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Database connection pool
const pool = mariadb.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'hotel_management',
  connectionLimit: 5
});

// JWT verification middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, 'secret');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Role verification middleware
const verifyPaymentManager = (req, res, next) => {
  if (req.user.role !== 'payment_manager' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Payment manager role required.' });
  }
  next();
};

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'hotel@example.com',
    pass: process.env.EMAIL_PASS || 'password'
  }
});

// 1. PAYMENT MANAGEMENT ENDPOINTS

// Get all reservations with pending payments
const getPendingPayments = async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const query = `
      SELECT r.id, r.customer_id, r.room_id, r.start_date, r.end_date, 
             r.payment_status, r.payment_amount, r.payment_date,
             c.name as customer_name, c.email as customer_email,
             rm.type as room_type, rm.code as room_code,
             p.name as policy_name
      FROM reservations r
      JOIN customers c ON r.customer_id = c.id
      JOIN rooms rm ON r.room_id = rm.id
      JOIN policies p ON r.policy_id = p.id
      WHERE r.payment_status IN ('pending', 'rejected')
      ORDER BY r.start_date ASC
    `;
    const rows = await conn.query(query);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Error fetching pending payments:', err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    if (conn) conn.release();
  }
};

// Update payment status
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

    // Check if reservation exists
    const [reservation] = await conn.query(
      'SELECT * FROM reservations WHERE id = ?',
      [reservation_id]
    );

    if (!reservation) {
      await conn.rollback();
      return res.status(404).json({ error: 'Reservation not found' });
    }

    // Update reservation payment status
    await conn.query(
      `UPDATE reservations 
       SET payment_status = ?, payment_date = NOW() 
       WHERE id = ?`,
      [payment_status, reservation_id]
    );

    // Insert payment record
    await conn.query(
      `INSERT INTO payments (reservation_id, amount, payment_method, payment_status, transaction_id, payment_date, processed_by, notes)
       VALUES (?, ?, ?, ?, ?, NOW(), ?, ?)`,
      [reservation_id, reservation.payment_amount, payment_method || 'cash', payment_status, transaction_id, req.user.id, notes]
    );

    await conn.commit();
    res.json({ success: true, message: 'Payment status updated successfully' });
  } catch (err) {
    console.error('Error updating payment status:', err);
    if (conn) await conn.rollback();
    res.status(500).json({ error: 'Database error' });
  } finally {
    if (conn) conn.release();
  }
};

// 2. RECEIPT GENERATION ENDPOINTS

// Get reservations ready for receipt generation
const getReceiptReadyReservations = async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const query = `
      SELECT r.id, r.customer_id, r.room_id, r.start_date, r.end_date, 
             r.payment_amount, r.receipt_issued, r.receipt_path,
             c.name as customer_name, c.email as customer_email,
             rm.type as room_type, rm.code as room_code,
             p.name as policy_name
      FROM reservations r
      JOIN customers c ON r.customer_id = c.id
      JOIN rooms rm ON r.room_id = rm.id
      JOIN policies p ON r.policy_id = p.id
      WHERE r.payment_status = 'paid' AND r.receipt_issued = FALSE
      ORDER BY r.payment_date ASC
    `;
    const rows = await conn.query(query);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Error fetching receipt-ready reservations:', err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    if (conn) conn.release();
  }
};

// Generate receipt
const generateReceipt = async (req, res) => {
  const { reservation_id } = req.body;
  
  if (!reservation_id) {
    return res.status(400).json({ error: 'Reservation ID is required' });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // Get reservation details
    const [reservation] = await conn.query(`
      SELECT r.*, c.name as customer_name, c.email as customer_email,
             rm.type as room_type, rm.code as room_code,
             p.name as policy_name
      FROM reservations r
      JOIN customers c ON r.customer_id = c.id
      JOIN rooms rm ON r.room_id = rm.id
      JOIN policies p ON r.policy_id = p.id
      WHERE r.id = ? AND r.payment_status = 'paid' AND r.receipt_issued = FALSE
    `, [reservation_id]);

    if (!reservation) {
      await conn.rollback();
      return res.status(404).json({ error: 'Reservation not found or not eligible for receipt' });
    }

    // Generate receipt number
    const receiptNumber = `RCP-${Date.now()}-${reservation_id}`;
    
    // Create receipt content (simplified HTML receipt)
    const receiptContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Hotel Receipt - ${receiptNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
          .details { margin: 20px 0; }
          .total { font-weight: bold; font-size: 18px; border-top: 1px solid #333; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Hotel Management System</h1>
          <h2>Receipt ${receiptNumber}</h2>
        </div>
        <div class="details">
          <p><strong>Customer:</strong> ${reservation.customer_name}</p>
          <p><strong>Email:</strong> ${reservation.customer_email}</p>
          <p><strong>Room:</strong> ${reservation.room_code} (${reservation.room_type})</p>
          <p><strong>Check-in:</strong> ${reservation.start_date}</p>
          <p><strong>Check-out:</strong> ${reservation.end_date}</p>
          <p><strong>Policy:</strong> ${reservation.policy_name}</p>
        </div>
        <div class="total">
          <p><strong>Total Amount: €${reservation.payment_amount}</strong></p>
          <p><strong>Payment Status: Paid</strong></p>
          <p><strong>Receipt Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
      </body>
      </html>
    `;

    // Save receipt file
    const receiptsDir = path.join(__dirname, 'receipts');
    if (!fs.existsSync(receiptsDir)) {
      fs.mkdirSync(receiptsDir, { recursive: true });
    }
    
    const receiptPath = path.join(receiptsDir, `${receiptNumber}.html`);
    fs.writeFileSync(receiptPath, receiptContent);

    // Update reservation
    await conn.query(
      'UPDATE reservations SET receipt_issued = TRUE, receipt_path = ? WHERE id = ?',
      [receiptPath, reservation_id]
    );

    // Insert receipt record
    await conn.query(
      `INSERT INTO receipts (reservation_id, receipt_number, file_path, issued_date, issued_by)
       VALUES (?, ?, ?, NOW(), ?)`,
      [reservation_id, receiptNumber, receiptPath, req.user.id]
    );

    await conn.commit();
    res.json({ 
      success: true, 
      message: 'Receipt generated successfully',
      receipt_number: receiptNumber,
      receipt_path: receiptPath
    });
  } catch (err) {
    console.error('Error generating receipt:', err);
    if (conn) await conn.rollback();
    res.status(500).json({ error: 'Database error' });
  } finally {
    if (conn) conn.release();
  }
};

// Send receipt via email
const sendReceiptEmail = async (req, res) => {
  const { reservation_id } = req.body;
  
  if (!reservation_id) {
    return res.status(400).json({ error: 'Reservation ID is required' });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // Get reservation and receipt details
    const [reservation] = await conn.query(`
      SELECT r.*, c.name as customer_name, c.email as customer_email,
             rec.receipt_number, rec.file_path
      FROM reservations r
      JOIN customers c ON r.customer_id = c.id
      JOIN receipts rec ON r.id = rec.reservation_id
      WHERE r.id = ? AND r.receipt_issued = TRUE
    `, [reservation_id]);

    if (!reservation) {
      await conn.rollback();
      return res.status(404).json({ error: 'Receipt not found' });
    }

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER || 'hotel@example.com',
      to: reservation.customer_email,
      subject: `Hotel Receipt - ${reservation.receipt_number}`,
      html: `
        <h2>Thank you for your stay!</h2>
        <p>Dear ${reservation.customer_name},</p>
        <p>Please find attached your receipt for your recent stay at our hotel.</p>
        <p>Receipt Number: ${reservation.receipt_number}</p>
        <p>Amount: €${reservation.payment_amount}</p>
        <p>Thank you for choosing our hotel!</p>
      `,
      attachments: [{
        filename: `${reservation.receipt_number}.html`,
        path: reservation.file_path
      }]
    };

    await transporter.sendMail(mailOptions);

    // Update receipt record
    await conn.query(
      'UPDATE receipts SET email_sent = TRUE, email_sent_date = NOW() WHERE reservation_id = ?',
      [reservation_id]
    );

    await conn.commit();
    res.json({ success: true, message: 'Receipt sent successfully' });
  } catch (err) {
    console.error('Error sending receipt email:', err);
    if (conn) await conn.rollback();
    res.status(500).json({ error: 'Email sending failed' });
  } finally {
    if (conn) conn.release();
  }
};

// 3. REFUND MANAGEMENT ENDPOINTS

// Get refund requests
const getRefundRequests = async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const query = `
      SELECT r.id, r.customer_id, r.room_id, r.start_date, r.end_date, 
             r.payment_amount, r.refund_status, r.refund_amount, r.refund_reason,
             c.name as customer_name, c.email as customer_email,
             rm.type as room_type, rm.code as room_code,
             p.name as policy_name, p.cancellation_hours,
             ref.requested_date, ref.processed_date, ref.rejection_reason
      FROM reservations r
      JOIN customers c ON r.customer_id = c.id
      JOIN rooms rm ON r.room_id = rm.id
      JOIN policies p ON r.policy_id = p.id
      LEFT JOIN refunds ref ON r.id = ref.reservation_id
      WHERE r.refund_status IN ('requested', 'approved', 'rejected')
      ORDER BY r.start_date ASC
    `;
    const rows = await conn.query(query);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Error fetching refund requests:', err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    if (conn) conn.release();
  }
};

// Process refund request
const processRefund = async (req, res) => {
  const { reservation_id, action, rejection_reason } = req.body;
  
  if (!reservation_id || !action) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!['approved', 'rejected'].includes(action)) {
    return res.status(400).json({ error: 'Invalid action' });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // Get reservation details
    const [reservation] = await conn.query(
      'SELECT * FROM reservations WHERE id = ? AND refund_status = "requested"',
      [reservation_id]
    );

    if (!reservation) {
      await conn.rollback();
      return res.status(404).json({ error: 'Refund request not found' });
    }

    // Update reservation refund status
    await conn.query(
      'UPDATE reservations SET refund_status = ? WHERE id = ?',
      [action, reservation_id]
    );

    // Update or create refund record
    if (action === 'approved') {
      await conn.query(
        `INSERT INTO refunds (reservation_id, amount, reason, status, requested_date, processed_date, processed_by)
         VALUES (?, ?, ?, 'approved', NOW(), NOW(), ?)
         ON DUPLICATE KEY UPDATE 
         status = 'approved', processed_date = NOW(), processed_by = ?`,
        [reservation_id, reservation.payment_amount, reservation.refund_reason, req.user.id, req.user.id]
      );
    } else {
      await conn.query(
        `INSERT INTO refunds (reservation_id, amount, reason, status, requested_date, processed_date, processed_by, rejection_reason)
         VALUES (?, ?, ?, 'rejected', NOW(), NOW(), ?, ?)
         ON DUPLICATE KEY UPDATE 
         status = 'rejected', processed_date = NOW(), processed_by = ?, rejection_reason = ?`,
        [reservation_id, reservation.payment_amount, reservation.refund_reason, req.user.id, rejection_reason, req.user.id, rejection_reason]
      );
    }

    await conn.commit();
    res.json({ 
      success: true, 
      message: `Refund ${action} successfully`,
      action: action
    });
  } catch (err) {
    console.error('Error processing refund:', err);
    if (conn) await conn.rollback();
    res.status(500).json({ error: 'Database error' });
  } finally {
    if (conn) conn.release();
  }
};

module.exports = {
  verifyToken,
  verifyPaymentManager,
  getPendingPayments,
  updatePaymentStatus,
  getReceiptReadyReservations,
  generateReceipt,
  sendReceiptEmail,
  getRefundRequests,
  processRefund
};
