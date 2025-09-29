import React, { useState, useEffect } from 'react';
import './ReceiptGeneration.css';

const ReceiptGeneration = ({ token }) => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [processing, setProcessing] = useState({});

  useEffect(() => {
    fetchReceiptReadyReservations();
  }, []);

  const fetchReceiptReadyReservations = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/receipts/ready', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reservations');
      }

      const data = await response.json();
      setReservations(data.data || []);
    } catch (err) {
      setError('Error loading reservations: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateReceipt = async (reservationId) => {
    try {
      setProcessing({...processing, [reservationId]: 'generating'});
      
      const response = await fetch('http://localhost:3001/api/receipts/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reservation_id: reservationId })
      });

      if (!response.ok) {
        throw new Error('Failed to generate receipt');
      }

      const result = await response.json();
      setSuccess(`Απόδειξη δημιουργήθηκε επιτυχώς: ${result.receipt_number}`);
      fetchReceiptReadyReservations();
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError('Error generating receipt: ' + err.message);
    } finally {
      setProcessing({...processing, [reservationId]: null});
    }
  };

  const sendReceiptEmail = async (reservationId) => {
    try {
      setProcessing({...processing, [reservationId]: 'sending'});
      
      const response = await fetch('http://localhost:3001/api/receipts/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reservation_id: reservationId })
      });

      if (!response.ok) {
        throw new Error('Failed to send receipt email');
      }

      const result = await response.json();
      setSuccess('Απόδειξη στάλθηκε επιτυχώς στον πελάτη');
      fetchReceiptReadyReservations();
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError('Error sending receipt: ' + err.message);
    } finally {
      setProcessing({...processing, [reservationId]: null});
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('el-GR');
  };

  if (loading) {
    return <div className="loading">Loading reservations...</div>;
  }

  return (
    <div className="receipt-generation">
      <div className="section-header">
        <h3>Έκδοση Αποδείξεων</h3>
        <button onClick={fetchReceiptReadyReservations} className="refresh-btn">
          Ανανέωση
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="reservations-list">
        {reservations.length === 0 ? (
          <div className="no-data">Δεν υπάρχουν κρατήσεις έτοιμες για απόδειξη</div>
        ) : (
          reservations.map((reservation) => (
            <div key={reservation.id} className="reservation-card">
              <div className="reservation-header">
                <div className="reservation-info">
                  <h4>Κράτηση #{reservation.id}</h4>
                  <span className="customer-name">{reservation.customer_name}</span>
                </div>
                <div className="receipt-status">
                  {reservation.receipt_issued ? (
                    <span className="status-badge issued">Απόδειξη Εκδόθηκε</span>
                  ) : (
                    <span className="status-badge pending">Εκκρεμής</span>
                  )}
                </div>
              </div>

              <div className="reservation-details">
                <div className="detail-row">
                  <span className="label">Δωμάτιο:</span>
                  <span>{reservation.room_code} ({reservation.room_type})</span>
                </div>
                <div className="detail-row">
                  <span className="label">Ημερομηνίες:</span>
                  <span>{formatDate(reservation.start_date)} - {formatDate(reservation.end_date)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Ποσό:</span>
                  <span className="amount">€{reservation.payment_amount}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Πολιτική:</span>
                  <span>{reservation.policy_name}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Email:</span>
                  <span>{reservation.customer_email}</span>
                </div>
                {reservation.receipt_path && (
                  <div className="detail-row">
                    <span className="label">Αρχείο Απόδειξης:</span>
                    <span className="file-path">{reservation.receipt_path}</span>
                  </div>
                )}
              </div>

              <div className="receipt-actions">
                {!reservation.receipt_issued ? (
                  <button 
                    className="generate-btn"
                    onClick={() => generateReceipt(reservation.id)}
                    disabled={processing[reservation.id] === 'generating'}
                  >
                    {processing[reservation.id] === 'generating' ? 'Δημιουργία...' : 'Δημιουργία Απόδειξης'}
                  </button>
                ) : (
                  <button 
                    className="send-btn"
                    onClick={() => sendReceiptEmail(reservation.id)}
                    disabled={processing[reservation.id] === 'sending'}
                  >
                    {processing[reservation.id] === 'sending' ? 'Αποστολή...' : 'Αποστολή Email'}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReceiptGeneration;
