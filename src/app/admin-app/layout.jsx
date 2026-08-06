import '@/legacy/admin/index.css';
import '@/legacy/admin/App.css';
import AdminProviders from '@/components/AdminProviders';

export const metadata = {
  title: 'Khudii Admin',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return <AdminProviders>{children}</AdminProviders>;
}
