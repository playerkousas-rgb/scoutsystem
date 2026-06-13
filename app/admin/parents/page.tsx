import AuthGate from '@/components/AuthGate';
import AdminTableView from '@/components/AdminTableView';

const adminRoles = ['super_admin', 'admin'];

export default function ParentsPage() {
  return (
    <AuthGate roles={adminRoles as any} title="需要管理員權限">
      <AdminTableView tableName="Applications" title="家長審核 / 申請管理" />
    </AuthGate>
  );
}
