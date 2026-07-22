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

* Docker + Docker Compose — containers for backend, frontend, and database
* .env — database connection and secrets configuration
