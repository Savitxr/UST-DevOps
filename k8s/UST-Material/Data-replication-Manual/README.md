MySQL StatefulSet Replication Demo

This setup creates a 3-pod MySQL StatefulSet and then configures asynchronous replication from mysql-0 (primary) to mysql-1 and mysql-2 (replicas).

Important:
- This is a demo-first setup to explain StatefulSet identity and replication flow.
- Change passwords in k8s/02-secret.yaml before using outside a demo environment.
- If your password contains special characters like !, use the command pattern in this README to avoid bash history-expansion errors.

What gets created
- Namespace: mysql-demo
- Secret with root and replication credentials
- ConfigMap with MySQL replication settings and initialization script
- Headless Service for stable pod DNS
- Dedicated writer Service (mysql-write -> mysql-0)
- Dedicated reader Services (mysql-read-1 -> mysql-1, mysql-read-2 -> mysql-2)
- Three static PersistentVolumes (no StorageClass required)
- StatefulSet with 3 pods and persistent volumes

Pod roles in this demo
- mysql-0 is the source (primary)
- mysql-1 and mysql-2 are replicas

Stable DNS names
- mysql-0.mysql-headless.mysql-demo.svc.cluster.local
- mysql-1.mysql-headless.mysql-demo.svc.cluster.local
- mysql-2.mysql-headless.mysql-demo.svc.cluster.local

Read/write Service DNS names
- mysql-write.mysql-demo.svc.cluster.local (writes to primary)
- mysql-read-1.mysql-demo.svc.cluster.local (reads from replica 1)
- mysql-read-2.mysql-demo.svc.cluster.local (reads from replica 2)

Prerequisites
- Kubernetes cluster is running
- kubectl context points to the target cluster
- No default StorageClass is required for this setup

Set reusable shell variables first

    export NS=stat
    export ROOT_PWD='RootPass!123'
    export REPL_USER='repl'
    export REPL_PWD='ReplPass!123'

Use NS=mysql-demo if you deploy exactly as provided in k8s/01-namespace.yaml.

1. Deploy all manifests

    kubectl apply -f k8s/01-namespace.yaml
    kubectl apply -f k8s/02-secret.yaml
    kubectl apply -f k8s/03-configmap.yaml
    kubectl apply -f k8s/04-services.yaml
    kubectl apply -f k8s/06-pv.yaml
    kubectl apply -f k8s/05-statefulset.yaml

2. Verify static PV/PVC binding

    kubectl get pv
    kubectl -n $NS get pvc

Expected:
- data-mysql-0, data-mysql-1, data-mysql-2 PVCs become Bound

3. Wait for pods to become Ready

    kubectl -n $NS get pods -w

Expected:
- mysql-0, mysql-1, mysql-2 all show 1/1 Running

3b. Verify read/write service endpoints

    kubectl -n $NS get endpoints mysql-write mysql-read-1 mysql-read-2

Expected:
- mysql-write points to mysql-0 pod IP
- mysql-read-1 points to mysql-1 pod IP
- mysql-read-2 points to mysql-2 pod IP

4. Verify MySQL server-id and read_only mode

    kubectl -n $NS exec mysql-0 -- env MYSQL_PWD="$ROOT_PWD" mysql -uroot -e "SHOW VARIABLES LIKE 'server_id'; SHOW VARIABLES LIKE 'read_only';"
    kubectl -n $NS exec mysql-1 -- env MYSQL_PWD="$ROOT_PWD" mysql -uroot -e "SHOW VARIABLES LIKE 'server_id'; SHOW VARIABLES LIKE 'read_only';"
    kubectl -n $NS exec mysql-2 -- env MYSQL_PWD="$ROOT_PWD" mysql -uroot -e "SHOW VARIABLES LIKE 'server_id'; SHOW VARIABLES LIKE 'read_only';"

You should see unique server_id values, and read_only OFF only on mysql-0.

5. Configure replication after StatefulSet creation

Run on replica mysql-1:

    kubectl -n $NS exec mysql-1 -- env MYSQL_PWD="$ROOT_PWD" mysql -uroot -e "STOP REPLICA; RESET REPLICA ALL; CHANGE REPLICATION SOURCE TO SOURCE_HOST='mysql-0.mysql-headless.$NS.svc.cluster.local', SOURCE_PORT=3306, SOURCE_USER='$REPL_USER', SOURCE_PASSWORD='$REPL_PWD', SOURCE_AUTO_POSITION=1, GET_SOURCE_PUBLIC_KEY=1; START REPLICA;"

Run on replica mysql-2:

    kubectl -n $NS exec mysql-2 -- env MYSQL_PWD="$ROOT_PWD" mysql -uroot -e "STOP REPLICA; RESET REPLICA ALL; CHANGE REPLICATION SOURCE TO SOURCE_HOST='mysql-0.mysql-headless.$NS.svc.cluster.local', SOURCE_PORT=3306, SOURCE_USER='$REPL_USER', SOURCE_PASSWORD='$REPL_PWD', SOURCE_AUTO_POSITION=1, GET_SOURCE_PUBLIC_KEY=1; START REPLICA;"

