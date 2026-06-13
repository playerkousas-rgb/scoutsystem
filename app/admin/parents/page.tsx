import AuthGate from '@/components/AuthGate';
import ApplicationManagement from '@/components/ApplicationManagement';

const adminRoles = ['super_admin', 'admin'];

export default function ParentsPage() {
  return (
    <AuthGate roles={adminRoles as any} title="需要管理員權限">
      <ApplicationManagement />
    </AuthGate>
  );
}
