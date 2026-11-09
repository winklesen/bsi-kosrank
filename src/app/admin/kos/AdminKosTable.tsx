"use client";

import { useState, useEffect } from "react";
import { 
  Pencil, 
  Trash2, 
  Star, 
  Search, 
  Filter, 
  SlidersHorizontal, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  X,
  Home
} from "lucide-react";
import { deleteKos, createKos, updateKos } from "@/features/kos/actions";
import MapPicker from "@/components/admin/MapPicker";

interface Kos {
  id: string;
  name: string;
  address: string;
  price: number;
  roomSize: string;
  description: string;
  campus: string;
  genderType: string;
  ranking: number | null;
  finalScore: number | null;
  latitude: number;
  longitude: number;
  transit: string;
  facilities: { facilityId: string }[];
}

interface Facility {
  id: string;
  name: string;
  type: "ROOM" | "PUBLIC";
}

interface AdminKosTableProps {
  kosList: Kos[];
  allFacilities: Facility[];
}

export function AdminKosTable({ kosList, allFacilities }: AdminKosTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedCampus, setSelectedCampus] = useState("");
  const [sortBy, setSortBy] = useState("ranking-asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingKos, setEditingKos] = useState<Kos | null>(null);

  // Coordinate and address states for dynamic MapPicker map
  const [createLat, setCreateLat] = useState(-6.3685);
  const [createLng, setCreateLng] = useState(106.8335);
  const [createAddress, setCreateAddress] = useState("");

  const [editLat, setEditLat] = useState(-6.3685);
  const [editLng, setEditLng] = useState(106.8335);
  const [editAddress, setEditAddress] = useState("");

  useEffect(() => {
    if (editingKos) {
      setEditLat(editingKos.latitude || -6.3685);
      setEditLng(editingKos.longitude || 106.8335);
      setEditAddress(editingKos.address || "");
    }
  }, [editingKos]);

  // Extract unique campus list for filtering dropdown
  const uniqueCampuses = Array.from(new Set(kosList.map((k) => k.campus))).filter(Boolean);

  // Apply search, filters and sort
  const filteredAndSortedList = kosList
    .filter((kos) => {
      const matchesSearch = 
        kos.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        kos.address.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesGender = selectedGender === "" || kos.genderType === selectedGender;
      const matchesCampus = selectedCampus === "" || kos.campus === selectedCampus;

      return matchesSearch && matchesGender && matchesCampus;
    })
    .sort((a, b) => {
      if (sortBy === "ranking-asc") {
        const aRank = a.ranking ?? 999999;
        const bRank = b.ranking ?? 999999;
        return aRank - bRank;
      }
      if (sortBy === "price-asc") {
        return a.price - b.price;
      }
      if (sortBy === "price-desc") {
        return b.price - a.price;
      }
      if (sortBy === "name-asc") {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

  // Calculate pagination slice
  const totalItems = filteredAndSortedList.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedList = filteredAndSortedList.slice(startIndex, endIndex);

  // Reset pagination on search/filter change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleGenderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGender(e.target.value);
    setCurrentPage(1);
  };

  const handleCampusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCampus(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data kos "${name}"? Tindakan ini tidak dapat dibatalkan.`)) {
      await deleteKos(id);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await createKos(formData);
      setIsCreateOpen(false);
      e.currentTarget.reset();
    } catch (err: any) {
      alert("Gagal menambahkan kos: " + err.message);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingKos) return;
    const formData = new FormData(e.currentTarget);
    try {
      await updateKos(editingKos.id, formData);
      setEditingKos(null);
    } catch (err: any) {
      alert("Gagal memperbarui kos: " + err.message);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Toolbar + Tambah Kos Button */}
      <div className="bg-white rounded-2xl border border-border p-4 shadow-sm flex flex-col lg:flex-row gap-3.5 items-stretch lg:items-center">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 h-4.5 w-4.5 text-ink-500" />
          <input
            type="text"
            placeholder="Cari nama kos atau alamat..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 text-sm bg-surface-muted border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder-ink-500"
          />
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap lg:flex-nowrap gap-2.5 items-center justify-between lg:justify-end">
          {/* Gender Filter */}
          <div className="flex items-center gap-1.5 bg-surface-muted border border-line rounded-xl px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-ink-500" />
            <select
              value={selectedGender}
              onChange={handleGenderChange}
              className="bg-transparent text-xs font-semibold text-ink-700 outline-none cursor-pointer pr-1"
            >
              <option value="">Semua Tipe Gender</option>
              <option value="PUTRA">Putra</option>
              <option value="PUTRI">Putri</option>
              <option value="CAMPUR">Campur</option>
            </select>
          </div>

          {/* Campus Filter */}
          <div className="flex items-center gap-1.5 bg-surface-muted border border-line rounded-xl px-2.5 py-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-ink-500" />
            <select
              value={selectedCampus}
              onChange={handleCampusChange}
              className="bg-transparent text-xs font-semibold text-ink-700 outline-none cursor-pointer pr-1"
            >
              <option value="">Semua Kampus</option>
              {uniqueCampuses.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Sorting Dropdown */}
          <div className="flex items-center gap-1.5 bg-surface-muted border border-line rounded-xl px-2.5 py-1.5">
            <span className="text-xs font-medium text-ink-500">Urutkan:</span>
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="bg-transparent text-xs font-bold text-ink-700 outline-none cursor-pointer pr-1"
            >
              <option value="ranking-asc">Peringkat SAW</option>
              <option value="price-asc">Harga Terendah</option>
              <option value="price-desc">Harga Tertinggi</option>
              <option value="name-asc">Nama A-Z</option>
            </select>
          </div>

          {/* Action button inside page toolbar */}
          <button 
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-700 hover:bg-brand-600 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-700/10 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tambah Kos
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="text-[11px] font-bold uppercase bg-surface-muted text-ink-500 border-b border-border">
              <tr>
                <th className="py-3.5 px-5 text-center w-24">Peringkat SAW</th>
                <th className="py-3.5 px-5">Nama Kos</th>
                <th className="py-3.5 px-5">Tarif Bulanan</th>
                <th className="py-3.5 px-5">Lokasi Kampus</th>
                <th className="py-3.5 px-5">Segmentasi</th>
                <th className="py-3.5 px-5">Skor SPK</th>
                <th className="py-3.5 px-5 text-right w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedList.map((kos) => (
                <tr key={kos.id} className="hover:bg-surface-muted/50 transition-colors">
                  <td className="py-4 px-5 text-center">
                    {kos.ranking ? (
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                        kos.ranking === 1 
                          ? "bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-sm"
                          : kos.ranking === 2
                          ? "bg-slate-400 text-white shadow-sm"
                          : kos.ranking === 3
                          ? "bg-brand-100 text-brand-700 shadow-sm"
                          : "bg-surface-muted text-ink-700 border border-line"
                      }`}>
                        {kos.ranking}
                      </span>
                    ) : (
                      <span className="text-ink-500 text-xs font-medium">—</span>
                    )}
                  </td>
                  <td className="py-4 px-5">
                    <div className="font-bold text-ink-900 text-[13.5px]">{kos.name}</div>
                    <div className="text-xs text-ink-500 mt-0.5 truncate max-w-sm">{kos.address}</div>
                  </td>
                  <td className="py-4 px-5 font-semibold text-ink-700">
                    Rp {kos.price.toLocaleString("id-ID")}
                  </td>
                  <td className="py-4 px-5 text-ink-700 font-medium">{kos.campus}</td>
                  <td className="py-4 px-5">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      kos.genderType === "PUTRA" ? "bg-blue-50 text-blue-700 border-blue-200" :
                      kos.genderType === "PUTRI" ? "bg-pink-50 text-pink-700 border-pink-200" :
                      "bg-purple-50 text-purple-700 border-purple-200"
                    }`}>
                      {kos.genderType === "PUTRA" ? "Putra" : kos.genderType === "PUTRI" ? "Putri" : "Campur"}
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    {kos.finalScore != null ? (
                      <span className="inline-flex items-center gap-1 text-brand-700 font-bold text-xs">
                        <Star className="w-3.5 h-3.5 fill-star text-star" />
                        {kos.finalScore.toFixed(4)}
                      </span>
                    ) : (
                      <span className="text-ink-500 text-xs italic">Belum dihitung</span>
                    )}
                  </td>
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingKos(kos)}
                        className="p-1.5 rounded-lg border border-line bg-white text-ink-500 hover:text-brand-700 hover:border-brand-600/40 hover:bg-brand-100/30 transition-all cursor-pointer"
                        title="Edit Kos"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(kos.id, kos.name)}
                        className="p-1.5 rounded-lg border border-line bg-white text-ink-500 hover:text-rose-650 hover:border-rose-300 hover:bg-rose-50 transition-all cursor-pointer"
                        title="Hapus Kos"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {totalItems === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-ink-500 italic">
                    Tidak ada alternatif kos yang cocok dengan kriteria pencarian/filter Anda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-surface-muted/50">
            <div className="text-xs text-ink-500 font-medium">
              Menampilkan <span className="font-semibold text-ink-700">{startIndex + 1}</span> -{" "}
              <span className="font-semibold text-ink-700">{endIndex}</span> dari{" "}
              <span className="font-semibold text-ink-700">{totalItems}</span> kos terdaftar
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-border bg-white text-ink-700 hover:bg-surface-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  return (
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1
                  );
                })
                .map((page, idx, array) => {
                  const showEllipsis = idx > 0 && page - array[idx - 1] > 1;
                  return (
                    <div key={page} className="flex items-center">
                      {showEllipsis && (
                        <span className="px-2 text-ink-500 text-xs select-none">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          currentPage === page
                            ? "bg-brand-700 text-white"
                            : "border border-border bg-white text-ink-700 hover:bg-surface-muted"
                        }`}
                      >
                        {page}
                      </button>
                    </div>
                  );
                })}

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-border bg-white text-ink-700 hover:bg-surface-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CREATE KOS MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-line w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-line flex items-center justify-between bg-surface-muted/50">
              <div className="flex items-center gap-2">
                <Home className="w-5 h-5 text-brand-700" />
                <h3 className="font-display tracking-[-0.02em] font-bold text-ink-900 text-[15px]">Tambah Kos Baru</h3>
              </div>
              <button 
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded-lg hover:bg-surface-muted text-ink-500 hover:text-ink-700 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink-500">Nama Kos</label>
                <input 
                  type="text" 
                  name="name" 
                  required 
                  placeholder="Contoh: Kost Griya Asri Beji"
                  className="w-full border border-line rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-brand-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink-500">Deskripsi Kos</label>
                <textarea 
                  name="description" 
                  required 
                  rows={2}
                  placeholder="Ceritakan tentang kenyamanan, fasilitas, dan detail kos..."
                  className="w-full border border-line rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-brand-600 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ink-500">Harga per Bulan (Rp)</label>
                  <input 
                    type="number" 
                    name="price" 
                    required 
                    placeholder="1200000"
                    className="w-full border border-line rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-brand-600"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ink-500">Ukuran Kamar</label>
                  <input 
                    type="text" 
                    name="roomSize" 
                    required 
                    placeholder="Contoh: 3x4 m"
                    className="w-full border border-line rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-brand-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ink-500">Tipe Gender</label>
                  <select 
                    name="genderType" 
                    className="w-full border border-line rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-brand-600 bg-white cursor-pointer"
                  >
                    <option value="PUTRA">Putra</option>
                    <option value="PUTRI">Putri</option>
                    <option value="CAMPUR">Campur</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ink-500">Kampus Terdekat</label>
                  <select 
                    name="campus" 
                    className="w-full border border-line rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-brand-600 bg-white cursor-pointer"
                  >
                    <option value="UBSI Margonda">UBSI Margonda</option>
                    <option value="UI">UI (Univ Indonesia)</option>
                    <option value="PNJ">Politeknik Negeri Jakarta</option>
                    <option value="Gunadarma">Universitas Gunadarma</option>
                    <option value="Amikom">Amikom</option>
                    <option value="UPN">UPN Veteran</option>
                    <option value="Mercu Buana">Mercu Buana</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink-500">Alamat Lengkap</label>
                <input 
                  type="text" 
                  name="address" 
                  required 
                  value={createAddress}
                  onChange={(e) => setCreateAddress(e.target.value)}
                  placeholder="Jl. Margonda Raya No. 45, Beji, Depok"
                  className="w-full border border-line rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-brand-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink-500">Pilih Koordinat Kos (Peta Interaktif)</label>
                <input type="hidden" name="latitude" value={createLat} />
                <input type="hidden" name="longitude" value={createLng} />
                <MapPicker 
                  defaultLat={createLat}
                  defaultLng={createLng}
                  onChange={(lat, lng, addr) => {
                    setCreateLat(lat);
                    setCreateLng(lng);
                    if (addr) setCreateAddress(addr);
                  }}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink-500">Akses Transportasi Utama</label>
                <select 
                  name="transit" 
                  className="w-full border border-line rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-brand-600 bg-white cursor-pointer"
                >
                  <option value="Ojek online/kendaraan pribadi">Ojek online/kendaraan pribadi (Skor 40)</option>
                  <option value="Angkot, ojek online/kendaraan pribadi">Angkot, ojek online/kendaraan pribadi (Skor 60)</option>
                  <option value="Bus, angkot, ojek online/kendaraan pribadi">Bus, angkot, ojek online/kendaraan pribadi (Skor 80)</option>
                  <option value="Kereta, bus, angkot, ojek online/kendaraan pribadi">Kereta, bus, angkot, ojek online/kendaraan pribadi (Skor 100)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-ink-500">Pilih Fasilitas Kamar & Kos</label>
                <div className="grid grid-cols-2 gap-4 border border-line bg-surface-muted/50 rounded-2xl p-3.5 max-h-40 overflow-y-auto">
                  <div>
                    <h4 className="font-display tracking-[-0.02em] text-[10px] font-bold uppercase text-ink-500 mb-2">Fasilitas Kamar</h4>
                    <div className="space-y-2">
                      {allFacilities
                        .filter((f) => f.type === "ROOM")
                        .map((f) => (
                          <label key={f.id} className="flex items-center gap-2 text-xs text-ink-700 cursor-pointer select-none">
                            <input 
                              type="checkbox" 
                              name="facilities" 
                              value={f.id} 
                              className="rounded text-primary focus:ring-primary"
                            />
                            {f.name}
                          </label>
                        ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-display tracking-[-0.02em] text-[10px] font-bold uppercase text-ink-500 mb-2">Fasilitas Umum</h4>
                    <div className="space-y-2">
                      {allFacilities
                        .filter((f) => f.type === "PUBLIC")
                        .map((f) => (
                          <label key={f.id} className="flex items-center gap-2 text-xs text-ink-700 cursor-pointer select-none">
                            <input 
                              type="checkbox" 
                              name="facilities" 
                              value={f.id} 
                              className="rounded text-primary focus:ring-primary"
                            />
                            {f.name}
                          </label>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-line">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-line text-xs font-bold text-ink-500 hover:bg-surface-muted transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-600 text-white text-xs font-bold shadow-md shadow-brand-700/10 transition-all cursor-pointer"
                >
                  Simpan Kos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT KOS MODAL */}
      {editingKos && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-line w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-line flex items-center justify-between bg-surface-muted/50">
              <div className="flex items-center gap-2">
                <Home className="w-5 h-5 text-brand-700" />
                <h3 className="font-display tracking-[-0.02em] font-bold text-ink-900 text-[15px]">Edit Data Kos</h3>
              </div>
              <button 
                onClick={() => setEditingKos(null)}
                className="p-1 rounded-lg hover:bg-surface-muted text-ink-500 hover:text-ink-700 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleUpdateSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink-500">Nama Kos</label>
                <input 
                  type="text" 
                  name="name" 
                  defaultValue={editingKos.name}
                  required 
                  className="w-full border border-line rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-brand-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink-500">Deskripsi Kos</label>
                <textarea 
                  name="description" 
                  defaultValue={editingKos.description}
                  required 
                  rows={2}
                  className="w-full border border-line rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-brand-600 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ink-500">Harga per Bulan (Rp)</label>
                  <input 
                    type="number" 
                    name="price" 
                    defaultValue={editingKos.price}
                    required 
                    className="w-full border border-line rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-brand-600"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ink-500">Ukuran Kamar</label>
                  <input 
                    type="text" 
                    name="roomSize" 
                    defaultValue={editingKos.roomSize}
                    required 
                    className="w-full border border-line rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-brand-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ink-500">Tipe Gender</label>
                  <select 
                    name="genderType" 
                    defaultValue={editingKos.genderType}
                    className="w-full border border-line rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-brand-600 bg-white cursor-pointer"
                  >
                    <option value="PUTRA">Putra</option>
                    <option value="PUTRI">Putri</option>
                    <option value="CAMPUR">Campur</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ink-500">Kampus Terdekat</label>
                  <select 
                    name="campus" 
                    defaultValue={editingKos.campus}
                    className="w-full border border-line rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-brand-600 bg-white cursor-pointer"
                  >
                    <option value="UBSI Margonda">UBSI Margonda</option>
                    <option value="UI">UI (Univ Indonesia)</option>
                    <option value="PNJ">Politeknik Negeri Jakarta</option>
                    <option value="Gunadarma">Universitas Gunadarma</option>
                    <option value="Amikom">Amikom</option>
                    <option value="UPN">UPN Veteran</option>
                    <option value="Mercu Buana">Mercu Buana</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink-500">Alamat Lengkap</label>
                <input 
                  type="text" 
                  name="address" 
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  required 
                  className="w-full border border-line rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-brand-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink-500">Pilih Koordinat Kos (Peta Interaktif)</label>
                <input type="hidden" name="latitude" value={editLat} />
                <input type="hidden" name="longitude" value={editLng} />
                <MapPicker 
                  defaultLat={editLat}
                  defaultLng={editLng}
                  onChange={(lat, lng, addr) => {
                    setEditLat(lat);
                    setEditLng(lng);
                    if (addr) setEditAddress(addr);
                  }}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink-500">Akses Transportasi Utama</label>
                <select 
                  name="transit" 
                  defaultValue={editingKos.transit}
                  className="w-full border border-line rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-brand-600 bg-white cursor-pointer"
                >
                  <option value="Ojek online/kendaraan pribadi">Ojek online/kendaraan pribadi (Skor 40)</option>
                  <option value="Angkot, ojek online/kendaraan pribadi">Angkot, ojek online/kendaraan pribadi (Skor 60)</option>
                  <option value="Bus, angkot, ojek online/kendaraan pribadi">Bus, angkot, ojek online/kendaraan pribadi (Skor 80)</option>
                  <option value="Kereta, bus, angkot, ojek online/kendaraan pribadi">Kereta, bus, angkot, ojek online/kendaraan pribadi (Skor 100)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-ink-500">Pilih Fasilitas Kamar & Kos</label>
                <div className="grid grid-cols-2 gap-4 border border-line bg-surface-muted/50 rounded-2xl p-3.5 max-h-40 overflow-y-auto">
                  <div>
                    <h4 className="font-display tracking-[-0.02em] text-[10px] font-bold uppercase text-ink-500 mb-2">Fasilitas Kamar</h4>
                    <div className="space-y-2">
                      {allFacilities
                        .filter((f) => f.type === "ROOM")
                        .map((f) => {
                          const isChecked = editingKos.facilities?.some((kf) => kf.facilityId === f.id) || false;
                          return (
                            <label key={f.id} className="flex items-center gap-2 text-xs text-ink-700 cursor-pointer select-none">
                              <input 
                                type="checkbox" 
                                name="facilities" 
                                value={f.id} 
                                defaultChecked={isChecked}
                                className="rounded text-primary focus:ring-primary"
                              />
                              {f.name}
                            </label>
                          );
                        })}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-display tracking-[-0.02em] text-[10px] font-bold uppercase text-ink-500 mb-2">Fasilitas Umum</h4>
                    <div className="space-y-2">
                      {allFacilities
                        .filter((f) => f.type === "PUBLIC")
                        .map((f) => {
                          const isChecked = editingKos.facilities?.some((kf) => kf.facilityId === f.id) || false;
                          return (
                            <label key={f.id} className="flex items-center gap-2 text-xs text-ink-700 cursor-pointer select-none">
                              <input 
                                type="checkbox" 
                                name="facilities" 
                                value={f.id} 
                                defaultChecked={isChecked}
                                className="rounded text-primary focus:ring-primary"
                              />
                              {f.name}
                            </label>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-line">
                <button
                  type="button"
                  onClick={() => setEditingKos(null)}
                  className="flex-1 py-2.5 rounded-xl border border-line text-xs font-bold text-ink-500 hover:bg-surface-muted transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-600 text-white text-xs font-bold shadow-md shadow-brand-700/10 transition-all cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
