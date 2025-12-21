# Dinarlytics Backend API

FastAPI-based backend for the Dinarlytics ERP system with comprehensive financial analysis, RBAC, and real-time alerts.

## Features

- ✅ **Authentication & Authorization**
  - JWT token-based authentication
  - Role-Based Access Control (RBAC)
  - Refresh token support
  - Password hashing with bcrypt
  - Session management
  - Login attempt tracking

- ✅ **Accounting Module**
  - Journal entries with debit/credit balance verification
  - Chart of accounts (Algerian standard)
  - Document access control per user/role
  - Approval workflow
  - Audit trail for all changes
  - Real-time KPI calculations

- ✅ **Financial Analysis**
  - Invoice management with HTT, TVA, TTC calculations
  - Purchase price analysis (PCA)
  - KPI tracking (EBITDA, ROE, ROA, DSO, DPO, etc.)
  - Financial indicators and ratios
  - Budget variance tracking

- ✅ **Alerts & Notifications**
  - Configurable alert definitions
  - Alert trigger history
  - User notifications (in-app, email, SMS)
  - Notification preferences per user

- ✅ **Document Management**
  - Invoices with barcode/QR code support
  - Delivery notes (Bons de Livraison)
  - Purchase orders (Bons de Commande)
  - Purchase notes (Bons d'Achat)
  - Electronic signature support (4 methods)

## Architecture

```
backend/
├── app/
│   ├── main.py              # FastAPI app setup & lifecycle
│   ├── config.py            # Configuration & settings
│   ├── security.py          # Authentication, JWT, RBAC
│   ├── database.py          # Database connection & session
│   ├── models/
│   │   ├── __init__.py
│   │   └── models.py        # SQLAlchemy ORM models
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py          # Authentication endpoints
│   │   ├── accounting.py    # Accounting/Journal endpoints
│   │   ├── documents.py     # Document endpoints (invoices, etc.)
│   │   ├── alerts.py        # Alerts & notifications endpoints
│   │   └── kpis.py          # KPI endpoints
│   └── services/
│       ├── __init__.py
│       ├── prediction.py    # AI prediction service
│       └── training.py      # Model training service
├── tests/
│   ├── __init__.py
│   ├── test_auth.py
│   ├── test_accounting.py
│   └── test_integration.py
├── requirements.txt         # Python dependencies
├── .env.example             # Environment variables template
├── .env                     # Environment variables (local)
├── pytest.ini              # Pytest configuration
└── README.md               # This file
```

## Installation

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Initialize Database

```bash
python -m alembic upgrade head  # If using migrations
# OR
# The database will be initialized on first app startup
```

### 4. Create Default Roles (Optional)

```bash
python -m app.scripts.create_roles
```

## Running the Application

### Development Mode

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Production Mode

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

The API documentation will be available at:
- Swagger UI: `http://localhost:8000/api/docs`
- ReDoc: `http://localhost:8000/api/redoc`

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login and get tokens
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout and invalidate session
- `GET /api/v1/auth/me` - Get current user info
- `POST /api/v1/auth/change-password` - Change password

### Accounting
- `POST /api/v1/accounting/journal-entries` - Create journal entry
- `GET /api/v1/accounting/journal-entries` - List journal entries
- `GET /api/v1/accounting/journal-entries/{id}` - Get specific entry
- `POST /api/v1/accounting/journal-entries/{id}/approve` - Approve/reject entry
- `GET /api/v1/accounting/chart-of-accounts` - List chart of accounts

### Documents
- `POST /api/v1/documents/invoices` - Create invoice
- `GET /api/v1/documents/invoices` - List invoices
- `GET /api/v1/documents/invoices/{id}` - Get specific invoice
- `POST /api/v1/documents/delivery-notes` - Create delivery note
- `POST /api/v1/documents/purchase-orders` - Create purchase order
- `POST /api/v1/documents/purchase-notes` - Create purchase note

### Alerts & Notifications
- `GET /api/v1/alerts` - List alerts
- `GET /api/v1/alerts/{id}` - Get alert details
- `GET /api/v1/notifications` - List user notifications
- `PUT /api/v1/notifications/{id}/read` - Mark notification as read

### KPIs
- `GET /api/v1/kpis` - List KPIs
- `GET /api/v1/kpis/{id}/values` - Get KPI values over time
- `GET /api/v1/financial-indicators` - List financial indicators

## Authentication

### Header Format
```
Authorization: Bearer <access_token>
```

### Login Example
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "SecurePass123!"
  }'
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 1800,
  "user": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "admin",
    "email": "admin@company.com",
    "first_name": "Admin",
    "last_name": "User",
    "roles": ["admin"]
  }
}
```

## Role-Based Access Control

### Available Roles
- **admin** - Full access, manage users & roles
- **comptable** - Create/edit accounting entries, approve
- **analyste_financier** - Read-only, generate reports
- **manager** - Create/edit, can approve certain documents
- **employee** - Read-only access

### Document Access by Role

| Document Type | Admin | Comptable | Manager | Analyste | Employee |
|---|---|---|---|---|---|
| invoice | CRUD+sign | CRU+sign | CRU | R | R |
| journal_entry | CRUD+approve | CRU | approve | R | - |
| delivery_note | CRUD+sign | CRU | CRU | - | R |
| purchase_order | CRUD+approve | CRU | approve | - | R |

(C=Create, R=Read, U=Update, D=Delete)

## Error Handling

All errors return standard HTTP status codes with descriptive messages:

```json
{
  "detail": "Error description"
}
```

Common Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid credentials)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate entry)
- `422` - Unprocessable Entity (validation error)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## Testing

### Run All Tests
```bash
pytest
```

### Run Specific Test File
```bash
pytest tests/test_auth.py -v
```

### Run with Coverage
```bash
pytest --cov=app --cov-report=html
```

## Database Models

### Core Tables
- `users` - User accounts
- `companies` - Company information
- `roles` - Role definitions
- `user_roles` - User-role relationships
- `user_sessions` - Active sessions

### Accounting Tables
- `journal_entries` - Accounting journal entries
- `journal_entry_lines` - Individual debit/credit lines
- `chart_of_accounts` - Chart of accounts (Algerian standard)
- `invoices` - Sales invoices
- `invoice_items` - Invoice line items
- `articles` - Product catalog

### Alert Tables
- `alert_definitions` - Alert configurations
- `alert_triggers` - Alert history
- `user_notifications` - User notifications

## Configuration

Key settings in `app/config.py`:

```python
# JWT Configuration
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

