-- Payment Management Schema Extensions
-- Run this to extend the existing hotel_management database

-- Add payment-related columns to reservations table
ALTER TABLE reservations 
ADD COLUMN payment_status ENUM('pending', 'paid', 'rejected', 'refunded') DEFAULT 'pending',
ADD COLUMN payment_amount DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN payment_date DATETIME NULL,
ADD COLUMN receipt_issued BOOLEAN DEFAULT FALSE,
ADD COLUMN receipt_path VARCHAR(255) NULL,
ADD COLUMN refund_status ENUM('none', 'requested', 'approved', 'rejected') DEFAULT 'none',
ADD COLUMN refund_amount DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN refund_reason TEXT NULL,
ADD COLUMN refund_date DATETIME NULL;

-- Create payments table for detailed payment tracking
CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reservation_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method ENUM('cash', 'card', 'bank_transfer', 'online') NOT NULL,
  payment_status ENUM('pending', 'completed', 'failed', 'refunded') NOT NULL,
  transaction_id VARCHAR(100) NULL,
  payment_date DATETIME NOT NULL,
  processed_by INT NOT NULL,
  notes TEXT NULL,
  FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE,
  FOREIGN KEY (processed_by) REFERENCES accounts(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Create receipts table for receipt management
CREATE TABLE receipts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reservation_id INT NOT NULL,
  receipt_number VARCHAR(50) UNIQUE NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  issued_date DATETIME NOT NULL,
  issued_by INT NOT NULL,
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_date DATETIME NULL,
  FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE,
  FOREIGN KEY (issued_by) REFERENCES accounts(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Create refunds table for refund tracking
CREATE TABLE refunds (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reservation_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  reason TEXT NOT NULL,
  status ENUM('requested', 'approved', 'rejected', 'processed') NOT NULL,
  requested_date DATETIME NOT NULL,
  processed_date DATETIME NULL,
  processed_by INT NULL,
  rejection_reason TEXT NULL,
  FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE,
  FOREIGN KEY (processed_by) REFERENCES accounts(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert sample data for testing
INSERT INTO customers (account_id, name, email) VALUES
(4, 'John Doe', 'john.doe@email.com');

INSERT INTO policies (name, cancellation_hours) VALUES
('Standard Policy', 24),
('Flexible Policy', 48),
('Non-refundable', 0);

INSERT INTO prices (category, amount) VALUES
('Single', 80.00),
('Double', 120.00),
('Suite', 200.00);

-- Insert sample reservations for testing
INSERT INTO reservations (customer_id, room_id, policy_id, start_date, end_date, payment_status, payment_amount) VALUES
(1, 1, 1, '2024-01-15', '2024-01-17', 'pending', 160.00),
(1, 2, 2, '2024-01-20', '2024-01-22', 'paid', 240.00),
(1, 3, 1, '2024-01-25', '2024-01-27', 'paid', 400.00);
