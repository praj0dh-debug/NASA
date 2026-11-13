# 🚀 Junior Astronaut Mission Trainer

**NASA Artemis Spaceflight Academy & STEM Simulator for Elementary Cadets (Ages 5–11)**

![Artemis Cadet Training Program](https://img.shields.io/badge/NASA-Artemis%20Cadet-blue.svg)
![Status](https://img.shields.io/badge/Status-Prototype%20V1.0-brightgreen.svg)
![COPPA](https://img.shields.io/badge/COPPA-Compliant-emerald.svg)
![WCAG](https://img.shields.io/badge/WCAG-2.1%20AA-purple.svg)
![Standards](https://img.shields.io/badge/Curriculum-NGSS%20%7C%20CSTA-orange.svg)

---

## 🛰️ Overview

The **Junior Astronaut Mission Trainer** is an interactive, browser-based spaceflight training simulator designed to teach elementary students authentic aerospace engineering, orbital mechanics, planetary geology, and robotics. Built according to the **6-Phase NASA STEM Prototype Plan**, it implements a shared **Plan → Execute → Evaluate** loop across 6 deep space missions.

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

7. **COPPA-Compliant Child Accounts**
   - No personal identifiable information (PII) is ever collected. Cadets choose callsigns (`STAR-SEEKER`, `ORION-BLAST`) and avatars.
   - Adult supervisor consent gate (Parent & Teacher authorization).

8. **Educator Command Center & Classroom Roster**
   - Real-time live roster tracking enrolled cadets, missions cleared, badges conferred, and NGSS standard mastery rates.
   - 1-click class code generator (`NASA-CADET-5A`) and CSV telemetry reporting.

9. **WCAG 2.1 AA Accessibility**
   - Multi-tier text scaling (Normal, Large 120%, Extra Large 130%).
   - High Contrast Mode (WCAG AAA compliant borders and text contrast).
   - Okabe-Ito Colorblind assistance patterns.
   - Web Audio synthesizer sound effects (engine roar, countdown beeps, success fanfare).
   - Early Reader voiceover narration using browser Speech Synthesis API.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS, Custom NASA Artemis Palette
- **Physics Engine:** Euler-integrated atmospheric drag, Newton's 2nd & 3rd laws, Tsiolkovsky Delta-V equation
- **Audio Engine:** Web Audio API synthesizer + Web Speech API Text-to-Speech
- **Celebrations:** Canvas Confetti

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production
```bash
npm run build
```
Creates an optimized static production bundle in `dist/`.

---

## 📚 Curriculum Standards Alignment

- **NGSS-5-PS2-1:** Gravitational force exerted by Earth directed downward toward center of planet.
- **NGSS-3-5-ETS1-1:** Engineering design criteria and constraints on mass and fuel.
- **NGSS-3-5-ETS1-2:** Comparing multiple engineering solutions to reach orbit.
- **NGSS-3-5-ETS1-3:** Testing failure points and iterative refinement of rocket configurations.
- **NGSS-2-ESS1-1:** Earth & Moon surface history and crater formation.
- **CSTA-1B-AP-10:** Sequencing, algorithms, and iterative loops in robotics control.

