# Dinarlytics - Guide de Déploiement

## 📋 Prérequis

- Linux/macOS (Ubuntu 20.04+ recommandé)
- Docker & Docker Compose (optionnel mais recommandé)
- Node.js 18+
- Python 3.10+
- PostgreSQL 14+
- 4GB RAM minimum, 2 CPU cores

---

## 🚀 Déploiement Local (Développement)

### 1. Cloner le projet
```bash
git clone <repository>
cd Dinarlytics
cp .env.example .env
```

### 2. Initialiser PostgreSQL
```bash
# MacOS avec Homebrew
brew install postgresql
brew services start postgresql

# Linux (Ubuntu)
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql

# Créer la base de données
createdb dinarlytics
psql dinarlytics < database/schema_complete.sql
psql dinarlytics < database/ai_procedures_snapshot_drift.sql
```

### 3. Démarrer le backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Démarrer le frontend
```bash
cd frontend
npm install
npm run dev
```

**Service URLs:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Swagger Docs: http://localhost:8000/docs

---

## 🐳 Déploiement Docker Compose (Recommandé)

### 1. Préparer Docker Compose

Créer `docker-compose.yml` :
```yaml
version: '3.8'

services:
  # PostgreSQL
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: ${PGUSER}
      POSTGRES_PASSWORD: ${PGPASSWORD}
      POSTGRES_DB: ${PGDATABASE}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/schema_complete.sql:/docker-entrypoint-initdb.d/01-schema.sql
      - ./database/ai_procedures_snapshot_drift.sql:/docker-entrypoint-initdb.d/02-procedures.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${PGUSER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      PGHOST: postgres
      PGPORT: 5432
      PGUSER: ${PGUSER}
      PGPASSWORD: ${PGPASSWORD}
      PGDATABASE: ${PGDATABASE}
      DEBUG: ${DEBUG}
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000

  # Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    environment:
      VITE_API_URL: http://backend:8000
    ports:
      - "5173:5173"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### 2. Créer Dockerfile Backend

Fichier `backend/Dockerfile` :
```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 3. Créer Dockerfile Frontend

Fichier `frontend/Dockerfile` :
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json .
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/dist ./dist

EXPOSE 5173

CMD ["serve", "-s", "dist", "-l", "5173"]
```

### 4. Lancer les services

```bash
# Copier le fichier .env
cp .env.example .env

# Lancer tous les services
docker-compose up -d

# Vérifier les logs
docker-compose logs -f

# Arrêter les services
docker-compose down
```

**URLs:**
- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- Database: localhost:5432

---

## ☁️ Déploiement Cloud (AWS EC2 / Heroku)

### Option 1: AWS EC2 (Ubuntu 20.04)

#### 1. SSH dans l'instance
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

#### 2. Installer dépendances
```bash
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y docker.io docker-compose postgresql postgresql-contrib nodejs npm git
sudo usermod -aG docker ubuntu
```

#### 3. Cloner et déployer
```bash
git clone <repository>
cd Dinarlytics
cp .env.example .env
# Éditer .env avec les credentials production

# Lancer
docker-compose up -d
```

#### 4. Configurer Nginx (Reverse Proxy)
```bash
sudo apt-get install -y nginx

# /etc/nginx/sites-available/dinarlytics
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:5173;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
    }
}
```

Enable and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/dinarlytics /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

#### 5. SSL Certificate (Let's Encrypt)
```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Option 2: Heroku

#### 1. Installer Heroku CLI
```bash
curl https://cli.heroku.com/install.sh | sh
heroku login
```

#### 2. Créer app Heroku
```bash
heroku create your-app-name
heroku addons:create heroku-postgresql:standard-0 -a your-app-name
```

#### 3. Déployer
```bash
git push heroku main
heroku logs --tail
```

---

## 🔐 Production Checklist

