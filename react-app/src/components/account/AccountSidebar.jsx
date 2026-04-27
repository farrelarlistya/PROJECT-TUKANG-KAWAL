import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AppContext';

export default function AccountSidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;
  const activeClass = 'text-brand bg-brand/[.08] font-semibold';
  const inactiveClass = 'text-[#6b7280] font-medium hover:bg-brand/[.06] hover:text-brand';

  return (
    <aside className="akun-sidebar bg-white rounded-xl border border-[#e5e7eb] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] py-7 px-5 h-fit sticky top-20">
      <div className="flex items-center gap-3.5 pb-6 border-b border-[#e5e7eb] mb-2">
        <div className="w-12 h-12 rounded-full bg-linear-to-br from-brand to-[#7e85a7] text-white flex items-center justify-center font-bold text-base tracking-[0.5px] shrink-0">
          {user?.initials || 'US'}
        </div>
        <div className="flex flex-col gap-[2px] overflow-hidden">
          <span className="font-semibold text-[15px] text-[#111827] font-dm-sans">{user?.username || 'User'}</span>
          <span className="text-[12px] text-[#6b7280] font-dm-sans whitespace-nowrap overflow-hidden text-ellipsis">{user?.email}</span>
        </div>
      </div>
      <nav className="flex flex-col gap-[2px] pt-2">
        <Link to="/account" className={`flex items-center gap-3 py-3 px-3.5 rounded-lg no-underline text-[14px] font-dm-sans transition-all duration-200 ${isActive('/account') ? activeClass : inactiveClass}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          Informasi Akun
        </Link>
        <Link to="/account/settings" className={`flex items-center gap-3 py-3 px-3.5 rounded-lg no-underline text-[14px] font-dm-sans transition-all duration-200 ${isActive('/account/settings') ? activeClass : inactiveClass}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          Pengaturan Akun
        </Link>
        <Link to="/account/subscription" className={`flex items-center gap-3 py-3 px-3.5 rounded-lg no-underline text-[14px] font-dm-sans transition-all duration-200 ${isActive('/account/subscription') ? activeClass : inactiveClass}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
          Langganan
        </Link>
        <a href="#" className={`flex items-center gap-3 py-3 px-3.5 rounded-lg no-underline text-[14px] font-dm-sans transition-all duration-200 ${inactiveClass}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          Bantuan Pelanggan
        </a>
        <div className="h-px bg-[#e5e7eb] my-2" />
        <button onClick={logout} className="flex items-center gap-3 py-3 px-3.5 rounded-lg no-underline text-[#dc2626] text-[14px] font-medium font-dm-sans transition-all duration-200 hover:bg-[rgba(220,38,38,0.06)] hover:text-[#b91c1c] border-none bg-transparent cursor-pointer text-left w-full">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Keluar
        </button>
      </nav>
    </aside>
  );
}
