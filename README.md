# Smart Goal Breaker

AI-powered goal breakdown app that converts vague goals into 5 actionable steps.

## Tech Stack
- **Backend**: Python FastAPI + SQLAlchemy + Alembic
- **Frontend**: Next.js 16 + shadcn/ui + Tailwind CSS
- **Database**: PostgreSQL
- **AI**: Google Gemini

## Features
- Enter a vague goal and get 5 actionable steps
- AI-generated complexity score (1-10)
- Save goals to PostgreSQL database
- Delete goals
- Loading skeletons and empty states
- Input validation (3-500 characters)
- Retry logic for AI failures
- Health check with DB verification

## Quick Start

### Option 1: Docker Compose (Recommended)
```bash
# Copy and edit environment variables
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# Start all services
docker-compose up -d
```
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Database: localhost:5432

### Option 2: Manual Setup

#### 1. Start PostgreSQL (Docker)
```bash
docker-compose up -d postgres
```

#### 2. Setup Backend
```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Add your Gemini API key to .env
# GEMINI_API_KEY=your_key_here

# Run database migrations
alembic upgrade head

# Run server
uvicorn app.main:app --reload
```
Backend runs at: http://localhost:8000

#### 3. Setup Frontend
```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev
```
Frontend runs at: http://localhost:3000

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/goals/` | Create goal + AI breakdown |
| GET | `/api/goals/` | List all goals |
| GET | `/api/goals/{id}` | Get single goal |
| DELETE | `/api/goals/{id}` | Delete a goal |
| GET | `/health` | Health check with DB status |

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/goalbreaker
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Testing

### Backend Tests
```bash
cd backend
pytest
```

## Deployment

### Frontend (Vercel)
1. Push to GitHub
2. Import project in Vercel
3. Set `NEXT_PUBLIC_API_URL` environment variable to your deployed backend URL

### Backend (Railway/Render)
1. Push to GitHub
2. Create new service from repo
3. Set environment variables:
   - `DATABASE_URL` (from PostgreSQL addon)
   - `GEMINI_API_KEY`
   - `FRONTEND_URL` (your Vercel URL)

### Full Stack (Docker)
```bash
# Build and run
docker-compose up -d --build

# View logs
docker-compose logs -f
```

## Database Migrations
```bash
cd backend

# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```
