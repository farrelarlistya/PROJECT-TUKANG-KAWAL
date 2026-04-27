export default function AdminMembership() {
  const plans = [
    { name: 'Langganan 1 Bulan', price: 'Rp 49.000', subscribers: 45, status: 'Aktif' },
    { name: 'Langganan 1 Tahun', price: 'Rp 411.600', subscribers: 83, status: 'Aktif' },
  ];
  return (
    <>
      <div className="mb-1"><h1 className="text-[22px] font-bold text-navy">Paket Membership</h1><p className="text-[13.5px] text-[#888] mt-1">Kelola paket langganan yang tersedia</p></div>
      <div className="grid grid-cols-2 gap-5">
        {plans.map((p,i)=>(
          <div key={i} className="bg-white border border-[#dcdcdc] rounded-lg p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <h3 className="text-[18px] font-bold text-navy mb-2">{p.name}</h3>
            <p className="text-[28px] font-extrabold text-[#333] mb-4">{p.price}</p>
            <div className="flex justify-between text-[14px] mb-2"><span className="text-[#666]">Pelanggan Aktif</span><span className="font-bold text-[#333]">{p.subscribers}</span></div>
            <div className="flex justify-between text-[14px] mb-4"><span className="text-[#666]">Status</span><span className="font-bold text-[#059669]">{p.status}</span></div>
            <button className="w-full bg-brand text-white py-2.5 rounded-lg border-none text-[14px] font-semibold cursor-pointer hover:bg-brand-hover">Edit Paket</button>
          </div>
        ))}
      </div>
    </>
  );
}