### Security
- [ ] Changer toutes les passwords par défaut
- [ ] Générer JWT_SECRET_KEY fort
- [ ] Configurer CORS correctement
- [ ] Activer HTTPS/SSL
- [ ] Configurer firewall
- [ ] Audit des logs
- [ ] Backup automatis des données

### Performance
- [ ] Ajouter Redis cache
- [ ] Configurer CDN pour assets
- [ ] Optimiser DB indexes
- [ ] Configurer connection pooling
- [ ] Load balancing (si multiple instances)

### Monitoring
- [ ] Configurer logging (Sentry, CloudWatch)
- [ ] Ajouter health checks
- [ ] Configurer alertes
- [ ] Dashboard Prometheus/Grafana
- [ ] Monitoring DB performance

### Backup & Recovery
- [ ] Backup automatis DB (daily)
- [ ] Backup code source
- [ ] Plan de recovery testé
- [ ] Versioning des models IA

---

## 📊 Monitoring & Logs

### Logs Docker
```bash
# Backend
docker-compose logs -f backend

# Frontend
docker-compose logs -f frontend

# Database
docker-compose logs -f postgres
```

### Health Checks
```bash
# Backend health
curl http://localhost:8000/health

# Frontend (check server is up)
curl http://localhost:5173
```

### Performance Metrics
```bash
# Docker stats
docker stats

# System stats
free -h
df -h
top
```

---

## 🔄 Updates & Maintenance

### Update Backend Code
```bash
git pull origin main
docker-compose up -d --build backend
```

### Update Frontend Code
```bash
git pull origin main
docker-compose up -d --build frontend
```

### Update Database Schema
```bash
# Backup first
pg_dump dinarlytics > backup_$(date +%Y%m%d).sql

# Apply migration
psql dinarlytics < database/migration_new.sql
```

### Restart Services
```bash
# Redémarrer tout
docker-compose restart

# Ou redémarrer un seul service
docker-compose restart backend
```

---

## 🚨 Troubleshooting

### Database Connection Error
```bash
# Vérifier la connexion
psql -h localhost -U postgres -d dinarlytics

# Vérifier Docker network
docker network ls
docker inspect bridge
```

### Backend Port Already in Use
```bash
# Trouver le processus
lsof -i :8000

# Tuer le processus
kill -9 <PID>
```

### Frontend Build Fails
```bash
cd frontend
rm -rf node_modules dist
npm install
npm run build
```

### Low Disk Space
```bash
# Nettoyer Docker
docker system prune -a
docker volume prune

# Check space
df -h
du -sh *
```

---

## 📈 Scaling Horizontale

### Multi-Instance Backend (avec Load Balancer)

```yaml
# docker-compose.yml
backend:
  image: dinarlytics-backend
  deploy:
    replicas: 3
  ports:
    - "8000-8002:8000"
```

### Nginx Load Balancing
```nginx
upstream backend {
    server backend-1:8000;
    server backend-2:8000;
    server backend-3:8000;
}

server {
    location /api/ {
        proxy_pass http://backend;
    }
}
```

---

## 🎯 Performance Tuning

### PostgreSQL
```sql
-- Increase shared buffers
ALTER SYSTEM SET shared_buffers = '2GB';

-- Increase work_mem
ALTER SYSTEM SET work_mem = '512MB';

-- Optimize for connections
ALTER SYSTEM SET max_connections = 200;

-- Reload config
SELECT pg_reload_conf();
```

### Backend Python
```python
# Use uvicorn workers
uvicorn app.main:app --workers 4 --host 0.0.0.0 --port 8000
```

---

## 📚 Resources

- [Docker Documentation](https://docs.docker.com)
- [Nginx Reverse Proxy](https://nginx.org/en/docs)
- [PostgreSQL Administration](https://www.postgresql.org/docs)
- [AWS EC2 Best Practices](https://docs.aws.amazon.com/ec2)
- [Heroku Deployment](https://devcenter.heroku.com)

---

**Déploiement production-ready, sécurisé et scalable.**
