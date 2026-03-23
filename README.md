# AgroForestry DMRV Platform — AI Engineering Context

> **Note to AI Assistants (ChatGPT, Claude, Gemini, etc.):** 
> This document provides the architectural context, mental models, and technical constraints of this Digital Measurement, Reporting, and Verification (DMRV) system. 

## 1. Project Overview & Purpose
A high-integrity DMRV platform for agroforestry carbon projects. It digitizes the manual MRV process for voluntary carbon markets (VM0047, Gold Standard ARR). 
The system traces evidence from the field (GPS polygons, tree biometrics, photo evidence) up to verifiable methodology reports for Validation and Verification Bodies (VVBs).

## 2. Monorepo Architecture (Nx)
We use an **Nx Monorepo**. Strict separation of concerns is enforced:
*   `libs/constants`: Species registry, enums, SDG metadata.
*   `libs/core-logic`: Carbon calculators, GeoJSON validators.
*   `apps/api-service`: Node/Express Backend.
*   `apps/admin-portal`: React/Vite/Leaflet Web UI.

## 3. High-Integrity Architecture (Phase 6 & 7)
The system has been recently refactored to enforce a **Strict Hierarchical & Project-First** lifecycle:

### A. Project-First Workflow
*   **Launchpad Entry**: Users are mandated to select/create a project via the `Project Launchpad` before any management modules (Farmers, Plots, LCA) become active.
*   **State Scoping**: The frontend `ProjectContext` and backend `apiFetch` interceptors automatically append `projectId` to all data queries.

### B. Farm-Wise Baseline Architecture (Critical)
*   **Mandatory Onboarding**: Every `FarmPlot` must define a "Year 0" inventory (Baseline) during registration. 
*   **Inventory Data**: Baseline includes `initialSoilCarbonContent`, `existingTreeCount`, and `historicalLandUse`.
*   **LCA Engine**: Net Impact calculations sum individual farm-level baselines (`baselineBiomassCO2e`) rather than using global project constants.

## 4. Tech Stack & Constraints
*   **Database**: MongoDB via Mongoose.
*   **Frontend**: React 19, React Router v7, Leaflet.
*   **Styling**: Vanilla CSS Variables (Light Theme). **No Tailwind**.
*   **Spatial Integrity**: Trees must geometrically fall within FarmPlot polygons (validated in `core-logic`).

## 5. Domain Models
1.  **Project**: Certification standard (Verra/GS) and methodology configuration.
2.  **Farmer**: Social data and FPIC consent tracking.
3.  **FarmPlot**: GeoJSON Polygon + required `baseline` nested object.
4.  **Tree**: GeoJSON Point + biometrics; strictly scoped to a `farmId` and `projectId`.

## 6. Execution Commands
Execute from the workspace root or respective app directories:

*   **Install**: `npm install` (or `pnpm install`)
*   **Admin UI**: `cd apps/admin-portal && npm run dev` (Port 4202)
*   **API Service**: `cd apps/api-service && npm run dev` (Port 3333)
*   **Seed History**: `cd apps/api-service && npm run seed` (Resets DB with high-integrity project data)

When generating code, ensure imports resolve via Nx aliases (e.g., `@dmrv/constants`) and maintain the hierarchical security scoping.
