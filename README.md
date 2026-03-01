# Breathe — Breathing & Meditation Timer

A calming breathing and meditation timer app built with React Native and Expo.

## Features

- **Animated lung visualizer** — Two clusters of translucent, softly glowing circles with floating light orbs representing airflow
- **Smooth breath cycle animation**:
  - **Inhale** — Lungs expand, glow brightens
  - **Hold** — Lungs stay at size, orbs drift gently
  - **Exhale** — Lungs shrink, glow fades
- **Three breathing patterns**:
  - 4-7-8 Breathing (Inhale 4s – Hold 7s – Exhale 8s)
  - Box Breathing (Inhale 4s – Hold 4s – Exhale 4s – Hold 4s)
  - Relaxed (Inhale 4s – Hold 2s – Exhale 6s)
- **Clean UI** — Phase name, countdown timer, progress bar, and play/pause button
- **Dark background** — Deep blue theme with soft teal/cyan/lavender palette

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Expo Go](https://expo.dev/go) app on your iOS or Android device

### Install & Run

```bash
npm install
npm start
```

Scan the QR code with Expo Go (Android) or the Camera app (iOS) to open on your device.

### Run on Specific Platforms

```bash
npm run android   # Android
npm run ios       # iOS (macOS only)
npm run web       # Web browser
```

## Tech Stack

- [React Native](https://reactnative.dev/) — Mobile UI framework
- [Expo](https://expo.dev/) — Development platform and tooling
- [react-native-svg](https://github.com/software-mansion/react-native-svg) — SVG icons for play/pause controls
- [react-native-safe-area-context](https://github.com/th3rdwave/react-native-safe-area-context) — Safe area handling for notches and home indicators
