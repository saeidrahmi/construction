-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: db
-- Generation Time: Nov 14, 2023 at 09:02 PM
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
  `planName` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `planType` varchar(20) NOT NULL,
  `createRfpIncluded` tinyint(1) NOT NULL,
  `createBidsIncluded` tinyint(1) DEFAULT NULL,
  `customProfileIncluded` tinyint(1) NOT NULL,
  `onlineSupportIncluded` tinyint(1) DEFAULT NULL,
  `dateCreated` timestamp NOT NULL,
  `startDate` timestamp NOT NULL,
  `expiryDate` timestamp NULL DEFAULT NULL,
  `planDescription` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `numberOfAdvertisements` int NOT NULL,
  `duration` varchar(20) NOT NULL,
  `priceAfterDiscount` decimal(10,2) NOT NULL,
  `originalPrice` decimal(10,2) NOT NULL,
  `discountPercentage` int NOT NULL,
  `active` tinyint(1) NOT NULL,
  `deleted` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `freeTiralPeriod` int DEFAULT NULL,
  `monthlyPrice` decimal(10,2) DEFAULT NULL,
  `monthlyDiscount` int NOT NULL,
  `quarterlyDiscount` int DEFAULT NULL,
  `semiAnualDiscount` int NOT NULL,
  `yearlyDiscount` int DEFAULT NULL,
  `tax` decimal(10,2) DEFAULT NULL,
  `topAdvertisementPrice` decimal(10,2) DEFAULT NULL,
  `maxAdvertisementSliderImage` int DEFAULT NULL,
  `userAdvertisementDuration` int NOT NULL,
  `passwordResetDurationAdminUsers` int DEFAULT NULL,
  `passwordResetDurationGeneralUsers` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `userAdvertisementImages`
--

