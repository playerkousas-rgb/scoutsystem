export type Role = 'super_admin' | 'admin' | 'group_leader' | 'branch_leader' | 'coach' | 'parent' | 'member';
export type EventScope = 'troop' | 'branch' | 'hq' | 'region' | 'district' | 'training';
export type EventStatus = 'draft' | 'published' | 'archived';
export type LibraryBookmarkStatus = 'new' | 'following' | 'not_applicable' | 'converted' | 'published' | 'archived';
export type ReplyStatus = 'pending' | 'yes' | 'no';
export type ApplicationStatus = 'pending' | 'approved' | 'rejected';
export type MemberFieldKey = 'ymNumber' | 'name' | 'age' | 'gender' | 'phone' | 'emergencyContactName' | 'emergencyContactPhone';

export type FieldSetting = {
  key: MemberFieldKey;
  label: string;
  required: boolean;
  enabled: boolean;
  source?: 'core' | 'optional' | 'ymis';
};

export type Branch = {
  id: string;
  name: string;
  shortName: string;
  section: '小童軍' | '幼童軍' | '童軍' | '深資童軍' | '樂行童軍' | '其他';
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role: Role;
  branchId?: string;
  memberId?: string;
  approved?: boolean;
  createdBy?: string;
};

export type LeaderApplication = {
  id: string;
  name: string;
  email: string;
  requestedRole: 'group_leader' | 'branch_leader' | 'coach';
  branchId: string;
  phone?: string;
  experience?: string;
  status: ApplicationStatus;
  approvedBy?: string;
  createdAt: string;
};

export type Member = {
  id: string;
  name: string;
  branchId: string;
  patrol?: string;
  ymNumber?: string;
  parentUserId?: string;
  emergencyPhone?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  phone?: string;
  age?: string;
  gender?: '男' | '女' | '其他' | '';
  dateOfBirth?: string;
  school?: string;
  rank?: string;
};

export type Event = {
  id: string;
  branchId?: string;
  scope: EventScope;
  title: string;
  date: string;
  endDate?: string;
  location: string;
  quota?: number;
  fee?: string;
  description: string;
  status: EventStatus;
  targetMemberIds: string[];
  createdBy: string;
  createdAt: string;
  source?: 'manual' | 'scout_library' | 'dbs';
};

export type EventReply = {
  id: string;
  eventId: string;
  memberId: string;
  parentUserId?: string;
  status: ReplyStatus;
  note?: string;
  updatedAt?: string;
};

export type Notification = {
  id: string;
  parentUserId: string;
  eventId: string;
  memberId: string;
  status: 'queued' | 'read';
  channel: 'in_app' | 'future';
  createdAt: string;
};

export type LibraryBookmark = {
  id: string;
  circularKey: string;
  title: string;
  sourceSite?: string;
  region?: string;
  circularDate?: string;
  sourceUrl?: string;
  attachmentUrl?: string;
  officialDeadline?: string;
  targetText?: string;
  fee?: string;
  status: LibraryBookmarkStatus;
  branchTags: string[];
  audienceTags: string[];
  activityType?: string;
  internalDeadline?: string;
  ownerUserId?: string;
  notes?: string;
  convertedEventId?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
};

export type AppData = {
  branches: Branch[];
  users: User[];
  leaderApplications: LeaderApplication[];
  members: Member[];
  events: Event[];
  replies: EventReply[];
  notifications: Notification[];
  memberFieldSettings: FieldSetting[];
  libraryBookmarks: LibraryBookmark[];
};

const STORAGE_KEY = 'scout-system-ui-v2';
const SESSION_KEY = 'scout-system-session-v2';

