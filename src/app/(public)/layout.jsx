import '@/legacy/public/index.css';
import '@/legacy/public/App.css';
import PublicShell from '@/components/PublicShell';

export default function PublicLayout({ children }) {
  return <PublicShell>{children}</PublicShell>;
}