CREATE TABLE `userAdvertisementImages` (
  `userAdvertisementImageId` bigint UNSIGNED NOT NULL,
  `userAdvertisementId` bigint UNSIGNED NOT NULL,
  `userAdvertisementImage` longblob NOT NULL,
  `imageTitle` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `imageDescription` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `userAdvertisements`
--

CREATE TABLE `userAdvertisements` (
  `userAdvertisementId` bigint UNSIGNED NOT NULL,
  `userPlanId` bigint UNSIGNED NOT NULL,
  `title` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `description` varchar(400) NOT NULL,
  `active` tinyint(1) DEFAULT NULL,
  `deleted` tinyint(1) NOT NULL DEFAULT '0',
  `approvedByAdmin` tinyint(1) DEFAULT '0',
  `rejected` tinyint(1) NOT NULL DEFAULT '0',
  `rejectedReason` varchar(160) DEFAULT NULL,
  `headerImage` longblob,
  `topAdvertisement` tinyint(1) DEFAULT NULL,
  `showPhone` tinyint(1) DEFAULT NULL,
  `showAddress` tinyint(1) DEFAULT NULL,
  `showEmail` tinyint(1) DEFAULT NULL,
  `showPicture` tinyint(1) DEFAULT NULL,
  `showChat` tinyint(1) DEFAULT NULL,
  `numberOfVisits` int DEFAULT '0',
  `dateCreated` timestamp NOT NULL,
  `expiryDate` timestamp NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `userAdvertisementsMessages`
--

CREATE TABLE `userAdvertisementsMessages` (
  `messageId` bigint UNSIGNED NOT NULL,
  `userId` varchar(80) NOT NULL,
  `fromUserId` varchar(80) NOT NULL,
  `advertisementId` bigint NOT NULL,
  `message` varchar(1000) NOT NULL,
  `dateCreated` timestamp NOT NULL,
  `viewed` tinyint(1) NOT NULL DEFAULT '0',
  `deleted` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `userFavoriteAdvertisements`
--

CREATE TABLE `userFavoriteAdvertisements` (
  `dateCreated` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `userId` varchar(80) NOT NULL,
  `userAdvertisementId` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `userPayments`
--

CREATE TABLE `userPayments` (
  `paymentId` bigint UNSIGNED NOT NULL,
  `userPlanId` bigint UNSIGNED NOT NULL,
  `paymentConfirmation` varchar(80) DEFAULT NULL,
  `paymentAmount` decimal(10,2) NOT NULL,
  `tax` decimal(10,2) DEFAULT NULL,
  `totalPayment` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `userPermissions`
--

CREATE TABLE `userPermissions` (
  `userId` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `viewDashboard` tinyint(1) NOT NULL DEFAULT '0',
  `updateAdminSettings` tinyint(1) NOT NULL DEFAULT '0',
  `createUser` tinyint(1) NOT NULL DEFAULT '0',
  `viewUsers` tinyint(1) NOT NULL DEFAULT '0',
  `createPlan` tinyint(1) NOT NULL DEFAULT '0',
  `listPlans` tinyint(1) NOT NULL DEFAULT '0',
  `viewPendingAdvertisements` tinyint(1) NOT NULL DEFAULT '0',
  `approveAdvertisement` tinyint(1) NOT NULL DEFAULT '0',
  `allowPlanActions` tinyint(1) NOT NULL DEFAULT '0',
  `allowUserActions` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `userPlans`
--

CREATE TABLE `userPlans` (
  `userPlanId` bigint UNSIGNED NOT NULL,
  `userId` varchar(80) NOT NULL,
  `planId` bigint UNSIGNED DEFAULT NULL,
  `purchasedDate` timestamp NOT NULL,
  `userPlanExpiryDate` timestamp NULL DEFAULT NULL,
  `userPlanActive` tinyint(1) DEFAULT '1',
  `inactiveReason` varchar(80) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `userProvinces`
--

CREATE TABLE `userProvinces` (
  `userId` varchar(80) NOT NULL,
  `province` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `userRatings`
--

CREATE TABLE `userRatings` (
  `userId` varchar(80) NOT NULL,
  `ratedBy` varchar(80) NOT NULL,
  `rate` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint UNSIGNED NOT NULL,
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
  `logoImage` longblob,
  `jwtToken` varchar(500) DEFAULT NULL,
  `loginCount` int DEFAULT '0',
  `password` varchar(200) DEFAULT NULL,
  `company` varchar(80) DEFAULT NULL,
  `jobProfileDescription` varchar(400) DEFAULT NULL,
  `deleted` tinyint(1) DEFAULT '0',
  `serviceCoverageType` varchar(10) DEFAULT NULL,
  `passwordResetRequired` tinyint(1) DEFAULT '0',
  `lastPasswordResetDate` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `userServiceCities`
--

CREATE TABLE `userServiceCities` (
  `userId` varchar(80) NOT NULL,
  `province` varchar(30) NOT NULL,
  `city` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `userServices`
--

CREATE TABLE `userServices` (
  `userId` varchar(80) NOT NULL,
  `service` varchar(80) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `userTopAdvertisementPayments`
--

CREATE TABLE `userTopAdvertisementPayments` (
  `paymentId` bigint UNSIGNED NOT NULL,
  `userAdvertisementId` bigint UNSIGNED NOT NULL,
  `paymentConfirmation` varchar(80) DEFAULT NULL,
  `paymentAmount` decimal(10,2) NOT NULL,
  `tax` decimal(10,2) DEFAULT NULL,
  `totalPayment` decimal(10,2) DEFAULT NULL
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
-- Indexes for table `userAdvertisementImages`
--
ALTER TABLE `userAdvertisementImages`
  ADD PRIMARY KEY (`userAdvertisementImageId`),
  ADD UNIQUE KEY `userAdvertisementImageId` (`userAdvertisementImageId`),
  ADD KEY `userAdImage_id` (`userAdvertisementId`);

--
-- Indexes for table `userAdvertisements`
--
ALTER TABLE `userAdvertisements`
  ADD PRIMARY KEY (`userAdvertisementId`),
  ADD UNIQUE KEY `userAdvertisementId` (`userAdvertisementId`),
  ADD KEY `userplan_Id` (`userPlanId`);

--
-- Indexes for table `userAdvertisementsMessages`
--
ALTER TABLE `userAdvertisementsMessages`
  ADD PRIMARY KEY (`messageId`),
  ADD UNIQUE KEY `messageId` (`messageId`);

--
-- Indexes for table `userFavoriteAdvertisements`
--
ALTER TABLE `userFavoriteAdvertisements`
  ADD PRIMARY KEY (`userId`,`userAdvertisementId`),
  ADD KEY `fav_adId` (`userAdvertisementId`);

--
-- Indexes for table `userPayments`
--
ALTER TABLE `userPayments`
  ADD PRIMARY KEY (`userPlanId`),
  ADD UNIQUE KEY `paymentId` (`paymentId`);

--
-- Indexes for table `userPermissions`
--
ALTER TABLE `userPermissions`
  ADD PRIMARY KEY (`userId`);

--
-- Indexes for table `userPlans`
--
ALTER TABLE `userPlans`
  ADD PRIMARY KEY (`userPlanId`),
  ADD UNIQUE KEY `userPlanId` (`userPlanId`),
  ADD KEY `f_userId` (`userId`),
  ADD KEY `f_planId` (`planId`);

--
-- Indexes for table `userProvinces`
--
ALTER TABLE `userProvinces`
  ADD PRIMARY KEY (`userId`,`province`);

--
-- Indexes for table `userRatings`
--
ALTER TABLE `userRatings`
  ADD PRIMARY KEY (`userId`,`ratedBy`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`userId`),
  ADD UNIQUE KEY `id` (`id`);

--
-- Indexes for table `userServiceCities`
--
ALTER TABLE `userServiceCities`
  ADD PRIMARY KEY (`userId`,`province`,`city`);

--
-- Indexes for table `userServices`
--
ALTER TABLE `userServices`
  ADD UNIQUE KEY `userId` (`userId`,`service`);

--
-- Indexes for table `userTopAdvertisementPayments`
--
ALTER TABLE `userTopAdvertisementPayments`
  ADD PRIMARY KEY (`paymentId`),
  ADD KEY `userAdvertisementId_index` (`userAdvertisementId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `plans`
--
ALTER TABLE `plans`
  MODIFY `planId` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `userAdvertisementImages`
--
ALTER TABLE `userAdvertisementImages`
  MODIFY `userAdvertisementImageId` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `userAdvertisements`
--
ALTER TABLE `userAdvertisements`
  MODIFY `userAdvertisementId` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `userAdvertisementsMessages`
--
ALTER TABLE `userAdvertisementsMessages`
  MODIFY `messageId` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

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
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `userTopAdvertisementPayments`
--
ALTER TABLE `userTopAdvertisementPayments`
  MODIFY `paymentId` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `userAdvertisementImages`
--
ALTER TABLE `userAdvertisementImages`
  ADD CONSTRAINT `userAdImage_id` FOREIGN KEY (`userAdvertisementId`) REFERENCES `userAdvertisements` (`userAdvertisementId`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `userAdvertisements`
--
ALTER TABLE `userAdvertisements`
  ADD CONSTRAINT `userplan_Id` FOREIGN KEY (`userPlanId`) REFERENCES `userPlans` (`userPlanId`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `userFavoriteAdvertisements`
--
ALTER TABLE `userFavoriteAdvertisements`
  ADD CONSTRAINT `fav_adId` FOREIGN KEY (`userAdvertisementId`) REFERENCES `userAdvertisements` (`userAdvertisementId`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `userId_fav` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `userPayments`
--
ALTER TABLE `userPayments`
  ADD CONSTRAINT `planId` FOREIGN KEY (`userPlanId`) REFERENCES `userPlans` (`userPlanId`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `userPermissions`
--
ALTER TABLE `userPermissions`
  ADD CONSTRAINT `userId_permissions` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `userPlans`
--
ALTER TABLE `userPlans`
  ADD CONSTRAINT `f_planId` FOREIGN KEY (`planId`) REFERENCES `plans` (`planId`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `f_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `userProvinces`
--
ALTER TABLE `userProvinces`
  ADD CONSTRAINT `userId_province` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `userServiceCities`
--
ALTER TABLE `userServiceCities`
  ADD CONSTRAINT `userId_city` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE CASCADE ON UPDATE RESTRICT;

--
-- Constraints for table `userServices`
--
ALTER TABLE `userServices`
  ADD CONSTRAINT `userId` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `userTopAdvertisementPayments`
--
ALTER TABLE `userTopAdvertisementPayments`
  ADD CONSTRAINT `userAdvertisementId_index` FOREIGN KEY (`userAdvertisementId`) REFERENCES `userAdvertisements` (`userAdvertisementId`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
