# Government-Style Minimalist Emergency Portal Redesign Plan

## Overview
Transform the frontend into an authentic, ultra-lightweight, high-performance **Government of India / Emergency Response Support System (ERSS)** style portal for demo video recording. The redesign focuses on extreme simplicity, fast rendering on all hardware, removing file ingestion, eliminating backend bloat, and implementing real-time dialogue transcription while the microphone is recording.

---

## User Review Required

> [!IMPORTANT]
> **Key Architectural & Visual Pivots:**
> 1. **Government Portal Design**: Clean official layout with deep navy header (`#1e3a8a` / `#0f2942`), subtle tricolor national accent strip, official bilingual typography, crisp borders, and zero heavy 3D animations or CPU-intensive loops.
> 2. **Removed File Ingestion**: All drag-and-drop and file upload mechanisms are completely removed.
> 3. **Live Microphone Recording with Real-Time Transcription**: When the operator clicks "Start Call Recording", the browser captures audio from the microphone while streaming the dialogue line-by-line in real-time (word-by-word / chunk-by-chunk) onto the screen as if Whisper/ASR is transcribing live.
> 4. **Swappable Demo Script**: A clean file `src/data/demoScript.ts` will hold the exact dialogue script. We will preload a standard realistic crisis helpline dialogue, which you can replace with your custom script at any time.
> 5. **Zero Backend Bloat**: All complex mock latencies and unused service layers are removed. Fast, rock-solid client-side state.

---

## Proposed Changes

### 1. Style & Theme Simplification

#### [MODIFY] [src/index.css](file:///c:/Users/Hanniel/Desktop/sih%2026/newfront/Blaze-Frontend/src/index.css)
- Replace dark/lime styling with authentic government emergency portal colors:
  - Header: Deep Navy Blue (`#1e3a8a` / `#172554`)
  - Accent: Tricolor accent bar (Saffron `#f97316`, White `#ffffff`, Green `#16a34a`)
  - Background: Clean institutional light gray (`#f8fafc` / `#ffffff`)
  - Cards: Crisp borders (`border-slate-200` / `border-slate-300`), sharp clean badges, no heavy glows.
- Minimal CSS footprint for instant 60fps rendering on low-end hardware.

---

### 2. Live Transcription Script Engine

#### [NEW] [src/data/demoScript.ts](file:///c:/Users/Hanniel/Desktop/sih%2026/newfront/Blaze-Frontend/src/data/demoScript.ts)
- Create an easily editable script configuration file.
- Contains speaker turns, timestamps, text, detected stress indicator tags, and final SVI assessment output.
- When you send your audio script, we simply paste it into this file.

---

### 3. Core Pages & Layout

#### [MODIFY] [src/components/AppShell.tsx](file:///c:/Users/Hanniel/Desktop/sih%2026/newfront/Blaze-Frontend/src/components/AppShell.tsx)
- Replace floating pill with official Government Portal Header:
  - Top emergency helpline strip: "National Emergency Helpline: 112 | Women Helpline: 1091 | Cyber Crime: 1930"
  - Official emblem / badge: "Government of India / Ministry of Home Affairs - ERSS Sahaaya AI"
  - Clean simple tabs: **Live Call Triage (Recording & Transcription)**, **Call Ledger**, **System Guidelines**
  - Operator badge: "Operator: Dr. Sarah Lin (Shift In-Charge)"

#### [MODIFY] [src/pages/VoiceAnalysis.tsx](file:///c:/Users/Hanniel/Desktop/sih%2026/newfront/Blaze-Frontend/src/pages/VoiceAnalysis.tsx)
- Completely replace with **Live Call Triage Console**:
  - **No file upload**: Purely "Start Call Recording" button with mic access and simple audio level indicator.
  - While recording, the transcript pane actively types out dialogue lines with speaker labels (`Caller`, `Operator`) and timestamps as the call progresses.
  - Visual indicators for detected distress words (e.g. "Fear", "Threat", "Trauma").
  - On "End Call / Stop Recording", instantly produces the triage summary: SVI Score, Risk Level (High/Critical/Moderate), and simple Emergency Action buttons ("Dispatch Response Team", "Mark Reviewed").

#### [MODIFY] [src/pages/Dashboard.tsx](file:///c:/Users/Hanniel/Desktop/sih%2026/newfront/Blaze-Frontend/src/pages/Dashboard.tsx)
- Streamline into a clean, official **Emergency Call Ledger**:
  - Clear high-contrast table of triaged calls with call duration, dialect, risk category, and operator status.
  - Simple summary count cards (Total Calls, Critical Calls, High Priority, Dispatched).

#### [DELETE/CLEANUP]
- Remove unused components and files:
  - Remove fake file ingestion logic from `analysisService.ts`.
  - Simplify `AudioPlayer.tsx` and `Waveform.tsx` to lightweight versions.

---

## Verification Plan

### Automated Tests
- Run `npm run build` to verify 0 TypeScript errors.
- Run `npm run lint` with oxlint to verify 0 linter warnings.

### Manual Verification
- Open in browser:
  - Check the official government portal appearance (header, tricolor banner, clear typography).
  - Click "Start Call Recording" with microphone enabled.
  - Verify live transcription streams dialogue line-by-line in real time while recording.
  - Stop recording and verify instant assessment summary.
