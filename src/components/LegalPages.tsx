import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, FileText, Info, Mail, AlertTriangle, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';

interface LegalPagesProps {
  view: 'about' | 'privacy' | 'terms' | 'disclaimer' | 'contact';
  onBack: () => void;
}

export default function LegalPages({ view, onBack }: LegalPagesProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    
    // Simulate API submission
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', subject: 'General', message: '' });
      setSubmitted(false);
    }, 4000);
  };

  const renderContent = () => {
    switch (view) {
      case 'about':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-zinc-900 pb-4">
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400">
                <Info className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">Tentang OneNationPress Sport</h2>
                <p className="text-xs text-slate-500 dark:text-gray-400">Portal Berita Olahraga Terintegrasi & Analisis Olahraga Independen</p>
              </div>
            </div>

            <div className="prose prose-slate dark:prose-invert max-w-none space-y-4 text-sm sm:text-base leading-relaxed text-slate-700 dark:text-gray-300">
              <p>
                <strong>OneNationPress Sport</strong> adalah platform media olahraga modern yang menyajikan ringkasan berita, statistik pertandingan, dan analisis mendalam dari berbagai cabang olahraga populer secara real-time. Kami mengintegrasikan teknologi sindikasi feed pintar (RSS) resmi dengan sentuhan analisis editorial independen guna memberikan perspektif menyeluruh bagi para penggemar olahraga di Indonesia.
              </p>
              
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-6">Misi Utama Kami</h3>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li><strong>Efisiensi Informasi:</strong> Menyaring kebisingan media untuk memberikan ringkasan (summary) berita olahraga yang esensial, padat, dan akurat dalam hitungan detik.</li>
                <li><strong>Dukungan Jurnalisme Orisinal:</strong> Berkomitmen penuh mendukung jurnalisme berkualitas dengan selalu menyertakan rujukan tautan orisinal ke media penerbit asli. Kami tidak menduplikasi isi artikel secara utuh.</li>
                <li><strong>Membangun Komunitas:</strong> Menyediakan wadah diskusi interaktif bagi pencinta olahraga untuk menganalisis taktik, hasil pertandingan, dan tren olahraga terkini.</li>
              </ul>

              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-6">Mengapa OneNationPress Sport Ramah AdSense & Hak Cipta?</h3>
              <p className="text-sm text-slate-600 dark:text-gray-400">
                Kami memahami pentingnya kepatuhan terhadap kebijakan Google AdSense dan undang-undang hak cipta. OneNationPress Sport didesain dari nol dengan prinsip <em>Fair Use</em> (Penggunaan Wajar):
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/40 border border-slate-100 dark:border-zinc-900">
                  <h4 className="font-bold text-xs text-indigo-600 dark:text-indigo-400 mb-1">HANYA RINGKASAN</h4>
                  <p className="text-xs">Kami hanya menampilkan judul dan ringkasan pendek (kurang dari 20% konten asli) sebagai cuplikan pengantar informasi.</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/40 border border-slate-100 dark:border-zinc-900">
                  <h4 className="font-bold text-xs text-indigo-600 dark:text-indigo-400 mb-1">ATRIBUSI & TRAFIK BALIK</h4>
                  <p className="text-xs">Setiap artikel memiliki rujukan yang sangat jelas, mengalihkan 100% pembaca yang mencari detail penuh ke situs web penerbit asli.</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-zinc-900 pb-4">
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">Kebijakan Privasi (Privacy Policy)</h2>
                <p className="text-xs text-slate-500 dark:text-gray-400">Terakhir diperbarui: Juni 2026</p>
              </div>
            </div>

            <div className="prose prose-slate dark:prose-invert max-w-none space-y-4 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-gray-300">
              <p>
                Di OneNationPress Sport, dapat diakses dari onenationpress.id, salah satu prioritas utama kami adalah privasi pengunjung kami. Dokumen Kebijakan Privasi ini berisi jenis informasi yang dikumpulkan dan dicatat oleh OneNationPress Sport dan bagaimana kami menggunakannya.
              </p>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-4 uppercase tracking-wider">1. Berkas Log (Log Files)</h3>
              <p>
                OneNationPress Sport mengikuti prosedur standar menggunakan file log. File-file ini mencatat pengunjung ketika mereka mengunjungi situs web. Semua perusahaan hosting melakukan ini dan merupakan bagian dari analisis layanan hosting. Informasi yang dikumpulkan oleh file log termasuk alamat protokol internet (IP), jenis browser, Penyedia Layanan Internet (ISP), stempel tanggal dan waktu, halaman rujukan/keluar, dan mungkin jumlah klik. Ini tidak terkait dengan informasi apa pun yang dapat diidentifikasi secara pribadi. Tujuan informasi tersebut adalah untuk menganalisis tren, mengelola situs, melacak pergerakan pengguna di situs web, dan mengumpulkan informasi demografis.
              </p>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-4 uppercase tracking-wider">2. Cookie DoubleClick DART Google</h3>
              <p>
                Google adalah salah satu vendor pihak ketiga di situs kami. Google juga menggunakan cookie, yang dikenal sebagai cookie DART, untuk menyajikan iklan kepada pengunjung situs kami berdasarkan kunjungan mereka ke situs kami dan situs lain di internet. Namun, pengunjung dapat memilih untuk menolak penggunaan cookie DART dengan mengunjungi Kebijakan Privasi jaringan iklan dan konten Google di URL berikut – <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 underline">https://policies.google.com/technologies/ads</a>.
              </p>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-4 uppercase tracking-wider">3. Kebijakan Privasi Mitra Iklan</h3>
              <p>
                Anda dapat berkonsultasi dengan daftar ini untuk menemukan Kebijakan Privasi untuk masing-masing mitra periklanan OneNationPress Sport. Server iklan pihak ketiga atau jaringan iklan menggunakan teknologi seperti cookie, JavaScript, atau Web Beacon yang digunakan dalam iklan masing-masing dan tautan yang muncul di OneNationPress Sport, yang dikirim langsung ke browser pengguna. Mereka secara otomatis menerima alamat IP Anda ketika ini terjadi. Teknologi ini digunakan untuk mengukur efektivitas kampanye iklan mereka dan/atau untuk mempersonalisasi konten iklan yang Anda lihat di situs web yang Anda kunjungi.
              </p>
              <p>
                Harap dicatat bahwa OneNationPress Sport tidak memiliki akses ke atau kontrol atas cookie ini yang digunakan oleh pengiklan pihak ketiga.
              </p>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-4 uppercase tracking-wider">4. Informasi Anak</h3>
              <p>
                Bagian lain dari prioritas kami adalah menambahkan perlindungan untuk anak-anak saat menggunakan internet. Kami mendorong orang tua dan wali untuk mengamati, berpartisipasi dalam, dan/atau memantau dan membimbing aktivitas online mereka.
              </p>
              <p>
                OneNationPress Sport tidak secara sadar mengumpulkan Informasi Identitas Pribadi apa pun dari anak-anak di bawah usia 13 tahun. Jika Anda berpikir bahwa anak Anda memberikan informasi semacam ini di situs web kami, kami sangat menganjurkan Anda untuk segera menghubungi kami dan kami akan melakukan upaya terbaik kami untuk segera menghapus informasi tersebut dari catatan kami.
              </p>
            </div>
          </div>
        );

      case 'terms':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-zinc-900 pb-4">
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">Syarat & Ketentuan (Terms of Service)</h2>
                <p className="text-xs text-slate-500 dark:text-gray-400">Terakhir diperbarui: Juni 2026</p>
              </div>
            </div>

            <div className="prose prose-slate dark:prose-invert max-w-none space-y-4 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-gray-300">
              <p>
                Selamat datang di OneNationPress Sport. Dengan accessing situs web ini, kami menganggap Anda menyetujui syarat dan ketentuan ini secara penuh. Jangan melanjutkan penggunaan OneNationPress Sport jika Anda tidak menerima semua syarat dan ketentuan yang tercantum di halaman ini.
              </p>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-4 uppercase tracking-wider">1. Penggunaan Lisensi Pengguna</h3>
              <p>
                Kecuali dinyatakan lain, OneNationPress Sport dan/atau pemberi lisensinya memiliki hak kekayaan intelektual untuk semua materi di OneNationPress Sport yang bersifat orisinal (seperti desain, tata letak, dan analisis redaksi). Semua hak kekayaan intelektual dilindungi undang-undang. Anda dapat melihat dan/atau mencetak halaman dari OneNationPress Sport untuk penggunaan pribadi Anda sendiri dengan tunduk pada batasan yang ditetapkan dalam syarat dan ketentuan ini.
              </p>
              <p>Anda dilarang keras untuk:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Menerbitkan ulang materi orisinal dari OneNationPress Sport tanpa izin tertulis.</li>
                <li>Menjual, menyewakan, atau mensublisensikan materi dari OneNationPress Sport.</li>
                <li>Mereproduksi, menduplikasi, atau menyalin materi dari OneNationPress Sport untuk tujuan komersial ilegal.</li>
              </ul>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-4 uppercase tracking-wider">2. Konten Pengguna (Komentar & Opini)</h3>
              <p>
                Bagian dari situs web ini menawarkan kesempatan bagi pengguna untuk memposting opini, analisis, dan informasi di area situs web. OneNationPress Sport tidak menyaring, mengedit, mempublikasikan, atau meninjau Komentar sebelum kemunculannya di situs web dan komentar tidak mencerminkan pandangan atau opini OneNationPress Sport, agen, atau afiliasinya. Komentar mencerminkan pandangan dan opini orang yang memposting pandangan atau opini tersebut.
              </p>
              <p>
                OneNationPress Sport berhak untuk memantau semua Komentar dan menghapus Komentar apa pun yang dianggap tidak pantas, menyinggung, melanggar SARA, atau melanggar Syarat dan Ketentuan ini.
              </p>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-4 uppercase tracking-wider">3. Penafian Tanggung Jawab Hukum</h3>
              <p>
                Sejauh diizinkan oleh hukum yang berlaku, kami mengecualikan semua representasi, jaminan, dan kondisi yang berkaitan dengan situs web kami dan penggunaan situs web ini (termasuk, tanpa batasan, jaminan apa pun yang tersirat oleh hukum mengenai kualitas yang memuaskan, kesesuaian untuk tujuan, dan/atau penggunaan perawatan dan keterampilan yang wajar).
              </p>
            </div>
          </div>
        );

      case 'disclaimer':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-zinc-900 pb-4">
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">Penyangkalan Hak Cipta & DMCA</h2>
                <p className="text-xs text-slate-500 dark:text-gray-400">Pernyataan Perlindungan Kekayaan Intelektual</p>
              </div>
            </div>

            <div className="prose prose-slate dark:prose-invert max-w-none space-y-4 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-gray-300">
              <p>
                OneNationPress Sport beroperasi sebagai portal informasi rujukan dan media sindikasi feed olahraga terkurasi secara profesional. Kami menjunjung tinggi kepatuhan terhadap undang-undang hak cipta dan hak kekayaan intelektual (HAKI) di Indonesia dan secara global (DMCA).
              </p>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-4 uppercase tracking-wider">1. Kebijakan Penggunaan Wajar (Fair Use Policy)</h3>
              <p>
                Seluruh kutipan artikel, judul berita, dan gambar logo yang didistribusikan melalui situs OneNationPress Sport dikumpulkan secara otomatis atau semi-otomatis melalui feed RSS sindikasi resmi yang dirilis secara publik oleh penerbit berita masing-masing. OneNationPress Sport menggunakan cuplikan (snippets) singkat dan deskripsi ringkas ini semata-mata sebagai jembatan informasi rujukan non-komersial yang bertujuan mengarahkan pembaca kembali ke situs web penerbit asli (atribusi penuh). Kami tidak menayangkan artikel lengkap di platform kami.
              </p>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-4 uppercase tracking-wider">2. Penafian Keakuratan Data Olahraga</h3>
              <p>
                Jadwal pertandingan, hasil pertandingan, skor langsung, dan statistik olahraga lainnya di OneNationPress Sport disediakan semata-mata sebagai informasi publik. Meskipun kami berupaya memastikan data diperbarui secara berkala, kami tidak menjamin keakuratan mutlak atau kelengkapan data real-time tersebut. OneNationPress Sport tidak bertanggung jawab atas kerugian moril atau material akibat keterlambatan atau kesalahan pembaruan data skor.
              </p>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-4 uppercase tracking-wider">3. Prosedur Klaim Pelanggaran Hak Cipta (DMCA / Takedown Notice)</h3>
              <p>
                Jika Anda adalah pemilik sah atas konten, artikel, atau gambar yang ditampilkan di OneNationPress Sport dan keberatan atas penayangannya, Anda dapat mengajukan permohonan takedown (penghapusan tautan) segera. Kami berkomitmen memproses permohonan yang valid dalam waktu 1x24 jam.
              </p>
              <p>Untuk memproses klaim Anda, harap hubungi kami melalui formulir di halaman <strong>Hubungi Kami</strong> dengan menyertakan detail berikut:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Nama lengkap dan informasi kontak pemilik hak cipta resmi.</li>
                <li>Spesifikasi konten yang diklaim melanggar hak cipta beserta tautan URL di situs kami.</li>
                <li>Bukti kepemilikan hak cipta yang sah atas konten orisinal tersebut.</li>
                <li>Pernyataan tegas meminta penghapusan cuplikan dari OneNationPress Sport.</li>
              </ul>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-zinc-900 pb-4">
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">Hubungi Kami (Contact Us)</h2>
                <p className="text-xs text-slate-500 dark:text-gray-400">Kirim Masukan, Kerja Sama, atau Klaim Hak Cipta</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 space-y-4 text-xs sm:text-sm text-slate-600 dark:text-gray-400">
                <p className="leading-relaxed">
                  Ada pertanyaan mengenai konten, kemitraan periklanan AdSense, masukan fitur, atau klaim kepemilikan hak cipta (DMCA)? Silakan isi formulir kontak resmi ini. Tim OneNationPress Sport akan menanggapi email Anda sesegera mungkin.
                </p>
                
                <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800 space-y-3 bg-slate-50/50 dark:bg-zinc-900/30 text-2xs">
                  <div className="font-bold text-slate-800 dark:text-slate-200">INFORMASI TANGGAPAN:</div>
                  <div><strong>Email Kemitraan:</strong> partner@onenationpress.id</div>
                  <div><strong>DMCA Takedown:</strong> copyright@onenationpress.id</div>
                  <div><strong>Waktu Kerja:</strong> Senin - Jumat (09:00 - 17:00 WIB)</div>
                </div>
              </div>

              <div className="lg:col-span-7 bg-slate-50/50 dark:bg-zinc-900/20 rounded-2xl border border-slate-200/60 dark:border-zinc-850 p-6">
                {submitted ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center text-center py-8 space-y-3"
                  >
                    <CheckCircle2 className="h-12 w-12 text-emerald-500 animate-bounce" />
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Pesan Anda Terkirim!</h3>
                    <p className="text-xs text-slate-500 dark:text-gray-400 max-w-sm">
                      Terima kasih telah menghubungi OneNationPress Sport. Formulir Anda telah terkirim secara aman ke tim kami. Kami akan merespons dalam waktu 24 jam kerja.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-2xs font-bold uppercase text-slate-500 dark:text-gray-400 mb-1">Nama Lengkap</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-white dark:bg-gray-950 border border-slate-200 dark:border-zinc-800 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none dark:text-white"
                        placeholder="Contoh: Budi Santoso"
                      />
                    </div>

                    <div>
                      <label className="block text-2xs font-bold uppercase text-slate-500 dark:text-gray-400 mb-1">Alamat Email</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-white dark:bg-gray-950 border border-slate-200 dark:border-zinc-800 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none dark:text-white"
                        placeholder="budi@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-2xs font-bold uppercase text-slate-500 dark:text-gray-400 mb-1">Tujuan Pesan (Subjek)</label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full bg-white dark:bg-gray-950 border border-slate-200 dark:border-zinc-800 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none dark:text-white cursor-pointer"
                      >
                        <option value="General">Pertanyaan Umum / Masukan</option>
                        <option value="DMCA">Laporan Pelanggaran Hak Cipta (DMCA)</option>
                        <option value="AdSense">Kemitraan Iklan & Kerja Sama</option>
                        <option value="Bug">Laporan Masalah Sistem</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-2xs font-bold uppercase text-slate-500 dark:text-gray-400 mb-1">Pesan / Detail Klaim</label>
                      <textarea
                        required
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full bg-white dark:bg-gray-950 border border-slate-200 dark:border-zinc-800 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none dark:text-white resize-none"
                        placeholder="Tuliskan pesan Anda secara lengkap di sini..."
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md hover:shadow-indigo-500/10 cursor-pointer"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Kirim Pesan Aman</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back to Home Header button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer group mb-6"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        <span>Kembali ke Beranda Berita</span>
      </button>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-950 rounded-2xl border border-slate-200 dark:border-gray-850 p-6 sm:p-10 shadow-xs"
      >
        {renderContent()}
      </motion.div>
    </div>
  );
}
