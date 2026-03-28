# 🧪 Kubernetes DaemonSet Hands-on Lab Guide (Task-Based + Commands & YAML)

This guide helps you **follow the demo conceptually** and **execute it step-by-step** with minimal YAML and clear commands.

---

# 📌 Prerequisites

* A running Kubernetes cluster
* `kubectl` configured
* At least 2 nodes

Check cluster:

```bash
kubectl get nodes -o wide
```

---

# 🔷 What You Will Learn

* How DaemonSets behave
* Why they are used for node-level workloads
* How scheduling works
* How nodeAffinity changes behavior

---

# 🟢 TASK 1: Observe Basic DaemonSet Behavior

## 🎯 Goal

Understand that a DaemonSet creates **one pod per node**

## 🧪 What to Do

* Deploy a simple DaemonSet
* List all pods and nodes

## 📄 YAML (basic-ds.yaml)

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: basic-daemonset
spec:
  selector:
    matchLabels:
      app: ds-demo
  template:
    metadata:
      labels:
        app: ds-demo
    spec:
      containers:
      - name: busybox
        image: busybox
        command: ["sh", "-c", "while true; do echo Running on $(hostname); sleep 10; done"]
```

## 💻 Commands

```bash
kubectl apply -f basic-ds.yaml
kubectl get pods -o wide
kubectl get nodes
```

## ✅ Verification

* Number of pods = number of nodes
* Each pod is on a different node

## 💡 Key Insight

👉 DaemonSet ensures one pod per node automatically

---

# 🟡 TASK 2: Logging Use Case (Fluent Bit)

## 🎯 Goal

Understand why logging requires DaemonSets

## 🧪 What to Do

* Deploy Fluent Bit DaemonSet
* Exec into a pod and inspect logs

## 📄 YAML (fluentbit.yaml)

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: fluentbit
  namespace: kube-system
spec:
  selector:
    matchLabels:
      app: fluentbit
  template:
    metadata:
      labels:
        app: fluentbit
    spec:
      containers:
      - name: fluentbit
        image: cr.fluentbit.io/fluent/fluent-bit:latest
        volumeMounts:
        - name: varlog
          mountPath: /var/log
      volumes:
      - name: varlog
        hostPath:
          path: /var/log
```

## 💻 Commands

```bash
kubectl apply -f fluentbit.yaml
kubectl get pods -n kube-system -o wide
kubectl get pods -n kube-system
kubectl exec -it <fluentbit-pod> -n kube-system -- sh
ls /var/log/containers
```

## ✅ Verification

* Log files from that node are visible
* One Fluent Bit pod per node

## 💡 Key Insight

👉 Logs are node-specific → need one agent per node

---

# 🔵 TASK 3: Monitoring Use Case (Node Exporter)

## 🎯 Goal

Understand node-level monitoring

## 🧪 What to Do

* Deploy Node Exporter DaemonSet
* Verify pods across nodes

## 📄 YAML (node-exporter.yaml)

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: node-exporter
spec:
  selector:
    matchLabels:
      app: node-exporter
  template:
    metadata:
      labels:
        app: node-exporter
    spec:
      hostPID: true
      containers:
      - name: node-exporter
        image: prom/node-exporter
        ports:
        - containerPort: 9100
```

## 💻 Commands

```bash
kubectl apply -f node-exporter.yaml
kubectl get pods -o wide
```

## ✅ Verification

* One monitoring pod per node

## 💡 Key Insight

👉 Metrics are node-specific

---

# 🟣 TASK 4: Node Affinity

## 🎯 Goal

Control **where DaemonSet pods run**

---

## Step 1: Label a node

## 💻 Commands

```bash
kubectl get nodes
kubectl label nodes <node-name> disktype=ssd
```

---

## Step 2: Deploy WITHOUT affinity

## 💻 Commands

```bash
kubectl get pods -o wide
```

👉 Observe pods on all nodes

---

## Step 3: REQUIRED nodeAffinity

## 📄 YAML (affinity-required.yaml)

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: affinity-required-ds
spec:
  selector:
    matchLabels:
      app: affinity-demo
  template:
    metadata:
      labels:
        app: affinity-demo
    spec:
      affinity:
        nodeAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms:
            - matchExpressions:
              - key: disktype
                operator: In
                values:
                - ssd
      containers:
      - name: busybox
        image: busybox
        command: ["sh", "-c", "sleep 3600"]
```

## 💻 Commands

```bash
kubectl apply -f affinity-required.yaml
kubectl get pods -o wide
```

👉 Pods only on labeled nodes

---

## Step 4: Add label to another node

## 💻 Commands

```bash
kubectl label nodes <another-node> disktype=ssd
kubectl get pods -o wide
```

👉 New pod appears automatically

---

## Step 5: PREFERRED affinity

## 📄 YAML (affinity-preferred.yaml)

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: affinity-preferred-ds
spec:
  selector:
    matchLabels:
      app: affinity-demo
  template:
    metadata:
      labels:
        app: affinity-demo
    spec:
      affinity:
        nodeAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 1
            preference:
              matchExpressions:
              - key: disktype
                operator: In
                values:
                - ssd
      containers:
      - name: busybox
        image: busybox
        command: ["sh", "-c", "sleep 3600"]
```

## 💻 Commands

```bash
kubectl apply -f affinity-preferred.yaml
kubectl get pods -o wide
```

👉 Pods run on all nodes (preference only)

---

## ✅ Verification Summary

* Without affinity → all nodes
* Required → only labeled nodes
* Preferred → all nodes, but influenced

## 💡 Key Insights

* DaemonSet = one pod per eligible node
* Required = filter
* Preferred = preference

---

# 🔴 TASK 5: Taints & Tolerations (Optional)

## 🎯 Goal

Run pods on restricted nodes

## 📄 YAML (toleration.yaml)

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: toleration-ds
spec:
  selector:
    matchLabels:
      app: toleration-demo
  template:
    metadata:
      labels:
        app: toleration-demo
    spec:
      tolerations:
      - key: "node-role.kubernetes.io/control-plane"
        operator: "Exists"
        effect: "NoSchedule"
      containers:
      - name: busybox
        image: busybox
        command: ["sh", "-c", "sleep 3600"]
```

## 💻 Commands

```bash
kubectl apply -f toleration.yaml
kubectl get pods -o wide
```

## ✅ Verification

* Pod appears on control-plane node

## 💡 Key Insight

👉 Taints block, tolerations allow

---

# 🧠 Final Observations

* DaemonSets are for infrastructure workloads
* Logging, monitoring, networking, security

👉 **"DaemonSet = One Pod Per Eligible Node"**

---

# 🧹 Cleanup

```bash
kubectl delete -f basic-ds.yaml
kubectl delete -f fluentbit.yaml -n kube-system
kubectl delete -f node-exporter.yaml
kubectl delete -f affinity-required.yaml
kubectl delete -f affinity-preferred.yaml
kubectl delete -f toleration.yaml
```
