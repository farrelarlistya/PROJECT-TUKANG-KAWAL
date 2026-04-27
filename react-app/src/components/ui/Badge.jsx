import { getBadgeClass, getCategoryLabel } from '@/utils/categoryMapper';

/**
 * Category badge
 * @param {{ category: string, className?: string }} props
 */
export default function Badge({ category, className = '' }) {
  return (
    <span className={`inline-block py-[3px] px-2.5 rounded-[4px] text-[11px] font-bold text-white uppercase ${getBadgeClass(category)} ${className}`}>
      {getCategoryLabel(category)}
    </span>
  );
}
