MySQL Master-Slave Restart Runbook (stat namespace)

Use this when the cluster has drifted and replication setup is failing, and when you want to re-verify the full flow before a demo.

Mode guide:
- Part A is for setup and normal demo flow.
- Part B is only for troubleshooting when Part A fails.

Rules while running this file
- Run one command at a time.
- Do not paste shell prompt text with the command.
- Keep namespace fixed to stat unless you intentionally change it.

## 0) Set variables

```bash
NS=stat
ROOT_PWD='password'
REPL_USER='repl'
REPL_PWD='repl123'
MASTER_HOST='mysql-0.mysql.stat.svc.cluster.local'
APP_USER='appuser'
APP_PWD='AppPass123!'
```

============================================================
PART A: SETUP + NORMAL DEMO FLOW
============================================================

## A1) Fresh setup path (from scratch)

Use this section first when building master-slave from zero. If your cluster is already running and healthy, jump to A2.

Apply core manifests:

```bash
kubectl apply -f k8s/04-services.yaml -n $NS
kubectl apply -f k8s/05-statefulset.yaml -n $NS
kubectl apply -f k8s/06-pv.yaml
```

Wait for pods:

```bash
kubectl -n $NS get pods -w
```

Run setup flow in this order:
1. A2 (verify baseline)
2. A3 only if log_bin is OFF
3. A4 only if replica server_id values are missing/wrong
4. A5 (users)
5. A6 (configure slaves)
6. A7 (validate replication)
7. A8 (data proof)
8. A9 (gateway proof)

If any step fails, stop and go to Part B.

## A2) Verify current state first

```bash
kubectl -n $NS get pods -o wide
kubectl -n $NS get svc
kubectl -n $NS get sts mysql -o yaml | grep -n "image:\|serviceName:\|MYSQL_ROOT_PASSWORD\|initContainers\|args:" -A3
```

```bash
kubectl -n $NS exec mysql-0 -- env MYSQL_PWD="$ROOT_PWD" mysql --no-defaults -uroot -e "SELECT VERSION(); SHOW VARIABLES LIKE 'server_id'; SHOW VARIABLES LIKE 'log_bin';"
kubectl -n $NS exec mysql-1 -- env MYSQL_PWD="$ROOT_PWD" mysql --no-defaults -uroot -e "SHOW VARIABLES LIKE 'server_id';"
kubectl -n $NS exec mysql-2 -- env MYSQL_PWD="$ROOT_PWD" mysql --no-defaults -uroot -e "SHOW VARIABLES LIKE 'server_id';"
```

Expected before replication setup:
- mysql-0 reachable as root with ROOT_PWD
- mysql-0: server_id != 0
- mysql-0: log_bin = ON
- replicas have unique non-zero server_id

If all expectations already pass, skip to A5.

## A3) If mysql-0 has log_bin OFF, patch StatefulSet and restart

```bash
kubectl -n $NS patch sts mysql --type='json' -p='[
  {"op":"add","path":"/spec/template/spec/containers/0/args","value":["--log-bin=mysql-bin","--binlog-format=ROW","--server-id=100"]}
]'
```

If the above fails with "path exists", replace args:

```bash
kubectl -n $NS patch sts mysql --type='json' -p='[
  {"op":"replace","path":"/spec/template/spec/containers/0/args","value":["--log-bin=mysql-bin","--binlog-format=ROW","--server-id=100"]}
]'
```

Restart and wait:

```bash
kubectl -n $NS rollout restart sts/mysql
kubectl -n $NS rollout status sts/mysql
```

Re-check master:

```bash
kubectl -n $NS exec mysql-0 -- env MYSQL_PWD="$ROOT_PWD" mysql --no-defaults -uroot -e "SHOW VARIABLES LIKE 'server_id'; SHOW VARIABLES LIKE 'log_bin';"
```

## A4) Set unique server_id on replicas (demo-safe runtime fix)

```bash
kubectl -n $NS exec mysql-1 -- env MYSQL_PWD="$ROOT_PWD" mysql --no-defaults -uroot -e "SET GLOBAL server_id=101; SET GLOBAL read_only=ON;"
kubectl -n $NS exec mysql-2 -- env MYSQL_PWD="$ROOT_PWD" mysql --no-defaults -uroot -e "SET GLOBAL server_id=102; SET GLOBAL read_only=ON;"
```

Verify:

```bash
kubectl -n $NS exec mysql-1 -- env MYSQL_PWD="$ROOT_PWD" mysql --no-defaults -uroot -e "SHOW VARIABLES LIKE 'server_id';"
kubectl -n $NS exec mysql-2 -- env MYSQL_PWD="$ROOT_PWD" mysql --no-defaults -uroot -e "SHOW VARIABLES LIKE 'server_id';"
```

## A5) Create/refresh replication user on master

```bash
kubectl -n $NS exec mysql-0 -- env MYSQL_PWD="$ROOT_PWD" mysql --no-defaults -uroot -e "CREATE USER IF NOT EXISTS '$REPL_USER'@'%' IDENTIFIED BY '$REPL_PWD'; ALTER USER '$REPL_USER'@'%' IDENTIFIED BY '$REPL_PWD'; GRANT REPLICATION SLAVE, REPLICATION CLIENT ON *.* TO '$REPL_USER'@'%'; FLUSH PRIVILEGES;"
```

Create/refresh application user used by FastAPI gateway:

