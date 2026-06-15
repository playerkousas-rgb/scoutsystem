import AuthGate from '@/components/AuthGate';
import ApplicationManagement from '@/components/ApplicationManagement';

// 團長、支部領袖也可審批申請（教練員不能）
const allowedRoles = ['super_admin', 'admin', 'group_leader', 'branch_leader'];

export default function ParentsPage() {
  return (
    <AuthGate roles={allowedRoles as any} title="需要管理員或領袖權限">
      <ApplicationManagement />
    </AuthGate>
  );
}
