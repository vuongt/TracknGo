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