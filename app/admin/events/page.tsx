import AuthGate from '@/components/AuthGate';
import AdminTableView from '@/components/AdminTableView';

const adminRoles = ['super_admin', 'admin'];

export default function EventsAdminPage() {
  return (
    <AuthGate roles={adminRoles as any} title="需要管理員權限">
      <AdminTableView tableName="Events" title="活動管理" description="可新增、編輯、刪除活動" />
    </AuthGate>
  );
}
