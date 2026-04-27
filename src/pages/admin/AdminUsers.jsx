export default function AdminUsers() {
  const users = [
    { name: 'User Biasa', email: 'user@gmail.com', role: 'Non-Member', joined: '15 Jan 2026' },
    { name: 'Member Premium', email: 'member@gmail.com', role: 'Member', joined: '10 Jan 2026' },
    { name: 'Budi Santoso', email: 'budi@email.com', role: 'Non-Member', joined: '20 Mar 2026' },
  ];
  return (
    <>
      <div className="mb-1"><h1 className="text-[22px] font-bold text-navy">Kelola Pengguna</h1><p className="text-[13.5px] text-[#888] mt-1">Daftar semua pengguna terdaftar</p></div>
      <div className="bg-white border border-[#dcdcdc] rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
        <table className="data-table w-full border-collapse">
          <thead><tr><th>Nama</th><th>Email</th><th>Role</th><th>Bergabung</th><th>Aksi</th></tr></thead>
          <tbody>{users.map((u,i)=><tr key={i}><td className="font-semibold">{u.name}</td><td>{u.email}</td><td><span className={`py-1 px-2.5 rounded text-[12px] font-semibold ${u.role==='Member'?'bg-[#eff6ff] text-brand':'bg-[#f3f4f6] text-[#374151]'}`}>{u.role}</span></td><td>{u.joined}</td><td><button className="bg-[#dc2626] text-white py-1.5 px-3 rounded text-[12px] font-semibold border-none cursor-pointer">Hapus</button></td></tr>)}</tbody>
        </table>
      </div>
    </>
  );
}
