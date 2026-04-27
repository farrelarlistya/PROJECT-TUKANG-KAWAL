import Header from './Header';
import Footer from './Footer';
import Toast from '@/components/ui/Toast';
import { useScrollRestore } from '@/hooks/useScrollRestore';
import { useLocation } from 'react-router-dom';

/**
 * PageWrapper — Layout wrapper untuk halaman publik
 * @param {{ children, showFooter, showSearch, showCategories, activeCategory }} props
 */
export default function PageWrapper({
  children,
  showFooter = true,
  showSearch = false,
  showCategories = true,
  activeCategory = '',
  headerOnly = false,
}) {
  useScrollRestore();
  const location = useLocation();

  return (
    <div key={location.pathname} className="page-fade-in min-h-screen flex flex-col">
      <Header
        showSearch={showSearch}
        showCategories={showCategories && !headerOnly}
        activeCategory={activeCategory}
      />
      <Toast />
      <main className="flex-grow">
        {children}
      </main>
      {showFooter && !headerOnly && <Footer />}
    </div>
  );
}
