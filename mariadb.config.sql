CREATE OR REPLACE DATABASE appdb CHARACTER SET 'utf8';
USE appdb;
CREATE USER IF NOT EXISTS 'dty'@'localhost' IDENTIFIED BY 'dty';
GRANT ALL PRIVILEGES ON appdb.* TO 'dty'@'localhost';

CREATE OR REPLACE TABLE users (
	id MEDIUMINT NOT NULL AUTO_INCREMENT,
	name VARCHAR(30) NOT NULL,
	email VARCHAR(30) NOT NULL,
	password VARCHAR(100) NOT NULL,
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

CREATE OR REPLACE TABLE favorite_artists (
  id_user MEDIUMINT NOT NULL,
  name_artist VARCHAR(30) NOT NULL
);

CREATE OR REPLACE TABLE comment (
  id_comment INT NOT NULL AUTO_INCREMENT,
  cdeprog VARCHAR(10) NOT NULL,
  id_user MEDIUMINT NOT NULL,
  creation_date DATETIME,
  content VARCHAR(2000),
  PRIMARY KEY (id_comment)
);

CREATE OR REPLACE TABLE planning (
  id_event INT NOT NULL AUTO_INCREMENT,
  id_user MEDIUMINT NOT NULL,
  cdeprog VARCHAR(10),
  prog_date DATETIME,
  location VARCHAR(100),
  title VARCHAR(100),
  id_bit INT,
  PRIMARY KEY (id_event)
 );

CREATE OR REPLACE TABLE users_token (
  id_token MEDIUMINT NOT NULL AUTO_INCREMENT,
  email VARCHAR(30) NOT NULL,
  token VARCHAR(200) NOT NULL,
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
INSERT INTO favorite_artists (id_user,name_artist)
VALUES ('1','Katy Perry'),
      ('2','Imagine Dragon'),
      ('2','Tokio Hotel'),
      ('3','Christine and the Queen'),
      ('3','Claude Francois'),
      ('4','Vanessa Paradis'),
      ('4','Zazie'),
      ('1','Garou'),
      ('5','Black M');


INSERT INTO comment (cdeprog, id_user, creation_date, content)
VALUES ('0008201463', '1', '2016-09-26 10:58:00', 'I\'ve come to talk with you again' ),
       ('0008201463', '2', '2016-09-26 10:50:00', 'I\'ve come to talk with you again' ),
       ('0008201496', '2', '2016-09-25 10:58:00', 'Hello darkness, my old friend' ),
       ('0008201496', '1', '2016-09-25 10:55:00', 'Hello darkness, my old friend' );


INSERT INTO planning (id_user,id_bit, cdeprog, prog_date, location, title)
VALUES ('1', '123', '', '2016-09-16T22:00:00.000Z', '13 Passage du Moulinet, 75013 Paris ', 'Concert Tribute to Balavoine'),
       ('1','' ,'0008201496', '2016-09-17T22:00:00.000Z', 'SOUFFLENHEIM', 'Concert Tribute to Balavoine');


