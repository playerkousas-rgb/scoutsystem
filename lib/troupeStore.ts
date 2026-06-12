export type Role = 'commissioner' | 'group_leader' | 'leader' | 'parent';
export type EventStatus = 'draft' | 'published' | 'archived';
export type ReplyStatus = 'pending' | 'yes' | 'no';

export type Branch = {
  id: string;
  name: string;
  shortName: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  branchId?: string;
  approved?: boolean;
};

export type Member = {
  id: string;
  name: string;
  branchId: string;
  patrol?: string;
  ymNumber?: string;
  parentUserId?: string;
  emergencyPhone?: string;
};

export type Event = {
  id: string;
  branchId: string;
  title: string;
  date: string;
  location: string;
  quota?: number;
  fee?: string;
  description: string;
  status: EventStatus;
  targetMemberIds: string[];
  createdBy: string;
  createdAt: string;
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

export type AppData = {
  branches: Branch[];
  users: User[];
  members: Member[];
  events: Event[];
  replies: EventReply[];
  notifications: Notification[];
};

const STORAGE_KEY = 'troupe-management-mvp-v1';
const SESSION_KEY = 'troupe-management-session-v1';

const today = new Date();
const addDays = (days: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

export const roleLabel: Record<Role, string> = {
  commissioner: '旅長',
  group_leader: '團長',
  leader: '領袖',
  parent: '家長',
};

export function seedData(): AppData {
  return {
    branches: [
      { id: 'b1', name: '第一支部', shortName: '一支' },
      { id: 'b2', name: '第二支部', shortName: '二支' },
      { id: 'b3', name: '深資支部', shortName: '深資' },
    ],
    users: [
      { id: 'u1', name: '陳旅長', email: 'commissioner@example.com', role: 'commissioner', approved: true },
      { id: 'u2', name: '李團長', email: 'leader-b1@example.com', role: 'group_leader', branchId: 'b1', approved: true },
      { id: 'u3', name: '黃領袖', email: 'leader-b2@example.com', role: 'leader', branchId: 'b2', approved: true },
      { id: 'u4', name: '王家長', email: 'parent@example.com', role: 'parent', approved: true },
      { id: 'u5', name: '待審家長', email: 'newparent@example.com', role: 'parent', approved: false },
    ],
    members: [
      { id: 'm1', name: '王小明', branchId: 'b1', patrol: '猛虎小隊', ymNumber: 'YM001', parentUserId: 'u4', emergencyPhone: '9123 4567' },
      { id: 'm2', name: '王小美', branchId: 'b2', patrol: '海豚小隊', ymNumber: 'YM002', parentUserId: 'u4', emergencyPhone: '9123 4567' },
      { id: 'm3', name: '陳志豪', branchId: 'b1', patrol: '雄鷹小隊', ymNumber: 'YM003', parentUserId: undefined, emergencyPhone: '9234 5678' },
      { id: 'm4', name: '林雅晴', branchId: 'b3', patrol: '深資小隊', ymNumber: 'YM004', parentUserId: undefined, emergencyPhone: '9345 6789' },
    ],
    events: [
      { id: 'e1', branchId: 'b1', title: '露營技能訓練日', date: addDays(14), location: '大潭童軍中心', quota: 30, fee: '$80', description: '繩結、營藝、野外煮食訓練。', status: 'published', targetMemberIds: ['m1', 'm3'], createdBy: 'u2', createdAt: new Date().toISOString() },
      { id: 'e2', branchId: 'b2', title: '社區服務探訪', date: addDays(21), location: '區內長者中心', quota: 18, fee: '$0', description: '探訪長者及服務學習。', status: 'published', targetMemberIds: ['m2'], createdBy: 'u3', createdAt: new Date().toISOString() },
      { id: 'e3', branchId: 'b1', title: '已完結遠足活動', date: addDays(-7), location: '龍脊', quota: 24, fee: '$20', description: '過期活動示範，列表預設會隱藏。', status: 'archived', targetMemberIds: ['m1'], createdBy: 'u2', createdAt: new Date().toISOString() },
    ],
    replies: [
      { id: 'r1', eventId: 'e1', memberId: 'm1', parentUserId: 'u4', status: 'pending' },
      { id: 'r2', eventId: 'e2', memberId: 'm2', parentUserId: 'u4', status: 'yes', note: '準時出席', updatedAt: new Date().toISOString() },
    ],
    notifications: [
      { id: 'n1', parentUserId: 'u4', eventId: 'e1', memberId: 'm1', status: 'queued', channel: 'future', createdAt: new Date().toISOString() },
      { id: 'n2', parentUserId: 'u4', eventId: 'e2', memberId: 'm2', status: 'read', channel: 'future', createdAt: new Date().toISOString() },
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
    return JSON.parse(raw) as AppData;
  } catch {
    const data = seedData();
    saveData(data);
    return data;
  }
}

export function saveData(data: AppData) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
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
  if (user.role === 'commissioner') return data.branches;
  if (user.branchId) return data.branches.filter(b => b.id === user.branchId);
  return [];
}

export function canSeeBranch(user: User, branchId: string) {
  if (user.role === 'commissioner') return true;
  if (user.role === 'group_leader' || user.role === 'leader') return user.branchId === branchId;
  return false;
}

export function getBranchName(data: AppData, branchId?: string) {
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
  return {
    ...data,
    events: [newEvent, ...data.events],
    replies: [...newReplies, ...data.replies],
    notifications: [...newNotifications, ...data.notifications],
  };
}

export function registerParentAccount(name: string, email: string, childYmNumbers: string[]) {
  const data = getData();
  const parentId = uid('u');
  const parent: User = { id: parentId, name, email, role: 'parent', approved: false };
  const ymSet = new Set(childYmNumbers.map(v => v.trim()).filter(Boolean));
  const members = data.members.map(member => ymSet.has(member.ymNumber || '') ? { ...member, parentUserId: parentId } : member);
  const next = { ...data, users: [parent, ...data.users], members };
  saveData(next);
  return parent;
}
