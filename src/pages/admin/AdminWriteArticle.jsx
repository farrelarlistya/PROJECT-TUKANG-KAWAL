import { useState, useEffect } from 'react';
import { useAuth, useToast } from '@/context/AppContext';
import { createArticle, uploadArticleCover } from '@/services/articleService';
import { supabase } from '@/services/supabaseClient';

export default function AdminWriteArticle() {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ judul: '', tags: '', kategori_id: '', konten: '', eksklusif: false, gambar: null });
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

  const update = (f) => (e) => setForm(s => ({ 
    ...s, 
    [f]: e.target.type === 'checkbox' ? e.target.checked : (e.target.type === 'file' ? e.target.files[0] : e.target.value) 
  }));
  const inputClass = "admin-form-input w-full py-3 px-4 border border-[#dcdcdc] rounded-lg text-[14px] outline-none bg-white focus:border-brand";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.judul || !form.konten) { 
      addToast('Judul dan konten wajib diisi!', 'error'); 
      return; 
    }

    // Validasi ukuran file sebelum submit
    if (form.gambar && form.gambar.size > 5 * 1024 * 1024) {
      addToast('Ukuran gambar terlalu besar. Maksimal 5MB.', 'error');
      return;
    }
    
    setIsSubmitting(true);
    try {
      let cover_image_url = null;
      if (form.gambar && user) {
        try {
          cover_image_url = await uploadArticleCover(form.gambar, user.id);
        } catch (uploadErr) {
          console.warn('Upload gambar gagal, lanjut tanpa gambar:', uploadErr);
          addToast('Upload gambar gagal: ' + uploadErr.message + '. Artikel tetap dipublikasikan tanpa gambar.', 'warning');
        }
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
        status: 'published',
        is_exclusive: form.eksklusif,
        tags: tagsArray,
        published_at: new Date().toISOString()
      });

      addToast('Artikel berhasil dipublikasikan!', 'success');
      setForm({ judul: '', tags: '', kategori_id: categories[0]?.id || '', konten: '', eksklusif: false, gambar: null });
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
    } catch (err) {
      console.error(err);
      addToast('Gagal mempublikasikan artikel: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="mb-1">
        <h1 className="text-[22px] font-bold text-navy">Tulis Artikel Baru</h1>
        <p className="text-[13.5px] text-[#888] mt-1">Buat artikel baru untuk dipublikasikan</p>
      </div>
      <form onSubmit={handleSubmit} className="bg-white border border-[#dcdcdc] rounded-lg p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col gap-5">
        <div>
          <label className="text-[13px] font-semibold text-[#333] mb-1.5 block">Judul Artikel</label>
          <input className={inputClass} value={form.judul} onChange={update('judul')} placeholder="Masukkan judul artikel..." disabled={isSubmitting} />
        </div>
        <div>
          <label className="text-[13px] font-semibold text-[#333] mb-1.5 block">Tags</label>
          <input className={inputClass} value={form.tags} onChange={update('tags')} placeholder="Tag (pisahkan dengan koma) cth: pemilu, 2024" disabled={isSubmitting} />
        </div>
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="text-[13px] font-semibold text-[#333] mb-1.5 block">Kategori</label>
            <select className={inputClass} value={form.kategori_id} onChange={update('kategori_id')} disabled={isSubmitting}>
              {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[13px] font-semibold text-[#333] mb-1.5 block">Gambar Cover</label>
            <input type="file" className={inputClass} accept="image/*" onChange={update('gambar')} disabled={isSubmitting} />
          </div>
        </div>
        <div>
          <label className="text-[13px] font-semibold text-[#333] mb-1.5 block">Konten</label>
          <textarea className={`${inputClass} min-h-[200px] resize-y`} value={form.konten} onChange={update('konten')} placeholder="Tulis isi artikel..." disabled={isSubmitting} />
        </div>
        <label className="exclusive-toggle flex items-center gap-3 p-4 border border-[#dcdcdc] rounded-lg cursor-pointer">
          <div className="toggle-switch relative w-11 h-6 inline-block">
            <input type="checkbox" className="sr-only" checked={form.eksklusif} onChange={update('eksklusif')} disabled={isSubmitting} />
            <span className="toggle-slider" />
          </div>
          <span className="text-[14px] font-semibold text-[#333]">Konten Eksklusif</span>
        </label>
        <button type="submit" disabled={isSubmitting} className="bg-brand text-white py-3 px-6 rounded-lg border-none text-[14px] font-semibold cursor-pointer self-end hover:bg-brand-hover disabled:opacity-50">
          {isSubmitting ? 'Mengunggah...' : 'Publikasikan'}
        </button>
      </form>
    </>
  );
}
