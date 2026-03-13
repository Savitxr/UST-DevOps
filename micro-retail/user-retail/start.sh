#! /bin/bash

service mysql start

sleep 5
# Run initialization script
mysql -u root < /init.sql



java -jar app.jar
