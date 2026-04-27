import { useState } from 'react';
import PageWrapper from '@/components/layout/PageWrapper';
import { useToast } from '@/context/AppContext';

export default function MulaiNgawal() {
  const { addToast } = useToast();
  const [form, setForm] = useState({ judul: '', tags: '', kategori: 'Politik', konten: '', gambar: null });

  const handleSubmit = () => {
    if (!form.judul || !form.konten) { addToast('Judul dan konten wajib diisi!', 'error'); return; }
    const articles = JSON.parse(localStorage.getItem('userArticles') || '[]');
    articles.push({ ...form, gambar: form.gambar?.name || null, createdAt: new Date().toISOString(), id: Date.now() });
    localStorage.setItem('userArticles', JSON.stringify(articles));
    addToast('Artikel berhasil dipublikasikan!', 'success');
    setForm({ judul: '', tags: '', kategori: 'Politik', konten: '', gambar: null });
  };

  const update = (f) => (e) => setForm(s => ({ ...s, [f]: f === 'gambar' ? e.target.files[0] : e.target.value }));
  const inputClass = "w-full py-3.5 px-4 border border-[#e5e7eb] rounded-lg font-dm-sans text-[15px] text-[#111827] outline-none transition-all duration-200 bg-[#f9fafb] focus:border-primary-blue focus:shadow-[0_0_0_3px_rgba(30,58,138,0.15)] focus:bg-white";

  return (
    <PageWrapper showCategories={true}>
      <main className="max-w-[900px] mx-auto pt-[50px] px-5 pb-20 !bg-[#f9fafb]">
        <div className="text-center mb-10">
          <h1 className="font-playfair text-[42px] text-[#111827] mb-2.5">Mulai Ngawal</h1>
          <p className="text-[#6b7280] text-base font-dm-sans">Sampaikan berita, fakta, atau laporan investigasi Anda kepada publik.</p>
        </div>
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-10 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="mb-[30px] border-b border-[#e5e7eb] pb-[15px]">
            <span className="text-[22px] font-semibold text-[#111827]">Tulis Artikel Baru</span>
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-semibold text-[#374151]">Judul & Label</label>
              <input className={inputClass} type="text" value={form.judul} onChange={update('judul')} placeholder="Masukkan judul artikel..." />
              <input className={inputClass} type="text" value={form.tags} onChange={update('tags')} placeholder="Tag (pisahkan dengan koma) cth: pemilu, 2024" />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-semibold text-[#374151]">Kategori</label>
                <select className={inputClass} value={form.kategori} onChange={update('kategori')}>
                  {['Politik','Ekonomi Bisnis','Hukum','Kriminal','Lingkungan'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-semibold text-[#374151]">Gambar Utama</label>
                <input type="file" className={inputClass} accept="image/*" onChange={update('gambar')} />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-semibold text-[#374151]">Konten Artikel</label>
              <textarea className={`${inputClass} resize-y min-h-[250px] leading-[1.6]`} value={form.konten} onChange={update('konten')} placeholder="Tulis atau salin isi berita di sini..." />
            </div>
            <div className="flex justify-end mt-2.5">
              <button onClick={handleSubmit} className="bg-primary-blue text-white border-none py-3.5 px-8 rounded-lg text-base font-semibold cursor-pointer transition-colors duration-200 hover:bg-primary-hover">Publikasikan Artikel</button>
            </div>
          </div>
        </div>
      </main>
    </PageWrapper>
  );
}
