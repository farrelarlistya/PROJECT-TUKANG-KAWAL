import { useState, useEffect } from 'react';
import PageWrapper from '@/components/layout/PageWrapper';
import { useAuth, useToast } from '@/context/AppContext';
import { createArticle, uploadArticleCover } from '@/services/articleService';
import { supabase } from '@/services/supabaseClient';

export default function MulaiNgawal() {
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ judul: '', tags: '', kategori_id: '', konten: '', gambar: null });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadCategories() {
      const { data } = await supabase.from('categories').select('id, label');
      if (data) {
        setCategories(data);
        if (data.length > 0) setForm(s => ({ ...s, kategori_id: data[0].id }));
      }
    }
    loadCategories();
  }, []);

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      addToast('Anda harus login terlebih dahulu!', 'error');
      return;
    }
    if (!form.judul || !form.konten) { 
      addToast('Judul dan konten wajib diisi!', 'error'); 
      return; 
    }
    
    setIsSubmitting(true);
    try {
      let cover_image_url = null;
      if (form.gambar && user) {
        cover_image_url = await uploadArticleCover(form.gambar, user.id);
      }

      const slug = form.judul.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);
      const tagsArray = form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

      await createArticle({
        title: form.judul,
        slug: slug,
        description: form.konten.substring(0, 150) + '...',
        content: form.konten,
        cover_image_url,
        category_id: form.kategori_id,
        author_id: user.id,
        status: 'published', // Or 'draft' or 'review' depending on business logic
        is_exclusive: false,
        tags: tagsArray,
        published_at: new Date().toISOString()
      });

      addToast('Artikel berhasil dipublikasikan!', 'success');
      setForm({ judul: '', tags: '', kategori_id: categories[0]?.id || '', konten: '', gambar: null });
    } catch (err) {
      console.error(err);
      addToast('Gagal mempublikasikan artikel: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
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
              <input className={inputClass} type="text" value={form.judul} onChange={update('judul')} placeholder="Masukkan judul artikel..." disabled={isSubmitting} />
              <input className={inputClass} type="text" value={form.tags} onChange={update('tags')} placeholder="Tag (pisahkan dengan koma) cth: pemilu, 2024" disabled={isSubmitting} />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-semibold text-[#374151]">Kategori</label>
                <select className={inputClass} value={form.kategori_id} onChange={update('kategori_id')} disabled={isSubmitting}>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-semibold text-[#374151]">Gambar Utama</label>
                <input type="file" className={inputClass} accept="image/*" onChange={update('gambar')} disabled={isSubmitting} />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-semibold text-[#374151]">Konten Artikel</label>
              <textarea className={`${inputClass} resize-y min-h-[250px] leading-[1.6]`} value={form.konten} onChange={update('konten')} placeholder="Tulis atau salin isi berita di sini..." disabled={isSubmitting} />
            </div>
            <div className="flex justify-end mt-2.5">
              <button onClick={handleSubmit} disabled={isSubmitting || !isAuthenticated} className="bg-primary-blue text-white border-none py-3.5 px-8 rounded-lg text-base font-semibold cursor-pointer transition-colors duration-200 hover:bg-primary-hover disabled:opacity-50">
                {isSubmitting ? 'Mengunggah...' : 'Publikasikan Artikel'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </PageWrapper>
  );
}
