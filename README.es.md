# Quilt

**Constructor de experiencias interactivas** — una plataforma para crear encuestas, minijuegos y dinámicas de preguntas que terminan en la elección de una recompensa personalizada.

## Descripción

Quilt permite armar experiencias interactivas modulares: secuencias de preguntas, minijuegos y selectores de recompensa que cualquiera puede jugar a través de un link único, sin necesidad de crear una cuenta. El nombre hace referencia a cómo se arma cada experiencia — como una colcha (quilt) de módulos combinados en el orden que el creador elija.

Cada creador diseña su propia experiencia desde cero: define las preguntas o dinámicas que quiere incluir, cuántos puntos otorga cada una, y qué recompensas se desbloquean al alcanzar cierto puntaje. El jugador responde, acumula puntos sin importar qué conteste, y al final elige entre las opciones de recompensa disponibles — incluyendo fecha y hora si aplica.

Pensado originalmente como una dinámica para planear citas de forma personalizada, el proyecto evolucionó hacia un constructor genérico y reutilizable: sirve tanto para juegos de preguntas entre parejas como para encuestas, dinámicas de equipo, o cualquier experiencia que combine input del usuario con un sistema de puntos y recompensas.

## Stack tecnológico

**Backend**
- FastAPI (Python) — API RESTful
- PostgreSQL — base de datos relacional
- SQLAlchemy — ORM
- Alembic — migraciones de base de datos
- Pydantic — validación de esquemas
- JWT (python-jose) + Passlib (bcrypt) — autenticación de creadores

**Frontend**
- React + Vite
- Tailwind CSS — estilos
- Jest + React Testing Library — testing

**Infraestructura**
- Docker Compose — levanta la base de datos PostgreSQL
- .env — configuración de conexión a la base de datos y secretos

## Inicio rápido (self-hosting)

Requisitos: [Docker](https://www.docker.com/), Python 3.12+, Node 18+.

1. **Cloná el repo y levantá la base de datos:**

   ```bash
   git clone https://github.com/MalvaLess/Quilt.git
   cd Quilt
   docker compose up -d
   ```

   Esto levanta un contenedor de PostgreSQL en `localhost:5432` (user/password/db: `quilt`).

2. **Backend:**

   ```bash
   cd backend
   cp .env.example .env
   ```

   Abrí `.env` y poné un `SECRET_KEY` real (ej. `openssl rand -hex 32`). El `DATABASE_URL` por defecto ya apunta a la base de datos del paso 1.

   ```bash
   python -m venv interactive
   interactive\Scripts\activate      # Windows
   source interactive/bin/activate   # macOS/Linux

   pip install -r requirements.txt
   alembic upgrade head
   uvicorn app:app --reload --port 8000
   ```

   Opcional: seteá `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` en `.env` y corré `python seed.py` para crear una primera cuenta sin pasar por el registro de la UI.

3. **Frontend** (en otra terminal):

   ```bash
   cd frontend
   cp .env.example .env
   npm install
   npm run dev
   ```

   Abrí la URL que imprime (normalmente `http://localhost:5173`), registrate y empezá a armar tu experiencia.
