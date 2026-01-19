# MyOps

> **Tagline:** The Master Solo VA App
> **Status:** System v2.2 (The Master Solo VA Update)
> **Architecture:** Serverless / Sovereign / Offline-First
> **Cost:** $0.00 / month

<img width="1536" height="1024" alt="MyOps UI" src="https://github.com/user-attachments/assets/e0a0c955-7ce4-4a2d-8a09-08a32f5d3861" />

**MyOps** is a sovereign task execution system. It replaces complex project management SaaS with a **lightweight, operator-grade interface** powered by Google Sheets. It is designed for **high-agency individuals** who demand **speed, ownership, and precision** in their master solo VA environment.

---

## Core Capabilities

### ⚡ Zero-Latency Core

- Built on an **Optimistic UI** architecture: actions (create, update, delete) happen **instantly** while syncing in the background.
- No spinners. No waiting. Immediate feedback.

### 🕸️ Execution Graph (Dependencies)

- Link tasks to create **dependency chains**.
- **Blocked tasks:** Red highlight
- **Resolved tasks:** Gray indicator
- Works across **Table** and **Kanban** views.

### 🧠 Neural Link (WesAI)

- **Integrated Intelligence:** Built-in chat interface powered by **Google Gemini 3 Flash**.
- **Context Aware:** WesAI has read/write access to your board. It knows your active missions.
- **Agentic Capabilities:**
  - _"Add a high priority task to investigate server costs."_ → Creates task.
  - _"What's on my plate today?"_ → Lists active tasks.
  - _"Mark the server task as Done."_ → Updates status.

### 📝 Rich Intel (Markdown)

- Full **Markdown support**: Bold, Italics, Lists, Code blocks.
- **Toolbar:** One-click formatting
- **Preview Mode:** Toggle raw/ rendered Markdown.

### 🔭 Mission Control Views

1. **Table:** Bulk management
2. **Kanban:** Flow visualization
3. **Gantt:** 14-day rolling timeline

### ⌨️ Keyboard Commands

| Shortcut       | Action                |
| -------------- | --------------------- |
| `c`            | Create new task       |
| `k` (Ctrl/Cmd) | Command Palette       |
| `/`            | Global Search         |
| `g` → `d`      | Go to Dashboard       |
| `g` → `m`      | Go to Mission Control |
| `?`            | View all shortcuts    |

---

## Sovereign Architecture

- Google Apps Script + Google Sheets = **fully sovereign, serverless execution**
- **No shared backend. No central database.**
- Each user deploys **their own script**, bound to **their own spreadsheet**.

### Data Ownership & Security

- Data lives **only** in your sheet.
- Apps Script runs **under your Google account**.
- **Best Practices:**
  - Strong passwords & 2FA
  - Careful sharing permissions
  - Backup sheets if needed

### Collaboration Model

- Solo-operator friendly.
- Multi-user collaboration possible via **shared sheets**, each with individual scripts.
- Task ownership + dependency logic minimize conflicts.

---

## 🚀 Quick Deployment (Click & Go)

Follow these steps to get MyOps running in your sheet:

1. **Open Apps Script**
   - `Extensions → Apps Script` in your sheet.
   - Open `Code.gs` and **paste the backend code**.

2. **Set Your Variables**

   ```javascript
   const API_SECRET = "YOUR_SECRET";
   const SLACK_WEBHOOK_URL = "YOUR_WEBHOOK";
   ```

3. **Authorize Slack (Critical)**
   - Select the function `testSlack` → **Run** → accept permissions.

4. **Deploy a New Version**
   - `Deploy → Manage Deployments` → pencil icon → **New Version** → **Deploy**.

5. **Copy Web App URL**
   - Ensure it hasn’t changed (usually stable if editing existing deployment).

> ✅ **Tip:** After deployment, check the modal in MyOps for additional setup instructions.

---

## Power-User Considerations

- Google Apps Script quotas exist; massive task volumes may pause execution temporarily.
- For very large projects, split across multiple sheets.
- Offline-first + optimistic UI ensures reliable sync even with intermittent connections.

---

## Final Thoughts

MyOps is not just task management — it’s a **sovereign operational system**. Fast, autonomous, zero-cost, and fully under your control. Perfect for operators who demand **execution speed, clarity, and ownership**.
