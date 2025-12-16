
export const GAS_BACKEND_CODE = `// --- CONFIGURATION ---
const API_SECRET = "myops-secret-key"; // <--- CHANGE THIS
const SLACK_WEBHOOK_URL = ""; // <--- PASTE YOUR WEBHOOK URL HERE
// ---------------------

/**
 * 🛠️ SETUP INSTRUCTION:
 * 1. Paste your Slack Webhook URL above.
 * 2. Select 'testSlack' from the function dropdown menu in the toolbar.
 * 3. Click 'Run'. 
 * 4. Google will ask for permissions (Review Permissions > Allow).
 * 5. Check your Slack channel for a test message.
 * 6. Deploy > Manage Deployments > Edit > Version: New Version > Deploy.
 */

function testSlack() {
  if (!SLACK_WEBHOOK_URL) {
    Logger.log("❌ Error: SLACK_WEBHOOK_URL is empty.");
    return;
  }
  notifySlack("create", {
    description: "System Connection Test",
    project: "MyOps",
    priority: "High",
    status: "Active"
  });
  Logger.log("✅ Test sent. Check your Slack.");
}

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

  const entries = data.slice(1).map(row => {
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

  // Modern Block Kit Layout
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
          {
            "type": "mrkdwn",
            "text": \`*Mission:*\n\${desc}\`
          },
          {
            "type": "mrkdwn",
            "text": \`*Project:*\n\${proj}\`
          }
        ]
      },
      {
        "type": "section",
        "fields": [
          {
            "type": "mrkdwn",
            "text": \`*Priority:*\n\${prio}\`
          },
          {
            "type": "mrkdwn",
            "text": \`*Status:*\n\${stat}\`
          }
        ]
      },
      {
        "type": "divider"
      },
      {
        "type": "context",
        "elements": [
          {
            "type": "plain_text",
            "text": "MyOps Sovereign System",
            "emoji": true
          }
        ]
      }
    ]
  };

  try {
    const options = {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    const resp = UrlFetchApp.fetch(SLACK_WEBHOOK_URL, options);
    Logger.log("Slack Response Code: " + resp.getResponseCode());
    Logger.log("Slack Response Body: " + resp.getContentText());
    
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
