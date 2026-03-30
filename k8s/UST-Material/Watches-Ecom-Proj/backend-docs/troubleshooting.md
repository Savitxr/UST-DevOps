# Docker Troubleshooting

## Common Issues and Fixes

- Containers stuck in restart loop
  - Check logs: `docker logs <container>`
  - Ensure ports are not already in use on the host
  - Validate environment variables are set

- Health checks failing
  - Verify service ports inside containers
  - Ensure dependencies are healthy (database, registry, logging)
  - Check firewall rules and Security Group inbound rules

- Services not registering with registry
  - Confirm `REGISTRY_URL` value
  - Check network connectivity between containers
  - Verify registry is healthy before starting services

- Gateway returns 502/504
  - Check registry for service instances
  - Confirm backend services are healthy and listening
  - Validate gateway route prefixes in the Node gateway

- Database connection failures
  - Confirm `DATABASE_URL` points to `postgres` service
  - Ensure schema exists in `init.sql`
  - Verify `watch_user` permissions

- Logs missing in logging service
  - Ensure `LOGGING_URL` is set
  - Check logging service health at `/health`
  - Validate network connectivity and DNS resolution

- Docker compose build failures
  - Run `docker compose build --no-cache`
  - Ensure required files are present in each build context

- Slow builds on EC2
  - Use smaller instance types only if necessary
  - Pre-build images locally and push to a registry

- Nginx shows default page
  - Ensure `frontend/Dockerfile` copies the custom `nginx.conf`
  - Verify `frontend/html` files are copied

- Port already allocated
  - Find the process using the port: `sudo lsof -i :<port>`
  - Stop the process or change the host port mapping

- DNS resolution failures between containers
  - Ensure services share the same Docker network
  - Recreate networks: `docker compose down` then `docker compose up -d`

- Postgres init scripts not applied
  - The init scripts run only on first boot of a new volume
  - Remove the volume: `docker volume rm <compose_project>_postgres-data`

- Disk full errors on EC2
  - Check disk usage: `df -h`
  - Prune unused images and volumes: `docker system prune`

- Container cannot reach internet
  - Verify EC2 route tables and outbound rules
  - Check if the instance uses a NAT gateway for private subnets

- Permission denied on mounted files
  - Ensure file permissions allow container access
  - Recreate files with correct ownership

- Logs flooded by excessive request volume
  - Use log sampling or lower verbosity
  - Scale logging service or forward logs to a managed stack

- Time drift between containers
  - Ensure the host time is correct
  - Restart containers after fixing host time

- Orphaned containers after compose changes
  - Clean up: `docker compose down --remove-orphans`
