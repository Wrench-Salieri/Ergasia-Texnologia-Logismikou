import React, { useState } from 'react';

function AddRoom() {
  const [type, setType] = useState('');
  const [floor, setFloor] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3001/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, floor, code }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('✅ Δωμάτιο προστέθηκε με επιτυχία');
      } else {
        setMessage(`❌ Σφάλμα: ${data.error}`);
      }
    } catch (err) {
      setMessage('❌ Αποτυχία σύνδεσης με διακομιστή');
    }
  };

  return (
    <div className="form-container">
      <h2>Προσθήκη Δωματίου</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Τύπος δωματίου"
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Όροφος"
          value={floor}
          onChange={(e) => setFloor(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Κωδικός"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
        <button type="submit">Αποθήκευση</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default AddRoom;
