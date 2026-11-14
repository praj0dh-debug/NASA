# Junior Astronaut NASA Mission Trainer — Visual Redesign Documentation

## 1. Overview

The application adopts the **space-themed visual aesthetic** from the reference design (`image.png`) while remaining **100% focused on the NASA Junior Astronaut Mission Trainer**:
- Deep cosmic blue-purple palette (`#0a0b2e`, `#12153f`, `#1a1050`)
- Pure CSS/SVG vector illustration artwork (large ringed planet, snow-capped peaks, floating islands, spacecraft, starfield)
- Minimalist-plus-illustration layout and frosted glassmorphic UI elements
- Complete elimination of generic software agency copy in favor of authentic NASA Artemis STEM mission content

---

## 2. Navigation ([`BeanMachineNav.tsx`](file:///c:/Users/Prajodh/Documents/NASA/src/components/landing/BeanMachineNav.tsx))
- **Brand**: `[🚀] Junior Astronaut` (NASA Artemis Academy)
- **Links**:
  - `Home`
  - `Missions ▾` (Rocket Launch, Space Station Ops, Lunar Base, Mars Rover Coding, Satellite Design, Asteroid Deflection)
  - `Curriculum ▾` (NGSS Science Standards, Flight Physics Engine, Educator Flight Deck)
  - `Badges`
  - `Flight Log`
  - `Launch Mission` (Mint-green `#10b981` pill button)
- **Cadet Telemetry**: Live status badge with Cadet nickname, avatar, and XP count.
- **Educator Hub & WCAG Settings**: Integrated directly into the top bar.

---

## 3. Hero Section ([`HeroSection.tsx`](file:///c:/Users/Prajodh/Documents/NASA/src/components/landing/HeroSection.tsx))
- **Headline**: *"Train Like a NASA Astronaut. Master the Cosmos."*
- **Subheading**: *"Authentic aerospace engineering simulators, orbital physics & Next Generation Science challenges for future space explorers"*
- **Badge**: *"NASA Artemis STEM Flight Deck"*
- **CTA**: Mint-green *"Launch Mission"* button directly launching into the flight simulators.
- **Visuals**: Illustrated ringed planet, mountain silhouettes, snow-capped peaks, floating islands, and sleek spacecraft.

---

## 4. Flight Training Disciplines ([`ServiceGrid.tsx`](file:///c:/Users/Prajodh/Documents/NASA/src/components/landing/ServiceGrid.tsx))
- 4-Column STEM training disciplines in frosted glass cards:
  1. **Propulsion & Orbit** — Rocket staging & Newton's laws
  2. **Life Support Ops** — Orbital station power & oxygen grids
  3. **Lunar Geology** — Artemis habitats & sample analysis
  4. **Autonomous Robotics** — Mars rover block programming

---

## 5. Mission Flight Deck & Simulators ([`MissionMap.tsx`](file:///c:/Users/Prajodh/Documents/NASA/src/components/hub/MissionMap.tsx), [`RocketBuilder.tsx`](file:///c:/Users/Prajodh/Documents/NASA/src/missions/rocket-launch/RocketBuilder.tsx), [`MissionShell.tsx`](file:///c:/Users/Prajodh/Documents/NASA/src/missions/engine/MissionShell.tsx))
- Full 6-stage flight progression:
  1. Rocket Launch & Orbital Insertion
  2. Orbital Space Station Life Support
  3. Artemis Lunar Base & Rock Analysis
  4. Mars Rover Autonomous Coding
  5. Earth Observation Satellite
  6. Planetary Defense DART Simulator
- Complete glassmorphism, clean geometric sans typography, and interactive flight controls.
