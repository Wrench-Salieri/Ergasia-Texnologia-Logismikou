-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 03, 2025 at 03:03 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `hotel_management`
--

-- --------------------------------------------------------

--
-- Table structure for table `accounts`
--

CREATE TABLE accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','receptionist','payment_manager','customer') NOT NULL
);ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `accounts`
--

INSERT INTO `accounts` (`id`, `username`, `password`, `role`) VALUES
(1, 'admin', '$2a$12$N.YSKnQTfl5hIq9JmeTRHu/89KO7Q4zNLVQ.owr2YWXdDcMTbT0CC', 'admin'),
(2, 'reception1', '$2a$12$pXhaxibRiUkQXpSKiTrGBuWj3kCFqg0Nromos.XN2LRXFTxqCSQLC', 'receptionist'),
(3, 'payment1', '$2a$12$pXhaxibRiUkQXpSKiTrGBuWj3kCFqg0Nromos.XN2LRXFTxqCSQLC', 'payment_manager'),
(4, 'customer1', '$2a$12$pXhaxibRiUkQXpSKiTrGBuWj3kCFqg0Nromos.XN2LRXFTxqCSQLC', 'customer');

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  account_id INT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  FOREIGN KEY (account_id) REFERENCES accounts(id)
); ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  account_id INT,
  name VARCHAR(100) NOT NULL,
  position VARCHAR(50),
  FOREIGN KEY (account_id) REFERENCES accounts(id)
); ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rooms`
--

CREATE TABLE rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  floor INT NOT NULL,
  code VARCHAR(10) UNIQUE NOT NULL,
  status ENUM('available','occupied','maintenance') DEFAULT 'available'
); ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rooms`
--

INSERT INTO `rooms` (`id`, `room_number`, `type`, `status`) VALUES
(1, '101', 'Single', 'available'),
(2, '102', 'Double', 'occupied'),
(3, '103', 'Suite', 'maintenance');

--
-- Table structure for table `prices`
--

CREATE TABLE prices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0)
); ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `policies`
--

CREATE TABLE policies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  cancellation_hours INT NOT NULL
);

--
-- Table structure for table `reservations`
--

CREATE TABLE reservations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  room_id INT NOT NULL,
  policy_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (room_id) REFERENCES rooms(id),
  FOREIGN KEY (policy_id) REFERENCES policies(id)
); ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
