import { Outlet } from 'react-router-dom';
import PageWrapper from '@/components/layout/PageWrapper';
import AccountSidebar from '@/components/account/AccountSidebar';

export default function Account() {
  return (
    <PageWrapper showCategories={true}>
      <main className="akun-layout max-w-[1100px] mx-auto py-10 px-6 pb-20 grid grid-cols-[280px_1fr] gap-10 min-h-[calc(100vh-200px)] !bg-[#f9fafb]">
        <AccountSidebar />
        <Outlet />
      </main>
    </PageWrapper>
  );
}
