import { useState } from 'react';
import { useToast } from '@/context/AppContext';

export default function AdminWriteArticle() {
  const { addToast } = useToast();
  const [form, setForm] = useState({ judul: '', kategori: 'Politik & Hukum', konten: '', eksklusif: false });
  const update = (f) => (e) => setForm(s => ({ ...s, [f]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const inputClass = "admin-form-input w-full py-3 px-4 border border-[#dcdcdc] rounded-lg text-[14px] outline-none bg-white focus:border-brand";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.judul || !form.konten) { addToast('Judul dan konten wajib diisi!', 'error'); return; }
    addToast('Artikel berhasil dipublikasikan!', 'success');
    setForm({ judul: '', kategori: 'Politik & Hukum', konten: '', eksklusif: false });
  };

  return (
    <>
      <div className="mb-1"><h1 className="text-[22px] font-bold text-navy">Tulis Artikel Baru</h1><p className="text-[13.5px] text-[#888] mt-1">Buat artikel baru untuk dipublikasikan</p></div>
      <form onSubmit={handleSubmit} className="bg-white border border-[#dcdcdc] rounded-lg p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col gap-5">
        <div><label className="text-[13px] font-semibold text-[#333] mb-1.5 block">Judul Artikel</label><input className={inputClass} value={form.judul} onChange={update('judul')} placeholder="Masukkan judul artikel..." /></div>
        <div><label className="text-[13px] font-semibold text-[#333] mb-1.5 block">Kategori</label><select className={inputClass} value={form.kategori} onChange={update('kategori')}>{['Politik & Hukum','Ekonomi Bisnis','Teknologi','Kesehatan','Olahraga','Hiburan'].map(c=><option key={c}>{c}</option>)}</select></div>
        <div><label className="text-[13px] font-semibold text-[#333] mb-1.5 block">Konten</label><textarea className={`${inputClass} min-h-[200px] resize-y`} value={form.konten} onChange={update('konten')} placeholder="Tulis isi artikel..." /></div>
        <label className="exclusive-toggle flex items-center gap-3 p-4 border border-[#dcdcdc] rounded-lg cursor-pointer">
          <div className="toggle-switch relative w-11 h-6 inline-block"><input type="checkbox" className="sr-only" checked={form.eksklusif} onChange={update('eksklusif')} /><span className="toggle-slider" /></div>
          <span className="text-[14px] font-semibold text-[#333]">Konten Eksklusif</span>
        </label>
        <button type="submit" className="bg-brand text-white py-3 px-6 rounded-lg border-none text-[14px] font-semibold cursor-pointer self-end hover:bg-brand-hover">Publikasikan</button>
      </form>
    </>
  );
}