# Password Requirements
PASSWORD_MIN_LENGTH = 8
PASSWORD_REQUIRE_SPECIAL_CHARS = True
PASSWORD_REQUIRE_NUMBERS = True
PASSWORD_REQUIRE_UPPERCASE = True

# Session Configuration
SESSION_EXPIRE_MINUTES = 480
MAX_LOGIN_ATTEMPTS = 5
LOGIN_ATTEMPT_TIMEOUT_MINUTES = 15

# Database
DATABASE_POOL_SIZE = 20
DATABASE_MAX_OVERFLOW = 10

# Rate Limiting
RATE_LIMIT_REQUESTS = 100
RATE_LIMIT_PERIOD_SECONDS = 60
```

## Security Considerations

- ✅ Passwords hashed with bcrypt
- ✅ JWT tokens with HS256 algorithm
- ✅ CORS configured for frontend access
- ✅ Login attempt tracking and throttling
- ✅ Session expiration
- ✅ RBAC with granular permissions
- ✅ SQL injection prevention (SQLAlchemy ORM)
- ✅ Request validation with Pydantic

## Logging

Logs are configured in `app/config.py`:

```python
LOG_LEVEL = "INFO"
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
LOG_FILE = "logs/backend.log"
```

## Performance Optimization

- Database connection pooling (QueuePool)
- GZIP middleware for response compression
- JWT token verification without database lookup
- Indexed database queries
- Rate limiting support

## Deployment

### Docker

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment Variables for Production

```bash
ENVIRONMENT=production
DEBUG=False
SECRET_KEY=<generate-secure-key>
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<dbname>
SENTRY_DSN=<your-sentry-dsn>
```

## Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Verify user credentials

### JWT Token Invalid
- Token may have expired (create new token)
- SECRET_KEY may have changed (regenerate tokens)

### Permission Denied (403)
- Check user role and permissions
- Verify document access control settings

## Contributing

1. Create feature branch
2. Follow PEP 8 style guide
3. Add tests for new features
4. Run linting: `flake8 app/`
5. Format code: `black app/`

## License

Proprietary - Dinarlytics 2024
