export function SkeletonCard() {
  return (
    <div className="news-card block bg-white rounded-lg overflow-hidden">
      <div className="skeleton skeleton-image" style={{ height: '180px' }} />
      <div className="p-[15px]">
        <div className="skeleton skeleton-text" style={{ width: '60px', height: '20px', marginBottom: '10px' }} />
        <div className="skeleton skeleton-text" style={{ width: '100%', height: '18px', marginBottom: '6px' }} />
        <div className="skeleton skeleton-text" style={{ width: '80%', height: '18px', marginBottom: '10px' }} />
        <div className="skeleton skeleton-text" style={{ width: '100%', height: '14px', marginBottom: '4px' }} />
        <div className="skeleton skeleton-text" style={{ width: '70%', height: '14px', marginBottom: '10px' }} />
        <div className="skeleton skeleton-text" style={{ width: '40%', height: '12px' }} />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }) {
  return Array.from({ length: count }, (_, i) => <SkeletonCard key={i} />);
}

export function SkeletonHotNews() {
  return (
    <div className="hot-news flex gap-[50px] bg-white mx-[50px] my-5">
      <div className="skeleton skeleton-image" style={{ width: '40vw', minHeight: '300px' }} />
      <div className="pr-[30px] flex flex-col justify-center gap-5 flex-1">
        <div className="skeleton skeleton-text" style={{ width: '90%', height: '35px' }} />
        <div className="skeleton skeleton-text" style={{ width: '100%', height: '16px' }} />
        <div className="skeleton skeleton-text" style={{ width: '70%', height: '16px' }} />
        <div className="skeleton skeleton-text" style={{ width: '30%', height: '14px' }} />
      </div>
    </div>
  );
}

export function SkeletonTrending({ count = 5 }) {
  return Array.from({ length: count }, (_, i) => (
    <li key={i} className="flex items-center gap-5 py-[15px] border-b border-[#eee]">
      <div className="skeleton" style={{ width: '80px', height: '80px', borderRadius: '8px' }} />
      <div className="skeleton" style={{ width: '40px', height: '32px', borderRadius: '4px' }} />
      <div className="flex-1">
        <div className="skeleton skeleton-text" style={{ width: '60px', height: '18px', marginBottom: '8px' }} />
        <div className="skeleton skeleton-text" style={{ width: '80%', height: '16px' }} />
      </div>
    </li>
  ));
}
