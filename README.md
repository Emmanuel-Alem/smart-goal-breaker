# 🎯 Smart Goal Breaker

> AI-powered goal breakdown app that converts vague goals into 5 actionable steps.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql)
![Google Gemini](https://img.shields.io/badge/Gemini-AI-4285F4?logo=google)

## 📸 Screenshots

| New Goal View | History View | Settings |
|---------------|--------------|----------|
| Enter your goal and get AI breakdown | View all saved goals | Theme, export, and more |

## ✨ Features

### Core
- 🤖 **AI Goal Breakdown** - Enter a vague goal, get 5 actionable steps
- 📊 **Complexity Score** - AI rates difficulty from 1-10 (Easy/Medium/Hard)
- 💾 **Persistent Storage** - Goals saved to PostgreSQL database
- ✏️ **Edit & Regenerate** - Modify goals and get new AI breakdown

### AI & Performance
- 🔄 **Dynamic Model Selection** - Choose between multiple Gemini models (2.0 Flash, 2.5 Flash, 1.5 Flash, 1.5 Pro)
- 📈 **API Usage Statistics** - Real-time monitoring of requests per minute and daily quota
- ⚡ **Rate Limiting** - Built-in protection (10 req/min, 500 req/day) to prevent quota exhaustion
- 🛡️ **Smart Error Handling** - User-friendly messages for all API errors with helpful hints

### UI/UX
- 🌓 **Dark/Light Theme** - Toggle with persistence
- 📱 **Fully Mobile Responsive** - Hamburger menu, adaptive layouts, touch-friendly interface
- 🎨 **Modern Design** - Claude-inspired UI with sidebar navigation
- ⏳ **Loading States** - Skeletons and smooth animations
- ✅ **Input Validation** - 3-500 character limit with real-time feedback
- 💡 **Contextual Hints** - Helpful suggestions displayed alongside error messages

### Data Management
- 📥 **Export Goals** - Download as JSON, CSV, PDF, or DOC
- 🗑️ **Delete Goals** - Remove individual or all goals
- 👁️ **Toggle Complexity** - Show/hide complexity badges
- 🔍 **Dual Views** - Switch between New Goal creation and History

## 🌟 Key Highlights

### 🎯 AI Model Selection
Switch between different Gemini models directly from the settings:
- **Gemini 2.5 Flash** - Newest, experimental (default)
- **Gemini 2.0 Flash** - Fast, latest stable
- **Gemini 1.5 Flash** - Previous generation, reliable
- **Gemini 1.5 Pro** - Higher quality, slower responses

### 📊 Real-Time API Monitoring
Track your API usage with live statistics:
- Requests used this minute (out of 10)
- Daily requests (out of 500)
- Visual progress bars in settings panel

### 📱 Mobile-First Design
Seamless experience across all devices:
- Responsive hamburger menu navigation
- Touch-optimized buttons and cards
- Text wrapping for long error messages
- Adaptive spacing and typography

### 💬 User-Friendly Error Messages
Clear, actionable error messages with helpful hints:
```
⚠️ API quota exceeded. Your free tier limit has been reached.
💡 Try switching to a different AI model from the settings and try again.
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16, React 19, Tailwind CSS, shadcn/ui |
| **Backend** | Python, FastAPI, SQLAlchemy, Alembic |
| **Database** | PostgreSQL with asyncpg |
| **AI** | Google Gemini (2.0 Flash, 2.5 Flash, 1.5 Flash, 1.5 Pro) |
| **Deployment** | Vercel -> Frontend, Render -> BackEnd, Neon -> DB, Docker(local setup) |

## 🚀 Quick Start

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

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/goals/` | Create goal + AI breakdown (with optional model selection) |
| GET | `/api/goals/` | List all goals |
| GET | `/api/goals/{id}` | Get single goal |
| PUT | `/api/goals/{id}` | Update goal + regenerate steps (with optional model) |
| DELETE | `/api/goals/{id}` | Delete a goal |
| DELETE | `/api/goals/` | Delete all goals |
| GET | `/api/goals/models` | List available AI models |
| GET | `/api/goals/rate-limit/status` | Get current API usage statistics |
| GET | `/health` | Health check with DB status |

## 🔐 Environment Variables

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

## 🧪 Testing

```bash
cd backend
pytest
```

## ☁️ Deployment

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

## 🗃️ Database Migrations

```bash
cd backend

# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

## 📁 Project Structure

```
smart-goal-breaker/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI app entry
│   │   ├── models.py         # SQLAlchemy models
│   │   ├── schemas.py        # Pydantic schemas
│   │   ├── database.py       # DB connection
│   │   ├── config.py         # Settings & validation
│   │   ├── routes/
│   │   │   └── goals.py      # API endpoints
│   │   └── services/
│   │       └── ai_service.py # Gemini integration
│   ├── alembic/              # DB migrations
│   ├── tests/                # Pytest tests
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/              # Next.js pages
│   │   ├── components/       # React components
│   │   │   ├── ui/           # shadcn/ui components
│   │   │   ├── goal/         # Goal-related components
│   │   │   └── layout/       # Layout components
│   │   └── lib/              # Utilities & API
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

## 📄 License

MIT License - feel free to use this project for learning or building upon it.

---

Built with ❤️ using FastAPI, Next.js, and Google Gemini
