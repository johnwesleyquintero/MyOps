
# MyOps

> **Status:** System v2.2 (The Generalist Update)
> **Architecture:** Serverless / Sovereign / Offline-First
> **Cost:** $0.00 / month

![System Architecture](https://chatgpt.com/backend-api/estuary/content?id=file_00000000a5dc71faaca5cebed10a83c1&ts=490538&p=fs&cid=1&sig=a05080a7741208f86f032f6c6ef58fe644e436d0f2e87245cccfbcc5bd190138&v=0)

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
*   The frontend communicates using:
    *   Your personal Web App URL.
    *   A private API token (`API_SECRET`).
*   This app does **not** store, sync, or proxy any user data externally.

> **Disclaimer:** If you delete your Sheet or Script, your data is gone — by design. You are responsible for your own backups.

---

## Deployment Protocol

### Phase 1: The Vault (Google Sheets)

1. Create a new **Google Sheet**.
2. Rename the sheet (tab) at the bottom to `tasks`. **(Case sensitive)**.
3. Create the following headers in **Row 1**:

| Col A | Col B | Col C | Col D | Col E | Col F | Col G | Col H |
|-------|-------|-------|-------|-------|-------|-------|-------|
| date | description | project | priority | status | createdAt | id | dependencies |

> **Note:** Column H (`dependencies`) stores a JSON array of blocking task IDs.

### Phase 2: The Gateway (Google Apps Script)

1. Inside your Google Sheet, go to **Extensions > Apps Script**.
2. Rename the project to `MyOps API`.
3. **Get the Code:**
   - Open the MyOps Web App (this repo running locally).
   - Click **System Config** (Sidebar) > **Backend Code**.
   - Copy the script.
4. Paste it into `Code.gs` in the Google Script editor.
5. **CRITICAL:** Change the `API_SECRET` variable at the top of the file to a strong password.
   ```javascript
   // WARNING:
   // This script runs with YOUR Google account permissions.
   // Do not expose your Web App URL or API_SECRET publicly.
   const API_SECRET = "CHANGE_THIS_TO_A_STRONG_SECRET"; 
   ```
6. Click **Deploy > New Deployment**.
   - **Select type:** Web app.
   - **Description:** `v2.2`.
   - **Execute as:** `Me` (your email).
   - **Who has access:** `Anyone` (Security is handled by your API Token).
7. Copy the **Web App URL**.

### Phase 3: The Interface (Frontend)

1. Clone this repository.
2. Install dependencies: `npm install`
3. Start the local server: `npm start`
4. Click **System Config** > **Connection**.
5. Switch to **Live Mode**.
6. Paste your **Web App URL** and **API Secret Token**.
7. Save.

---

## API Reference (The Engine Room)

If you wish to interact with your system programmatically outside of this UI, the following endpoints are available on your Web App URL.

### Authentication
All requests must include your `token` (API Secret).

### Read Tasks
*   **Method:** `GET`
*   **Params:** `?token=YOUR_SECRET`
*   **Returns:** JSON array of tasks.

### Create Task
*   **Method:** `POST`
*   **Payload:**
    ```json
    {
      "token": "YOUR_SECRET",
      "action": "create",
      "entry": {
        "date": "2025-01-01",
        "description": "Task description",
        "project": "Inbox",
        "priority": "Medium",
        "status": "Backlog",
        "dependencies": []
      }
    }
    ```

### Concurrency
Writes are protected with `LockService` to prevent race conditions. Google Apps Script has quota limits; if you hit them, execution will pause temporarily, but you will not be charged.

---

*"Own your operation, own your life."*
