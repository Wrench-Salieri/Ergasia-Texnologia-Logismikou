import React, { useState } from 'react';

function AddPolicy() {
  const [name, setName] = useState('');
  const [hours, setHours] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3001/api/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, cancellation_hours: parseInt(hours) }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('✅ Πολιτική αποθηκεύτηκε με επιτυχία');
      } else {
        setMessage(`❌ Σφάλμα: ${data.error}`);
      }
    } catch (err) {
      setMessage('❌ Αποτυχία σύνδεσης με διακομιστή');
    }
  };

  return (
    <div className="form-container">
      <h2>Καταχώρηση Πολιτικής</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Όνομα πολιτικής"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Ώρες ακύρωσης"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          required
        />
        <button type="submit">Αποθήκευση</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default AddPolicy;
