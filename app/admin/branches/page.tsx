import AuthGate from '@/components/AuthGate';
import AdminTableView from '@/components/AdminTableView';

const adminRoles = ['super_admin', 'admin'];

export default function BranchesPage() {
  return (
    <AuthGate roles={adminRoles as any} title="需要管理員權限">
      <AdminTableView tableName="Branches" title="支部管理" />
    </AuthGate>
  );
}
