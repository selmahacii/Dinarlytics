# Makefile for Dinarlytics project management

.PHONY: setup up down build logs test lint clean

# --- Setup & Environment ---
setup:
	cp .env.example .env
	cp backend/.env.example backend/.env
	cd frontend && npm install
	cd backend && pip install -r requirements.txt

# --- Docker Commands ---
up:
	docker-compose up -d

down:
	docker-compose down

build:
	docker-compose build

logs:
	docker-compose logs -f

# --- Development ---
run-backend:
	cd backend && uvicorn app.main:app --reload

run-frontend:
	cd frontend && npm run dev

# --- Quality Assurance ---
test:
	cd backend && pytest
	cd frontend && npm test

lint:
	cd backend && flake8 app
	cd frontend && npm run lint

# --- Database ---
migrate-init:
	cd backend && alembic init migrations

migrate-check:
	cd backend && alembic revision --autogenerate -m "auto"

migrate-apply:
	cd backend && alembic upgrade head
