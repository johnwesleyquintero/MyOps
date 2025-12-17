
# MyOps

> **Status:** System v2.2 (The Generalist Update)
> **Architecture:** Serverless / Sovereign / Offline-First
> **Cost:** $0.00 / month

<img width="1536" height="1024" alt="image" src="https://github.com/user-attachments/assets/e0a0c955-7ce4-4a2d-8a09-08a32f5d3861" />

**MyOps** is a sovereign task execution system. It replaces complex project management SaaS with a lightweight, operator-grade interface backed by Google Sheets. It is designed for high-agency individuals who demand speed, ownership, and precision.

---

## Core Capabilities

### ⚡ Zero-Latency Core
Built on an **Optimistic UI** architecture. Actions (create, update, delete) happen instantly in the interface while syncing to the sovereign cloud (Google Sheets) in the background. No loading spinners. No waiting.

### 🕸️ Execution Graph (Dependencies)
Tasks are no longer isolated. Link tasks to create dependency chains.
- **Visual Blockers:** The interface highlights blocked tasks in Red.
- **Clearance:** Indicators turn Gray when dependencies are resolved.
- **Logic:** Works across Table and Kanban views.

### 📝 Rich Intel (Markdown)
Precision in communication. The description field supports full Markdown syntax.
- **Formatting:** Bold, Italics, Lists, Code blocks.
- **Toolbar:** One-click formatting tools.
- **Preview:** Toggle between raw markdown and rendered view.

### 🔭 Mission Control Views
Three distinct operational lenses:
1.  **Table:** High-density data view for bulk management.
2.  **Kanban:** Flow state visualization for status tracking.
3.  **Gantt:** Timeline view for temporal planning (14-day rolling window).

### ⌨️ Keyboard Command
Navigate without leaving the keyboard.
- `c` : Create new task
- `/` : Global Search
- `g` then `d` : Go to Dashboard
- `g` then `m` : Go to Mission Control
- `?` : View all shortcuts

---

## Sovereign Architecture

MyOps uses **Google Apps Script** as a lightweight execution layer over Google Sheets. Each user deploys their **own script**, bound to **their own spreadsheet**. 

**There is no shared backend and no central database.**

### Data Ownership & Security Model

*   Your data lives **only** in your Google Sheet.
*   The Apps Script runs **under your Google account** (`Execute as: Me`).
