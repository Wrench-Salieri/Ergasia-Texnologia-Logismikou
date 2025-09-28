app.delete('/api/reservations/:id', async (req, res) => {
  const reservationId = req.params.id;
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query('DELETE FROM reservations WHERE id = ?', [reservationId]);
    res.json({ message: 'Reservation cancelled successfully' });
  } catch (err) {
    res.status(500).send(err.message);
  } finally {
    if (conn) conn.release();
  }
});
