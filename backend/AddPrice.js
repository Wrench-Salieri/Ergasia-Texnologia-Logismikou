import React, { useState } from 'react';

function AddPrice() {
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3001/api/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, amount: parseFloat(amount) }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('✅ Τιμή αποθηκεύτηκε επιτυχώς');
      } else {
        setMessage(`❌ Σφάλμα: ${data.error}`);
      }
    } catch (err) {
      setMessage('❌ Αποτυχία σύνδεσης με διακομιστή');
    }
  };

  return (
    <div className="form-container">
      <h2>Καταχώρηση Τιμής</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Κατηγορία"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />
        <input
          type="number"
          step="0.01"
          placeholder="Ποσό"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <button type="submit">Αποθήκευση</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default AddPrice;