const today = new Date();
const addDays = (days: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

export const roleLabel: Record<Role, string> = {
  super_admin: '超級管理員',
  admin: '管理員',
  group_leader: '團長',
  branch_leader: '支部領袖',
  coach: '教練員',
  parent: '家長',
  member: '成員',
};

export const adminRoles: Role[] = ['super_admin', 'admin'];
export const leaderRoles: Role[] = ['group_leader', 'branch_leader', 'coach'];

export function seedData(): AppData {
  return {
    branches: [
      { id: 'b1', name: '小童軍支部', shortName: '小童軍', section: '小童軍' },
      { id: 'b2', name: '幼童軍支部', shortName: '幼童軍', section: '幼童軍' },
      { id: 'b3', name: '童軍支部', shortName: '童軍', section: '童軍' },
      { id: 'b4', name: '深資童軍支部', shortName: '深資', section: '深資童軍' },
    ],
    users: [
      { id: 'u0', name: '系統超級管理員', email: 'super@example.com', password: 'sheet-only', role: 'super_admin', approved: true, createdBy: 'Google Sheet 初始化' },
      { id: 'u1', name: '陳旅長 / 管理員', email: 'admin@example.com', password: 'admin123', role: 'admin', approved: true, createdBy: 'u0' },
      { id: 'u2', name: '李團長', email: 'gsl-cub@example.com', password: 'leader123', role: 'group_leader', branchId: 'b2', approved: true },
      { id: 'u3', name: '黃支部領袖', email: 'leader-scout@example.com', password: 'leader123', role: 'branch_leader', branchId: 'b3', approved: true },
      { id: 'u4', name: '何教練員', email: 'coach@example.com', password: 'coach123', role: 'coach', branchId: 'b4', approved: true },
      { id: 'u5', name: '王家長', email: 'parent@example.com', phone: '9123 4567', password: 'parent123', role: 'parent', approved: true },
      { id: 'u6', name: '王小明', email: 'member@example.com', password: 'member123', role: 'member', branchId: 'b3', memberId: 'm1', approved: true },
    ],
    libraryBookmarks: [
      {
        id: 'lb1',
        circularKey: 'demo-scout-library-item',
        title: '地域領袖訓練班（圖書館收藏示範）',
        sourceSite: '九龍地域',
        region: '九龍地域',
        circularDate: addDays(-1),
        sourceUrl: 'https://scout-circulars.vercel.app/',
        attachmentUrl: 'https://scout-circulars.vercel.app/',
        officialDeadline: addDays(20),
        targetText: '領袖',
        fee: '$120',
        status: 'following',
        branchTags: ['全旅'],
        audienceTags: ['領袖'],
        activityType: '訓練班',
        internalDeadline: addDays(14),
        ownerUserId: 'u1',
        notes: '示範收藏：可由圖書館加入 ScoutSystem。',
        createdBy: 'u1',
        createdAt: new Date().toISOString(),
      }
    ],
    memberFieldSettings: [
      { key: 'ymNumber', label: 'YMIS / 成員編號', required: true, enabled: true, source: 'core' },
      { key: 'name', label: '姓名', required: true, enabled: true, source: 'core' },
      { key: 'age', label: '年齡', required: false, enabled: false, source: 'optional' },
      { key: 'gender', label: '性別', required: false, enabled: false, source: 'optional' },
      { key: 'phone', label: '成員電話', required: false, enabled: false, source: 'optional' },
      { key: 'emergencyContactName', label: '緊急聯絡人', required: false, enabled: true, source: 'optional' },
      { key: 'emergencyContactPhone', label: '緊急聯絡人電話', required: false, enabled: true, source: 'optional' },
    ],
    leaderApplications: [
      { id: 'la1', name: '張教練', email: 'newcoach@example.com', requestedRole: 'coach', branchId: 'b2', phone: '9000 1111', experience: '曾協助幼童軍集會及戶外活動。', status: 'pending', createdAt: new Date().toISOString() },
      { id: 'la2', name: '林團長申請', email: 'newgsl@example.com', requestedRole: 'group_leader', branchId: 'b4', phone: '9000 2222', experience: '現任深資活動負責人，申請團長權限。', status: 'pending', createdAt: new Date().toISOString() },
    ],
    members: [
      { id: 'm1', name: '王小明', branchId: 'b3', patrol: '猛虎小隊', ymNumber: 'YM001', parentUserId: 'u5', emergencyPhone: '9123 4567', emergencyContactName: '王先生', emergencyContactPhone: '9123 4567', age: '13', gender: '男', dateOfBirth: '2012-03-15', school: '筲箕灣官立小學', rank: '會員' },
      { id: 'm2', name: '王小美', branchId: 'b2', patrol: '紅花六', ymNumber: 'YM002', parentUserId: 'u5', emergencyPhone: '9123 4567', emergencyContactName: '王先生', emergencyContactPhone: '9123 4567', age: '10', gender: '女', dateOfBirth: '2015-07-20', school: '東區小學', rank: '會員' },
      { id: 'm3', name: '陳志豪', branchId: 'b3', patrol: '雄鷹小隊', ymNumber: 'YM003', parentUserId: undefined, emergencyPhone: '9234 5678', rank: '小隊長' },
      { id: 'm4', name: '林雅晴', branchId: 'b4', patrol: '深資小隊', ymNumber: 'YM004', parentUserId: undefined, emergencyPhone: '9345 6789', rank: '會員' },
    ],
    events: [
      { id: 'e1', branchId: 'b3', scope: 'branch', title: '童軍露營技能訓練日', date: addDays(14), location: '大潭童軍中心', quota: 30, fee: '$80', description: '繩結、營藝、野外煮食訓練。', status: 'published', targetMemberIds: ['m1', 'm3'], createdBy: 'u3', createdAt: new Date().toISOString(), source: 'manual' },
      { id: 'e2', branchId: 'b2', scope: 'branch', title: '幼童軍社區服務探訪', date: addDays(21), location: '區內長者中心', quota: 18, fee: '$0', description: '探訪長者及服務學習。', status: 'published', targetMemberIds: ['m2'], createdBy: 'u2', createdAt: new Date().toISOString(), source: 'manual' },
      { id: 'e3', scope: 'troop', title: '全旅周年大會操', date: addDays(28), location: '區內運動場', quota: 120, fee: '$0', description: '全旅成員、家長及領袖參與。', status: 'published', targetMemberIds: ['m1', 'm2', 'm3', 'm4'], createdBy: 'u1', createdAt: new Date().toISOString(), source: 'manual' },
      { id: 'e4', scope: 'training', title: '地域領袖訓練班（童軍圖書館接入示範）', date: addDays(45), location: '香港童軍中心', quota: 40, fee: '$120', description: '未來會由童軍圖書館或公開活動來源同步。', status: 'published', targetMemberIds: [], createdBy: 'system', createdAt: new Date().toISOString(), source: 'scout_library' },
    ],
    replies: [
      { id: 'r1', eventId: 'e1', memberId: 'm1', parentUserId: 'u5', status: 'pending' },
      { id: 'r2', eventId: 'e2', memberId: 'm2', parentUserId: 'u5', status: 'yes', note: '準時出席', updatedAt: new Date().toISOString() },
      { id: 'r3', eventId: 'e3', memberId: 'm1', parentUserId: 'u5', status: 'pending' },
      { id: 'r4', eventId: 'e3', memberId: 'm2', parentUserId: 'u5', status: 'pending' },
    ],
    notifications: [
      { id: 'n1', parentUserId: 'u5', eventId: 'e1', memberId: 'm1', status: 'queued', channel: 'future', createdAt: new Date().toISOString() },
      { id: 'n2', parentUserId: 'u5', eventId: 'e2', memberId: 'm2', status: 'read', channel: 'future', createdAt: new Date().toISOString() },
    ],
  };
}

export function getData(): AppData {
  if (typeof window === 'undefined') return seedData();
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const data = seedData();
    saveData(data);
    return data;
  }
  try {
    const parsed = JSON.parse(raw) as AppData;
    if (!parsed.leaderApplications || !parsed.memberFieldSettings || !parsed.libraryBookmarks) return resetData();
    return parsed;
  } catch {
    return resetData();
  }
}

