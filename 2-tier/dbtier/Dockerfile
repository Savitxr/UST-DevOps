FROM mysql:8.0

# MySQL will automatically run any .sql scripts placed in /docker-entrypoint-initdb.d
# on first container startup.
COPY init.sql /docker-entrypoint-initdb.d/

EXPOSE 3306
