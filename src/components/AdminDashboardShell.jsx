'use client';

import Sidebar from '@/legacy/admin/components/navbar/Navbar';

export default function AdminDashboardShell({ children }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
