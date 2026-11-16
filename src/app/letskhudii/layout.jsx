import '@/legacy/admin/index.css';
import '@/legacy/admin/App.css';
import '@/app/admin-app/admin-premium.css';
import AdminProviders from '@/components/AdminProviders';

export const metadata = { title: 'Sign in | Khudii Admin', robots: { index: false, follow: false } };
export default function LoginLayout({ children }) { return <AdminProviders>{children}</AdminProviders>; }
