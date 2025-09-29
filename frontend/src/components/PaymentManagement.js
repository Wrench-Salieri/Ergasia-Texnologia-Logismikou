import React, { useState, useEffect } from 'react';
import './PaymentManagement.css';

const PaymentManagement = ({ token }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    payment_method: 'cash',
    transaction_id: '',
    notes: ''
  });

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  const fetchPendingPayments = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/payments/pending', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }

      const data = await response.json();
      setPayments(data.data || []);
    } catch (err) {
      setError('Error loading payments: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentUpdate = async (reservationId, status) => {
    try {
      const response = await fetch('http://localhost:3001/api/payments/update', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reservation_id: reservationId,
          payment_status: status,
          payment_method: paymentData.payment_method,
          transaction_id: paymentData.transaction_id,
          notes: paymentData.notes
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update payment');
      }

      const result = await response.json();
      setSuccess(result.message);
      setShowModal(false);
      setSelectedPayment(null);
      setPaymentData({ payment_method: 'cash', transaction_id: '', notes: '' });
      fetchPendingPayments();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error updating payment: ' + err.message);
    }
  };

  const openPaymentModal = (payment) => {
    setSelectedPayment(payment);
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffa500';
      case 'paid': return '#28a745';
      case 'rejected': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('el-GR');
  };

  if (loading) {
    return <div className="loading">Loading payments...</div>;
  }

  return (
    <div className="payment-management">
      <div className="section-header">
        <h3>Διαχείριση Πληρωμών</h3>
        <button onClick={fetchPendingPayments} className="refresh-btn">
          Ανανέωση
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="payments-list">
        {payments.length === 0 ? (
          <div className="no-data">Δεν υπάρχουν εκκρεμείς πληρωμές</div>
        ) : (
          payments.map((payment) => (
            <div key={payment.id} className="payment-card">
              <div className="payment-header">
                <div className="reservation-info">
                  <h4>Κράτηση #{payment.id}</h4>
                  <span className="customer-name">{payment.customer_name}</span>
                </div>
                <div className="payment-status">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(payment.payment_status) }}
                  >
                    {payment.payment_status === 'pending' ? 'Εκκρεμής' : 
                     payment.payment_status === 'paid' ? 'Πληρωμένη' : 'Απορριφθείσα'}
                  </span>
                </div>
              </div>

              <div className="payment-details">
                <div className="detail-row">
                  <span className="label">Δωμάτιο:</span>
                  <span>{payment.room_code} ({payment.room_type})</span>
                </div>
                <div className="detail-row">
                  <span className="label">Ημερομηνίες:</span>
                  <span>{formatDate(payment.start_date)} - {formatDate(payment.end_date)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Ποσό:</span>
                  <span className="amount">€{payment.payment_amount}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Πολιτική:</span>
                  <span>{payment.policy_name}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Email:</span>
                  <span>{payment.customer_email}</span>
                </div>
              </div>

              <div className="payment-actions">
                {payment.payment_status === 'pending' && (
                  <>
                    <button 
                      className="approve-btn"
                      onClick={() => openPaymentModal(payment)}
                    >
                      Επιβεβαίωση Πληρωμής
                    </button>
                    <button 
                      className="reject-btn"
                      onClick={() => handlePaymentUpdate(payment.id, 'rejected')}
                    >
                      Απόρριψη Πληρωμής
                    </button>
                  </>
                )}
                {payment.payment_status === 'rejected' && (
                  <button 
                    className="approve-btn"
                    onClick={() => openPaymentModal(payment)}
                  >
                    Επανεξέταση
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Payment Confirmation Modal */}
      {showModal && selectedPayment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Επιβεβαίωση Πληρωμής</h3>
              <button 
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <p>Κράτηση #{selectedPayment.id} - {selectedPayment.customer_name}</p>
              <p>Ποσό: €{selectedPayment.payment_amount}</p>
              
              <div className="form-group">
                <label>Μέθοδος Πληρωμής:</label>
                <select 
                  value={paymentData.payment_method}
                  onChange={(e) => setPaymentData({...paymentData, payment_method: e.target.value})}
                >
                  <option value="cash">Μετρητά</option>
                  <option value="card">Κάρτα</option>
                  <option value="bank_transfer">Τραπεζική Μεταφορά</option>
                  <option value="online">Online</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Transaction ID (προαιρετικό):</label>
                <input 
                  type="text"
                  value={paymentData.transaction_id}
                  onChange={(e) => setPaymentData({...paymentData, transaction_id: e.target.value})}
                  placeholder="π.χ. TXN123456"
                />
              </div>
              
              <div className="form-group">
                <label>Σημειώσεις (προαιρετικό):</label>
                <textarea 
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData({...paymentData, notes: e.target.value})}
                  placeholder="Επιπλέον σημειώσεις..."
                  rows="3"
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => setShowModal(false)}
              >
                Ακύρωση
              </button>
              <button 
                className="confirm-btn"
                onClick={() => handlePaymentUpdate(selectedPayment.id, 'paid')}
              >
                Επιβεβαίωση Πληρωμής
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentManagement;
