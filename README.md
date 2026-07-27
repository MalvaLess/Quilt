# Quilt

**Interactive experience builder** — a platform for creating surveys, mini-games, and Q&A dynamics that end with the selection of a personalized reward.

## Description

Quilt allows you to build modular interactive experiences: sequences of questions, mini-games, and reward selectors that anyone can play via a unique link, with no account creation required. The name refers to how each experience is put together — like a quilt made of combined modules in whatever order the creator chooses.

Each creator designs their own experience from scratch: defining the questions or dynamics they want to include, how many points each one awards, and which rewards unlock upon reaching a certain score. The player answers, earns points regardless of their choices, and at the end selects from the available reward options — including date and time, if applicable.

Originally conceived as a dynamic tool for planning personalized dates, the project evolved into a generic, reusable builder: it works just as well for Q&A games between couples as it does for surveys, team dynamics, or any experience combining user input with a points and rewards system.

## Tech Stack

**Backend**

* FastAPI (Python) — RESTful API
* PostgreSQL — relational database
* SQLAlchemy — ORM
* Alembic — database migrations
* Pydantic — schema validation
* JWT (python-jose) + Passlib (bcrypt) — creator authentication

**Frontend**

* React + Vite
* Tailwind CSS — styling
* Jest + React Testing Library — testing

**Infrastructure**

* Docker Compose — spins up the PostgreSQL database
* .env — database connection and secrets configuration

## Quick Start (self-hosting)

Prerequisites: [Docker](https://www.docker.com/), Python 3.12+, Node 18+.

1. **Clone the repo and start the database:**

   ```bash
   git clone https://github.com/MalvaLess/Quilt.git
   cd Quilt
   docker compose up -d
   ```

   This starts a PostgreSQL container on `localhost:5432` (user/password/db: `quilt`).

2. **Backend:**

   ```bash
   cd backend
   cp .env.example .env
   ```

   Open `.env` and set a real `SECRET_KEY` (e.g. `openssl rand -hex 32`). The default `DATABASE_URL` already points at the database from step 1.

   ```bash
   python -m venv interactive
   interactive\Scripts\activate      # Windows
   source interactive/bin/activate   # macOS/Linux

   pip install -r requirements.txt
   alembic upgrade head
   uvicorn app:app --reload --port 8000
   ```

   Optional: set `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` in `.env` and run `python seed.py` to create a first account instead of registering through the UI.

3. **Frontend** (in a new terminal):

   ```bash
   cd frontend
   cp .env.example .env
   npm install
   npm run dev
   ```

   Open the printed URL (usually `http://localhost:5173`), register an account, and start building.
