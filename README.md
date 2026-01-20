# MyOps

> **Tagline:** The Solo Operator Command Center
> **Status:** System v2.5 (The Operator-Architect Update)
> **Architecture:** Serverless / Sovereign / Offline-First
> **Cost:** $0.00 / month

<img width="1536" height="1024" alt="MyOps UI" src="https://github.com/user-attachments/assets/e0a0c955-7ce4-4a2d-8a09-08a32f5d3861" />

**MyOps** is a sovereign operating system for solo operators. It replaces fragmented SaaS tools with a **unified, operator-grade interface** powered by your own Google infrastructure. It is designed for **high-agency individuals** who demand **total ownership, zero latency, and strategic clarity**.

---

## The 7 Pillars of MyOps

MyOps isn't just a task manager; it's a closed-loop system for executing at the highest level:

1.  **⚡ Execution:** High-speed mission board, dependency tracking, and velocity metrics.
2.  **🧠 Memory:** Integrated IP registry (Assets), post-mortems (Reflections), and decision journals.
3.  **🤝 Relationships:** A streamlined CRM with interaction history and context.
4.  **🧘 Self-Regulation:** Real-time tracking of mental state (energy/clarity) and life constraints.
5.  **🔐 Security:** A sovereign vault for sensitive data, hosted on your private infra.
6.  **🔭 Strategy:** Strategic decision logs, outcome tracking, and assumptions testing.
7.  **🤖 Intelligence:** WesAI—a context-aware co-pilot that lives inside your board.

---

## Core Capabilities

### ⚡ Zero-Latency Execution

- **Optimistic UI:** Actions happen **instantly** (ms) while syncing in the background.
- **Dependency Graph:** Link tasks to visualize bottlenecks and critical paths.
- **Multi-View:** Switch between Table, Kanban, and a 14-day rolling Gantt timeline.

### 🧠 Neural Link (WesAI)

- **Agentic Co-pilot:** Powered by **Google Gemini 3 Flash**.
- **Context-Aware:** WesAI has full read/write access to your missions, CRM, and knowledge base.
- **Operator Tone:** A brotherly, high-agency partner that helps you organize the board.

### 📝 Rich Intel & Assets

- **Markdown Core:** Full support for SOPs, documentation, and rich notes.
- **IP Registry:** Track reusability and monetization potential of your frameworks.
- **Reflections:** Automated learning loops and mistake logs to prevent systemic failure.

### ⌨️ Keyboard-First Workflow

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

- **Infrastructure:** Google Apps Script + Google Sheets.
- **Cost:** $0/month (forever).
- **Ownership:** No central database. You own the script, the sheet, and the data.

### Data Sovereignty & Recovery

- **Local-First:** The app runs in your browser; the data lives in your cloud.
- **Zero Lock-in:** Your data is always available in human-readable Google Sheets.
- **Disaster Recovery:** If the UI fails, you can manage your missions directly in the sheet.

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
