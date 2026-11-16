import AdminDashboardShell from '@/components/AdminDashboardShell';
import {requireAdminPage} from '@/server/cms-v2/security';
export const dynamic='force-dynamic';
export default async function DashboardLayout({children}){await requireAdminPage();return <AdminDashboardShell>{children}</AdminDashboardShell>;}
