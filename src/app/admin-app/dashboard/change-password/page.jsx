'use client';

import dynamic from 'next/dynamic';

const ChangePassword = dynamic(
  () => import('@/legacy/admin/Pages/PasswordChange/PasswordChange'),
  { ssr: false },
);

export default function Page() {
  return <ChangePassword />;
}
