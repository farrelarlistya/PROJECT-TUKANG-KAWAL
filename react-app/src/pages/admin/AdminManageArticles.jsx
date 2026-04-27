export default function AdminManageArticles() {
  const articles = [
    { title: 'Pemilu 2026: Analisis Mendalam', category: 'Politik', date: '25 Apr', status: 'Diterbitkan' },
    { title: 'Startup Unicorn Baru Indonesia', category: 'Bisnis', date: '24 Apr', status: 'Diterbitkan' },
    { title: 'Vaksin Generasi Terbaru', category: 'Kesehatan', date: '23 Apr', status: 'Draft' },
  ];
  return (
    <>
      <div className="mb-1"><h1 className="text-[22px] font-bold text-navy">Kelola Artikel</h1><p className="text-[13.5px] text-[#888] mt-1">Semua artikel yang tersimpan di sistem</p></div>
      <div className="bg-white border border-[#dcdcdc] rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
        <table className="data-table w-full border-collapse">
          <thead><tr><th>Judul</th><th>Kategori</th><th>Tanggal</th><th>Status</th><th>Aksi</th></tr></thead>
          <tbody>{articles.map((a,i)=><tr key={i}><td className="font-semibold">{a.title}</td><td>{a.category}</td><td>{a.date}</td><td><span className={`py-1 px-2.5 rounded text-[12px] font-semibold ${a.status==='Diterbitkan'?'bg-[#d1fae5] text-[#065f46]':'bg-[#e5e7eb] text-[#374151]'}`}>{a.status}</span></td><td className="flex gap-2"><button className="bg-brand text-white py-1.5 px-3 rounded text-[12px] font-semibold border-none cursor-pointer">Edit</button><button className="bg-[#dc2626] text-white py-1.5 px-3 rounded text-[12px] font-semibold border-none cursor-pointer">Hapus</button></td></tr>)}</tbody>
        </table>
      </div>
    </>
  );
}
