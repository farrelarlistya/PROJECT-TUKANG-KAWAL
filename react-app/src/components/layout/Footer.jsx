import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#1e1e2e] text-[#ccc] pt-[50px] px-[50px] pb-0">
      <div className="footer-content grid grid-cols-[2fr_1fr_1fr_1fr] gap-10 pb-10 border-b border-[#333]">
        <div className="footer-brand">
          <h2>
            <span className="header-logo inline-flex items-center justify-center w-9 h-9 bg-linear-to-br from-brand to-[#7e85a7] text-white font-playfair text-[20px] mb-[5px] font-extrabold rounded-lg mr-2.5 shrink-0 align-middle leading-none">
              T
            </span>{' '}
            Tukang Kawal
          </h2>
          <p>Portal berita yang mengawal fakta dan berita terkini untuk masyarakat Indonesia.</p>
        </div>
        <div className="footer-col">
          <h4>Kategori</h4>
          <ul>
            <li><Link to="/category/business">Business</Link></li>
            <li><Link to="/category/entertainment">Entertainment</Link></li>
            <li><Link to="/category/health">Health</Link></li>
            <li><Link to="/category/science">Science</Link></li>
            <li><Link to="/category/sports">Sports</Link></li>
            <li><Link to="/category/technology">Technology</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Tentang Sertai</h4>
          <ul>
            <li><a href="#">Tentang Kami</a></li>
            <li><a href="#">Redaksi</a></li>
            <li><a href="#">Karir</a></li>
            <li><a href="#">Syarat &amp; Ketentuan</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Ikuti Kami</h4>
          <ul>
            <li><a href="#">Facebook</a></li>
            <li><a href="#">Twitter / X</a></li>
            <li><a href="#">Instagram</a></li>
            <li><a href="#">YouTube</a></li>
          </ul>
        </div>
      </div>
      <div className="text-center py-5 text-[12px] text-[#666]">
        <p>&copy; 2026 Tukang Kawal. Hak Cipta Dilindungi. Penyalahgunaan informasi tanpa izin adalah pelanggaran hukum.</p>
      </div>
    </footer>
  );
}
