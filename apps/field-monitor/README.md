# Field Monitor — React Native Mobile App

## Overview

This is the placeholder for the **offline-first React Native mobile application** used by Digital Runners (field enumerators) to collect ground-truth data in the field.

## Intended Feature Set

### Core Features
- **Offline-First Architecture**: Full data capture without internet using Realm/SQLite + queue-based sync
- **GPS Polygon Boundary Tool**: Walk-around boundary plotting for farm polygon creation
- **Scientific Decision Tree**: Family → Genus → Species hierarchical selector preventing data entry errors
- **Photo Evidence (EXIF)**: Mandatory photos with embedded GPS and timestamp metadata
- **Tree Inventory**: Individual tree measurement (DBH, height, condition) with auto-carbon calculation
- **Digital Consent Capture**: FPIC documentation with timestamped photos and farmer signatures

### Technical Architecture
- **Framework**: React Native (cross-platform iOS/Android)
- **Offline Storage**: Realm or AsyncStorage with conflict resolution queue
- **Sync Service**: Queue-based sync to `/api/sync` with exponential backoff and 409 conflict handling
- **Maps**: react-native-maps with offline tile caching
- **Connectivity**: @react-native-community/netinfo for connection state monitoring
- **OCR**: ML Kit for land title deed and ID document scanning

### Module Structure
```
field-monitor/
├── src/
│   ├── screens/
│   │   ├── HomeScreen.ts        # Dashboard with assigned tasks
│   │   ├── FarmerScreen.ts      # Farmer registration form
│   │   ├── PlotScreen.ts        # Polygon boundary capture
│   │   ├── TreeScreen.ts        # Tree inventory form
│   │   ├── ActivityScreen.ts    # Activity logging
│   │   └── ConsentScreen.ts     # FPIC digital consent
│   ├── services/
│   │   ├── SyncService.ts       # Offline queue + sync logic
│   │   ├── LocationService.ts   # GPS tracking
│   │   └── CameraService.ts     # Photo with EXIF
│   ├── stores/
│   │   └── OfflineStore.ts      # Local data persistence
│   └── navigation/
│       └── AppNavigator.ts      # Stack navigator
├── package.json
└── README.md
```

### Shared Logic
This app consumes the same `@dmrv/core-logic` and `@dmrv/constants` libraries as the admin portal, ensuring:
- Identical species decision tree validation
- Consistent carbon calculation formulas
- Shared TypeScript interfaces

## Setup Instructions
> **Note**: Building this app requires React Native CLI, Xcode (iOS), or Android Studio (Android). See the [React Native environment setup guide](https://reactnative.dev/docs/environment-setup).
