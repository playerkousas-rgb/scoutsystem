import AuthGate from '@/components/AuthGate';
import AdminTableView from '@/components/AdminTableView';

const adminRoles = ['super_admin', 'admin'];

export default function MembersPage() {
  return (
    <AuthGate roles={adminRoles as any} title="需要管理員權限">
      <AdminTableView tableName="Members" title="成員資料庫" description="可新增、編輯、刪除成員資料" />
    </AuthGate>
  );
}
