import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '@/components/layout/PageWrapper';
import { useAuth, useToast } from '@/context/AppContext';
import Modal from '@/components/ui/Modal';

export default function Subscription() {
  const [paket, setPaket] = useState('1tahun');
  const [payment, setPayment] = useState('bca');
  const [agreed, setAgreed] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showPhonePopup, setShowPhonePopup] = useState(false);
  const [processing, setProcessing] = useState(false);
  const { user, isAuthenticated, upgradeToMember } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const prices = { '1bulan': { label: '1 Bulan', monthly: 'Rp 49.000', total: 'Rp 49.000', amount: 49000 }, '1tahun': { label: '1 Tahun', monthly: 'Rp 34.300', total: 'Rp 411.600', amount: 411600 } };
  const selected = prices[paket];

  // VA prefix per bank/ewallet
  const vaPrefix = {
    bca: '80777',
    mandiri: '89008',
    gopay: '90001',
    ovo: '90002',
  };

  const getPhoneSuffix = () => {
    const phone = user?.phoneWa || '';
    // Ambil 8 digit terakhir no HP
    const digits = phone.replace(/\D/g, '');
    return digits.slice(-8) || '00000000';
  };

  const getVANumber = () => {
    const prefix = vaPrefix[payment] || '99999';
    return `${prefix} ${getPhoneSuffix().slice(0,4)} ${getPhoneSuffix().slice(4)}`;
  };

  const handleProceed = () => {
    if (!agreed) { addToast('Setujui syarat & ketentuan', 'error'); return; }
    if (!isAuthenticated) { navigate('/login'); return; }
    
    // Cek no HP untuk metode non-QRIS
    if (payment !== 'qris' && !user?.phoneWa) {
      setShowPhonePopup(true);
      return;
    }

    setShowPayment(true);
  };

  const handleConfirmPayment = async () => {
    setProcessing(true);
    try {
      const va = payment !== 'qris' ? getVANumber().replace(/\s/g, '') : 'QRIS';
      await upgradeToMember(paket, payment, selected.amount, va);
      addToast('Pembayaran berhasil dikonfirmasi. Anda sekarang adalah member eksklusif!', 'success');
      setShowPayment(false);
      navigate('/account/subscription');
    } catch (err) {
      addToast('Gagal memproses pembayaran: ' + err.message, 'error');
    } finally {
      setProcessing(false);
    }
  };

  const paymentLabels = {
    bca: 'BCA Virtual Account',
    mandiri: 'Mandiri Virtual Account',
    gopay: 'GoPay',
    ovo: 'OVO',
    qris: 'QRIS',
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
        <div className="flex flex-col gap-0">
          {/* Card 1 Bulan */}
          <label className={`paket-card flex items-center justify-between py-5 px-6 border border-[#e0e0e0] bg-white cursor-pointer transition-all duration-200 relative rounded-t-lg hover:bg-[#fafafa] ${paket==='1bulan'?'!border-brand !bg-brand-light z-[1]':''}`}>
            <div className="flex-1">
              <div className="text-base font-bold text-[#1a1a1a]">Langganan 1 Bulan</div>
              <div className="text-[13px] text-[#666] mt-1.5">Akses penuh selama 30 hari.</div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[26px] font-extrabold text-[#1a1a1a]">Rp 49.000<span className="text-[14px] font-normal text-[#888]">/bln</span></span>
              <input type="radio" name="paket" checked={paket==='1bulan'} onChange={()=>setPaket('1bulan')} className="w-5 h-5 accent-brand" />
            </div>
          </label>
          {/* Card 1 Tahun — badge di dalam konten, bukan absolute */}
          <label className={`paket-card flex items-center justify-between py-5 px-6 border border-[#e0e0e0] bg-white cursor-pointer transition-all duration-200 relative rounded-b-lg hover:bg-[#fafafa] ${paket==='1tahun'?'!border-brand !bg-brand-light z-[1]':''}`}>
            <div className="flex-1">
              <div className="flex items-center gap-2.5 mb-1">
                <div className="text-base font-bold text-[#1a1a1a]">Langganan 1 Tahun</div>
                <span className="bg-brand text-white text-[11px] font-bold py-0.5 px-2.5 rounded-[4px]">Lebih Hemat 30%</span>
              </div>
              <div className="text-[13px] text-[#666] mt-1">Akses penuh selama 12 bulan. Ditagih Rp 411.600 per tahun.</div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[26px] font-extrabold text-[#1a1a1a]">Rp 34.300<span className="text-[14px] font-normal text-[#888]">/bln</span></span>
              <input type="radio" name="paket" checked={paket==='1tahun'} onChange={()=>setPaket('1tahun')} className="w-5 h-5 accent-brand" />
            </div>
          </label>
        </div>

        <div className="flex items-center gap-3 mb-5 mt-10">
          <span className="step-number inline-flex items-center justify-center text-white w-7 h-7 bg-navy text-[14px] font-bold rounded-[4px] shrink-0">2</span>
          <h2 className="text-[20px] font-bold text-[#1a1a1a]">Pilih Metode Pembayaran</h2>
        </div>
        <div className="border border-[#e0e0e0] rounded-lg overflow-hidden bg-white">
          {[{group:'Bank Transfer',opts:[['bca','','BCA Virtual Account'],['mandiri','','Mandiri Virtual Account']]},{group:'E-Wallet & QRIS',opts:[['gopay','','GoPay'],['ovo','','OVO'],['qris','','QRIS']]}].map(g=>(
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
          <button onClick={handleProceed} className="block w-full p-4 mt-4 bg-navy text-white text-base font-bold border-none rounded-[6px] cursor-pointer transition-all duration-200 hover:bg-[#0f2397] hover:-translate-y-[1px]">Lanjutkan ke Pembayaran</button>
        </div>
      </main>

      {/* ── Modal: Popup instruksi isi no HP ── */}
      <Modal isOpen={showPhonePopup} onClose={() => setShowPhonePopup(false)} title="Lengkapi Nomor WhatsApp">
        <div className="text-center mb-5">
          <div className="w-16 h-16 rounded-full bg-[#fffbeb] flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#f59e0b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h3 className="text-[18px] font-bold text-[#111827] mb-2">Nomor WhatsApp Belum Diisi</h3>
          <p className="text-[14px] text-[#6b7280] leading-[1.6]">
            Nomor WhatsApp diperlukan untuk membuat nomor Virtual Account pembayaran Anda. 
            Silakan lengkapi terlebih dahulu di halaman <strong>Informasi Akun</strong>.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowPhonePopup(false)} className="flex-1 py-3 border border-[#e5e7eb] bg-white text-[#374151] rounded-lg text-[14px] font-semibold cursor-pointer hover:bg-[#f9fafb] transition-colors">Nanti</button>
          <button onClick={() => { setShowPhonePopup(false); navigate('/account'); }} className="flex-1 py-3 bg-navy text-white border-none rounded-lg text-[14px] font-semibold cursor-pointer hover:bg-[#0f2397] transition-colors">Lengkapi Sekarang</button>
        </div>
      </Modal>

      {/* ── Modal: Detail Pembayaran VA / QRIS ── */}
      <Modal isOpen={showPayment} onClose={() => setShowPayment(false)} title="Detail Pembayaran">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-[#eff6ff] flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
            </svg>
          </div>
          <p className="text-[13px] text-[#6b7280] mb-1">Metode Pembayaran</p>
          <p className="text-[17px] font-bold text-[#111827]">{paymentLabels[payment]}</p>
        </div>

        {/* Total */}
        <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-lg p-4 mb-5">
          <div className="flex justify-between items-center">
            <span className="text-[13px] text-[#6b7280]">Total Pembayaran</span>
            <span className="text-[20px] font-extrabold text-navy">{selected.total}</span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-[12px] text-[#9ca3af]">Paket {selected.label}</span>
          </div>
        </div>

        {payment === 'qris' ? (
          /* QRIS - Tampilkan QR Code dummy */
          <div className="text-center mb-5">
            <p className="text-[13px] text-[#6b7280] mb-3">Scan kode QR di bawah ini untuk membayar:</p>
            <div className="inline-block bg-white border-2 border-[#e5e7eb] rounded-xl p-4 mx-auto">
              {/* QR Code SVG placeholder */}
              <svg width="180" height="180" viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
                <rect width="180" height="180" fill="white"/>
                {/* Outer frame top-left */}
                <rect x="10" y="10" width="50" height="50" fill="none" stroke="#1e3a8a" strokeWidth="4"/>
                <rect x="18" y="18" width="34" height="34" fill="#1e3a8a"/>
                {/* Outer frame top-right */}
                <rect x="120" y="10" width="50" height="50" fill="none" stroke="#1e3a8a" strokeWidth="4"/>
                <rect x="128" y="18" width="34" height="34" fill="#1e3a8a"/>
                {/* Outer frame bottom-left */}
                <rect x="10" y="120" width="50" height="50" fill="none" stroke="#1e3a8a" strokeWidth="4"/>
                <rect x="18" y="128" width="34" height="34" fill="#1e3a8a"/>
                {/* Data modules */}
                {[
                  [70,10],[80,10],[90,10],[100,10],
                  [70,20],[100,20],[110,20],
                  [70,30],[80,30],[90,30],[110,30],
                  [70,40],[100,40],[110,40],
                  [10,70],[20,70],[30,70],[40,70],[50,70],[70,70],[80,70],[90,70],[100,70],[110,70],[120,70],[130,70],[140,70],[150,70],[160,70],
                  [10,80],[30,80],[50,80],[70,80],[90,80],[110,80],[130,80],[150,80],
                  [10,90],[20,90],[30,90],[40,90],[50,90],[70,90],[80,90],[90,90],[100,90],[110,90],[130,90],[140,90],[160,90],
                  [10,100],[30,100],[50,100],[80,100],[100,100],[120,100],[140,100],[160,100],
                  [10,110],[20,110],[30,110],[40,110],[50,110],[70,110],[90,110],[100,110],[110,110],[130,110],[150,110],[160,110],
                  [70,120],[90,120],[120,120],[140,120],[160,120],
                  [70,130],[80,130],[100,130],[120,130],[130,130],[150,130],
                  [70,140],[90,140],[110,140],[130,140],[140,140],[150,140],[160,140],
                  [70,150],[80,150],[90,150],[100,150],[120,150],[140,150],[160,150],
                  [70,160],[100,160],[110,160],[130,160],[150,160]
                ].map(([x,y], i) => (
                  <rect key={i} x={x} y={y} width="8" height="8" fill="#1e3a8a"/>
                ))}
                {/* Center logo */}
                <rect x="70" y="70" width="40" height="40" rx="4" fill="white" stroke="#1e3a8a" strokeWidth="2"/>
                <text x="90" y="95" textAnchor="middle" fontFamily="serif" fontSize="18" fontWeight="bold" fill="#1e3a8a">T</text>
              </svg>
            </div>
            <p className="text-[12px] text-[#9ca3af] mt-3">QR berlaku selama 24 jam</p>
          </div>
        ) : (
          /* Non-QRIS - Tampilkan Virtual Account */
          <div className="text-center mb-5">
            <p className="text-[13px] text-[#6b7280] mb-3">Transfer ke nomor Virtual Account berikut:</p>
            <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-xl p-5 mx-auto">
              <p className="text-[12px] text-[#6b7280] mb-2 uppercase tracking-wide">Nomor Virtual Account</p>
              <p className="text-[28px] font-mono font-extrabold text-navy tracking-[3px]">{getVANumber()}</p>
              <button 
                onClick={() => { navigator.clipboard.writeText(getVANumber().replace(/\s/g, '')); addToast('Nomor VA berhasil disalin!', 'success'); }}
                className="mt-3 text-[12px] text-brand font-semibold bg-white border border-[#bfdbfe] rounded-lg py-1.5 px-4 cursor-pointer hover:bg-[#dbeafe] transition-colors"
              >
                📋 Salin Nomor
              </button>
            </div>
            <p className="text-[12px] text-[#9ca3af] mt-3">Selesaikan pembayaran dalam 24 jam</p>
          </div>
        )}

        <div className="border-t border-[#e5e7eb] pt-4 flex flex-col gap-3">
          <button 
            onClick={handleConfirmPayment}
            disabled={processing}
            className="w-full py-3.5 bg-[#059669] text-white border-none rounded-lg text-[15px] font-bold cursor-pointer transition-all duration-200 hover:bg-[#047857] disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Konfirmasi Telah Bayar
              </>
            )}
          </button>
          <button 
            onClick={() => setShowPayment(false)}
            className="w-full py-3 bg-white text-[#374151] border border-[#e5e7eb] rounded-lg text-[14px] font-semibold cursor-pointer hover:bg-[#f9fafb] transition-colors"
          >
            Batal
          </button>
        </div>
      </Modal>
    </PageWrapper>
  );
}
