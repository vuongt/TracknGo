CREATE OR REPLACE DATABASE appdb CHARACTER SET 'utf8';
USE appdb;
CREATE USER IF NOT EXISTS 'dty'@'localhost' IDENTIFIED BY 'dty';
GRANT ALL PRIVILEGES ON appdb.* TO 'dty'@'localhost';

CREATE OR REPLACE TABLE users (
	id MEDIUMINT NOT NULL AUTO_INCREMENT,
	name VARCHAR(30) NOT NULL,
	email VARCHAR(30) NOT NULL,
	password VARCHAR(20) NOT NULL,
	PRIMARY KEY (id)
);

CREATE OR REPLACE TABLE favorite_works (
  id_user MEDIUMINT NOT NULL,
  iswc VARCHAR(15) NOT NULL,
  title VARCHAR(50)
);

CREATE OR REPLACE TABLE favorite_authors (
  id_user MEDIUMINT NOT NULL,
  name_author INT NOT NULL
);

CREATE OR REPLACE TABLE comment (
  id_comment INT NOT NULL AUTO_INCREMENT,
  id_prog INT NOT NULL,
  id_user MEDIUMINT NOT NULL,
  creation_date DATE,
  content VARCHAR(2000),
  PRIMARY KEY (id_comment)
);

CREATE OR REPLACE TABLE planning (
  id_user MEDIUMINT NOT NULL,
  id_prog INT NOT NULL,
  prog_date DATE
  );

CREATE OR REPLACE TABLE users_token (
  id_token MEDIUMINT NOT NULL AUTO_INCREMENT,
  email VARCHAR(30) NOT NULL,
  token VARCHAR(100) NOT NULL,
  expire_date DATETIME,
  PRIMARY KEY (id_token)
)
