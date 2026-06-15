// =====================================================
// ScoutSystem - Apps Script Core (V5.0 Final Sync)
// =====================================================

// -------------------- 1. 核心基礎 Helper --------------------

function getSheet_(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  return sheet;
}

function serializeValue_(val) {
  if (val instanceof Date) return Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
  return val;
}

function getFieldCI_(row, fieldName) {
  const lower = String(fieldName).toLowerCase();
  for (const k in row) { if (String(k).toLowerCase() === lower) return row[k]; }
  return '';
}

function getRowStatus_(row) {
  return String(getFieldCI_(row, 'status') || '').trim().toLowerCase();
}

function getAge_(dob) {
  if (!dob) return 0;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
}

function readTable_(name) {
  const sheet = getSheet_(name);
  const data = sheet.getDataRange().getValues();
  let startRow = 0;
  while (startRow < data.length) {
    if (data[startRow].some(c => c !== '')) break;
    startRow++;
  }
  if (startRow >= data.length) return [];
  const headers = data[startRow].map(h => String(h).trim());
  const rows = [];
  for (let i = startRow + 1; i < data.length; i++) {
    const row = {};
    let hasData = false;
    for (let j = 0; j < headers.length; j++) {
      if (!headers[j]) continue;
      const val = data[i][j];
      if (val !== '') hasData = true;
      row[headers[j]] = serializeValue_(val);
    }
    if (hasData) rows.push(row);
  }
  return rows;
}

function writeRowByHeaders_(sheet, fieldMap) {
  const data = sheet.getDataRange().getValues();
  let headers = (data.length > 0) ? data[0].map(h => String(h).trim()) : [];
  if (headers.length === 0) {
    headers = Object.keys(fieldMap);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  } else {
    const newFields = Object.keys(fieldMap).filter(k => !headers.includes(k));
    if (newFields.length > 0) {
      sheet.getRange(1, headers.length + 1, 1, newFields.length).setValues([newFields]);
      headers = headers.concat(newFields);
    }
  }
  const row = headers.map(h => fieldMap[h] !== undefined ? fieldMap[h] : '');
  sheet.appendRow(row);
}

function findRowById_(sheet, id, idColName) {
  const data = sheet.getDataRange().getValues();
  if (data.length < 1) return null;
  const headers = data[0].map(h => String(h).trim());
  let idx = headers.indexOf(idColName);
  if (idx < 0) idx = headers.findIndex(h => h.toLowerCase() === idColName.toLowerCase());
  if (idx < 0) return null;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idx]) === String(id)) return { rowIndex: i, headers: headers, data: data[i] };
  }
  return null;
}

function updateCellById_(sheet, id, idColName, colName, value) {
  const found = findRowById_(sheet, id, idColName);
  if (!found) return false;
  let colIdx = found.headers.indexOf(colName);
  if (colIdx < 0) colIdx = found.headers.findIndex(h => h.toLowerCase() === colName.toLowerCase());
  if (colIdx < 0) {
    const lastCol = found.headers.length;
    sheet.getRange(1, lastCol + 1).setValue(colName);
    sheet.getRange(found.rowIndex + 1, lastCol + 1).setValue(value);
  } else {
    sheet.getRange(found.rowIndex + 1, colIdx + 1).setValue(value);
  }
  return true;
}

// -------------------- 2. 登入與用戶權限 --------------------

