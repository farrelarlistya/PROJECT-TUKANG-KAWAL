export default function AdminDashboard() {
  const stats = [{ val: '12', label: 'Menunggu Persetujuan' },{ val: '342', label: 'Total Artikel Ditulis' },{ val: '1,247', label: 'Total Pengguna Aktif' },{ val: '128', label: 'Pelanggan Membership' }];
  const categories = [['Politik & Hukum','120'],['Ekonomi Bisnis','85'],['Teknologi','60'],['Kesehatan','77']];
  return (
    <>
      <div className="mb-1"><h1 className="text-[22px] font-bold text-navy">Dashboard Utama</h1><p className="text-[13.5px] text-[#888] mt-1">Ringkasan aktivitas dan statistik sistem TukangKawal</p></div>
      <section>
        <div className="text-[20px] font-bold text-navy mb-3">Ringkasan Sistem</div>
        <div className="grid grid-cols-4 gap-4">
          {stats.map((s,i)=><div key={i} className="bg-white border border-[#dcdcdc] rounded-lg p-[18px] flex flex-col gap-2 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"><div className="text-[28px] font-bold text-[#333]">{s.val}</div><div className="text-[13px] text-[#565656]">{s.label}</div></div>)}
        </div>
      </section>
      <div className="my-[15px] bg-white border border-[#dcdcdc] rounded-lg p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="mb-4 pb-3 border-b border-[#f0f4f8]"><span className="text-base font-semibold text-navy">Daftar Kategori Artikel</span></div>
        <ul className="list-none flex flex-col gap-3">
          {categories.map(([name,count],i)=><li key={i} className="flex justify-between items-center py-2.5 px-3.5 bg-[#f0f4f8] rounded-[6px] border border-[#dcdcdc]"><span className="font-semibold text-[#333]">{name}</span><span className="bg-brand text-white py-[2px] px-2 rounded-xl text-[12px] font-bold">{count}</span></li>)}
        </ul>
      </div>
    </>
  );
}
