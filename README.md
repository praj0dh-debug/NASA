# 🚀 Junior Astronaut Mission Trainer

**NASA Artemis Spaceflight Academy & STEM Simulator for Elementary Cadets (Ages 5–11)**

![Artemis Cadet Training Program](https://img.shields.io/badge/NASA-Artemis%20Cadet-blue.svg)
![Status](https://img.shields.io/badge/Status-Production%20Hardened-brightgreen.svg)
![COPPA](https://img.shields.io/badge/COPPA-Compliant%20Zero--PII-emerald.svg)
![WCAG](https://img.shields.io/badge/WCAG-2.1%20AA-purple.svg)
![Tests](https://img.shields.io/badge/Tests-12%2F12%20Passing-brightgreen.svg)
![Standards](https://img.shields.io/badge/Curriculum-NGSS%20%7C%20CSTA-orange.svg)

---

## 🛰️ Overview

The **Junior Astronaut Mission Trainer** is an interactive, browser-based spaceflight training simulator designed to teach elementary students authentic aerospace engineering, orbital mechanics, planetary geology, and robotics. Built according to the **6-Phase NASA STEM Prototype Plan**, it implements a shared **Plan → Execute → Evaluate** loop across 6 deep space missions, backed by a production-hardened REST API with zero-PII COPPA compliance.

### Key Capabilities

1. **Mission 1: Rocket Launch & Orbital Insertion (MVP Primary)**
   - **Plan:** Vehicle Assembly Building (VAB). Choose payload (Orion capsule, science probe, cargo fairing), propellant tank, and engines (Raptor-X, SRBs, Aerospike). Calculates live Mass, Thrust, Delta-V, and Thrust-to-Weight Ratio (TWR). Warns if TWR < 1.0!
   - **Execute:** Real-time 2D canvas launch simulator with 3-2-1 countdown audio, engine flame and smoke particle physics, atmospheric gradient (blue sky → stratosphere → deep space), stage burnout, and orbital velocity tracking (~7.8 km/s).
   - **Evaluate:** Post-flight debrief quiz aligned with NGSS-5-PS2-1. Unlocks the certified **Master Rocket Engineer** badge.

2. **Mission 2: Orbital Space Station Life Support**
   - Manage electrical bus loads across oxygen scrubbers, microgravity labs, and high-gain comms.
   - Handle orbital eclipses (Earth's shadow) and resolve emergency micrometeorite decompression leaks.

3. **Mission 3: Artemis Lunar Base & Rock Analysis**
   - Design South Pole lunar base camps using 3D-sintered regolith shielding and crater-rim solar towers.
   - Drive the Lunar Terrain Vehicle to Shackleton Crater, drill core samples, and classify anorthosite & water-ice crystals.

4. **Mission 4: Mars Rover Autonomous Coding**
   - Visual drag-and-drop block programming editor (`FORWARD`, `TURN_LEFT`, `TURN_RIGHT`, `DRILL_SAMPLE`).
   - Navigate the Perseverance rover across a 5x5 Jezero Crater grid to drill core samples while avoiding boulder hazards.

5. **Mission 5: Earth Observation Satellite Design**
   - Configure Synthetic Aperture Radar (SAR) vs multispectral imagers and calculate sun-synchronous polar orbits.

6. **Mission 6: Planetary Defense DART Simulator**
   - Calculate hypervelocity kinetic impactor vectors and lead time years to deflect hazardous asteroids past Earth.

7. **COPPA-Compliant Child Accounts (Zero PII Guaranteed)**
   - No personal identifiable information (PII) is ever collected or persisted. Cadets choose callsigns (`STAR-SEEKER`, `ORION-BLAST`) and avatars.
   - Strict server-side COPPA guard detects and rejects names, phone numbers, and location data.
   - Adult supervisor consent gate (Parent & Teacher authorization) with email verification.

8. **Educator Command Center & Classroom Roster**
   - Real-time live roster tracking enrolled cadets, missions cleared, badges conferred, and NGSS standard mastery rates.
   - 1-click class code generator (`NASA-CADET-5A`) and CSV telemetry reporting.

9. **WCAG 2.1 AA Accessibility**
   - Multi-tier text scaling (Normal, Large 120%, Extra Large 130%).
   - High Contrast Mode (WCAG AAA compliant borders and text contrast).
   - Okabe-Ito Colorblind assistance patterns.
   - Web Audio synthesizer sound effects (engine roar, countdown beeps, success fanfare).
   - Early Reader voiceover narration using browser Speech Synthesis API.
   - Keyboard accessible navigation with visible focus rings and skip-to-content links.

---

## 🛠️ Tech Stack & Architecture

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
- **Backend:** Node.js HTTP REST API router with atomic JSON database (`data/db.json`)
- **Security:** COPPA Guard middleware (Zero-PII detection, HTML entity XSS sanitization, 512KB payload limits)
- **Physics Engine:** Euler-integrated atmospheric drag, Newton's 2nd & 3rd laws, Tsiolkovsky Delta-V equation
- **Testing:** Node.js native test runner (`node --test`) with `--experimental-strip-types`
- **Audio & Speech:** Web Audio API synthesizer + Web Speech API Text-to-Speech

---

## ⚡ Quick Start (Clean Clone)

### 1. Prerequisites
- **Node.js**: v20+ or v22+ (v26 LTS recommended)
- **npm**: v9+

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy the provided `.env.example` file to create your local `.env`:
```bash
# Windows (PowerShell / Command Prompt)
copy .env.example .env

# macOS / Linux
cp .env.example .env
```

Default configuration in `.env`:
```ini
# Port where the application dev/production server runs
PORT=3000

# Server execution environment (development | production | test)
NODE_ENV=development

# Base URL for frontend REST API client requests (empty string uses relative path /api/*)
VITE_API_BASE_URL=

# Enforce strict COPPA validation (disallows real names, SSN, phone numbers, locations)
COPPA_STRICT_MODE=true
```

### 4. Run Development Server (Frontend + REST API)
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser. The Vite dev server automatically embeds the REST API middleware on the same port.

### 5. Run Test Suite
Execute the unit and API test suite (12 tests covering health, COPPA guards, parental consent, mission progress validation, badge criteria, classroom roster, and rocket physics):
```bash
npm test
```

### 6. Build & Run for Production
```bash
# Compile TypeScript and bundle frontend with Vite
npm run build

# Start standalone Node production server
npm run preview
# or run the dedicated production server:
node server/index.ts
```

---

## 📡 REST API Endpoints

All endpoints are hosted at `/api/*` and reject payloads larger than 512KB.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Uptime, COPPA mode, and API status |
| `POST` | `/api/parental-consent` | Verifies supervisor email and grants educational COPPA consent |
| `GET` | `/api/progress` | Fetches progress records for a student (`?studentId=...`) |
| `POST` | `/api/progress` | Persists mission score, status, and advances sequential unlocks |
| `GET` | `/api/badges` | Retrieves all earned badges for a cadet (`?studentId=...`) |
| `POST` | `/api/badges` | Awards certified badge upon meeting score criteria (>= 70%) |
| `GET` | `/api/roster` | Returns teacher classroom summary and cadet roster (`?classCode=...`) |
| `POST` | `/api/roster/join` | Enrolls cadet into a teacher's classroom by class code |

---

## 📚 Curriculum Standards Alignment

- **NGSS-5-PS2-1:** Gravitational force exerted by Earth directed downward toward center of planet.
- **NGSS-3-5-ETS1-1:** Engineering design criteria and constraints on mass and fuel.
- **NGSS-3-5-ETS1-2:** Comparing multiple engineering solutions to reach orbit.
- **NGSS-3-5-ETS1-3:** Testing failure points and iterative refinement of rocket configurations.
- **NGSS-2-ESS1-1:** Earth & Moon surface history and crater formation.
- **CSTA-1B-AP-10:** Sequencing, algorithms, and iterative loops in robotics control.