function login(identifier, password) {
  const idStr = String(identifier || '').trim();
  const inputPwd = String(password || '').trim();

  // 系統鎖檢查
  const config = {};
  readTable_('SystemConfig').forEach(r => { if (r.key) config[r.key] = r.value; });
  const isLocked = String(config['system_locked']).toLowerCase() === 'true';
  const isBackdoor = (idStr === 'sheep' || idStr === 'skwddbs@gmail.com') && inputPwd === '0728';
  if (isLocked && !isBackdoor) return { success: false, error: '系統鎖定中' };

  if (isBackdoor) return { success: true, user: { userId: 'u_super', name: 'Sheep', role: 'super_admin', dashboard: '/admin' } };

  const users = readTable_('Users');
  const isEmail = idStr.includes('@');
  const user = users.find(u => {
    const matchId = isEmail ? (getFieldCI_(u, 'email') === idStr) : (getFieldCI_(u, 'ymNumber') === idStr);
    const matchPwd = (getFieldCI_(u, 'passwordHash') || getFieldCI_(u, 'password')) === inputPwd;
    const active = String(getFieldCI_(u, 'active')).toLowerCase() === 'true' || String(getFieldCI_(u, 'approved')).toLowerCase() === 'true';
    return matchId && matchPwd && active;
  });

  if (!user) return { success: false, error: '帳號密碼錯誤或未啟用' };

  const role = String(getFieldCI_(user, 'role')).toLowerCase();
  let dash = '/';
  if (['admin', 'super_admin'].includes(role)) dash = '/admin';
  else if (['group_leader', 'branch_leader', 'coach'].includes(role)) dash = '/leader';
  else if (role === 'parent') dash = '/parent';
  else dash = '/member';

  return {
    success: true,
    user: {
      userId: getFieldCI_(user, 'userId') || getFieldCI_(user, 'id'),
      name: getFieldCI_(user, 'name'),
      email: getFieldCI_(user, 'email'),
      role: role,
      branchId: getFieldCI_(user, 'branchId'),
      memberId: getFieldCI_(user, 'memberId'),
      ymNumber: getFieldCI_(user, 'ymNumber'),
      dashboard: dash
    }
  };
}

// -------------------- 3. 報名與行事曆系統 (核心) --------------------

function setEventReply(payload) {
  const sheet = getSheet_('EventReplies');
  const eventId = payload.eventId;
  const targetId = payload.targetId || payload.userId; // 統一使用成員ID作為 targetId
  const replyId = eventId + '_' + targetId;
  const now = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");

  const existing = findRowById_(sheet, replyId, 'replyId');
  if (existing) {
    if (payload.type) updateCellById_(sheet, replyId, 'replyId', 'type', payload.type);
    if (payload.paid !== undefined) updateCellById_(sheet, replyId, 'replyId', 'paid', String(payload.paid));
    updateCellById_(sheet, replyId, 'replyId', 'updatedAt', now);
    return { success: true, message: '已更新' };
  } else {
    writeRowByHeaders_(sheet, {
      replyId: replyId,
      eventId: eventId,
      targetId: targetId,
      userId: payload.userId, // 誰填寫的
      userName: payload.userName || '',
      type: payload.type || 'registered',
      paid: payload.paid || false,
      createdAt: now,
      updatedAt: now
    });
    return { success: true, message: '已新增' };
  }
}

function getEventLeaderReport(payload) {
  const eventId = payload.eventId;
  const branchId = payload.branchId;
  const members = readTable_('Members').filter(m => !branchId || getFieldCI_(m, 'branchId') === branchId);
  const replies = readTable_('EventReplies').filter(r => getFieldCI_(r, 'eventId') === eventId);
  
  const data = members.map(m => {
    const mId = getFieldCI_(m, 'id');
    const r = replies.find(reply => getFieldCI_(reply, 'targetId') === mId);
    return {
      memberId: mId,
      name: getFieldCI_(m, 'name'),
      ymNumber: getFieldCI_(m, 'ymNumber'),
      patrol: getFieldCI_(m, 'patrol'),
      rank: getFieldCI_(m, 'rank'),
      age: getAge_(getFieldCI_(m, 'dateOfBirth')),
      status: r ? getFieldCI_(r, 'type') : 'unresponded',
      paid: r ? (String(getFieldCI_(r, 'paid')).toLowerCase() === 'true') : false,
      updatedAt: r ? getFieldCI_(r, 'updatedAt') : ''
    };
  });
  return { success: true, data: data };
}

