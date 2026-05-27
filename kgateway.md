# kgateway Installation and Setup Guide

This guide covers:

1. Installing Helm
2. Installing kgateway and Gateway API CRDs
3. Creating Gateway and HTTPRoute resources

---

# Step 1: Install Helm

Reference: https://helm.sh/docs/intro/install/

## What this step does

Helm is the package manager for Kubernetes.

It is used to:
- Install Kubernetes applications using charts
- Manage upgrades and rollbacks
- Simplify deployment of complex applications

kgateway is distributed as a Helm chart, so Helm must be installed before deploying kgateway.

---

## Install Helm

```bash
curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-4
chmod 700 get_helm.sh
./get_helm.sh
```

### Command Explanation

| Command | Purpose |
|---|---|
| `curl -fsSL -o get_helm.sh ...` | Downloads the official Helm installation script |
| `chmod 700 get_helm.sh` | Gives execute permission to the script |
| `./get_helm.sh` | Executes the script and installs Helm |

---

## Verify Installation

```bash
helm version
```

### What this verifies

Checks whether Helm is correctly installed and accessible from the terminal.

Expected output:

```bash
version.BuildInfo{Version:"v3.x.x"}
```

---

# Step 2: Install kgateway CRDs and Control Plane

Reference: https://kgateway.dev/docs/envoy/latest/install/helm/

## What this step does

This step installs:
- Gateway API CRDs
- kgateway CRDs
- kgateway Control Plane

Together, these components allow Kubernetes to understand and manage Gateway API resources such as:
- Gateway
- GatewayClass
- HTTPRoute

kgateway internally uses Envoy Proxy as the data plane.

---

## Install Gateway API CRDs

```bash
kubectl apply --server-side -f \
https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.4.0/experimental-install.yaml
```

### What this does

Installs Kubernetes Gateway API Custom Resource Definitions (CRDs).

These CRDs extend Kubernetes with new resource types like:
- Gateway
- GatewayClass
- HTTPRoute

Without these CRDs, Kubernetes would not recognize Gateway API objects.

---

## Install kgateway CRDs

```bash
helm upgrade -i --create-namespace \
  --namespace kgateway-system \
  --version v2.3.0-main \
  kgateway-crds \
  oci://cr.kgateway.dev/kgateway-dev/charts/kgateway-crds
```

### What this does

Installs kgateway-specific CRDs required by the controller.

### Command Explanation

| Option | Purpose |
|---|---|
| `helm upgrade -i` | Installs the chart if not already installed |
| `--create-namespace` | Creates namespace if it doesn't exist |
| `--namespace kgateway-system` | Installs resources into `kgateway-system` namespace |
| `kgateway-crds` | Release name |
| `oci://...` | OCI Helm chart location |

---

## Install kgateway Control Plane

```bash
helm upgrade -i \
  --namespace kgateway-system \
  --version v2.3.0-main \
  --set controller.extraEnv.KGW_ENABLE_GATEWAY_API_EXPERIMENTAL_FEATURES=true \
  kgateway \
  oci://cr.kgateway.dev/kgateway-dev/charts/kgateway
```

### What this does

Installs the kgateway controller.

The controller:
- Watches Gateway API resources
- Converts them into Envoy configurations
- Manages Envoy proxy behavior

### Important Flag

```bash
KGW_ENABLE_GATEWAY_API_EXPERIMENTAL_FEATURES=true
```

Enables experimental Gateway API features required by some advanced functionalities.

---

## Verify Installation

```bash
kubectl get pods -n kgateway-system
kubectl get gatewayclass kgateway
```

### What this verifies

| Command | Verification |
|---|---|
| `kubectl get pods` | Confirms kgateway pods are running |
| `kubectl get gatewayclass` | Confirms GatewayClass is successfully registered |

Expected:
- Pods should be in `Running` state
- GatewayClass should exist

---

# Step 3: Create Gateway and HTTPRoute Resources

Reference: https://github.com/Savitxr/UST-DevOps/tree/main/kgateway/banking-app/demo/k8s/kgatwy

## What this step does

This step creates:
- GatewayClass
- Gateway
- HTTPRoute

These resources define:
- Which controller manages traffic
- How traffic enters the cluster
- How traffic routes to backend services

---

# Create `gateway.yaml`

## What this file contains

| Resource | Purpose |
|---|---|
| `GatewayClass` | Registers kgateway as the Gateway API controller |
| `Gateway` | Defines the traffic entry point into the cluster |

---

## gateway.yaml

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: GatewayClass
metadata:
  name: kgateway
spec:
  controllerName: kgateway.dev/kgateway

---
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: banking-gateway
  namespace: banking
spec:
  gatewayClassName: kgateway
  listeners:
    - name: http
      protocol: HTTP
      port: 80
      allowedRoutes:
        namespaces:
          from: Same
```

---

## Apply the Gateway Resources

```bash
kubectl apply -f gateway.yaml
```

### What this does

Creates:
- GatewayClass
- Gateway

inside the Kubernetes cluster.

The Gateway listens for HTTP traffic on port 80.

---

# Create `httproutes.yaml`

## What this file contains

`HTTPRoute` defines routing rules.

It tells the Gateway:
- Which URL path to match
- Which backend service should receive traffic

---

## httproutes.yaml

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: frontend-route
  namespace: banking
spec:
  parentRefs:
    - name: banking-gateway
      namespace: banking
  rules:
    - matches:
        - path:
            type: PathPrefix
            value: /
      backendRefs:
        - name: frontend
          port: 80
```

---

## Apply the HTTPRoute

```bash
kubectl apply -f httproutes.yaml
```

### What this does

Creates the HTTPRoute resource.

Traffic flow becomes:

```text
Client Request
      ↓
Gateway
      ↓
HTTPRoute Matching
      ↓
Frontend Service
```

All requests matching `/` are forwarded to:
- Service: `frontend`
- Port: `80`

---
