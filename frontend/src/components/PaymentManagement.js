import React, { useState } from 'react';
import './PaymentManagement.css';

const PaymentManagement = () => {
  const [payments, setPayments] = useState([
    {
      id: 1,
      customer_name: 'John Doe',
      customer_email: 'john.doe@email.com',
      room_type: 'Double',
      room_code: '102',
      start_date: '2025-10-10',
      end_date: '2025-10-12',
      payment_amount: 150,
      payment_status: 'complete',
      policy_name: 'Standard'
    },
    {
      id: 2,
      customer_name: 'Jane Smith',
      customer_email: 'jane.smith@email.com',
      room_type: 'Single',
      room_code: '101',
      start_date: '2025-10-11',
      end_date: '2025-10-13',
      payment_amount: 120,
      payment_status: 'pending',
      policy_name: 'Flexible'
    },
    {
      id: 3,
      customer_name: 'Customer One',
      customer_email: 'customer1@email.com',
      room_type: 'Double',
      room_code: '102',
      start_date: '2025-10-15',
      end_date: '2025-10-18',
      payment_amount: 150,
      payment_status: 'pending',
      policy_name: 'Standard'
    }
  ]);

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    payment_method: 'cash',
    transaction_id: '',
    notes: ''
  });
  const [success, setSuccess] = useState('');

  const openPaymentModal = (payment) => {
    setSelectedPayment(payment);
    setShowModal(true);
  };

  const handlePaymentUpdate = (id, status) => {
    setPayments((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, payment_status: status } : p
      )
    );
    setShowModal(false);
    setSelectedPayment(null);
    setPaymentData({ payment_method: 'cash', transaction_id: '', notes: '' });
    setSuccess(`Payment #${id} updated to "${status}"`);

    setTimeout(() => setSuccess(''), 3000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffa500';
      case 'paid': return '#28a745';
      case 'rejected': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('el-GR');

  return (
    <div className="payment-management">
      <div className="section-header">
        <h3>Διαχείριση Πληρωμών</h3>
        <button
          className="refresh-btn"
          onClick={() => setSuccess('Refreshed!')}
        >
          Ανανέωση
        </button>
      </div>

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
                {(payment.payment_status === 'pending' || payment.payment_status === 'rejected') && (
                  <button
                    className="approve-btn"
                    onClick={() => openPaymentModal(payment)}
                  >
                    {payment.payment_status === 'pending' ? 'Επιβεβαίωση Πληρωμής' : 'Επανεξέταση'}
                  </button>
                )}
                {payment.payment_status === 'pending' && (
                  <button
                    className="reject-btn"
                    onClick={() => handlePaymentUpdate(payment.id, 'rejected')}
                  >
                    Απόρριψη Πληρωμής
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && selectedPayment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Επιβεβαίωση Πληρωμής</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>Κράτηση #{selectedPayment.id} - {selectedPayment.customer_name}</p>
              <p>Ποσό: €{selectedPayment.payment_amount}</p>
              <div className="form-group">
                <label>Μέθοδος Πληρωμής:</label>
                <select
                  value={paymentData.payment_method}
                  onChange={(e) => setPaymentData({ ...paymentData, payment_method: e.target.value })}
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
                  onChange={(e) => setPaymentData({ ...paymentData, transaction_id: e.target.value })}
                  placeholder="π.χ. TXN123456"
                />
              </div>
              <div className="form-group">
                <label>Σημειώσεις (προαιρετικό):</label>
                <textarea
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                  placeholder="Επιπλέον σημειώσεις..."
                  rows="3"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowModal(false)}>Ακύρωση</button>
              <button className="confirm-btn" onClick={() => handlePaymentUpdate(selectedPayment.id, 'paid')}>Επιβεβαίωση Πληρωμής</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentManagement;
