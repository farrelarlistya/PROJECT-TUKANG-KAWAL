import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useToast } from '@/context/AppContext';

export default function Register() {
  const [form, setForm] = useState({ nama: '', username: '', email: '', password: '', confirm: '', terms: false });
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { addToast('Konfirmasi password tidak cocok!', 'error'); return; }
    if (!form.terms) { addToast('Setujui syarat & ketentuan', 'error'); return; }
    const result = register(form.nama, form.username, form.email, form.password);
    if (result.success) { addToast('Pendaftaran berhasil!', 'success'); navigate('/'); }
    else addToast(result.error, 'error');
  };

  const update = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  return (
    <div>
      <header className="sticky top-0 flex shadow-[0_2px_12px_rgba(0,0,0,.25)] bg-navy justify-center items-center z-[2] p-[15px]">
        <Link to="/" className="font-playfair no-underline text-white text-[25px] font-bold">
          <span className="inline-flex items-center justify-center w-9 h-9 bg-linear-to-br from-brand to-[#7e85a7] text-white font-playfair text-[20px] mb-[5px] font-extrabold rounded-lg mr-2.5 shrink-0 align-middle leading-none">T</span>TukangKawal
        </Link>
      </header>
      <main className="flex justify-center pt-[21.5px]">
        <div className="border border-[#e0e0e0] rounded-[10px] py-10 px-[50px] shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <h1 className="text-[25px] mb-[5px]">Daftar Sebagai Pengawal Baru</h1>
          <p className="text-[15px] text-[#666]">Bergabunglah dengan komunitas pengawal berita</p>
          <form onSubmit={handleSubmit} className="flex flex-col">
            {[['nama','Nama Lengkap','text','Masukkan nama lengkap'],['username','Username','text','Masukkan username'],['email','Email','email','nama@email.com'],['password','Kata Sandi','password','Minimal 8 karakter'],['confirm','Konfirmasi Kata Sandi','password','Masukkan ulang kata sandi']].map(([f,l,t,p])=>(
              <div key={f} className="flex flex-col">
                <label className="text-[14px] text-[#333] mb-[5px] mt-5">{l}</label>
                <input type={t} value={form[f]} onChange={update(f)} className="text-[15px] font-thin py-3 px-[15px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#e0e0e0] rounded-lg bg-white outline-none focus:border-brand" placeholder={p} required minLength={t==='password'?8:undefined} />
              </div>
            ))}
            <div className="flex items-center gap-2 mt-2.5 mb-[25px]">
              <input type="checkbox" checked={form.terms} onChange={update('terms')} required className="w-4 h-4 cursor-pointer accent-brand shrink-0" />
              <label className="text-[#555] text-[14px] cursor-pointer leading-[1.4]">Saya setuju dengan <a href="#" className="text-brand underline font-semibold">Syarat &amp; Ketentuan</a> dan <a href="#" className="text-brand underline font-semibold">Kebijakan Privasi</a></label>
            </div>
            <button type="submit" className="text-[15px] font-semibold text-white bg-brand py-[13px] rounded-lg border-none cursor-pointer transition-all duration-200 w-full hover:bg-brand-hover hover:-translate-y-[1px]">Daftar Sekarang</button>
          </form>
          <p className="mt-[35px] text-center text-[#555] text-[15px]">Sudah mempunyai akun? <Link to="/login" className="no-underline text-brand font-semibold hover:underline">Masuk</Link></p>
        </div>
      </main>
    </div>
  );
}
