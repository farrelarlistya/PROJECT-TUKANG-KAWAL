import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '@/components/layout/PageWrapper';
import { useAuth, useToast } from '@/context/AppContext';

export default function Subscription() {
  const [paket, setPaket] = useState('1tahun');
  const [payment, setPayment] = useState('bca');
  const [agreed, setAgreed] = useState(false);
  const { isAuthenticated, upgradeToMember } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const prices = { '1bulan': { label: '1 Bulan', monthly: 'Rp 49.000', total: 'Rp 49.000' }, '1tahun': { label: '1 Tahun', monthly: 'Rp 34.300', total: 'Rp 411.600' } };
  const selected = prices[paket];

  const handleSubmit = () => {
    if (!agreed) { addToast('Setujui syarat & ketentuan', 'error'); return; }
    if (!isAuthenticated) { navigate('/login'); return; }
    upgradeToMember();
    addToast('Selamat! Anda sekarang Pengawal Eksklusif!', 'success');
    navigate('/account/subscription');
  };

  return (
    <PageWrapper showCategories={true}>
      <main className="langganan-container max-w-[760px] mx-auto py-8 px-6 pb-[60px]">
        <div className="text-center mb-10 pb-8 border-b border-[#e0e0e0]">
          <h1 className="font-playfair font-bold text-navy text-[28px] mb-3">Pengawal Eksklusif</h1>
          <p className="text-[15px] text-[#666] leading-[1.7] max-w-[560px] mx-auto">Satu akses penuh untuk membuka seluruh laporan investigasi mendalam, dokumen internal, dan analisis dari redaksi kami.</p>
        </div>

        <div className="flex items-center gap-3 mb-5 mt-10">
          <span className="step-number inline-flex items-center justify-center text-white w-7 h-7 bg-navy text-[14px] font-bold rounded-[4px] shrink-0">1</span>
          <h2 className="text-[20px] font-bold text-[#1a1a1a]">Pilih Durasi Berlangganan</h2>
        </div>
        <div className="flex flex-col">
          {Object.entries(prices).map(([key, p]) => (
            <label key={key} className={`paket-card flex items-center justify-between py-5 px-6 border border-[#e0e0e0] bg-white cursor-pointer transition-all duration-200 relative hover:bg-[#fafafa] ${paket===key?'!border-brand !bg-brand-light z-[1]':''} ${key==='1bulan'?'rounded-t-lg':''} ${key==='1tahun'?'rounded-b-lg':''}`}>
              {key === '1tahun' && <span className="absolute -top-3 left-5 bg-brand text-white text-[11px] font-bold py-1 px-3 rounded-[4px]">Lebih Hemat 30%</span>}
              <div className="flex-1">
                <div className="text-base font-bold text-[#1a1a1a]">Langganan {p.label}</div>
                <div className="text-[13px] text-[#666] mt-1.5">{key==='1bulan'?'Akses penuh selama 30 hari.':'Akses penuh selama 12 bulan. Ditagih '+p.total+' per tahun.'}</div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[26px] font-extrabold text-[#1a1a1a]">{p.monthly}<span className="text-[14px] font-normal text-[#888]">/bln</span></span>
                <input type="radio" name="paket" checked={paket===key} onChange={()=>setPaket(key)} className="w-5 h-5 accent-brand" />
              </div>
            </label>
          ))}
        </div>

        <div className="flex items-center gap-3 mb-5 mt-10">
          <span className="step-number inline-flex items-center justify-center text-white w-7 h-7 bg-navy text-[14px] font-bold rounded-[4px] shrink-0">2</span>
          <h2 className="text-[20px] font-bold text-[#1a1a1a]">Pilih Metode Pembayaran</h2>
        </div>
        <div className="border border-[#e0e0e0] rounded-lg overflow-hidden bg-white">
          {[{group:'Bank Transfer',opts:[['bca','🏦','BCA Virtual Account'],['mandiri','🏦','Mandiri Virtual Account']]},{group:'E-Wallet & QRIS',opts:[['gopay','📱','GoPay'],['ovo','📱','OVO'],['qris','📱','QRIS']]}].map(g=>(
            <details key={g.group} className="payment-group border-b border-[#e0e0e0] last:border-0" open={g.group==='Bank Transfer'}>
              <summary className="flex items-center justify-between py-4 px-6 text-[15px] font-semibold text-[#1a1a1a] cursor-pointer list-none hover:bg-[#fafafa]">{g.group}<span className="summary-arrow text-[12px] text-[#999]">▼</span></summary>
              <div className="py-2">
                {g.opts.map(([val,icon,label])=>(
                  <label key={val} className={`payment-option flex items-center gap-3.5 py-3 px-6 cursor-pointer transition-colors duration-150 hover:bg-[#f5f5f5] ${payment===val?'bg-brand-light':''}`}>
                    <input type="radio" name="payment" checked={payment===val} onChange={()=>setPayment(val)} className="w-4 h-4 accent-brand" />
                    <span className="text-[20px] w-10 text-center shrink-0">{icon}</span>
                    <span className="text-[14px] font-medium text-[#333]">{label}</span>
                  </label>
                ))}
              </div>
            </details>
          ))}
        </div>

        <div className="flex items-center gap-3 mb-5 mt-10">
          <span className="step-number inline-flex items-center justify-center text-white w-7 h-7 bg-navy text-[14px] font-bold rounded-[4px] shrink-0">3</span>
          <h2 className="text-[20px] font-bold text-[#1a1a1a]">Detail Tagihan</h2>
        </div>
        <div>
          <div className="flex justify-between items-center py-2.5 text-[14px] text-[#555]"><span>Langganan {selected.label}</span><span className="font-semibold text-[#1a1a1a]">{selected.total}</span></div>
          <div className="h-px bg-[#e0e0e0] my-1" />
          <div className="flex justify-between items-center pt-3 pb-1 text-[15px]"><span className="font-bold text-[#1a1a1a]">Total Pembayaran</span><span className="font-extrabold text-[18px] text-navy">{selected.total}</span></div>
        </div>
        <div className="mt-9 pt-6 border-t border-[#e0e0e0]">
          <label className="flex items-start gap-2.5 text-[14px] text-[#555] cursor-pointer leading-[1.5]">
            <input type="checkbox" checked={agreed} onChange={e=>setAgreed(e.target.checked)} className="mt-[3px] w-[18px] h-[18px] accent-navy shrink-0 cursor-pointer" />
            <span>Saya menyetujui <a href="#" className="text-[#1a1a1a] font-semibold underline">Syarat &amp; Ketentuan</a> serta <a href="#" className="text-[#1a1a1a] font-semibold underline">Kebijakan Privasi</a></span>
          </label>
          <button onClick={handleSubmit} className="block w-full p-4 mt-4 bg-navy text-white text-base font-bold border-none rounded-[6px] cursor-pointer transition-all duration-200 hover:bg-[#0f2397] hover:-translate-y-[1px]">Lanjutkan ke Pembayaran</button>
        </div>
      </main>
    </PageWrapper>
  );
}
