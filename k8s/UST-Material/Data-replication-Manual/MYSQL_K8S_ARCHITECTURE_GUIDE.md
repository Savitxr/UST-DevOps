MySQL StatefulSet + FastAPI Gateway Architecture Guide

This guide explains how the current demo works in Kubernetes terms, what data path is used, and what to watch during demonstrations.

## 1) Components

Namespace (runtime):
- stat

Stateful database layer:
- StatefulSet: mysql (3 pods)
- Pods: mysql-0 (master), mysql-1 (replica), mysql-2 (replica)
- PVC per pod: data-mysql-0, data-mysql-1, data-mysql-2
- PV per PVC (Retain policy)

Service layer:
- mysql-headless: stable pod DNS
- mysql-write: routes only to mysql-0
- mysql-read-1: routes only to mysql-1
- mysql-read-2: routes only to mysql-2
- mysql-rw-gateway (NodePort): exposes FastAPI app

Application layer:
- FastAPI gateway
- POST /messages -> mysql-write
- GET /messages -> mysql-read-1 or mysql-read-2 (random)

## 2) Data flow

Write flow:
1. Client sends POST /messages to gateway.
2. Gateway writes to mysql-write service.
3. mysql-write routes to mysql-0 only.
4. mysql-0 commits transaction and writes binlog event.

Replication flow:
1. mysql-1 and mysql-2 I/O threads pull binlog events from mysql-0.
2. SQL threads apply events locally on each replica volume.
3. Replicas eventually contain same rows as master.

Read flow:
1. Client sends GET /messages to gateway.
2. Gateway picks one read service (mysql-read-1 or mysql-read-2).
3. Query result comes from replica.

Key point:
- Kubernetes does routing and stable identity.
- MySQL does actual data replication.

## 3) Why StatefulSet is important here

StatefulSet guarantees:
- Stable pod names (mysql-0/1/2)
- Stable network identities
- Stable persistent volume claims per pod

These guarantees make replication config predictable:
- master host can stay fixed at mysql-0 DNS
- each replica keeps its own persisted data directory

## 4) What can break the flow

1. Wrong credentials in gateway:
- Gateway pod crash with Access denied (1045).
- Fix by creating app user and setting DB_USER/DB_PASSWORD env in deployment.

2. Master not replication-capable:
- server_id = 0 or log_bin = OFF.
- Replication cannot start.

3. Wrong service host in CHANGE MASTER:
- DNS/connect errors (2005).
- Use correct master host for your service layout.

4. External Postman timeout:
- In-cluster works but NodePort blocked by cloud firewall/security group.
- Use port-forward for guaranteed demo path.

5. Retained old data:
- PV Retain keeps old MySQL state/passwords.
- Can cause auth mismatch after redeploy.

## 5) Demo checklist (quick)


1. kubectl -n stat get pods
2. kubectl -n stat get svc mysql-write mysql-read-1 mysql-read-2 mysql-rw-gateway
3. kubectl -n stat exec mysql-1 -- env MYSQL_PWD='password' mysql --no-defaults -uroot -e "SHOW SLAVE STATUS\G" | egrep "Slave_IO_Running|Slave_SQL_Running"
4. kubectl -n stat exec mysql-2 -- env MYSQL_PWD='password' mysql --no-defaults -uroot -e "SHOW SLAVE STATUS\G" | egrep "Slave_IO_Running|Slave_SQL_Running"

Live proof sequence:
1. GET /health
2. POST /messages (write)
3. GET /messages (read)
4. Show read_from value switching across replica services
5. Show replicas healthy via SHOW SLAVE STATUS\G

## 6) Security and production notes

This demo is intentionally simple.

Not production-ready by default:
- Root usage exists in some commands.
- NodePort exposure may be open broadly.
- No TLS between app and DB.
- No automatic failover/orchestrator.
- No connection pooling layer.

For production direction:
- Use dedicated least-privilege app users only.
- Add super_read_only on replicas.
- Use managed DB/operator or failover tooling.
- Use Ingress/LB + auth/TLS.
- Add observability (metrics, alerts, slow query tracking).

## 7) Useful commands

Replication status:
- kubectl -n stat exec mysql-1 -- env MYSQL_PWD='password' mysql --no-defaults -uroot -e "SHOW SLAVE STATUS\G"
- kubectl -n stat exec mysql-2 -- env MYSQL_PWD='password' mysql --no-defaults -uroot -e "SHOW SLAVE STATUS\G"

Gateway health:
- kubectl -n stat logs deploy/mysql-rw-gateway --tail=120
- kubectl -n stat run curltest --rm -it --image=curlimages/curl --restart=Never -- curl -sS http://mysql-rw-gateway/health

Safe external demo (no firewall changes):
- kubectl -n stat port-forward svc/mysql-rw-gateway 8080:80
- then call http://127.0.0.1:8080
