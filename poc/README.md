# La Petite Maison de l'Épouvante — POC V1

## Stack
- **Frontend** : Vue.js 3 + Vite
- **Auth** : Keycloak 23 (OAuth2/OIDC)
- **Backend** : Node.js + Express (auth-service + product-service)
- **BDD** : PostgreSQL 16
- **Gateway** : nginx + HTTPS/TLS
- **CI/CD** : GitHub Actions

## Démarrage

### 1. Lancer tous les services
```bash
docker compose up --build
```

### 2. Configurer Keycloak (première fois)
Ouvrir http://localhost:8080 → admin / admin

1. Créer un realm : `petitemaison`
2. Créer un client : `poc-app`
   - Client type : OpenID Connect
   - Valid redirect URIs : `https://localhost:8443/*`
   - Web origins : `https://localhost:8443`
3. Créer un utilisateur test → définir un mot de passe

### 3. Accéder à l'application
```
https://localhost:8443
```
Accepter le certificat auto-signé en dev.

## Commandes utiles

```bash
# Vérifier les services
docker compose ps

# Health checks
curl -k https://localhost:8443/api/health
curl -k https://localhost:8443/api/auth/health

# Métriques temps réel
curl -k https://localhost:8443/api/metrics

# Logs en temps réel
docker compose logs -f product-service

# Base de données
docker exec -it poc_postgres psql -U pmuser -d petitemaison -c "SELECT id, title, price, category FROM products;"
docker exec -it poc_postgres psql -U pmuser -d petitemaison -c "SELECT * FROM cart_items;"

# Tests
cd auth-service && npm test
cd product-service && npm test

# Tests de charge k6
docker run --rm -i --network host grafana/k6 run --insecure-skip-tls-verify - < load-test/script.js

# Déclencher le pipeline CI/CD
git commit --allow-empty -m "ci: demo" && git push origin main
```

## Architecture

```
Client (Vue.js)
      ↕ HTTPS :8443
nginx (TLS + Reverse Proxy)
      ↕ poc_network (Docker privé)
auth-service :3001  |  product-service :3002  |  Keycloak :8080
                              ↕
                       PostgreSQL :5432
```
