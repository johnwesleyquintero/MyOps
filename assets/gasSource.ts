
export const GAS_BACKEND_CODE = `// --- CONFIGURATION ---
const API_SECRET = "myops-secret-key"; // <--- CHANGE THIS to your own strong password
const SLACK_WEBHOOK_URL = ""; // <--- OPTIONAL: Add your Slack Webhook URL here
const SLACK_BOT_NAME = "MyOps System";
// ---------------------

function doGet(e) {
  if (!e || !e.parameter) {
    return ContentService.createTextOutput("MyOps System Online.");
  }

  const token = e.parameter.token;
  if (token !== API_SECRET) {
    return errorResponse("Unauthorized: Invalid Token");
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('tasks');
  if (!sheet) return errorResponse("Sheet 'tasks' not found");
  
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return jsonResponse([]);

  const headers = data.shift();
  
  // Mapping: 
  // 0:Date, 1:Desc, 2:Project, 3:Priority, 4:Status, 5:CreatedAt, 6:ID, 7:Dependencies(JSON)
  const entries = data.map(row => {
    let dateVal = row[0];
    if (Object.prototype.toString.call(dateVal) === '[object Date]') {
      try {
        dateVal = Utilities.formatDate(dateVal, Session.getScriptTimeZone(), "yyyy-MM-dd");
      } catch(e) {
        dateVal = new Date().toISOString().split('T')[0];
      }
    }

    let deps = [];
    try {
      if (row[7] && row[7] !== "") {
        deps = JSON.parse(row[7]);
      }
    } catch (err) {
      deps = [];
    }
    
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
  }).filter(e => e.description !== "");

  return jsonResponse(entries);
}

function doPost(e) {
  if (!e || !e.postData) {
    return ContentService.createTextOutput("MyOps System Online.");
  }

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000); 
    
    const payload = JSON.parse(e.postData.contents);
    
    if (payload.token !== API_SECRET) {
       return errorResponse("Unauthorized: Invalid Token");
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('tasks');
    if (!sheet) return errorResponse("Sheet 'tasks' not found");
    
    const action = payload.action || 'create';
    const entry = payload.entry;
    const depsString = JSON.stringify(entry.dependencies || []);

    if (action === 'create') {
      const id = entry.id || Utilities.getUuid();
      const newRow = [
        entry.date,
        entry.description,
        entry.project,
        entry.priority,
        entry.status,
        new Date().toISOString(),
        id,
        depsString
      ];
      sheet.appendRow(newRow);
      notifySlack("create", { ...entry, id: id });
      return jsonResponse({ status: "success", id: id });
    } 
    
    else if (action === 'update') {
      if (!entry.id) return errorResponse("ID required for update");
      const data = sheet.getDataRange().getValues();
      // ID is at index 6
      for (let i = 1; i < data.length; i++) {
        if (data[i][6] == entry.id) {
          // Update columns 1-5 (Basic info)
          sheet.getRange(i + 1, 1, 1, 5).setValues([[entry.date, entry.description, entry.project, entry.priority, entry.status]]);
          // Update column 8 (Dependencies)
          sheet.getRange(i + 1, 8).setValue(depsString);
          notifySlack("update", entry);
          return jsonResponse({ status: "updated" });
        }
      }
      return errorResponse("ID not found");
    }
    
    else if (action === 'delete') {
      if (!entry.id) return errorResponse("ID required for delete");
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (data[i][6] == entry.id) {
          // Grab description before deleting for the notification
          const deletedTask = { id: entry.id, description: data[i][1] };
          sheet.deleteRow(i + 1);
          notifySlack("delete", deletedTask);
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

function notifySlack(action, entry) {
  if (!SLACK_WEBHOOK_URL || SLACK_WEBHOOK_URL === "") return;
  
  let title = "";
  let color = "#334155";
  let text = "";
  
  // Safe defaults
  const desc = entry.description || "No description";
  const proj = entry.project || "-";
  const prio = entry.priority || "-";
  const stat = entry.status || "-";

  if (action === "create") {
    title = "🆕 New Mission Initialized";
    color = "#4f46e5"; // Indigo
    text = \`*Task:* \${desc}\\n*Project:* \${proj} | *Priority:* \${prio}\`;
  } else if (action === "update") {
    if (stat === "Done") {
      title = "✅ Mission Accomplished";
      color = "#10b981"; // Emerald
      text = \`*Task:* \${desc}\\n*Status:* COMPLETED\`;
    } else {
      title = "🔄 Mission Update";
      color = "#f59e0b"; // Amber
      text = \`*Task:* \${desc}\\n*Status:* \${stat} | *Priority:* \${prio}\`;
    }
  } else if (action === "delete") {
    title = "🗑️ Mission Aborted";
    color = "#ef4444"; // Red
    text = \`*Task:* \${desc}\`;
  }

  const payload = {
    username: SLACK_BOT_NAME,
    attachments: [{
      color: color,
      title: title,
      text: text,
      footer: "MyOps Sovereign System",
      ts: Math.floor(Date.now() / 1000)
    }]
  };

  try {
    UrlFetchApp.fetch(SLACK_WEBHOOK_URL, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload)
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
