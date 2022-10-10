CREATE TABLE `word` (
  `id` int NOT NULL AUTO_INCREMENT,
  `eng` varchar(45) DEFAULT NULL,
  `meaning` tinyint DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ignore` (
  `name` varchar(45) NOT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `name_UNIQUE` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `variant` (
  `name` varchar(45) NOT NULL,
  `word` int DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `name_UNIQUE` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