export function saveData(data: AppData) {
  if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function resetData() {
  const data = seedData();
  saveData(data);
  return data;
}

export function getCurrentUser(): User | undefined {
  if (typeof window === 'undefined') return undefined;
  const id = window.localStorage.getItem(SESSION_KEY);
  return getData().users.find(u => u.id === id);
}

export function setCurrentUser(userId: string) {
  if (typeof window !== 'undefined') window.localStorage.setItem(SESSION_KEY, userId);
}

export function logout() {
  if (typeof window !== 'undefined') window.localStorage.removeItem(SESSION_KEY);
}

export function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}_${Date.now().toString(36)}`;
}

export function isFutureEvent(event: Event) {
  return event.status !== 'archived' && event.date >= new Date().toISOString().slice(0, 10);
}

export function visibleBranchesFor(user: User, data: AppData) {
  if (adminRoles.includes(user.role)) return data.branches;
  if (leaderRoles.includes(user.role) && user.branchId) return data.branches.filter(b => b.id === user.branchId);
  if (user.role === 'member' && user.branchId) return data.branches.filter(b => b.id === user.branchId);
  if (user.role === 'parent') {
    const ids = new Set(data.members.filter(m => m.parentUserId === user.id).map(m => m.branchId));
    return data.branches.filter(b => ids.has(b.id));
  }
  return [];
}

export function canManageAll(user: User) {
  return adminRoles.includes(user.role);
}

export function canManageBranch(user: User, branchId?: string) {
  if (!branchId) return adminRoles.includes(user.role);
  if (adminRoles.includes(user.role)) return true;
  if (leaderRoles.includes(user.role)) return user.branchId === branchId;
  return false;
}

export function canViewBranch(user: User, branchId?: string) {
  if (!branchId) return adminRoles.includes(user.role);
  if (adminRoles.includes(user.role)) return true;
  if ((leaderRoles.includes(user.role) || user.role === 'member') && user.branchId === branchId) return true;
  if (user.role === 'parent') return getData().members.some(m => m.parentUserId === user.id && m.branchId === branchId);
  return false;
}

export function getBranchName(data: AppData, branchId?: string) {
  if (!branchId) return '全旅 / 外部活動';
  return data.branches.find(b => b.id === branchId)?.name || '未指定';
}

export function getReplySummary(eventId: string, data: AppData) {
  const replies = data.replies.filter(r => r.eventId === eventId);
  return {
    total: replies.length,
    yes: replies.filter(r => r.status === 'yes').length,
    no: replies.filter(r => r.status === 'no').length,
    pending: replies.filter(r => r.status === 'pending').length,
  };
}

export function createEventWithReplies(data: AppData, event: Omit<Event, 'id' | 'createdAt'>) {
  const id = uid('e');
  const newEvent: Event = { ...event, id, createdAt: new Date().toISOString() };
  const newReplies: EventReply[] = event.targetMemberIds.map(memberId => {
    const member = data.members.find(m => m.id === memberId);
    return { id: uid('r'), eventId: id, memberId, parentUserId: member?.parentUserId, status: 'pending' };
  });
  const newNotifications: Notification[] = newReplies
    .filter(r => !!r.parentUserId)
    .map(r => ({ id: uid('n'), parentUserId: r.parentUserId!, eventId: id, memberId: r.memberId, status: 'queued', channel: 'future', createdAt: new Date().toISOString() }));
  return { ...data, events: [newEvent, ...data.events], replies: [...newReplies, ...data.replies], notifications: [...newNotifications, ...data.notifications] };
}

export function registerParentAccount(name: string, email: string, childYmNumbers: string[], phone?: string) {
  const data = getData();
  const parentId = uid('u');
  const parent: User = { id: parentId, name, email, phone, role: 'parent', approved: false };
  const ymSet = new Set(childYmNumbers.map(v => v.trim()).filter(Boolean));
  const members = data.members.map(member => ymSet.has(member.ymNumber || '') ? { ...member, parentUserId: parentId } : member);
  const next = { ...data, users: [parent, ...data.users], members };
  saveData(next);
  return parent;
}

export function submitLeaderApplication(input: Omit<LeaderApplication, 'id' | 'status' | 'createdAt'>) {
  const data = getData();
  const application: LeaderApplication = { ...input, id: uid('la'), status: 'pending', createdAt: new Date().toISOString() };
  const next = { ...data, leaderApplications: [application, ...data.leaderApplications] };
  saveData(next);
  return application;
}

export function upsertLibraryBookmark(input: Omit<LibraryBookmark, 'id' | 'createdAt' | 'updatedAt'>) {
  const data = getData();
  const existing = data.libraryBookmarks.find(b => b.circularKey === input.circularKey);
  const now = new Date().toISOString();
  const bookmark: LibraryBookmark = existing
    ? { ...existing, ...input, updatedAt: now }
    : { ...input, id: uid('lb'), createdAt: now };
  const next = {
    ...data,
    libraryBookmarks: existing
      ? data.libraryBookmarks.map(b => b.id === existing.id ? bookmark : b)
      : [bookmark, ...data.libraryBookmarks],
  };
  saveData(next);
  return bookmark;
}