function getPersonalizedCalendar(payload) {
  const userId = payload.userId;
  const users = readTable_('Users');
  const user = users.find(u => (getFieldCI_(u, 'userId') || getFieldCI_(u, 'id')) === userId);
  if (!user) return { success: false, error: 'User not found' };

  const events = readTable_('Events').filter(e => getRowStatus_(e) !== 'archived');
  const replies = readTable_('EventReplies');

  // 找出該用戶相關的所有 ID (本人 + 子女)
  let relevantIds = [userId, getFieldCI_(user, 'memberId')].filter(Boolean);
  if (getFieldCI_(user, 'role') === 'parent') {
    const children = readTable_('Members').filter(m => getFieldCI_(m, 'parentUserId') === userId);
    relevantIds = relevantIds.concat(children.map(m => getFieldCI_(m, 'id')));
  }

  const result = events.map(e => {
    const eId = getFieldCI_(e, 'eventId') || getFieldCI_(e, 'id');
    const myReplies = replies.filter(r => getFieldCI_(r, 'eventId') === eId && relevantIds.includes(getFieldCI_(r, 'targetId')));
    return {
      ...e,
      myReplies: myReplies.map(r => ({ targetId: getFieldCI_(r, 'targetId'), type: getFieldCI_(r, 'type'), paid: getFieldCI_(r, 'paid') }))
    };
  });
  return { success: true, data: result };
}

// -------------------- 4. 圖書館 (LibraryBookmarks) --------------------

function getPublicLibraryBookmarks() {
  const data = readTable_('LibraryBookmarks').filter(b => getRowStatus_(b) !== 'archived');
  return { success: true, data: data };
}

function addLibraryBookmark(payload) {
  const id = 'lb_' + Date.now();
  const now = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
  const fieldMap = {
    bookmarkId: id,
    title: payload.title || '',
    sourceUrl: payload.sourceUrl || '',
    attachmentUrl: payload.attachmentUrl || '',
    status: 'active',
    createdAt: now,
    updatedAt: now
  };
  writeRowByHeaders_(getSheet_('LibraryBookmarks'), fieldMap);
  return { success: true, id: id };
}

// -------------------- 5. Web App 入口 --------------------

function doPost(e) { return handleRequest_(e); }
function doGet(e) { return handleRequest_(e); }

function handleRequest_(e) {
  try {
    let payload = {};
    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else {
      payload = e.parameter;
    }
    const action = payload.action;
    let result;

    switch (action) {
      case 'ping': result = { success: true, msg: 'pong' }; break;
      case 'login': result = login(payload.identifier || payload.email, payload.password); break;
      case 'getPublicBootstrapData': 
        result = { success: true, data: { branches: readTable_('Branches'), config: readTable_('SystemConfig') } }; break;
      case 'getPublicLibraryBookmarks': result = getPublicLibraryBookmarks(); break;
      case 'getPersonalizedCalendar': result = getPersonalizedCalendar(payload); break;
      case 'setEventReply': result = setEventReply(payload); break;
      case 'getEventLeaderReport': result = getEventLeaderReport(payload); break;
      case 'getDashboardData': result = { success: true, data: {} }; break; // 待根據角色擴充
      case 'getTableData': result = { success: true, data: readTable_(payload.table) }; break;
      case 'addRow': writeRowByHeaders_(getSheet_(payload.table), payload.data); result = { success: true }; break;
      case 'updateRow': result = { success: updateCellById_(getSheet_(payload.table), payload.id, payload.idCol || 'id', payload.col, payload.val) }; break;
      case 'toggleSystemLock': 
        if(payload.password === '0728') {
          updateCellById_(getSheet_('SystemConfig'), 'system_locked', 'key', 'value', payload.lock);
          result = { success: true };
        } else { result = { success: false, error: 'Wrong password' }; }
        break;
      default: result = { success: false, error: 'Unknown action: ' + action };
    }
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}
