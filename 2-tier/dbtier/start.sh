#! /bin/bash

# Wait for MySQL to start
sleep 10

# Use root password if provided
MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD:-root}

# Run initialization script
mysql -u root -p"$MYSQL_ROOT_PASSWORD" < /init.sql

