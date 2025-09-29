import React, { useState, useEffect } from 'react';
import './RefundManagement.css';

const RefundManagement = ({ token }) => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchRefundRequests();
  }, []);

  const fetchRefundRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/refunds/requests', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch refund requests');
      }

      const data = await response.json();
      setRefunds(data.data || []);
    } catch (err) {
      setError('Error loading refund requests: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const processRefund = async (reservationId, action) => {
    try {
      const response = await fetch('http://localhost:3001/api/refunds/process', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reservation_id: reservationId,
          action: action,
          rejection_reason: action === 'rejected' ? rejectionReason : null
        })
      });

      if (!response.ok) {
        throw new Error('Failed to process refund');
      }

      const result = await response.json();
      setSuccess(result.message);
      setShowModal(false);
      setSelectedRefund(null);
      setRejectionReason('');
      fetchRefundRequests();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error processing refund: ' + err.message);
    }
  };

  const openRefundModal = (refund, action) => {
    setSelectedRefund({...refund, action});
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'requested': return '#ffa500';
      case 'approved': return '#28a745';
      case 'rejected': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'requested': return 'Αιτήθηκε';
      case 'approved': return 'Εγκρίθηκε';
      case 'rejected': return 'Απορρίφθηκε';
      default: return 'Άγνωστο';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('el-GR');
  };

  const canCancel = (startDate, cancellationHours) => {
    const now = new Date();
    const start = new Date(startDate);
    const hoursUntilStart = (start - now) / (1000 * 60 * 60);
    return hoursUntilStart >= cancellationHours;
  };

  if (loading) {
    return <div className="loading">Loading refund requests...</div>;
  }

  return (
    <div className="refund-management">
      <div className="section-header">
        <h3>Διαχείριση Επιστροφών</h3>
        <button onClick={fetchRefundRequests} className="refresh-btn">
          Ανανέωση
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="refunds-list">
        {refunds.length === 0 ? (
          <div className="no-data">Δεν υπάρχουν αιτήματα επιστροφής</div>
        ) : (
          refunds.map((refund) => (
            <div key={refund.id} className="refund-card">
              <div className="refund-header">
                <div className="refund-info">
                  <h4>Κράτηση #{refund.id}</h4>
                  <span className="customer-name">{refund.customer_name}</span>
                </div>
                <div className="refund-status">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(refund.refund_status) }}
                  >
                    {getStatusText(refund.refund_status)}
                  </span>
                </div>
              </div>

              <div className="refund-details">
                <div className="detail-row">
                  <span className="label">Δωμάτιο:</span>
                  <span>{refund.room_code} ({refund.room_type})</span>
                </div>
                <div className="detail-row">
                  <span className="label">Ημερομηνίες:</span>
                  <span>{formatDate(refund.start_date)} - {formatDate(refund.end_date)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Ποσό Επιστροφής:</span>
                  <span className="amount">€{refund.refund_amount || refund.payment_amount}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Πολιτική:</span>
                  <span>{refund.policy_name} ({refund.cancellation_hours} ώρες)</span>
                </div>
                <div className="detail-row">
                  <span className="label">Email:</span>
                  <span>{refund.customer_email}</span>
                </div>
                {refund.refund_reason && (
                  <div className="detail-row">
                    <span className="label">Λόγος Επιστροφής:</span>
                    <span className="reason">{refund.refund_reason}</span>
                  </div>
                )}
                {refund.rejection_reason && (
                  <div className="detail-row">
                    <span className="label">Λόγος Απόρριψης:</span>
                    <span className="rejection-reason">{refund.rejection_reason}</span>
                  </div>
                )}
                {refund.requested_date && (
                  <div className="detail-row">
                    <span className="label">Ημερομηνία Αίτησης:</span>
                    <span>{formatDate(refund.requested_date)}</span>
                  </div>
                )}
              </div>

              <div className="refund-actions">
                {refund.refund_status === 'requested' && (
                  <>
                    <button 
                      className="approve-btn"
                      onClick={() => openRefundModal(refund, 'approved')}
                    >
                      Έγκριση Επιστροφής
                    </button>
                    <button 
                      className="reject-btn"
                      onClick={() => openRefundModal(refund, 'rejected')}
                    >
                      Απόρριψη Επιστροφής
                    </button>
                  </>
                )}
                {refund.refund_status === 'approved' && (
                  <span className="approved-text">Επιστροφή εγκρίθηκε</span>
                )}
                {refund.refund_status === 'rejected' && (
                  <span className="rejected-text">Επιστροφή απορρίφθηκε</span>
                )}
              </div>

              <div className="refund-eligibility">
                <div className="eligibility-check">
                  <span className="label">Επιλέξιμο για Ακύρωση:</span>
                  <span className={canCancel(refund.start_date, refund.cancellation_hours) ? 'eligible' : 'not-eligible'}>
                    {canCancel(refund.start_date, refund.cancellation_hours) ? 'Ναι' : 'Όχι'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Refund Processing Modal */}
      {showModal && selectedRefund && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                {selectedRefund.action === 'approved' ? 'Έγκριση Επιστροφής' : 'Απόρριψη Επιστροφής'}
              </h3>
              <button 
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <p>Κράτηση #{selectedRefund.id} - {selectedRefund.customer_name}</p>
              <p>Ποσό Επιστροφής: €{selectedRefund.refund_amount || selectedRefund.payment_amount}</p>
              
              {selectedRefund.action === 'rejected' && (
                <div className="form-group">
                  <label>Λόγος Απόρριψης:</label>
                  <textarea 
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Εισάγετε τον λόγο απόρριψης..."
                    rows="3"
                    required
                  />
                </div>
              )}
              
              {selectedRefund.action === 'approved' && (
                <div className="approval-info">
                  <p>Η επιστροφή θα εγκριθεί και ο πελάτης θα ενημερωθεί.</p>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => setShowModal(false)}
              >
                Ακύρωση
              </button>
              <button 
                className={selectedRefund.action === 'approved' ? 'confirm-btn' : 'reject-btn'}
                onClick={() => processRefund(selectedRefund.id, selectedRefund.action)}
                disabled={selectedRefund.action === 'rejected' && !rejectionReason.trim()}
              >
                {selectedRefund.action === 'approved' ? 'Επιβεβαίωση Έγκρισης' : 'Επιβεβαίωση Απόρριψης'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RefundManagement;
