# Aucto -- Auction Web Application

## 📌 Opis aplikacije

Aucto je full-stack web aplikacija za online aukcije. Sistem omogućava
korisnicima da kreiraju naloge, postavljaju aukcije (kao prodavci),
licitiraju (kao kupci), upravljaju korpom i kreiraju porudžbine nakon
završetka aukcije. Administratori imaju poseban panel sa statistikom i
upravljanjem korisnicima.

Aplikacija je podeljena na frontend (React + Vite) i backend (Node.js +
Express + Prisma), uz MySQL bazu podataka.

---

## 🛠️ Tehnologije

### Backend

- Node.js
- Express.js
- Prisma ORM
- MySQL
- JWT autentifikacija (httpOnly cookie)
- Swagger (OpenAPI dokumentacija)
- Docker

### Frontend

- React
- Vite
- Zustand (state management)
- React Router
- Vitest + React Testing Library (testovi)

### DevOps

- Docker & Docker Compose
- GitHub Actions (CI pipeline)

---

## 🚀 Lokalno pokretanje (bez Dockera)

### 1️⃣ Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

Backend se pokreće na:

    http://localhost:5000

Swagger dokumentacija:

    http://localhost:5000/docs

### 2️⃣ Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend se pokreće na:

    http://localhost:5173

---

## 🐳 Pokretanje pomoću Docker-a

Projekat je potpuno dockerizovan i može se pokrenuti jednom komandom.

### Build i start svih servisa

Iz root direktorijuma projekta:

```bash
docker compose up --build
```

Za pokretanje u pozadini:

```bash
docker compose up --build -d
```

### Zaustavljanje servisa

```bash
docker compose down
```

### Brisanje i baze (volumena)

```bash
docker compose down -v
```

---

## 📦 Servisi u Docker Compose-u

- **db** -- MySQL 8 baza podataka (port 3306)
- **backend** -- Express API (port 5000)
- **frontend** -- React aplikacija (port 5173)

Svi servisi se automatski povezuju preko Docker mreže.

---

## 🧪 Testiranje

Frontend testovi se pokreću komandom:

```bash
cd frontend
npm run test
```

Testovi se automatski izvršavaju i u CI pipeline-u (GitHub Actions).

---

## 🔄 CI/CD

GitHub Actions pipeline: - Pokreće se na svaki push i pull request na
`main` i `development` - Izvršava frontend testove - Gradi Docker image
za frontend i backend - Validira docker-compose konfiguraciju