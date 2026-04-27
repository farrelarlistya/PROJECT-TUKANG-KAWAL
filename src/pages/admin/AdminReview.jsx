export default function AdminReview() {
  const items = [
    { title: 'Investigasi Korupsi Dana Desa 2026', author: 'Budi Santoso', date: '27 Apr 2026', status: 'Menunggu' },
    { title: 'Kebijakan Energi Baru Pemerintah', author: 'Siti Rahmawati', date: '26 Apr 2026', status: 'Menunggu' },
    { title: 'Dampak AI Terhadap Lapangan Kerja', author: 'Andi Wijaya', date: '25 Apr 2026', status: 'Menunggu' },
  ];
  return (
    <>
      <div className="mb-1"><h1 className="text-[22px] font-bold text-navy">Review & Persetujuan</h1><p className="text-[13.5px] text-[#888] mt-1">Artikel yang memerlukan tinjauan redaksi</p></div>
      <div className="bg-white border border-[#dcdcdc] rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
        <table className="data-table w-full border-collapse">
          <thead><tr><th>Judul Artikel</th><th>Penulis</th><th>Tanggal</th><th>Status</th><th>Aksi</th></tr></thead>
          <tbody>
            {items.map((it,i)=>(
              <tr key={i}><td className="font-semibold">{it.title}</td><td>{it.author}</td><td>{it.date}</td><td><span className="bg-[#fef3c7] text-[#92400e] py-1 px-2.5 rounded text-[12px] font-semibold">{it.status}</span></td><td className="flex gap-2"><button className="bg-[#059669] text-white py-1.5 px-3 rounded text-[12px] font-semibold border-none cursor-pointer">Setujui</button><button className="bg-[#dc2626] text-white py-1.5 px-3 rounded text-[12px] font-semibold border-none cursor-pointer">Tolak</button></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
