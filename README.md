The first time you pull this project type :

    npm install
    
This will install gulp, bower and gulp-util which are needed to use the gulp install task that you will need to use after each pull to check if modules were updated.

After each pull type :

    gulp install
    
You are ready to go !


# How to use the configuration you want

The NodeJS server connects to the live MariaDB Database with a client that is generated when you launch the NodeJS server.
How the connection is established depends on which configuration file you use :

**config-dev.js** is located at the root of the project and should be used when you wish to code. You can change the contents of the file to use the ports you want.

**config-prod.js** is located in the same directory. 

To check which configuration you are currently using : use the following command 

    gulp check-config
    
It gets the configuration file from which you are importing the configuration paramaters from the **server.js** file.
If you wish to change configuration from there, just use the command :

    gulp change-config
    
# How to prepare Eliza database.

First you have to install MariaDB. I invite you to look up on internet which installation you need, since their is a lot of different installations possible depending on your OS.
Then, you need to configure MariaDB. For that, the MariaDB documentation is the way to go too, since the location of your my.cnf file depends on your OS too.

Secondly, you need to create your tables. For that, you need to use the script **elizaCreate.sql** located into this git at the root of the project.

For that, log into mysql by opening a command prompt the computer hosting your server and typing :

    mysql -u root 
    
If you set up a password for the root user :

    mysql -u root -p
    
The command for loading the script is :

    source /path/to/elizaCreate.sql

After that, you to import Eliza's content into your MariaDB database.
The module you need to use is **CSV import**, located in another branch of this git.

## How does it work

It creates a file and formats the data from a given and properly named DSV file (which should correspond to the data inserted into a table of Eliza), and creates another DSV file corresponding to what you can insert into your database.

**Be CAREFUL**
THE DELIMITER USED IN THE DSV FILES HAS TO BE A PIPE '|'

**THE FILES SHOULD BE PLACED IN THE DATA FOLDER AT THE ROOT OF THE CSV IMPORT MODULE AND YOU SHOULD LAUNCH node main as root user**

    sudo su
    node main
    

The names of the files should be :

**prog.dsv** for table ELIZAT_PROG

**oeuvdif.dsv** for table ELIZAT_OEUVDIF

**progtyp.dsv** for table ELIZAT_PROGTYPDIF

**adr.dsv** for ELIZAT_ADR

**progtyputil.dsv** for table ELIZAT_PROGTYPUTIL

**improoeuvdif.dsv** for ELIZAT_IMPROOEUVDIF


The last table, TYPANIMUTIL can be imported without treatment since it only has 5 rows


The created file name is the same with data as a prefix (ex : dataadr).
To import data into your database, launch mysql as root with

    mysql -u root 
    
If you haven't configured a password, else with

    mysql -u root -p
    
Then launch the sql script import.sql which is located at the root of the module folder. 

    source /path/to/import.sql

**BE CAREFUL** import.sql also deals with the two tables that should be added (which is the contents and participants of "programmes types").
Therefore, it is import that when these two CSV files are extracted from Oracle, they be named :

**dataprogtypcontenu.csv** for ELIZAT_PROGTYPCONTENU

**dataprogtyppart.csv** for ELIZAT_PROGTYPPART

## Adding geolocation data

First you need to check the config file in the root of the CSV import module to check if the parameters used to connect to mariadb are the good ones.

Then, you just need to launch

    node coordinates
    
And watch node add everything you will need to geolocate events from Eliza !