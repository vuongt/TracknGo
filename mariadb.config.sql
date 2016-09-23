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
  name_author VARCHAR(30) NOT NULL
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
);

INSERT INTO users (name, email, password)
VALUES ('aaa','aaa@aaa.com','aaa'),
       ('bbb','bbb@bbb.com','bbb'),
       ('ccc','ccc@ccc.com','ccc'),
       ('ddd','ddd@ddd.com','ddd'),
       ('fff','fff@fff.com','fff'),
       ('ggg','ggg@ggg.com','ggg');

INSERT INTO favorite_works (id_user,iswc,title)
VALUES ('1','T-913.015.597.4', 'Tous les meme'),
      ('1','T-703.284.149.1', 'LA VIE EN ROSE'),
      ('2','T-703.149.807.6', 'Quand c est'),
      ('2','T-003.582.360.9', 'CONTRE COURANT'),
      ('2','T-702.990.343.5', 'J AI 20 ANS'),
      ('3','T-070.139.886.8', 'SWEET SWEET BABY');

INSERT INTO favorite_authors (id_user,name_author)
VALUES ('1','Goldman'),
       ('2','Coldplay'),
       ('2','Celine Dion'),
       ('3','Zazie'),
       ('3','Florent Pagny'),
       ('4','Mika'),
       ('4','Zazie'),
       ('1','Garou'),
       ('5','Black M');



