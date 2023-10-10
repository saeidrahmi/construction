-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: db
-- Generation Time: Oct 10, 2023 at 03:33 PM
-- Server version: 8.1.0
-- PHP Version: 8.2.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `construction`
--

-- --------------------------------------------------------

--
-- Table structure for table `plans`
--

CREATE TABLE `plans` (
  `planId` bigint UNSIGNED NOT NULL,
  `dateCreated` timestamp NOT NULL,
  `expiryDate` timestamp NULL DEFAULT NULL,
  `description` varchar(80) NOT NULL,
  `numberOfAdvertisements` int NOT NULL,
  `duration` varchar(20) NOT NULL,
  `price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `userAdvertisements`
--

CREATE TABLE `userAdvertisements` (
  `userId` varchar(80) NOT NULL,
  `planId` bigint UNSIGNED NOT NULL,
  `dateCreated` timestamp NOT NULL,
  `expiryDate` timestamp NULL DEFAULT NULL,
  `header` varchar(80) NOT NULL,
  `description` varchar(400) NOT NULL,
  `expired` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `userPayments`
--

CREATE TABLE `userPayments` (
  `paymentId` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `userPlans`
--

CREATE TABLE `userPlans` (
  `userPlanId` bigint UNSIGNED NOT NULL,
  `paymentId` bigint UNSIGNED NOT NULL,
  `userId` varchar(80) NOT NULL,
  `planId` bigint UNSIGNED NOT NULL,
  `purchasedDate` timestamp NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `userId` varchar(80) NOT NULL,
  `role` varchar(20) NOT NULL,
  `firstName` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `lastName` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `registeredDate` timestamp NOT NULL,
  `loggedIn` tinyint(1) DEFAULT NULL,
  `active` tinyint(1) DEFAULT NULL,
  `registered` tinyint(1) DEFAULT NULL,
  `lastLoginDate` timestamp NULL DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `fax` varchar(20) DEFAULT NULL,
  `address` varchar(80) DEFAULT NULL,
  `city` varchar(20) DEFAULT NULL,
  `province` varchar(20) DEFAULT NULL,
  `postalCode` varchar(7) DEFAULT NULL,
  `website` varchar(80) DEFAULT NULL,
  `middleName` varchar(80) DEFAULT NULL,
  `profileImage` longblob,
  `jwtToken` varchar(500) DEFAULT NULL,
  `loginCount` int DEFAULT NULL,
  `password` varchar(200) DEFAULT NULL,
  `company` varchar(80) DEFAULT NULL,
  `jobProfileDescription` varchar(400) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `userServices`
--

CREATE TABLE `userServices` (
  `userId` varchar(80) NOT NULL,
  `service` varchar(80) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `plans`
--
ALTER TABLE `plans`
  ADD PRIMARY KEY (`planId`),
  ADD UNIQUE KEY `planId` (`planId`);

--
-- Indexes for table `userAdvertisements`
--
ALTER TABLE `userAdvertisements`
  ADD UNIQUE KEY `userId` (`userId`,`planId`) USING BTREE,
  ADD UNIQUE KEY `planId` (`planId`);

--
-- Indexes for table `userPayments`
--
ALTER TABLE `userPayments`
  ADD PRIMARY KEY (`paymentId`),
  ADD UNIQUE KEY `paymentId` (`paymentId`);

--
-- Indexes for table `userPlans`
--
ALTER TABLE `userPlans`
  ADD PRIMARY KEY (`userPlanId`),
  ADD UNIQUE KEY `userPlanId` (`userPlanId`),
  ADD KEY `f_userId` (`userId`),
  ADD KEY `f_planId` (`planId`),
  ADD KEY `f_paymentId` (`paymentId`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`userId`);

--
-- Indexes for table `userServices`
--
ALTER TABLE `userServices`
  ADD UNIQUE KEY `userId` (`userId`,`service`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `plans`
--
ALTER TABLE `plans`
  MODIFY `planId` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `userAdvertisements`
--
ALTER TABLE `userAdvertisements`
  MODIFY `planId` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `userPayments`
--
ALTER TABLE `userPayments`
  MODIFY `paymentId` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `userPlans`
--
ALTER TABLE `userPlans`
  MODIFY `userPlanId` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `userPlans`
--
ALTER TABLE `userPlans`
  ADD CONSTRAINT `f_paymentId` FOREIGN KEY (`paymentId`) REFERENCES `userPayments` (`paymentId`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `f_planId` FOREIGN KEY (`planId`) REFERENCES `plans` (`planId`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `f_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `userServices`
--
ALTER TABLE `userServices`
  ADD CONSTRAINT `userId` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
