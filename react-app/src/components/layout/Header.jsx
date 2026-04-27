import { memo, useState, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, useToast } from '@/context/AppContext';
import { getNavbarCategories } from '@/utils/categoryMapper';
import { USER_ROLES } from '@/utils/constants';

const Header = memo(function Header({ showSearch = false, showCategories = true, activeCategory = '' }) {
  const { user, isAuthenticated, isMember, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const categories = getNavbarCategories();

  const isSubscriptionPage = location.pathname === '/subscription';

  const handleSearch = useCallback((e) => {
    const val = e.target.value;
    setSearchQuery(val);
    // Dispatch custom event for Home page to listen
    window.dispatchEvent(new CustomEvent('search-query', { detail: val }));
  }, []);

  return (
    <header className="sticky top-0 flex shadow-[0_2px_12px_rgba(0,0,0,.25)] bg-navy justify-around items-center z-[2]">
      <div className="header-brand-nav max-w-[1160px] px-6 flex items-center">
        <Link to="/" className="font-playfair no-underline text-white text-[25px] font-bold">
          <span className="header-logo inline-flex items-center justify-center w-9 h-9 bg-linear-to-br from-brand to-[#7e85a7] text-white font-playfair text-[20px] mb-[5px] font-extrabold rounded-lg mr-2.5 shrink-0 align-middle leading-none">
            T
          </span>
          TukangKawal
        </Link>
        {showCategories && (
          <nav>
            <ul id="header-category-nav" className="header-nav flex items-center gap-5 list-none transition-all duration-500 py-5 px-[30px]">
              {categories.map(cat => (
                <li key={cat.slug}>
                  <Link
                    to={cat.slug === 'semua' ? '/' : `/category/${cat.slug}`}
                    className={`nav-category-link no-underline rounded-[5px] border-[rgb(220,220,220)] text-white p-[5px] transition-all duration-200 ${
                      activeCategory === cat.slug ? 'nav-category-active' : ''
                    }`}
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
              {/* Member gets Eksklusif category */}
              {isMember && (
                <li>
                  <Link
                    to="/category/eksklusif"
                    className={`nav-category-link no-underline rounded-[5px] border-[rgb(220,220,220)] text-white p-[5px] transition-all duration-200 ${
                      activeCategory === 'eksklusif' ? 'nav-category-active' : ''
                    }`}
                  >
                    🔒 Eksklusif
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        )}
      </div>
      <div className="flex items-center gap-3">
        {showSearch && (
          <input
            type="search"
            id="search-input"
            placeholder="Cari Berita..."
            value={searchQuery}
            onChange={handleSearch}
            className="no-underline rounded-[5px] border border-white/30 bg-white/10 text-white placeholder-white/50 py-1.5 px-3 text-[14px] outline-none focus:border-white/60 transition-colors"
          />
        )}
        <div className="header-action flex items-center gap-3">
          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Silakan login atau daftar terlebih dahulu untuk mengakses Pengawal Eksklusif.');
                  navigate('/login');
                }}
                className="no-underline bg-brand text-white py-2.5 px-[15px] rounded-lg border-none cursor-pointer text-[15px] font-semibold"
              >
                Pengawal Eksklusif
              </Link>
              <Link to="/login" className="no-underline bg-brand text-white py-2.5 px-[15px] rounded-lg border-none cursor-pointer text-[15px] font-semibold">
                Masuk/Daftar
              </Link>
            </>
          ) : isAdmin ? (
            <>
              <Link to="/admin" className="no-underline bg-brand text-white py-2.5 px-[15px] rounded-lg border-none cursor-pointer text-[15px] font-semibold">
                Dashboard
              </Link>
              <button onClick={logout} className="no-underline bg-brand text-white py-2.5 px-[15px] rounded-lg border-none cursor-pointer text-[15px] font-semibold">
                Keluar
              </button>
            </>
          ) : isMember ? (
            <>
              <Link to="/mulai-ngawal" className="no-underline bg-brand text-white py-2.5 px-[15px] rounded-lg border-none cursor-pointer text-[15px] font-semibold">
                Mulai Ngawal
              </Link>
              <Link to="/account" className="no-underline w-9 h-9 rounded-full bg-white text-brand flex items-center justify-center text-[13px] font-bold cursor-pointer" title={user.username}>
                {user.initials || 'MB'}
              </Link>
              <span className="member-badge-plus bg-linear-to-r from-[#1e3a8a] to-[#3b82f6] text-white text-[11px] font-extrabold py-1 px-2 rounded-full shadow-[0_2px_8px_rgba(30,58,138,0.4)] tracking-[0.5px]">
                T+
              </span>
            </>
          ) : (
            <>
              {!isSubscriptionPage && (
                <Link to="/subscription" className="no-underline bg-brand text-white py-2.5 px-[15px] rounded-lg border-none cursor-pointer text-[15px] font-semibold">
                  Pengawal Eksklusif
                </Link>
              )}
              <Link to="/account" className="no-underline w-9 h-9 rounded-full bg-white text-brand flex items-center justify-center text-[13px] font-bold cursor-pointer" title={user.username}>
                {user.initials || 'US'}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
});

export default Header;
