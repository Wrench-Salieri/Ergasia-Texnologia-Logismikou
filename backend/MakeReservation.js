app.post('/api/reservations', async (req, res) => {
  const { userId, roomId, checkIn, checkOut } = req.body;
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query(
      'INSERT INTO reservations (user_id, room_id, check_in, check_out) VALUES (?, ?, ?, ?)',
      [userId, roomId, checkIn, checkOut]
    );
    res.json({ message: 'Reservation created successfully' });
  } catch (err) {
    res.status(500).send(err.message);
  } finally {
    if (conn) conn.release();
  }
});