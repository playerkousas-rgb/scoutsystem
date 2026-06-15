import AuthGate from '@/components/AuthGate';
import AdminTableView from '@/components/AdminTableView';

// 管理員、團長、支部領袖、教練員都可管理活動
const allowedRoles = ['super_admin', 'admin', 'group_leader', 'branch_leader', 'coach'];

export default function EventsAdminPage() {
  return (
    <AuthGate roles={allowedRoles as any} title="需要管理員或領袖權限">
      <AdminTableView tableName="Events" title="活動管理" description="可新增、編輯、刪除活動" />
    </AuthGate>
  );
}
