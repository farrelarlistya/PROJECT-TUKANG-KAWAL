import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useToast } from '@/context/AppContext';

export default function Register() {
  const [form, setForm] = useState({ nama: '', username: '', email: '', password: '', confirm: '', terms: false });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { addToast('Konfirmasi password tidak cocok!', 'error'); return; }
    if (!form.terms) { addToast('Setujui syarat & ketentuan', 'error'); return; }
    
    setLoading(true);
    setTimeout(() => {
      const result = register(form.nama, form.username, form.email, form.password);
      if (result.success) { 
        addToast('Pendaftaran berhasil! Silakan masuk.', 'success'); 
        navigate('/login'); 
      } else {
        addToast(result.error, 'error');
        setLoading(false);
      }
    }, 500);
  };

  const update = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const formFields = [
    { id: 'nama', label: 'Nama Lengkap', type: 'text', placeholder: 'Masukkan nama lengkap' },
    { id: 'username', label: 'Username', type: 'text', placeholder: 'Masukkan username' },
    { id: 'email', label: 'Email Address', type: 'email', placeholder: 'nama@email.com' },
    { id: 'password', label: 'Kata Sandi', type: 'password', placeholder: 'Minimal 8 karakter' },
    { id: 'confirm', label: 'Konfirmasi Kata Sandi', type: 'password', placeholder: 'Masukkan ulang kata sandi' }
  ];

  return (
    <div className="min-h-screen flex bg-white font-sans overflow-hidden">
      
      {/* CSS Animasi Khusus */}
      <style>{`
        @keyframes slideFromLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideFromRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      {/* Sisi Kiri: Form Register (Masuk dari Kiri) */}
      <div className="flex-1 flex flex-col justify-center px-6 py-10 sm:px-12 lg:px-20 xl:px-28 bg-white overflow-y-auto animate-[slideFromLeft_0.6s_ease-out_forwards]">
        <div className="mx-auto w-full max-w-md">
          <div className="lg:hidden flex justify-center mb-8">
            <Link to="/" className="inline-flex items-center no-underline text-navy text-[28px] font-bold font-playfair">
              <span className="inline-flex items-center justify-center w-9 h-9 bg-gradient-to-br from-brand to-[#7e85a7] text-white font-playfair text-[20px] font-extrabold rounded-lg mr-2.5">T</span>
              TukangKawal
            </Link>
          </div>

          <h1 className="text-[28px] font-bold text-gray-900 mb-2 font-playfair">Bergabunglah Sekarang</h1>
          <p className="text-[15px] text-gray-500 mb-8">Jadilah bagian dari komunitas pengawal berita dan temukan fakta di setiap cerita.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {formFields.map(({ id, label, type, placeholder }) => (
              <div key={id}>
                <label htmlFor={id} className="block text-[14px] font-medium text-gray-700 mb-1.5">{label}</label>
                <input type={type} id={id} value={form[id]} onChange={update(id)} className="w-full text-[15px] py-2.5 px-4 border border-gray-300 rounded-lg bg-gray-50 outline-none focus:bg-white focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all duration-200" placeholder={placeholder} required minLength={type === 'password' ? 8 : undefined} />
              </div>
            ))}

            <div className="flex items-start gap-3 pt-2 mb-6">
              <div className="flex items-center h-5 mt-0.5">
                <input type="checkbox" id="terms" checked={form.terms} onChange={update('terms')} required className="w-4 h-4 rounded border-gray-300 text-brand focus:ring-brand cursor-pointer" />
              </div>
              <label htmlFor="terms" className="text-gray-500 text-[13px] leading-relaxed cursor-pointer">
                Saya setuju dengan <a href="#" className="text-brand font-semibold hover:underline">Syarat &amp; Ketentuan</a> dan <a href="#" className="text-brand font-semibold hover:underline">Kebijakan Privasi</a> yang berlaku.
              </label>
            </div>

            <button type="submit" disabled={loading} className="w-full text-[15px] font-semibold text-white bg-brand py-3.5 rounded-lg border-none cursor-pointer shadow-md transition-all duration-200 hover:bg-brand-hover hover:-translate-y-0.5 disabled:opacity-70 flex justify-center items-center">
              {loading ? 'Mendaftarkan...' : 'Daftar Sebagai Pengawal'}
            </button>
          </form>

          <p className="mt-8 text-center text-gray-600 text-[14px]">
            Sudah mempunyai akun? <Link to="/login" className="text-brand font-semibold hover:underline">Masuk di sini</Link>
          </p>
        </div>
      </div>

      {/* Sisi Kanan: Visual Banner (Masuk dari Kanan) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-navy items-center justify-center overflow-hidden animate-[slideFromRight_0.6s_ease-out_forwards]">
        {/* Gambar disamakan dengan halaman Login */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2070&auto=format&fit=crop')" }}
        ></div>
        
        <div className="relative z-10 p-12 max-w-lg text-white">
          <Link to="/" className="inline-flex items-center no-underline text-white text-[32px] font-bold font-playfair mb-8">
            <span className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-brand to-[#7e85a7] text-white font-playfair text-[22px] font-extrabold rounded-lg mr-3 shadow-lg">T</span>
            TukangKawal
          </Link>
          <h2 className="text-4xl font-playfair font-bold leading-tight mb-4">
            Suara Anda,<br />Membentuk Realita.
          </h2>
          <p className="text-lg text-gray-200 leading-relaxed">
            Daftar sekarang untuk ikut serta mengawal isu-isu terkini, memberikan perspektif baru, dan membangun ruang diskusi yang sehat serta terpercaya.
          </p>
        </div>
      </div>
    </div>
  );
}