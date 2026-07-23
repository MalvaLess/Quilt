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
- Docker + Docker Compose — contenedores para backend, frontend y base de datos
- .env — configuración de conexión a la base de datos y secretos