6. Check replication status

    kubectl -n $NS exec mysql-1 -- env MYSQL_PWD="$ROOT_PWD" mysql -uroot -e "SHOW REPLICA STATUS\\G"
    kubectl -n $NS exec mysql-2 -- env MYSQL_PWD="$ROOT_PWD" mysql -uroot -e "SHOW REPLICA STATUS\\G"

Look for:
- Replica_IO_Running: Yes
- Replica_SQL_Running: Yes
- Seconds_Behind_Source: small number or 0

7. Demo data replication live

Insert on primary:

    kubectl -n $NS exec mysql-0 -- env MYSQL_PWD="$ROOT_PWD" mysql -uroot -e "INSERT INTO appdb.seed_data (message) VALUES ('hello from primary during demo'); SELECT * FROM appdb.seed_data;"

Read from replicas:

    kubectl -n $NS exec mysql-1 -- env MYSQL_PWD="$ROOT_PWD" mysql -uroot -e "SELECT * FROM appdb.seed_data;"
    kubectl -n $NS exec mysql-2 -- env MYSQL_PWD="$ROOT_PWD" mysql -uroot -e "SELECT * FROM appdb.seed_data;"

Service-based test (clean app routing pattern):

    kubectl -n $NS run mysql-client --rm -it --image=mysql:8.0.36 --restart=Never -- bash -lc "mysql -hmysql-write -uroot -p\"$ROOT_PWD\" -e \"INSERT INTO appdb.seed_data (message) VALUES ('write via mysql-write service');\""
    kubectl -n $NS run mysql-client --rm -it --image=mysql:8.0.36 --restart=Never -- bash -lc "mysql -hmysql-read-1 -uroot -p\"$ROOT_PWD\" -e \"SELECT * FROM appdb.seed_data ORDER BY id DESC LIMIT 5;\""
    kubectl -n $NS run mysql-client --rm -it --image=mysql:8.0.36 --restart=Never -- bash -lc "mysql -hmysql-read-2 -uroot -p\"$ROOT_PWD\" -e \"SELECT * FROM appdb.seed_data ORDER BY id DESC LIMIT 5;\""

Your audience should see the new row on both replicas.

8. Optional failover discussion point (for presentation)

This manifest does not include automatic failover tooling. If mysql-0 fails, replicas keep data but no automatic primary election occurs. Mention common production add-ons like Orchestrator, MHA, or an operator-based approach.

9. Cleanup

    kubectl delete namespace $NS
    kubectl delete -f k8s/06-pv.yaml

10. Troubleshooting: root login fails after redeploy

Because PV reclaim policy is Retain, old MySQL data and old credentials can remain on disk.

If login fails with ERROR 1045 after changing secret values:

    kubectl -n $NS delete sts mysql
    kubectl -n $NS delete pvc data-mysql-0 data-mysql-1 data-mysql-2 --ignore-not-found
    kubectl delete pv mysql-pv-0 mysql-pv-1 mysql-pv-2

Then clear hostPath directories on each worker node used by these PVs:

    sudo rm -rf /var/lib/mysql-demo/mysql-0 /var/lib/mysql-demo/mysql-1 /var/lib/mysql-demo/mysql-2

Reapply manifests:

    kubectl apply -f k8s/06-pv.yaml
    kubectl apply -f k8s/05-statefulset.yaml

Quick interactive login test (safe with special characters in password):

    kubectl -n $NS exec -it mysql-0 -- mysql -uroot -p

Notes for a smooth live demo
- Keep one terminal running: kubectl -n $NS get pods -w
- Keep one terminal for mysql exec commands
- Always send writes to mysql-write service and reads to mysql-read-1/mysql-read-2 services
- If a pod restarts and has old data, delete only that pod and recheck replication status

FastAPI read/write gateway (simple app demo)

This project includes a tiny FastAPI microservice in gateway-service:
- POST /messages writes to mysql-write (primary)
- GET /messages reads from mysql-read-1 or mysql-read-2 (randomly)

Files:
- gateway-service/main.py
- gateway-service/requirements.txt
- gateway-service/Dockerfile
- k8s/07-fastapi-gateway.yaml

1. Build and push image

    cd gateway-service
    docker build -t <your-registry>/mysql-rw-gateway:latest .
    docker push <your-registry>/mysql-rw-gateway:latest

2. Update image in manifest

Edit k8s/07-fastapi-gateway.yaml and replace:
- your-dockerhub-username/mysql-rw-gateway:latest

3. Deploy gateway into your namespace

    kubectl -n $NS apply -f k8s/07-fastapi-gateway.yaml
    kubectl -n $NS get pods -l app=mysql-rw-gateway
    kubectl -n $NS get svc mysql-rw-gateway

4. Test via NodePort

Get any worker node IP and call port 30080:

    curl http://<node-ip>:30080/health
    curl -X POST http://<node-ip>:30080/messages -H "Content-Type: application/json" -d '{"message":"hello from gateway"}'
    curl http://<node-ip>:30080/messages

What to show audience:
- POST response includes written_to: mysql-write
- GET response includes read_from: mysql-read-1 or mysql-read-2

This means app traffic is split clearly by intent:
- writes to primary
- reads from replicas
