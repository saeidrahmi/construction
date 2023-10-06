
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


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
  `password` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

ALTER TABLE `users`
  ADD PRIMARY KEY (`userId`);
COMMIT;



CREATE TABLE `userServices` (
  `userId` varchar(80) NOT NULL,
  `service` varchar(80) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


ALTER TABLE `userServices`
  ADD UNIQUE KEY `userId` (`userId`,`service`);


ALTER TABLE `userServices`
  ADD CONSTRAINT `userId` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;
