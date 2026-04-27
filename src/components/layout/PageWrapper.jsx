import Header from './Header';
import Footer from './Footer';
import Toast from '@/components/ui/Toast';
import { useScrollRestore } from '@/hooks/useScrollRestore';

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

  return (
    <>
      <Header
        showSearch={showSearch}
        showCategories={showCategories && !headerOnly}
        activeCategory={activeCategory}
      />
      <Toast />
      {children}
      {showFooter && !headerOnly && <Footer />}
    </>
  );
}
