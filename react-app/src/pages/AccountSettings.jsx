import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useToast } from '@/context/AppContext';
import Modal from '@/components/ui/Modal';

export default function AccountSettings() {
  const { updatePassword, deleteAccount } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [pwForm, setPwForm] = useState({ old: '', new: '', confirm: '' });
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  const handlePassword = (e) => {
    e.preventDefault();
    if (pwForm.new !== pwForm.confirm) { addToast('Konfirmasi tidak cocok!', 'error'); return; }
    if (pwForm.new.length < 6) { addToast('Minimal 6 karakter!', 'error'); return; }
    const result = updatePassword(pwForm.old, pwForm.new);
    if (result.success) { addToast('Kata sandi berhasil diubah!', 'success'); setPwForm({ old: '', new: '', confirm: '' }); }
    else addToast(result.error, 'error');
  };

  const handleDelete = () => {
    if (deleteConfirm.trim() === 'HAPUS') {
      deleteAccount();
      addToast('Akun telah dihapus.', 'info');
      navigate('/login');
    }
  };

  return (
    <section className="akun-content bg-white rounded-xl border border-[#e5e7eb] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] p-10 h-fit">
      <h1 className="akun-page-title font-playfair text-[28px] text-[#111827] mb-8 pb-4 border-b border-[#e5e7eb]">Pengaturan Akun</h1>
      <div className="mb-10">
        <h2 className="text-[18px] font-semibold text-[#111827] mb-5 flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          Ubah Kata Sandi
        </h2>
        <form className="flex flex-col gap-5" onSubmit={handlePassword}>
          {[['Kata Sandi Lama','old','Masukkan kata sandi lama'],['Kata Sandi Baru','new','Masukkan kata sandi baru'],['Konfirmasi','confirm','Ulangi kata sandi baru']].map(([l,f,p])=>(
            <div key={f} className="flex flex-col gap-2">
              <label className="text-[14px] font-semibold text-[#374151] font-dm-sans">{l}</label>
              <input type="password" value={pwForm[f]} onChange={e=>setPwForm(s=>({...s,[f]:e.target.value}))} placeholder={p} required minLength={f!=='old'?6:undefined} className="akun-form-input w-full py-3.5 px-4 border border-[#e5e7eb] rounded-lg font-dm-sans text-[15px] text-[#111827] outline-none transition-all duration-200 bg-[#f9fafb] focus:border-primary-blue focus:shadow-[0_0_0_3px_rgba(30,58,138,0.15)] focus:bg-white" />
            </div>
          ))}
          <button type="submit" className="akun-btn-simpan bg-primary-blue text-white border-none py-3.5 px-10 rounded-lg text-base font-semibold font-dm-sans cursor-pointer transition-all duration-200 self-start mt-1 hover:bg-primary-hover">Ubah Kata Sandi</button>
        </form>
      </div>
      <div className="pt-8 border-t border-[#e5e7eb]">
        <h2 className="text-[18px] font-semibold text-[#dc2626] mb-3 flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          Hapus Akun
        </h2>
        <div className="bg-[#fef2f2] border border-[#fecaca] rounded-lg p-5 mb-5">
          <p className="text-[14px] text-[#991b1b] leading-[1.6] font-dm-sans"><strong>Peringatan:</strong> Menghapus akun bersifat permanen dan tidak dapat dipulihkan.</p>
        </div>
        <button onClick={()=>setShowModal(true)} className="bg-[#dc2626] text-white border-none py-3 px-8 rounded-lg text-[14px] font-semibold cursor-pointer transition-all duration-200 hover:bg-[#b91c1c]">Hapus Akun Saya</button>
      </div>
      <Modal isOpen={showModal} onClose={()=>setShowModal(false)} title="Hapus Akun">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-[#fef2f2] flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          </div>
          <h3 className="text-[20px] font-bold text-[#111827] mb-2">Hapus Akun?</h3>
          <p className="text-[14px] text-[#6b7280] leading-[1.6]">Ketik <strong className="text-[#dc2626]">HAPUS</strong> untuk mengkonfirmasi.</p>
        </div>
        <input type="text" value={deleteConfirm} onChange={e=>setDeleteConfirm(e.target.value)} placeholder="Ketik HAPUS" className="w-full py-3 px-4 border border-[#e5e7eb] rounded-lg text-[15px] text-center outline-none mb-5 focus:border-[#dc2626]" />
        <div className="flex gap-3">
          <button onClick={()=>setShowModal(false)} className="flex-1 py-3 border border-[#e5e7eb] bg-white text-[#374151] rounded-lg text-[14px] font-semibold cursor-pointer">Batal</button>
          <button onClick={handleDelete} disabled={deleteConfirm.trim()!=='HAPUS'} className="flex-1 py-3 bg-[#dc2626] text-white border-none rounded-lg text-[14px] font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">Hapus Permanen</button>
        </div>
      </Modal>
    </section>
  );
}
