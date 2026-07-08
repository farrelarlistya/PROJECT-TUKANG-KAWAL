import { memo, useState, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AppContext';
import { getNavbarCategories } from '@/utils/categoryMapper';
import { USER_ROLES } from '@/utils/constants';

const Header = memo(function Header({ showSearch = false, showCategories = true, activeCategory = '' }) {
  const { user, isAuthenticated, isMember, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const categories = getNavbarCategories();

  const isSubscriptionPage = location.pathname === '/subscription';

  const handleSearch = useCallback((e) => {
    const val = e.target.value;
    setSearchQuery(val);
    // Dispatch custom event for Home page to listen
    window.dispatchEvent(new CustomEvent('search-query', { detail: val }));
  }, []);

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 shadow-[0_2px_12px_rgba(0,0,0,.25)] bg-navy z-[2]">
      {/* Top bar — always visible */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-2 max-w-[1160px] mx-auto">
        <Link to="/" className="font-playfair no-underline text-white text-[22px] sm:text-[25px] font-bold shrink-0">
          <span className="header-logo inline-flex items-center justify-center w-9 h-9 bg-linear-to-br from-brand to-[#7e85a7] text-white font-playfair text-[20px] mb-[5px] font-extrabold rounded-lg mr-2.5 shrink-0 align-middle leading-none">
            T
          </span>
          TukangKawal
        </Link>

        {/* Desktop nav — hidden on mobile */}
        {showCategories && (
          <nav className="hidden lg:block">
            <ul id="header-category-nav" className="header-nav flex items-center gap-5 list-none transition-all duration-500 py-5 px-[30px]">
              {categories.map(cat => (
                <li key={cat.slug}>
                  <Link
                    to={`/category/${cat.slug}`}
                    className={`nav-category-link no-underline rounded-[5px] border-[rgb(220,220,220)] text-white p-[5px] transition-all duration-200 ${
                      activeCategory === cat.slug ? 'nav-category-active' : ''
                    }`}
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
              {/* Semua user bisa melihat tab Eksklusif */}
              <li>
                <Link
                  to="/category/eksklusif"
                  className={`nav-category-link no-underline rounded-[5px] border-[rgb(220,220,220)] text-white p-[5px] transition-all duration-200 ${
                    activeCategory === 'eksklusif' ? 'nav-category-active' : ''
                  }`}
                >
                   Eksklusif
                </Link>
              </li>
            </ul>
          </nav>
        )}

        {/* Desktop actions — hidden on mobile */}
        <div className="hidden lg:flex items-center gap-3">
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

        {/* Hamburger button — mobile only */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden flex flex-col justify-center items-center w-10 h-10 bg-transparent border-none cursor-pointer gap-[5px] p-1"
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-[2.5px] bg-white rounded transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-[7.5px]' : ''}`} />
          <span className={`block w-6 h-[2.5px] bg-white rounded transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-[2.5px] bg-white rounded transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-[7.5px]' : ''}`} />
        </button>
      </div>

      {/* Mobile menu — slide down */}
      <div className={`lg:hidden overflow-hidden transition-all duration-300 ${mobileMenuOpen ? 'max-h-[600px] border-t border-white/10' : 'max-h-0'}`}>
        <div className="px-4 py-4 flex flex-col gap-3">
          {/* Search */}
          {showSearch && (
            <input
              type="search"
              placeholder="Cari Berita..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full rounded-lg border border-white/30 bg-white/10 text-white placeholder-white/50 py-2.5 px-4 text-[14px] outline-none focus:border-white/60 transition-colors"
            />
          )}

          {/* Categories */}
          {showCategories && (
            <div className="flex flex-wrap gap-2 py-2">
              {categories.map(cat => (
                <Link
                  key={cat.slug}
                  to={`/category/${cat.slug}`}
                  onClick={closeMobile}
                  className={`nav-category-link no-underline rounded-[5px] text-white py-1.5 px-3 text-[13px] transition-all duration-200 ${
                    activeCategory === cat.slug ? 'nav-category-active' : 'bg-white/5'
                  }`}
                >
                  {cat.label}
                </Link>
              ))}
              <Link
                to="/category/eksklusif"
                onClick={closeMobile}
                className={`nav-category-link no-underline rounded-[5px] text-white py-1.5 px-3 text-[13px] transition-all duration-200 ${
                  activeCategory === 'eksklusif' ? 'nav-category-active' : 'bg-white/5'
                }`}
              >
                Eksklusif
              </Link>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
            {!isAuthenticated ? (
              <>
                <Link onClick={closeMobile} to="/login" className="no-underline bg-brand text-white py-2.5 px-4 rounded-lg border-none text-center text-[14px] font-semibold">
                  Pengawal Eksklusif
                </Link>
                <Link onClick={closeMobile} to="/login" className="no-underline bg-white/10 text-white py-2.5 px-4 rounded-lg border-none text-center text-[14px] font-semibold">
                  Masuk/Daftar
                </Link>
              </>
            ) : isAdmin ? (
              <Link onClick={closeMobile} to="/admin" className="no-underline bg-brand text-white py-2.5 px-4 rounded-lg border-none text-center text-[14px] font-semibold">
                Dashboard
              </Link>
            ) : isMember ? (
              <>
                <Link onClick={closeMobile} to="/mulai-ngawal" className="no-underline bg-brand text-white py-2.5 px-4 rounded-lg border-none text-center text-[14px] font-semibold">
                  Mulai Ngawal
                </Link>
                <div className="flex items-center gap-3 pt-1">
                  <Link onClick={closeMobile} to="/account" className="no-underline w-9 h-9 rounded-full bg-white text-brand flex items-center justify-center text-[13px] font-bold" title={user.username}>
                    {user.initials || 'MB'}
                  </Link>
                  <span className="text-white text-[14px]">{user.username}</span>
                  <span className="member-badge-plus bg-linear-to-r from-[#1e3a8a] to-[#3b82f6] text-white text-[11px] font-extrabold py-1 px-2 rounded-full shadow-[0_2px_8px_rgba(30,58,138,0.4)] tracking-[0.5px]">
                    T+
                  </span>
                </div>
              </>
            ) : (
              <>
                {!isSubscriptionPage && (
                  <Link onClick={closeMobile} to="/subscription" className="no-underline bg-brand text-white py-2.5 px-4 rounded-lg border-none text-center text-[14px] font-semibold">
                    Pengawal Eksklusif
                  </Link>
                )}
                <div className="flex items-center gap-3 pt-1">
                  <Link onClick={closeMobile} to="/account" className="no-underline w-9 h-9 rounded-full bg-white text-brand flex items-center justify-center text-[13px] font-bold" title={user.username}>
                    {user.initials || 'US'}
                  </Link>
                  <span className="text-white text-[14px]">{user.username}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
});

export default Header;
