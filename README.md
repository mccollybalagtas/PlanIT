# PlannerHUB

A modern, full-stack to-do list and schedule planner with a beautiful glassmorphism UI.

## Features

- **User Authentication** - Secure signup, login, and logout with JWT
- **Task Management** - Create, read, update, delete tasks with priorities, categories, due dates, and reminders
- **Calendar View** - Monthly calendar with event scheduling
- **Drag & Drop** - Reorder tasks with smooth drag-and-drop
- **Notifications** - Reminder system for tasks and events
- **Dark/Light Mode** - System-aware theme switching
- **Responsive Design** - Works beautifully on desktop and mobile
- **Glassmorphism UI** - Frosted glass panels, blurred backgrounds, pastel gradients

## Tech Stack

### Frontend
- React 18 + Vite
- TailwindCSS (custom glassmorphism design system)
- React Router v6
- @dnd-kit for drag-and-drop
- @headlessui for accessible components
- Zustand for state management
- Axios for API calls
- date-fns for date handling
- React Hot Toast for notifications

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Cookie-parser for secure cookies
- Express-validator for validation
- Node-cron for scheduled reminders

### Deployment
- Docker & Docker Compose
- Nginx for frontend serving
- Multi-stage builds for optimization

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB 7+
- Docker & Docker Compose (for containerized deployment)

### Development Setup

1. Clone the repository
```bash
cd PlannerHUB
```

2. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start MongoDB
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:7

# Or use local MongoDB installation
```

4. Start the backend
```bash
cd backend
npm install
npm run dev
```

5. Start the frontend
```bash
cd frontend
npm install
npm run dev
```

6. Open http://localhost:5173

### Docker Deployment

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## Project Structure

```
PlannerHUB/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Utility functions
│   │   └── server.js       # Entry point
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/         # Reusable UI components
│   │   │   ├── layout/     # Layout components
│   │   │   ├── tasks/      # Task-specific components
│   │   │   ├── events/     # Event-specific components
│   │   │   └── calendar/   # Calendar components
│   │   ├── context/        # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── store/          # State management
│   │   ├── utils/          # Utility functions
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
└── .env.example
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Update password

### Tasks
- `GET /api/tasks` - Get all tasks (with filters)
- `GET /api/tasks/stats` - Get task statistics
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PUT /api/tasks/reorder` - Reorder tasks

### Events
- `GET /api/events` - Get all events (with filters)
- `GET /api/events/month` - Get events for month
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Notifications
- `GET /api/notifications` - Get notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

## Design System

### Colors
- Primary: Indigo (#6366f1)
- Glass Light: rgba(255, 255, 255, 0.7)
- Glass Dark: rgba(30, 30, 40, 0.7)

### Components
- Glass cards with backdrop blur
- Smooth animations (fade, slide, scale)
- Consistent spacing and typography
- Accessible focus states
- Dark mode support

## License

MIT

## Publishing to GitHub

This project is structured as a monorepo with separate `backend/` and `frontend/` packages.

### Prerequisites for GitHub Deployment

1. **Create a `.env` file** in `backend/` from `backend/.env.example`:
   ```bash
   cp backend/.env.example backend/.env
   # Set JWT_SECRET to a strong random string
   ```

2. **Set up MongoDB** (choose one):
   - **MongoDB Atlas** (recommended for production):
     - Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
     - Get your connection string and set it as `MONGODB_URI` in `backend/.env`
   - **Local MongoDB**: Install MongoDB locally and use `mongodb://localhost:27017/plannerhub`
   - **Docker**: The included `docker-compose.yml` starts MongoDB automatically

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/plannerhub` |
| `JWT_SECRET` | JWT signing secret | *(change in production)* |
| `JWT_EXPIRE` | JWT token expiration | `7d` |
| `COOKIE_EXPIRE` | Cookie expiration in days | `7` |
| `CLIENT_URL` | Frontend URL (for CORS) | `http://localhost:5173` |
| `PORT` | Backend server port | `5000` |
| `VITE_API_URL` | Frontend API URL (frontend only) | `/api` |

### GitHub Deployment Options

#### Option 1: Deploy with Docker (Recommended)

The project includes Docker configuration for easy deployment:

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/PlannerHUB.git
cd PlannerHUB

# 2. Create environment files
cp backend/.env.example backend/.env
# Edit backend/.env with your MongoDB URI and JWT secret

# 3. Build and start all services
docker-compose up -d --build

# 4. Seed the database (optional - creates demo user)
docker-compose exec backend npm run seed

# 5. Access the app
# Frontend: http://localhost
# Backend API: http://localhost:5000/api
# Demo credentials: demo@plannerhub.com / password123
```

#### Option 2: Deploy to Vercel (Frontend) + Render/Railway (Backend)

The frontend can be deployed to Vercel, and the backend to any Node.js hosting platform.

**Frontend (Vercel):**
```bash
# 1. Set environment variable in Vercel dashboard
VITE_API_URL=https://your-backend-url.com/api

# 2. Deploy
vercel --cwd frontend
```

**Backend (Render/Railway):**
```bash
# 1. Set environment variables
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_jwt_secret
CLIENT_URL=https://your-frontend-url.vercel.app

# 2. Build command: npm install
# 3. Start command: npm start
```

### Development

```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev

# Terminal 3 - (Optional) Seed demo data
cd backend
npm run seed
```

### API Health Check

```bash
curl http://localhost:5000/api/health
# {"success":true,"message":"PlannerHUB API is running"}
```