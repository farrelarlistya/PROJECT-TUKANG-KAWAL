import { useState, useEffect } from 'react';
import { useToast } from '@/context/AppContext';

export default function AccountInfo() {
  const { addToast } = useToast();
  const [form, setForm] = useState({ namaLengkap: '', tanggalLahir: '', nomorWa: '', kota: '' });

  useEffect(() => {
    const saved = localStorage.getItem('userProfile');
    if (saved) setForm(JSON.parse(saved));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('userProfile', JSON.stringify(form));
    addToast('Informasi akun berhasil disimpan!', 'success');
  };

  const update = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  return (
    <section className="akun-content bg-white rounded-xl border border-[#e5e7eb] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] p-10 h-fit">
      <h1 className="akun-page-title font-playfair text-[28px] text-[#111827] mb-8 pb-4 border-b border-[#e5e7eb]">Informasi Akun</h1>
      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        {[['Nama Lengkap','namaLengkap','text','Masukkan nama lengkap'],['Tanggal Lahir','tanggalLahir','date',''],['Nomor WhatsApp','nomorWa','tel','Masukkan nomor whatsapp']].map(([label,field,type,ph])=>(
          <div key={field} className="flex flex-col gap-2">
            <label className="text-[14px] font-semibold text-[#374151] font-dm-sans">{label}</label>
            <input type={type} value={form[field]} onChange={update(field)} placeholder={ph} className="akun-form-input w-full py-3.5 px-4 border border-[#e5e7eb] rounded-lg font-dm-sans text-[15px] text-[#111827] outline-none transition-all duration-200 bg-[#f9fafb] focus:border-primary-blue focus:shadow-[0_0_0_3px_rgba(30,58,138,0.15)] focus:bg-white" />
          </div>
        ))}
        <div className="flex flex-col gap-2">
          <label className="text-[14px] font-semibold text-[#374151] font-dm-sans">Kota</label>
          <select value={form.kota} onChange={update('kota')} className="akun-form-input w-full py-3.5 px-4 border border-[#e5e7eb] rounded-lg font-dm-sans text-[15px] text-[#111827] outline-none transition-all duration-200 bg-[#f9fafb] focus:border-primary-blue focus:shadow-[0_0_0_3px_rgba(30,58,138,0.15)] focus:bg-white">
            <option value="" disabled>Pilih Kota</option>
            {['Jakarta','Surabaya','Bandung','Medan','Semarang','Makassar','Palembang','Yogyakarta','Denpasar','Malang'].map(c=>(
              <option key={c} value={c.toLowerCase()}>{c}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="akun-btn-simpan bg-primary-blue text-white border-none py-3.5 px-10 rounded-lg text-base font-semibold font-dm-sans cursor-pointer transition-all duration-200 self-start mt-2 hover:bg-primary-hover hover:shadow-[0_4px_12px_rgba(30,58,138,0.3)] active:scale-[0.98]">Simpan</button>
      </form>
    </section>
  );
}
