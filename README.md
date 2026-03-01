# Breathing & Meditation Timer

A calming breathing and meditation timer app built with React + Vite.

## Features

- **Abstract lung visualizer** — Two clusters of translucent, softly glowing circles rendered on HTML Canvas, inspired by popular "breath ball" apps
- **Floating light orbs** — Small glowing balls inside each lung animate along curved paths to represent airflow
- **Animated breath cycle guidance**:
  - **Inhale** — Lungs expand, balls move inward and upward, glow brightens
  - **Hold** — Lungs stay at maximum size, balls pulse gently
  - **Exhale** — Lungs smoothly shrink, balls drift outward and downward, glow fades
- **Three breathing patterns**:
  - 4-7-8 Breathing (Inhale 4s – Hold 7s – Exhale 8s)
  - Box Breathing (Inhale 4s – Hold 4s – Exhale 4s – Hold 4s)
  - Relaxed (Inhale 4s – Hold 2s – Exhale 6s)
- **Clean UI** — Phase name, countdown timer, progress bar, and rounded play/pause button
- **Dark gradient background** — Deep blue/purple with soft diffused lighting
- **Soft colors** — Teal, cyan, and lavender palette; no sharp edges or clutter

## Preview

![Breathing App](https://github.com/user-attachments/assets/b32311f0-91fa-4fd2-a963-0c7963f602cd)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Build

```bash
npm run build
```

## Tech Stack

- [React](https://react.dev/) — UI components
- [Vite](https://vitejs.dev/) — Build tool
- HTML Canvas API — Smooth, frame-accurate lung animation
