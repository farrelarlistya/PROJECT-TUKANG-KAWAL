import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, useToast } from '@/context/AppContext';
import Toast from '@/components/ui/Toast';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, isAdmin } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  if (isAuthenticated) {
    const redirect = searchParams.get('redirect') || (isAdmin ? '/admin' : '/');
    navigate(redirect, { replace: true });
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    const result = login(identifier, password);
    if (result.success) {
      addToast('Login berhasil!', 'success');
      const redirect = searchParams.get('redirect') || (result.user.role === 'admin' ? '/admin' : '/');
      setTimeout(() => navigate(redirect, { replace: true }), 100);
    } else {
      addToast(result.error, 'error');
      setLoading(false);
    }
  };

  return (
    <div>
      <Toast />
      <header className="sticky top-0 flex shadow-[0_2px_12px_rgba(0,0,0,.25)] bg-navy justify-center items-center z-[2] p-[15px]">
        <Link to="/" className="font-playfair no-underline text-white text-[25px] font-bold">
          <span className="inline-flex items-center justify-center w-9 h-9 bg-linear-to-br from-brand to-[#7e85a7] text-white font-playfair text-[20px] mb-[5px] font-extrabold rounded-lg mr-2.5 shrink-0 align-middle leading-none">T</span>
          TukangKawal
        </Link>
      </header>
      <main className="flex justify-center pt-[21.5px]">
        <div className="border border-[#e0e0e0] rounded-[10px] py-10 px-[50px] shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <h1 className="text-[25px] mb-[5px]">Masuk</h1>
          <p className="text-[15px] text-[#666]">Masuk ke akun Anda untuk melanjutkan membaca</p>
          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="flex flex-col">
              <label htmlFor="namaEmail" className="text-[14px] text-[#333] mb-[5px] mt-5">Username</label>
              <input type="text" id="namaEmail" value={identifier} onChange={(e) => setIdentifier(e.target.value)} className="text-[15px] font-thin py-3 px-[15px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#e0e0e0] rounded-lg bg-white outline-none focus:border-brand" placeholder="Masukkan Username" required />
            </div>
            <div className="flex flex-col">
              <label htmlFor="password" className="text-[14px] text-[#333] mb-[5px] mt-5">Kata Sandi</label>
              <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="text-[15px] font-thin py-3 px-[15px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#e0e0e0] rounded-lg bg-white outline-none focus:border-brand" placeholder="Masukkan Password" required />
            </div>
            <a href="#" className="text-[14px] no-underline text-end font-medium mt-2.5 mb-[30px]">Lupa Kata Sandi?</a>
            <button type="submit" disabled={loading} className="text-[15px] font-semibold text-white bg-brand py-[13px] rounded-lg border-none cursor-pointer transition-all duration-200 w-full hover:bg-brand-hover hover:-translate-y-[1px] disabled:opacity-50">
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>
          <p className="alternatif-option mt-[30px] text-center text-[#666] text-[14px] relative flex items-center justify-center">Atau masuk dengan</p>
          <a href="https://google.com" className="mt-5 flex justify-center items-center p-2.5 rounded-lg border border-[#e0e0e0] no-underline transition-colors duration-200 hover:bg-[#f5f5f5]">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/3840px-Google_%22G%22_logo.svg.png" alt="Google Logo" className="w-6 h-6" />
          </a>
          <p className="mt-[35px] text-center text-[#555] text-[15px]">
            Belum mempunyai akun? <Link to="/register" className="no-underline text-brand font-semibold hover:underline">Daftar</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
