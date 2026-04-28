import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useToast } from '@/context/AppContext';
import Toast from '@/components/ui/Toast';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, isAdmin } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();


  useEffect(() => {
    if (isAuthenticated) {
      navigate(isAdmin ? '/admin' : '/', { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate]);

  if (isAuthenticated) {
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    const result = login(identifier, password);
    if (result.success) {
      addToast('Login berhasil!', 'success');
      const target = result.user.role === 'admin' ? '/admin' : '/';
      setTimeout(() => navigate(target, { replace: true }), 100);
    } else {
      addToast(result.error, 'error');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans overflow-hidden">
      <Toast />

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

      {/* Sisi Kiri: Visual Banner (Masuk dari Kiri) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-navy items-center justify-center overflow-hidden animate-[slideFromLeft_0.6s_ease-out_forwards]">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2070&auto=format&fit=crop')" }}
        ></div>
        
        <div className="relative z-10 p-12 max-w-lg text-white">
          <Link to="/" className="inline-flex items-center no-underline text-white text-[32px] font-bold font-playfair mb-8">
            <span className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-brand to-[#7e85a7] text-white font-playfair text-[22px] font-extrabold rounded-lg mr-3 shadow-lg">T</span>
            TukangKawal
          </Link>
          <h1 className="text-4xl font-playfair font-bold leading-tight mb-4">
            Kawal Fakta,<br />Temukan Kebenaran.
          </h1>
          <p className="text-lg text-gray-200 leading-relaxed">
            Akses ribuan artikel berita eksklusif, opini pakar, dan liputan mendalam langsung dari ujung jari Anda. Tetap terhubung dengan dunia setiap hari.
          </p>
        </div>
      </div>

      {/* Sisi Kanan: Form Login (Masuk dari Kanan) */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-24 xl:px-32 bg-white animate-[slideFromRight_0.6s_ease-out_forwards]">
        <div className="mx-auto w-full max-w-md">
          <div className="lg:hidden flex justify-center mb-10">
            <Link to="/" className="inline-flex items-center no-underline text-navy text-[28px] font-bold font-playfair">
              <span className="inline-flex items-center justify-center w-9 h-9 bg-gradient-to-br from-brand to-[#7e85a7] text-white font-playfair text-[20px] font-extrabold rounded-lg mr-2.5">T</span>
              TukangKawal
            </Link>
          </div>

          <h2 className="text-[28px] font-bold text-gray-900 mb-2 font-playfair">Selamat Datang Kembali</h2>
          <p className="text-[15px] text-gray-500 mb-8">Masuk ke akun Anda untuk melanjutkan membaca berita hari ini.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="identifier" className="block text-[14px] font-medium text-gray-700 mb-1.5">Username atau Email</label>
              <input type="text" id="identifier" value={identifier} onChange={(e) => setIdentifier(e.target.value)} className="w-full text-[15px] py-3 px-4 border border-gray-300 rounded-lg bg-gray-50 outline-none focus:bg-white focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all duration-200" placeholder="Masukkan username atau email" required />
            </div>

            <div>
              <label htmlFor="password" className="block text-[14px] font-medium text-gray-700 mb-1.5">Kata Sandi</label>
              <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full text-[15px] py-3 px-4 border border-gray-300 rounded-lg bg-gray-50 outline-none focus:bg-white focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all duration-200" placeholder="Masukkan kata sandi" required />
            </div>

            <div className="flex items-center justify-end">
              <a href="#" className="text-[13px] font-semibold text-brand hover:underline">Lupa Kata Sandi?</a>
            </div>

            <button type="submit" disabled={loading} className="w-full text-[15px] font-semibold text-white bg-brand py-3.5 rounded-lg border-none cursor-pointer shadow-md transition-all duration-200 hover:bg-brand-hover hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center">
              {loading ? 'Memproses...' : 'Masuk ke Berita'}
            </button>
          </form>

          <div className="mt-8 flex items-center justify-center space-x-4">
            <span className="h-px w-full bg-gray-200"></span>
            <span className="text-[13px] text-gray-500 font-medium whitespace-nowrap">Atau lanjutkan dengan</span>
            <span className="h-px w-full bg-gray-200"></span>
          </div>

          <a href="https://google.com" className="mt-6 flex justify-center items-center gap-3 w-full py-3 px-4 rounded-lg border border-gray-300 text-gray-700 text-[14px] font-semibold transition-colors duration-200 hover:bg-gray-50">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/3840px-Google_%22G%22_logo.svg.png" alt="Google Logo" className="w-5 h-5" />
            Google
          </a>

          <p className="mt-10 text-center text-gray-600 text-[14px]">
            Belum berlangganan? <Link to="/register" className="text-brand font-semibold hover:underline">Daftar Sekarang</Link>
          </p>
        </div>
      </div>
    </div>
  );
}