# MyOps

> **Status:** System v2.2 (The Generalist Update)
> **Architecture:** Serverless / Sovereign / Offline-First
> **Cost:** $0.00 / month

<img width="1536" height="1024" alt="MyOps UI" src="https://github.com/user-attachments/assets/e0a0c955-7ce4-4a2d-8a09-08a32f5d3861" />

**MyOps** is a sovereign task execution system. It replaces complex project management SaaS with a **lightweight, operator-grade interface** powered by Google Sheets. It is designed for **high-agency individuals** who demand **speed, ownership, and precision**.

---

## Core Capabilities

### ⚡ Zero-Latency Core

* Built on an **Optimistic UI** architecture: actions (create, update, delete) happen **instantly** in the interface while syncing to Google Sheets in the background.
* No loading spinners. No waiting. Actions feel immediate.

### 🕸️ Execution Graph (Dependencies)

* Tasks are no longer isolated. Link tasks to create **dependency chains**.
* **Blocked tasks:** Red highlight
* **Resolved tasks:** Gray indicator
* Works seamlessly across **Table** and **Kanban** views.

### 📝 Rich Intel (Markdown)

* Task descriptions support full **Markdown syntax**: Bold, Italics, Lists, Code blocks.
* **Toolbar:** One-click formatting tools
* **Preview Mode:** Toggle between raw Markdown and rendered view

### 🔭 Mission Control Views

Three operational lenses for maximum control:

1. **Table:** High-density data view for bulk management
2. **Kanban:** Flow state visualization for status tracking
3. **Gantt:** 14-day rolling timeline view for temporal planning

### ⌨️ Keyboard Commands

Power-user navigation without touching the mouse:

| Shortcut  | Action                |
| --------- | --------------------- |
| `c`       | Create new task       |
| `/`       | Global Search         |
| `g` → `d` | Go to Dashboard       |
| `g` → `m` | Go to Mission Control |
| `?`       | View all shortcuts    |

---

## Sovereign Architecture

MyOps uses **Google Apps Script** as a lightweight execution layer over Google Sheets. Each user deploys **their own script**, bound to **their own spreadsheet**.

**There is no shared backend and no central database.**

### Data Ownership & Security

* Data lives **only** in your Google Sheet.
* Apps Script executes **under your Google account** (`Execute as: Me`).
* **Best Practices:**

  * Use **strong passwords** and **2FA** on your Google account
  * Carefully manage sharing permissions
  * Regularly backup your sheet if needed

### Collaboration Model

* Primarily a **solo operator tool**.
* Multi-user collaboration is possible via **shared Google Sheets**, with each user running their own script.
* Conflicts are minimized by **clear task ownership** and dependency logic.

---

## Onboarding & Deployment

Deploying MyOps is simple, even for non-technical users:

1. **Copy the Spreadsheet Template**

   * Pre-configured with required tables and headers.

2. **Deploy the Apps Script**

   * Follow step-by-step instructions to attach the script to your sheet.
   * Optional: **One-click deploy script** (future update) to fully automate setup.

3. **Start Managing Tasks**

   * Begin creating tasks immediately.
   * Dependencies, views, and shortcuts work out-of-the-box.

> **Tip:** Think of MyOps as your personal mission control — every task you create is instantly actionable, sovereign, and secure.

---

## Power-User Considerations

* Google Apps Script has execution quotas. If you create thousands of tasks at once, the system may temporarily pause.
* For advanced workflows, consider **splitting large projects across multiple sheets**.
* Offline-first and optimistic updates ensure tasks **sync reliably**, even if your connection fluctuates.

---

**Conclusion:**
MyOps is not just task management — it’s a **sovereign operational system**. Fast, autonomous, zero-cost, and fully under your control. Perfect for operators who demand **execution speed, clarity, and ownership**.

---
