# DMRV Data Entry Mobile App

A React Native CLI mobile application for field enumerators to collect ground-truth data for the Decentralized Monitoring, Reporting, and Verification (DMRV) system.

## 🌟 Key Features

- **Offline-First**: Collect data in remote areas without internet; sync later.
- **Farmer Registration**: Onboard new farmers with socio-economic data and FPIC consent.
- **Plot Mapping**: (Planned) Capture farm boundaries and land-use data.
- **Tree Inventory**: Record tree species, height, DBH, and health metrics.
- **Activity Logging**: Track farm maintenance, planting, and harvesting activities.
- **Earthy UI**: Premium, high-contrast interface designed for readability in bright sunlight.

## 🚀 Tech Stack

- **Framework**: React Native CLI (v0.76)
- **Language**: TypeScript
- **Navigation**: React Navigation (Native Stack & Bottom Tabs)
- **Persistence**: AsyncStorage (for offline queueing)
- **Connectivity**: NetInfo (auto-sync detection)
- **API**: Centralized `fetch` wrapper targeting DMRV API Service.

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18+)
- Java Development Kit (JDK) 17+ (for Android)
- Android Studio / Xcode
- A running instance of the [DMRV API Service](../../apps/api-service)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. **iOS**: Install CocoaPods:
   ```bash
   cd ios && pod install && cd ..
   ```

### Running the App

- **Android**:
  ```bash
  npm run android
  ```

- **iOS**:
  ```bash
  npm run ios
  ```

- **Metro Bundler**:
  ```bash
  npm start
  ```

## 📁 Project Structure

```text
src/
├── components/   # Shared UI components (Input, Buttons, Cards)
├── navigation/   # Tab and Stack navigation logic
├── screens/      # Feature screens (FarmerList, PlotForm, etc.)
├── services/     # API client, Storage, and Sync logic
├── theme/        # Design tokens, colors, and typography
└── types/        # Type definitions mirrored from core-logic
```

## 🔄 Sync Logic

The app uses a **Sync Queue** pattern:
1. Mutations (Create Farmer/Plot) are stored in `AsyncStorage` when offline.
2. The `SyncService` listens for connectivity changes.
3. Once online, the queue is flushed to the API server sequentially.

## 🗺️ Future Roadmap

- [ ] Interactive offline map tiling for boundary drawing.
- [ ] Bluetooth integration for digital calipers/measuring tapes.
- [ ] Photo evidence capture for trees and activities.
- [ ] QR Code generation for farmer IDs.
