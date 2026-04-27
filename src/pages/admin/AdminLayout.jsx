import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AppContext';
import Toast from '@/components/ui/Toast';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const links = [
    { to: '/admin', label: 'Dashboard Utama' },
    { to: '/admin/review', label: 'Review & Persetujuan' },
    { to: '/admin/write', label: 'Tulis Artikel Baru' },
    { to: '/admin/articles', label: 'Kelola Artikel' },
    { to: '/admin/users', label: 'Kelola Pengguna' },
    { to: '/admin/membership', label: 'Paket Membership' },
  ];

  return (
    <div className="flex min-h-screen text-[14px]">
      <aside className="w-[240px] min-h-screen bg-navy flex flex-col fixed top-0 left-0 bottom-0 z-[100] shadow-[2px_0_12px_rgba(0,0,0,0.15)]">
        <div className="py-5 px-6 border-b border-white/10 flex items-center">
          <Link to="/admin" className="font-playfair no-underline text-white text-[25px] font-bold">
            <span className="inline-flex items-center justify-center w-9 h-9 bg-linear-to-br from-brand to-[#7e85a7] text-white font-playfair text-[20px] mb-[5px] font-extrabold rounded-lg mr-2.5 shrink-0 align-middle leading-none">T</span> TukangKawal
          </Link>
        </div>
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          {links.map(l => (
            <Link key={l.to} to={l.to} className={`flex items-center py-3 px-3.5 rounded-lg cursor-pointer mb-1 text-[14px] font-medium no-underline transition-all duration-200 ${isActive(l.to) ? 'text-white bg-brand' : 'text-white/78 hover:bg-white/10 hover:text-white'}`}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="py-4 px-5 border-t border-white/10 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-[13px] font-bold text-white">{user?.initials}</div>
          <div className="flex-1 overflow-hidden text-white">
            <strong className="block text-[13px] font-semibold">Administrator</strong>
            <span className="text-[11px] text-white/60 block">{user?.email}</span>
          </div>
          <button onClick={logout} className="text-white/60 cursor-pointer text-[12px] no-underline hover:text-[#ef4444] bg-transparent border-none">Keluar</button>
        </div>
      </aside>
      <main className="ml-[240px] flex flex-col min-h-screen w-[calc(100%-240px)]">
        <Toast />
        <div className="p-7 flex flex-col gap-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
