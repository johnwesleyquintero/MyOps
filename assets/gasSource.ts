export const GAS_BACKEND_CODE = `// --- CONFIGURATION ---
const API_SECRET = "myops-secret-key"; // <--- CHANGE THIS to your own strong password
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
  
  // Mapping: 0:Date, 1:Description, 2:Project, 3:Priority, 4:Status, 5:CreatedAt, 6:ID
  const entries = data.map(row => {
    let dateVal = row[0];
    if (Object.prototype.toString.call(dateVal) === '[object Date]') {
      try {
        dateVal = Utilities.formatDate(dateVal, Session.getScriptTimeZone(), "yyyy-MM-dd");
      } catch(e) {
        dateVal = new Date().toISOString().split('T')[0];
      }
    }
    
    return {
      date: dateVal || "", 
      description: row[1] || "",
      project: row[2] || "Inbox",
      priority: row[3] || "Medium",
      status: row[4] || "Backlog",
      createdAt: row[5] || "",
      id: row[6] || "" 
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

    if (action === 'create') {
      const id = entry.id || Utilities.getUuid();
      const newRow = [
        entry.date,
        entry.description,
        entry.project,
        entry.priority,
        entry.status,
        new Date().toISOString(),
        id
      ];
      sheet.appendRow(newRow);
      return jsonResponse({ status: "success", id: id });
    } 
    
    else if (action === 'update') {
      if (!entry.id) return errorResponse("ID required for update");
      const data = sheet.getDataRange().getValues();
      // ID is at index 6
      for (let i = 1; i < data.length; i++) {
        if (data[i][6] == entry.id) {
          const range = sheet.getRange(i + 1, 1, 1, 5); // Update first 5 cols
          range.setValues([[entry.date, entry.description, entry.project, entry.priority, entry.status]]);
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
          sheet.deleteRow(i + 1);
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

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function errorResponse(msg) {
  return ContentService.createTextOutput(JSON.stringify({status: "error", message: msg}))
    .setMimeType(ContentService.MimeType.JSON);
}`;