# Mobile Order Tracker - Digital Heroes Qualification Task

A premium, highly polished 2-screen **Order Tracker** mobile application built with **React Native (Expo)**, **TypeScript**, and **React Native Reanimated**. This project qualifies for the **Mobile App Developer (Role 06)** internship programme at Digital Heroes.

---

## 🚀 Live Preview & Code Links

- **GitHub Repository**: https://github.com/SidakSethi-Singh/mobile-order-tracker

---

## ✨ Features Built

### Screen 1: Order Listing (`src/app/index.tsx`)
- **Real-Time Search & Filtering**: Instant search across order IDs, customer names, and specific items. Filter orders by status (Processing, Shipped, Out for Delivery, Delivered, Cancelled) via a horizontal scrolling chip selector.
- **Pull-To-Refresh**: Standard mobile pull gesture to reload order database with micro-animations.
- **Skeleton Shimmer Loading**: Native-feeling placeholder cards that pulse gently during loading states.
- **Empty & Error UI States**: Illustrated empty search results screen and robust error screen with retry triggers.
- **Enterprise Metrics Dashboard**: Added a mini-stats bar at the top displaying total, pending, transit, and completed orders.
- **Haptic Interactions**: Micro-vibrations via `expo-haptics` trigger on filter interactions for tactile feedback.

### Screen 2: Order Detail (`src/app/orders/[id].tsx`)
- **Vertical Status Timeline**: Interactive milestone tracker displaying order status (Placed ➔ Processing ➔ Shipped ➔ Out for Delivery ➔ Delivered) with precise time markings.
- **Live Route Tracking Map**: A beautiful route visualizer card that displays en-route GPS tracking paths, pulsing waves, and an animated delivery vehicle.
- **State Transition Simulator**: An interactive button that advances the tracking state of the order in local memory dynamically, triggering success haptics.
- **State Transition Animations**: Spring-based staggering animations for card entrances and timeline path transitions.
- **Interactive Details**: Dynamic calculations of tax, totals, shipping, and breakdown of multiple item purchases.

### Task B Additions: Polish & Robustness
- **Offline Mode Support**: Utilizes `@react-native-community/netinfo` to detect offline states. Returns cached orders from `@react-native-async-storage/async-storage` when disconnected so the app remains fully functional.
- **Interactive Developer Panel**: Added a hidden-on-demand dev tools panel at the header to **"Simulate Offline Mode"** and **"Simulate Server Error (500)"** instantly on any emulator, device, or web browser. This facilitates recording the Loom video.
- **Credit Line Requirement**: Visible credit footer linking to `digitalheroesco.com` across both screens.


---

## 🛠️ Tech Stack & Dependencies

- **Framework**: Expo (SDK 57) / React Native
- **Language**: TypeScript
- **Styling**: StyleSheet API (Indigo / Slate Premium Palette)
- **Animations**: React Native Reanimated (Spring transitions & staggered layout entrances)
- **Device Utilities**: NetInfo (Network monitoring), AsyncStorage (Local storage caching)

---

## 📦 How to Setup & Run

### Prerequisites
Make sure you have [Node.js](https://nodejs.org) (v18+) and `npm` installed.

### 1. Clone the project and install dependencies
```bash
npm install
```

### 2. Run the application
You can run this project on the web, Android, or iOS:

#### Web Preview (Highly Recommended for Instant Testing)
```bash
npm run web
```

#### Expo Go / Emulators
```bash
# Start Expo bundler
npx expo start

# Press 'a' for Android emulator or 'i' for iOS simulator (requires macOS)
```

---

## 💡 Key Design & Architecture Decisions

### 1. Hybrid Offline-First Strategy
To handle flaky network connections, we query the network state dynamically using `NetInfo` and try fetching from the remote URL. If successful, we save the payload to `AsyncStorage`. If the network fails, we automatically fall back to loading the serialized cache. If no cache exists, we degrade gracefully to bundled mock data.

### 2. Declarative Milestone Path Tracking
Rather than mapping simple state strings, the details screen defines standard progress milestones. It overlays actual timestamped timeline data from the database onto these milestones, showing future stages as greyed-out / dashed nodes, and past stages with full checkmarks. Cancelled orders automatically route to a simplified 2-step timeline.

### 3. Integrated Developer Controls
Because simulating connection loss or API server crashes on a mobile simulator can be tedious (requiring system settings adjustment or code editing), we built an in-app **Dev Tools** panel. Reviews can toggle switches to force the API layer to raise server errors or report an offline network, confirming correct state transitions instantly.

---

## 📝 Verification Checks
All TypeScript files compile without errors:
```bash
npx tsc --noEmit
# Output: Success (No errors)
```