```bash
kubectl -n $NS exec mysql-0 -- env MYSQL_PWD="$ROOT_PWD" mysql --no-defaults -uroot -e "CREATE DATABASE IF NOT EXISTS appdb; CREATE USER IF NOT EXISTS '$APP_USER'@'%' IDENTIFIED BY '$APP_PWD'; ALTER USER '$APP_USER'@'%' IDENTIFIED BY '$APP_PWD'; GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX ON appdb.* TO '$APP_USER'@'%'; FLUSH PRIVILEGES;"
```

Verify user works from replica network path:

```bash
kubectl -n $NS exec mysql-1 -- mysql --no-defaults -h $MASTER_HOST -u$REPL_USER -p$REPL_PWD -e "SELECT 1;"
```

## A6) Configure slaves (MySQL 5.7 syntax)

```bash
kubectl -n $NS exec mysql-1 -- env MYSQL_PWD="$ROOT_PWD" mysql --no-defaults -uroot -e "STOP SLAVE; RESET SLAVE ALL; CHANGE MASTER TO MASTER_HOST='$MASTER_HOST', MASTER_PORT=3306, MASTER_USER='$REPL_USER', MASTER_PASSWORD='$REPL_PWD', MASTER_AUTO_POSITION=1; START SLAVE;"
kubectl -n $NS exec mysql-2 -- env MYSQL_PWD="$ROOT_PWD" mysql --no-defaults -uroot -e "STOP SLAVE; RESET SLAVE ALL; CHANGE MASTER TO MASTER_HOST='$MASTER_HOST', MASTER_PORT=3306, MASTER_USER='$REPL_USER', MASTER_PASSWORD='$REPL_PWD', MASTER_AUTO_POSITION=1; START SLAVE;"
```

## A7) Validate replication health

```bash
kubectl -n $NS exec mysql-1 -- env MYSQL_PWD="$ROOT_PWD" mysql --no-defaults -uroot -e "SHOW SLAVE STATUS\\G"
kubectl -n $NS exec mysql-2 -- env MYSQL_PWD="$ROOT_PWD" mysql --no-defaults -uroot -e "SHOW SLAVE STATUS\\G"
```

Success criteria:
- Slave_IO_Running: Yes
- Slave_SQL_Running: Yes

## A8) Demo proof (insert on master, read on replicas)

```bash
kubectl -n $NS exec mysql-0 -- env MYSQL_PWD="$ROOT_PWD" mysql --no-defaults -uroot -e "CREATE DATABASE IF NOT EXISTS appdb; CREATE TABLE IF NOT EXISTS appdb.seed_data(id INT PRIMARY KEY AUTO_INCREMENT, message VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP); INSERT INTO appdb.seed_data(message) VALUES ('replication demo row'); SELECT * FROM appdb.seed_data ORDER BY id DESC LIMIT 5;"
```

```bash
kubectl -n $NS exec mysql-1 -- env MYSQL_PWD="$ROOT_PWD" mysql --no-defaults -uroot -e "SELECT * FROM appdb.seed_data ORDER BY id DESC LIMIT 5;"
kubectl -n $NS exec mysql-2 -- env MYSQL_PWD="$ROOT_PWD" mysql --no-defaults -uroot -e "SELECT * FROM appdb.seed_data ORDER BY id DESC LIMIT 5;"
```

## A9) FastAPI gateway verification (write to master, read from replicas)

Deploy/update gateway:

```bash
kubectl -n $NS apply -f k8s/07-fastapi-gateway.yaml
kubectl -n $NS set env deploy/mysql-rw-gateway DB_USER=$APP_USER DB_PASSWORD=$APP_PWD
kubectl -n $NS rollout restart deploy/mysql-rw-gateway
kubectl -n $NS rollout status deploy/mysql-rw-gateway
```

Internal check:

```bash
kubectl -n $NS run curltest --rm -it --image=curlimages/curl --restart=Never -- curl -sS http://mysql-rw-gateway/health
```

External demo options:

Option A (recommended, no cloud firewall changes):

```bash
kubectl -n $NS port-forward svc/mysql-rw-gateway 8080:80
```

Then call:

```bash
curl http://127.0.0.1:8080/health
curl -X POST http://127.0.0.1:8080/messages -H "Content-Type: application/json" -d '{"message":"hello from gateway"}'
curl http://127.0.0.1:8080/messages
```

Option B (NodePort):
- Open inbound TCP 30080 to worker nodes in cloud Security Group/NACL.
- Call http://<worker-public-ip>:30080/health

Expected gateway behavior:
- POST response includes written_to: mysql-write
- GET response includes read_from: mysql-read-1 or mysql-read-2

If everything in A2-A9 passes, you are done.

============================================================
PART B: TROUBLESHOOTING ONLY
============================================================

Use this only if Part A fails.

## B1) If still broken, capture this bundle and stop

```bash
kubectl -n $NS get pods -o wide
kubectl -n $NS get svc
kubectl -n $NS exec mysql-0 -- env MYSQL_PWD="$ROOT_PWD" mysql --no-defaults -uroot -e "SHOW VARIABLES LIKE 'server_id'; SHOW VARIABLES LIKE 'log_bin';"
kubectl -n $NS exec mysql-1 -- env MYSQL_PWD="$ROOT_PWD" mysql --no-defaults -uroot -e "SHOW SLAVE STATUS\\G"
kubectl -n $NS exec mysql-2 -- env MYSQL_PWD="$ROOT_PWD" mysql --no-defaults -uroot -e "SHOW SLAVE STATUS\\G"
kubectl -n $NS get pods -l app=mysql-rw-gateway -o wide
kubectl -n $NS logs deploy/mysql-rw-gateway --tail=120
```
