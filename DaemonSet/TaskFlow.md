# 🧪 Kubernetes DaemonSet Hands-on Lab Guide (Task-Based)

This guide is designed to help you **follow the demo conceptually** without focusing on YAML. It emphasizes **what to do, why you're doing it, and how to verify it**.

---

# 📌 Prerequisites

* A running Kubernetes cluster
* kubectl access configured
* At least 2 nodes (to observe behavior clearly)

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

* Deploy a simple DaemonSet (any lightweight container)
* List all pods
* List all nodes

## ✅ Verification

* Number of pods = number of nodes
* Each pod is running on a different node

## 💡 Key Insight

👉 DaemonSet ensures one pod per node automatically

---

# 🟡 TASK 2: Logging Use Case (Fluent Bit Concept)

## 🎯 Goal

Understand why logging requires DaemonSets

## 🧪 What to Do

* Deploy a logging agent DaemonSet (Fluent Bit or similar)
* Enter one of the pods
* Explore log directories inside the container

## ✅ Verification

* You can see log files from that node
* Each node has its own logging pod

## 💡 Key Insight

👉 Logs are node-specific → so logging must run on every node

---

# 🔵 TASK 3: Monitoring Use Case (Node Exporter Concept)

## 🎯 Goal

Understand node-level monitoring

## 🧪 What to Do

* Deploy a monitoring agent DaemonSet
* Check that pods are running on all nodes

## ✅ Verification

* One monitoring pod per node

## 💡 Key Insight

👉 Metrics like CPU/memory are node-specific

---

# 🟣 TASK 4: Node Affinity (Main Demo Scenario)

## 🎯 Goal

Control **where DaemonSet pods run**

## 🧪 What to Do

### Step 1: Label a node

* Add a label (e.g., disktype=ssd) to only one node

### Step 2: Deploy DaemonSet WITHOUT affinity

* Observe pods running on all nodes

### Step 3: Add REQUIRED nodeAffinity

* Update DaemonSet to target only labeled nodes

### Step 4: Add label to another node

* Observe scheduling change

### Step 5: Change to PREFERRED affinity

* Observe behavior again

---

## ✅ Verification

### Without affinity

* Pods run on all nodes

### With REQUIRED affinity

* Pods run ONLY on labeled nodes

### After adding label

* New pod appears on newly labeled node

### With PREFERRED affinity

* Pods run on all nodes
* But preference is given to labeled nodes

---

## 💡 Key Insights

* DaemonSet = one pod per **eligible node**
* REQUIRED affinity → filters nodes
* PREFERRED affinity → influences scheduling only

---

# 🔴 TASK 5: Taints & Tolerations (Optional Advanced)

## 🎯 Goal

Understand how DaemonSet behaves with restricted nodes

## 🧪 What to Do

* Observe that some nodes (like control-plane) may not have pods
* Add toleration to DaemonSet

## ✅ Verification

* Pod gets scheduled on previously restricted node

## 💡 Key Insight

👉 Taints block scheduling unless tolerated

---

# 🧠 Final Observations

* DaemonSets are used for **infrastructure-level workloads**
* Examples:

  * Logging
  * Monitoring
  * Networking
  * Security

👉 Key takeaway:

**"DaemonSet = One Pod Per Eligible Node"**

---

# 🎯 How to Think About DaemonSets

* Deployment → "Run N pods"
* DaemonSet → "Run 1 pod per node"
* Affinity → "Which nodes should count"
