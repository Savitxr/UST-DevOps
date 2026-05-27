# kgateway Installation and Setup Guide

## Step 1: Install Helm

Reference: https://helm.sh/docs/intro/install/

```bash
curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-4
chmod 700 get_helm.sh
./get_helm.sh
```

Verify installation:

```bash
helm version
```

---

## Step 2: Install kgateway CRDs and Control Plane

Reference: https://kgateway.dev/docs/envoy/latest/install/helm/

### Install Gateway API CRDs

```bash
kubectl apply --server-side -f \
https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.4.0/experimental-install.yaml
```

### Install kgateway CRDs

```bash
helm upgrade -i --create-namespace \
  --namespace kgateway-system \
  --version v2.3.0-main \
  kgateway-crds \
  oci://cr.kgateway.dev/kgateway-dev/charts/kgateway-crds
```

### Install kgateway Control Plane

```bash
helm upgrade -i \
  --namespace kgateway-system \
  --version v2.3.0-main \
  --set controller.extraEnv.KGW_ENABLE_GATEWAY_API_EXPERIMENTAL_FEATURES=true \
  kgateway \
  oci://cr.kgateway.dev/kgateway-dev/charts/kgateway
```

### Verify Installation

```bash
kubectl get pods -n kgateway-system
kubectl get gatewayclass kgateway
```

---

## Step 3: Create Gateway and HTTPRoute Resources

Reference: https://github.com/Savitxr/UST-DevOps/tree/main/kgateway/banking-app/demo/k8s/kgatwy

### Create `gateway.yaml`

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

Apply the file:

```bash
kubectl apply -f gateway.yaml
```

---

### Create `httproutes.yaml`

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

Apply the file:

```bash
kubectl apply -f httproutes.yaml
```
