export const GAS_BACKEND_CODE = `// --- CONFIGURATION ---
const API_SECRET = "myops-secret-key"; // <--- CHANGE THIS
const SLACK_WEBHOOK_URL = ""; // <--- PASTE YOUR WEBHOOK URL HERE
// ---------------------

/**
 * 🛠️ SETUP INSTRUCTION:
 * 1. Paste your Slack Webhook URL above.
 * 2. Select 'setupSystem' from the function dropdown menu in the toolbar.
 * 3. Click 'Run'. This will create all necessary sheets (tasks, contacts, interactions, notes, vault, automations).
 * 4. Google WILL ask for permissions. Click "Review Permissions" -> Choose Account -> Advanced -> Go to MyOps API (unsafe) -> Allow.
 * 5. (Optional) Run 'testSlack' to verify notification connectivity.
 * 6. Deploy > Manage Deployments > Edit > Version: New Version > Deploy.
 */

function setupSystem() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const modules = ['tasks', 'contacts', 'interactions', 'notes', 'vault', 'automations', 'strategy', 'awareness', 'assets'];
  
  modules.forEach(m => {
    let sheet = ss.getSheetByName(m);
    if (!sheet) {
      sheet = ss.insertSheet(m);
      // Optional: Add headers
      let headers = [];
      if (m === 'tasks') headers = ['Date', 'Description', 'Project', 'Priority', 'Status', 'CreatedAt', 'ID', 'Dependencies'];
      if (m === 'contacts') headers = ['ID', 'Name', 'Email', 'Phone', 'Company', 'Type', 'Status', 'Tags', 'Notes', 'CreatedAt', 'LastInteraction'];
      if (m === 'interactions') headers = ['ID', 'ContactID', 'Date', 'Type', 'Notes', 'TaskID'];
      if (m === 'notes') headers = ['ID', 'Title', 'Content', 'Tags', 'CreatedAt', 'UpdatedAt'];
      if (m === 'vault') headers = ['ID', 'Label', 'Category', 'Value', 'CreatedAt'];
      if (m === 'automations') headers = ['ID', 'Name', 'Trigger', 'Action', 'Status', 'LastRun'];
      if (m === 'strategy') headers = ['ID', 'Date', 'Title', 'Context', 'Options', 'Decision', 'ExpectedOutcome', 'ReviewDate', 'Status', 'Impact', 'Tags'];
      if (m === 'awareness') headers = ['ID', 'Date', 'Energy', 'Clarity', 'Notes'];
      if (m === 'assets') headers = ['ID', 'Title', 'Type', 'Status', 'ReusabilityScore', 'MonetizationPotential', 'Notes', 'CreatedAt', 'UpdatedAt', 'Link'];
      
      if (headers.length > 0) {
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
        sheet.setFrozenRows(1);
      }
    }
  });
  
  Logger.log("✅ System setup complete. All sheets initialized.");
}

function testSlack() {
  if (!SLACK_WEBHOOK_URL) {
    Logger.log("❌ Error: SLACK_WEBHOOK_URL is empty.");
    return;
  }
  
  Logger.log("📡 Attempting connection to Slack...");
  const check = UrlFetchApp.fetch(SLACK_WEBHOOK_URL, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify({ text: "🔌 System Check: Auth Validated" }),
    muteHttpExceptions: true
  });
  
  Logger.log("✅ Connection successful (Code: " + check.getResponseCode() + ")");

  notifySlack("create", {
    description: "System Connection Test",
    project: "MyOps",
    priority: "High",
    status: "Active"
  }, "tasks");
  Logger.log("✅ Rich notification sent.");
}

function doGet(e) {
  if (!e || !e.parameter) {
    return ContentService.createTextOutput("MyOps Online.");
  }

  const token = e.parameter.token;
  if (token !== API_SECRET) {
    return errorResponse("Unauthorized: Invalid Token");
  }

  const module = e.parameter.module || 'tasks';
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(module);
  if (!sheet) return errorResponse("Sheet '" + module + "' not found. Run setupSystem().");
  
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return jsonResponse([]);

  const entries = data.slice(1).map(row => {
    return mapRowToEntry(row, module);
  }).filter(e => e !== null);

  return jsonResponse(entries);
}

function doPost(e) {
  if (!e || !e.postData) {
    return ContentService.createTextOutput("MyOps Online.");
  }

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000); 
    
    const payload = JSON.parse(e.postData.contents);
    
    if (payload.token !== API_SECRET) {
       return errorResponse("Unauthorized: Invalid Token");
    }

    const module = payload.module || 'tasks';
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(module);
    if (!sheet) return errorResponse("Sheet '" + module + "' not found");
    
    const action = payload.action || 'create';
    const entry = payload.entry;

    if (action === 'create') {
      const id = entry.id || Utilities.getUuid();
      const newRow = mapEntryToRow({ ...entry, id: id }, module);
      sheet.appendRow(newRow);
      if (module === 'tasks') notifySlack("create", { ...entry, id: id }, module);
      return jsonResponse({ status: "success", id: id });
    } 
    
    else if (action === 'update') {
      if (!entry.id) return errorResponse("ID required for update");
      const data = sheet.getDataRange().getValues();
      const idCol = getIdColumnIndex(module);
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][idCol] == entry.id) {
          const updatedRow = mapEntryToRow(entry, module);
          sheet.getRange(i + 1, 1, 1, updatedRow.length).setValues([updatedRow]);
          if (module === 'tasks') notifySlack("update", entry, module);
          return jsonResponse({ status: "updated" });
        }
      }
      return errorResponse("ID not found");
    }
    
    else if (action === 'delete') {
      if (!entry.id) return errorResponse("ID required for delete");
      const data = sheet.getDataRange().getValues();
      const idCol = getIdColumnIndex(module);

      for (let i = 1; i < data.length; i++) {
        if (data[i][idCol] == entry.id) {
          const deletedTask = { id: entry.id, description: data[i][1] };
          sheet.deleteRow(i + 1);
          if (module === 'tasks') notifySlack("delete", deletedTask, module);
          return jsonResponse({ status: "deleted" });
        }
      }
      return errorResponse("ID not found");
    }

  } catch (err) {
    return errorResponse(err.toString());
  } finally {
    lock.releaseLock();
  }
}

function getIdColumnIndex(module) {
  switch(module) {
    case 'tasks': return 6;
    default: return 0;
  }
}

function mapRowToEntry(row, module) {
  try {
    if (module === 'tasks') {
      let dateVal = row[0];
      if (Object.prototype.toString.call(dateVal) === '[object Date]') {
        dateVal = Utilities.formatDate(dateVal, Session.getScriptTimeZone(), "yyyy-MM-dd");
      }
      let deps = [];
      try { if (row[7] && row[7] !== "") deps = JSON.parse(row[7]); } catch (e) {}
      
      return {
        date: dateVal || "", 
        description: row[1] || "",
        project: row[2] || "Inbox",
        priority: row[3] || "Medium",
        status: row[4] || "Backlog",
        createdAt: row[5] || "",
        id: row[6] || "",
        dependencies: deps
      };
    }
    
    if (module === 'contacts') {
      let tags = [];
      try { if (row[7] && row[7] !== "") tags = JSON.parse(row[7]); } catch (e) {}
      return {
        id: row[0], name: row[1], email: row[2], phone: row[3],
        company: row[4], type: row[5], status: row[6], tags: tags,
        notes: row[8], createdAt: row[9], lastInteraction: row[10],
        interactions: [] // Loaded separately
      };
    }

    if (module === 'interactions') {
      return {
        id: row[0], contactId: row[1], date: row[2], type: row[3], notes: row[4], taskId: row[5]
      };
    }

    if (module === 'notes') {
      let tags = [];
      try { if (row[3] && row[3] !== "") tags = JSON.parse(row[3]); } catch (e) {}
      return {
        id: row[0], title: row[1], content: row[2], tags: tags, createdAt: row[4], updatedAt: row[5]
      };
    }

    if (module === 'vault') {
      return { id: row[0], label: row[1], category: row[2], value: row[3], createdAt: row[4] };
    }

    if (module === 'automations') {
      return { id: row[0], name: row[1], trigger: row[2], action: row[3], status: row[4], lastRun: row[5] };
    }

    if (module === 'strategy') {
      let options = [];
      try { if (row[4] && row[4] !== "") options = JSON.parse(row[4]); } catch (e) {}
      let tags = [];
      try { if (row[10] && row[10] !== "") tags = JSON.parse(row[10]); } catch (e) {}
      
      return {
        id: row[0], date: row[1], title: row[2], context: row[3],
        options: options, decision: row[5], expectedOutcome: row[6],
        reviewDate: row[7], status: row[8], impact: row[9], tags: tags
      };
    }

    if (module === 'awareness') {
      return {
        id: row[0],
        date: row[1],
        energy: row[2],
        clarity: row[3],
        notes: row[4]
      };
    }

    if (module === 'assets') {
      return {
        id: row[0],
        title: row[1],
        type: row[2],
        status: row[3],
        reusabilityScore: row[4],
        monetizationPotential: row[5],
        notes: row[6],
        createdAt: row[7],
        updatedAt: row[8],
        link: row[9]
      };
    }
  } catch (e) {
    return null;
  }
  return null;
}

function mapEntryToRow(entry, module) {
  if (module === 'tasks') {
    return [
      entry.date, entry.description, entry.project, entry.priority, entry.status,
      entry.createdAt || new Date().toISOString(), entry.id, JSON.stringify(entry.dependencies || [])
    ];
  }
  if (module === 'contacts') {
    return [
      entry.id, entry.name, entry.email || "", entry.phone || "", entry.company || "",
      entry.type, entry.status, JSON.stringify(entry.tags || []), entry.notes || "",
      entry.createdAt || new Date().toISOString(), entry.lastInteraction || ""
    ];
  }
  if (module === 'interactions') {
    return [entry.id, entry.contactId, entry.date, entry.type, entry.notes, entry.taskId || ""];
  }
  if (module === 'notes') {
    return [
      entry.id, entry.title, entry.content, JSON.stringify(entry.tags || []),
      entry.createdAt || new Date().toISOString(), entry.updatedAt || new Date().toISOString()
    ];
  }
  if (module === 'vault') {
    return [entry.id, entry.label, entry.category, entry.value, entry.createdAt || new Date().toISOString()];
  }
  if (module === 'automations') {
    return [entry.id, entry.name, entry.trigger, entry.action, entry.status, entry.lastRun || ""];
  }
  if (module === 'strategy') {
    return [
      entry.id, entry.date, entry.title, entry.context, JSON.stringify(entry.options || []),
      entry.decision, entry.expectedOutcome, entry.reviewDate, entry.status, entry.impact,
      JSON.stringify(entry.tags || [])
    ];
  }
  if (module === 'awareness') {
    return [
      entry.id, entry.date, entry.energy, entry.clarity, entry.notes || ""
    ];
  }
  if (module === 'assets') {
    return [
      entry.id, entry.title, entry.type, entry.status, entry.reusabilityScore,
      entry.monetizationPotential, entry.notes || "", entry.createdAt || new Date().toISOString(),
      entry.updatedAt || new Date().toISOString(), entry.link || ""
    ];
  }
  return [];
}

function notifySlack(action, entry, module) {
  if (!SLACK_WEBHOOK_URL || SLACK_WEBHOOK_URL === "" || module !== 'tasks') return;
  
  const desc = entry.description || "No description";
  const proj = entry.project || "Inbox";
  const prio = entry.priority || "Medium";
  const stat = entry.status || "Backlog";
  
  let headerText = "";
  let colorEmoji = "⚪";

  if (action === "create") {
    headerText = "New Mission Initialized";
    colorEmoji = "🔵";
  } else if (action === "update") {
    if (stat === "Done") {
      headerText = "Mission Accomplished";
      colorEmoji = "🟢";
    } else {
      headerText = "Mission Update";
      colorEmoji = "🟠";
    }
  } else if (action === "delete") {
    headerText = "Mission Aborted";
    colorEmoji = "🔴";
  }

  const payload = {
    "text": \`\${colorEmoji} \${headerText}: \${desc}\`,
    "blocks": [
      {
        "type": "header",
        "text": {
          "type": "plain_text",
          "text": \`\${colorEmoji}  \${headerText}\`,
          "emoji": true
        }
      },
      {
        "type": "section",
        "fields": [
          { "type": "mrkdwn", "text": \`*Mission:*\n\${desc}\` },
          { "type": "mrkdwn", "text": \`*Project:*\n\${proj}\` }
        ]
      },
      {
        "type": "section",
        "fields": [
          { "type": "mrkdwn", "text": \`*Priority:*\n\${prio}\` },
          { "type": "mrkdwn", "text": \`*Status:*\n\${stat}\` }
        ]
      },
      { "type": "divider" },
      {
        "type": "context",
        "elements": [
          { "type": "plain_text", "text": "MyOps Sovereign System", "emoji": true }
        ]
      }
    ]
  };

  try {
    UrlFetchApp.fetch(SLACK_WEBHOOK_URL, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
  } catch (err) {
    Logger.log("Slack notification failed: " + err);
  }
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function errorResponse(msg) {
  return ContentService.createTextOutput(JSON.stringify({status: "error", message: msg}))
    .setMimeType(ContentService.MimeType.JSON);
}`;
