# kgateway — Complete Installation & Setup Guide
 
> **Controller:** kgateway v2.3 (Envoy-based) | **Gateway API:** v1.4.0
> **Cluster:** Kubernetes v1.28+ | **OS:** Ubuntu / Debian (kubeadm or cloud)
> **Reference:** [kgateway.dev](https://kgateway.dev/docs/envoy/main/install/helm/) · [helm.sh](https://helm.sh/docs/intro/install)
 
---
 
## Table of Contents
 
1. [Prerequisites](#1-prerequisites)
2. [Install kubectl](#2-install-kubectl)
3. [Install Helm](#3-install-helm)
4. [Install Gateway API CRDs](#4-install-gateway-api-crds)
5. [Install kgateway via Helm](#5-install-kgateway-via-helm)
6. [Verify Installation](#6-verify-installation)
7. [Create a Namespace](#7-create-a-namespace)
8. [Create Gateway Resources](#8-create-gateway-resources)
9. [Create HTTPRoutes](#9-create-httproutes)
10. [Expose on Bare-Metal / kubeadm](#10-expose-on-bare-metal--kubeadm)
11. [Add CORS with TrafficPolicy](#11-add-cors-with-trafficpolicy)
12. [Test Everything](#12-test-everything)
13. [Quick Reference Cheatsheet](#13-quick-reference-cheatsheet)
 
---
 
## 1. Prerequisites
 
Before you start, make sure the following are in place.
 
| Requirement | Minimum Version | Check |
|---|---|---|
| Kubernetes cluster | v1.28+ | `kubectl version` |
| Helm | v3.12+ | `helm version` |
| kubectl | v1.28+ | `kubectl version --client` |
| cluster-admin permissions | — | `kubectl auth can-i create clusterroles --all-namespaces` |
 
> **Using kubeadm on AWS EC2?**
> Make sure your EC2 Security Group allows inbound traffic on the NodePort range (default `30000–32767`) so you can reach the gateway from outside.
 
---
 
## 2. Install kubectl
 
If `kubectl` is not installed on your machine:
 
```bash
# Ubuntu / Debian
sudo apt-get update
sudo apt-get install -y apt-transport-https ca-certificates curl gpg
 
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.32/deb/Release.key \
  | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
 
echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.32/deb/ /' \
  | sudo tee /etc/apt/sources.list.d/kubernetes.list
 
sudo apt-get update
sudo apt-get install -y kubectl
```
 
Verify:
 
```bash
kubectl version --client
# Expected: Client Version: v1.32.x
```
 
---
 
## 3. Install Helm
 
kgateway is installed via Helm. Install Helm first.
 
### Option A — Script (recommended for Ubuntu/Debian)
 
```bash
curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-4
chmod 700 get_helm.sh
./get_helm.sh
```
 
### Option B — apt package manager
 
```bash
sudo apt-get install curl gpg apt-transport-https --yes
 
curl -fsSL https://packages.buildkite.com/helm-linux/helm-debian/gpgkey \
  | gpg --dearmor \
  | sudo tee /usr/share/keyrings/helm.gpg > /dev/null
 
echo "deb [signed-by=/usr/share/keyrings/helm.gpg] https://packages.buildkite.com/helm-linux/helm-debian/any/ any main" \
  | sudo tee /etc/apt/sources.list.d/helm-stable-debian.list
 
sudo apt-get update
sudo apt-get install helm
```
 
Verify:
 
```bash
helm version
# Expected: version.BuildInfo{Version:"v3.x.x", ...}
```
 
---
 
## 4. Install Gateway API CRDs
 
kgateway implements the Kubernetes Gateway API. The CRDs must be installed before kgateway itself.
 
> **Important:** Use the **experimental** channel. It is required for CORS support via TrafficPolicy.
 
```bash
kubectl apply --server-side -f \
  https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.4.0/experimental-install.yaml
```
 
Verify the CRDs are created:
 
```bash
kubectl get crd | grep gateway
```
 
Expected output:
 
```
gatewayclasses.gateway.networking.k8s.io
gateways.gateway.networking.k8s.io
grpcroutes.gateway.networking.k8s.io
httproutes.gateway.networking.k8s.io
referencegrants.gateway.networking.k8s.io
```
 
---
 
## 5. Install kgateway via Helm
 
Install in two steps — kgateway CRDs first, then the control plane.
 
### Step 5.1 — Install kgateway CRDs
 
```bash
helm upgrade -i --create-namespace \
  --namespace kgateway-system \
  --version v2.3.0-main \
  kgateway-crds \
  oci://cr.kgateway.dev/kgateway-dev/charts/kgateway-crds
```
 
### Step 5.2 — Install kgateway Control Plane
 
```bash
helm upgrade -i \
  --namespace kgateway-system \
  --version v2.3.0-main \
  --set controller.extraEnv.KGW_ENABLE_GATEWAY_API_EXPERIMENTAL_FEATURES=true \
  kgateway \
  oci://cr.kgateway.dev/kgateway-dev/charts/kgateway
```
 
> **Why the experimental flag?**
> `KGW_ENABLE_GATEWAY_API_EXPERIMENTAL_FEATURES=true` enables CORS support via TrafficPolicy.
> Without this flag, CORS policies will be silently ignored.
 
---
 
## 6. Verify Installation
 
```bash
# Controller pod should show STATUS: Running
kubectl get pods -n kgateway-system
 
# GatewayClass should show ACCEPTED: True
kubectl get gatewayclass kgateway
```
 
Expected output:
 
```
NAME       READY   STATUS    RESTARTS   AGE
kgateway   1/1     Running   0          45s
 
NAME       CONTROLLER              ACCEPTED   AGE
kgateway   kgateway.dev/kgateway   True       45s
```
 
If `ACCEPTED` is `False`, check controller logs:
 
```bash
kubectl logs -n kgateway-system deploy/kgateway --tail=50
```
 
---
 
## 7. Create a Namespace
 
Create a namespace for your application. All gateway resources and services live here.
 
```bash
kubectl create namespace banking
```
 
Or declaratively:
 
```yaml
# namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: banking
```
 
```bash
kubectl apply -f namespace.yaml
```
 
---
 
## 8. Create Gateway Resources
 
Create a file called `gateway.yaml`. This file contains three resources:
 
| Resource | Purpose |
|---|---|
| `GatewayClass` | Registers kgateway as the controller (cluster-scoped) |
| `Gateway` | The actual L7 entry point — equivalent to an Ingress resource |
| `TrafficPolicy` | CORS policy applied to all API routes |
 
```yaml
# k8s/gateway.yaml
 
# ── 1. GatewayClass ──────────────────────────────────────────────
# Cluster-scoped. controllerName must match exactly.
apiVersion: gateway.networking.k8s.io/v1
kind: GatewayClass
metadata:
  name: kgateway
spec:
  controllerName: kgateway.dev/kgateway
 
---
 
# ── 2. Gateway ───────────────────────────────────────────────────
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
          from: Same      # only HTTPRoutes in the 'banking' namespace
 
---
 
# ── 3. TrafficPolicy – CORS ──────────────────────────────────────
# Attached to HTTPRoutes via extensionRef (see httproute.yaml).
apiVersion: gateway.kgateway.dev/v1alpha1
kind: TrafficPolicy
metadata:
  name: banking-cors-policy
  namespace: banking
spec:
  cors:
    allowOrigins:
      - "*"
    allowMethods:
      - GET
      - POST
      - PUT
      - PATCH
      - DELETE
      - OPTIONS
    allowHeaders:
      - "Authorization"
      - "Content-Type"
      - "Accept"
      - "X-Requested-With"
    maxAge: 86400
```
 
Apply it:
 
```bash
kubectl apply -f k8s/gateway.yaml
```
 
Expected output:
 
```
gatewayclass.gateway.networking.k8s.io/kgateway created
gateway.gateway.networking.k8s.io/banking-gateway created
trafficpolicy.gateway.kgateway.dev/banking-cors-policy created
```
 
---
 
## 9. Create HTTPRoutes
 
Create a file called `httproute.yaml`. Each HTTPRoute defines routing rules for one service.
 
> **How path matching works:** Gateway API uses **longest-prefix-match**.
> `/api/users` always wins over `/` regardless of order in the file.
 
```yaml
# k8s/httproute.yaml
 
# ── 1. User Service ──────────────────────────────────────────────
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: user-service-route
  namespace: banking
spec:
  parentRefs:
    - name: banking-gateway
      namespace: banking
  rules:
    - matches:
        - path:
            type: PathPrefix
            value: /api/users
      filters:
        - type: ExtensionRef
          extensionRef:
            group: gateway.kgateway.dev
            kind: TrafficPolicy
            name: banking-cors-policy
      backendRefs:
        - name: user-service
          port: 3001
 
---
 
# ── 2. Account Service ───────────────────────────────────────────
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: account-service-route
  namespace: banking
spec:
  parentRefs:
    - name: banking-gateway
      namespace: banking
  rules:
    - matches:
        - path:
            type: PathPrefix
            value: /api/accounts
      filters:
        - type: ExtensionRef
          extensionRef:
            group: gateway.kgateway.dev
            kind: TrafficPolicy
            name: banking-cors-policy
      backendRefs:
        - name: account-service
          port: 3002
 
---
 
# ── 3. Transaction Service ───────────────────────────────────────
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: transaction-service-route
  namespace: banking
spec:
  parentRefs:
    - name: banking-gateway
      namespace: banking
  rules:
    - matches:
        - path:
            type: PathPrefix
            value: /api/transactions
      filters:
        - type: ExtensionRef
          extensionRef:
            group: gateway.kgateway.dev
            kind: TrafficPolicy
            name: banking-cors-policy
      backendRefs:
        - name: transaction-service
          port: 3003
 
---
 
# ── 4. Frontend – catch-all ──────────────────────────────────────
# No CORS needed — served from the same origin.
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
 
Apply it:
 
```bash
kubectl apply -f k8s/httproute.yaml
```
 
Expected output:
 
```
httproute.gateway.networking.k8s.io/user-service-route created
httproute.gateway.networking.k8s.io/account-service-route created
httproute.gateway.networking.k8s.io/transaction-service-route created
httproute.gateway.networking.k8s.io/frontend-route created
```
 
---
 
## 10. Expose on Bare-Metal / kubeadm
 
On kubeadm clusters there is no cloud LoadBalancer. kgateway automatically creates a `LoadBalancer` service with a `NodePort` — use that.
 
### Find your NodePort
 
```bash
kubectl get svc -n banking
```
 
Look for the `banking-gateway` service:
 
```
NAME              TYPE           CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
banking-gateway   LoadBalancer   10.102.10.165   <pending>     80:32295/TCP   1m
                                                                   ^^^^^^
                                                            This is your NodePort
```
 
`<pending>` under EXTERNAL-IP is normal on bare-metal — the NodePort is all you need.
 
### Set your gateway address
 
```bash
# Get the node's private IP
kubectl get nodes -o wide
 
export NODE_IP=<your-ec2-public-ip>
export NODE_PORT=32295            # replace with your actual NodePort
export GW=$NODE_IP:$NODE_PORT
```
 
### Optional — patch to pure NodePort (removes the pending noise)
 
```bash
kubectl patch svc banking-gateway -n banking \
  -p '{"spec": {"type": "NodePort"}}'
```
 
### AWS EC2 — open the port in your Security Group
 
```
AWS Console → EC2 → Security Groups → Inbound Rules → Add Rule
Type     : Custom TCP
Port     : 32295        ← your NodePort
Source   : 0.0.0.0/0
```
 
---
 
## 11. Add CORS with TrafficPolicy
 
CORS is already included in `gateway.yaml` above (Step 8). Here is what each field does:
 
```yaml
spec:
  cors:
    allowOrigins:
      - "*"               # allow requests from any origin
    allowMethods:         # HTTP methods browsers may send
      - GET
      - POST
      - PUT
      - PATCH
      - DELETE
      - OPTIONS           # OPTIONS must be included for preflight
    allowHeaders:         # headers the browser is allowed to send
      - "Authorization"
      - "Content-Type"
      - "Accept"
      - "X-Requested-With"
    maxAge: 86400         # seconds browser caches the preflight response (24h)
```
 
The policy is attached to each API HTTPRoute via `extensionRef`:
 
```yaml
filters:
  - type: ExtensionRef
    extensionRef:
      group: gateway.kgateway.dev
      kind: TrafficPolicy
      name: banking-cors-policy    # must match TrafficPolicy metadata.name
```
 
> **Note:** The frontend route does not need a CORS filter — the React SPA and the API both sit behind the same gateway, so all API calls are treated as same-origin by the browser.
 
---
 
## 12. Test Everything
 
Replace `<GW>` with your `NODE_IP:NODE_PORT` value from Step 10.
 
### Routing tests
 
```bash
# Frontend — expect 200 OK + HTML
curl -i http://$GW/
 
# API routes — expect 401 Unauthorized (auth middleware working, routing correct)
curl -i http://$GW/api/users/my
curl -i http://$GW/api/accounts/my
curl -i http://$GW/api/transactions/my
```
 
### CORS preflight test
 
```bash
curl -I -X OPTIONS http://$GW/api/users \
  -H "Origin: http://example.com" \
  -H "Access-Control-Request-Method: POST"
```
 
Expected response:
 
```
HTTP/1.1 204 No Content
access-control-allow-origin: *
access-control-allow-methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
server: envoy
```
 
### What each response means
 
| Route | Expected | Means |
|---|---|---|
| `GET /` | `200 OK` + HTML | Frontend routing works |
| `GET /api/users/my` | `401 Unauthorized` | Gateway routed correctly, auth middleware running |
| `GET /api/accounts/my` | `401 Unauthorized` | Gateway routed correctly, auth middleware running |
| `GET /api/transactions/my` | `401 Unauthorized` | Gateway routed correctly, auth middleware running |
| `OPTIONS /api/users` | `204 No Content` + CORS headers | TrafficPolicy CORS working |
 
> `server: envoy` in every response header confirms all traffic is flowing through kgateway.
 
### Check gateway and route status
 
```bash
# All resources at a glance
kubectl get gatewayclass,gateway,httproute,trafficpolicy -A
 
# Gateway must show PROGRAMMED: True and Attached Routes: 4
kubectl describe gateway banking-gateway -n banking
 
# Check a specific route
kubectl describe httproute user-service-route -n banking
```
 
---
 
## 13. Quick Reference Cheatsheet
 
### Key resource types
 
| Resource | API Group | Scope | Purpose |
|---|---|---|---|
| `GatewayClass` | `gateway.networking.k8s.io/v1` | Cluster | Registers controller |
| `Gateway` | `gateway.networking.k8s.io/v1` | Namespaced | L7 entry point |
| `HTTPRoute` | `gateway.networking.k8s.io/v1` | Namespaced | Routing rules per service |
| `TrafficPolicy` | `gateway.kgateway.dev/v1alpha1` | Namespaced | CORS, rate limit, auth |
 
### Most-used kubectl commands
 
```bash
# View all gateway resources
kubectl get gatewayclass,gateway,httproute,trafficpolicy -A
 
# Watch gateway events
kubectl get events -n banking --watch
 
# Check gateway status
kubectl describe gateway banking-gateway -n banking
 
# Check a route
kubectl describe httproute user-service-route -n banking
 
# kgateway controller logs
kubectl logs -n kgateway-system deploy/kgateway --tail=50 -f
 
# Get gateway NodePort
kubectl get svc -n banking
 
# Patch service to NodePort type
kubectl patch svc banking-gateway -n banking \
  -p '{"spec": {"type": "NodePort"}}'
```
 
### Re-install kgateway (clean slate)
 
```bash
helm uninstall kgateway -n kgateway-system
helm uninstall kgateway-crds -n kgateway-system
kubectl delete namespace kgateway-system
 
# Then follow Steps 4 and 5 again
```
 
### Useful links
 
| Resource | URL |
|---|---|
| kgateway install guide | https://kgateway.dev/docs/envoy/main/install/helm/ |
| kgateway CORS guide | https://kgateway.dev/docs/envoy/main/security/cors/ |
| kgateway GitHub | https://github.com/kgateway-dev/kgateway |
| Gateway API spec | https://gateway-api.sigs.k8s.io/ |
| Gateway API CRDs | https://github.com/kubernetes-sigs/gateway-api/releases/tag/v1.4.0 |
| Helm install guide | https://helm.sh/docs/intro/install/ |
 
---
 
*kgateway is a CNCF Sandbox project originally created by Solo.io. © kgateway, a Series of LF Projects, LLC.*
