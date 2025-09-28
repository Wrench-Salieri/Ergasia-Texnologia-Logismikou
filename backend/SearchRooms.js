app.get('/api/rooms/search', async (req, res) => {
  const { startDate, endDate } = req.query;
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(
      SELECT * FROM rooms r
      WHERE r.id NOT IN (
        SELECT room_id FROM reservations 
        WHERE (check_in <= ? AND check_out >= ?)
      )
    , [endDate, startDate]);
    res.json(rows);
  } catch (err) {
    res.status(500).send(err.message);
  } finally {
    if (conn) conn.release();
  }
});