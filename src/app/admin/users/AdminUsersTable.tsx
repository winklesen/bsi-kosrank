"use client";

import { useState } from "react";
import { 
  Store, 
  User, 
  Shield, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  SlidersHorizontal,
  Pencil,
  Trash2,
  X,
  UserCheck
} from "lucide-react";
import { updateUser, deleteUser } from "@/features/users/actions";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "SELLER" | "USER";
  createdAt: Date | string;
  _count: {
    kos: number;
  };
}

interface AdminUsersTableProps {
  initialUsers: UserItem[];
}

export function AdminUsersTable({ initialUsers }: AdminUsersTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"USER" | "SELLER">("USER");
  const [sortBy, setSortBy] = useState("joined-desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  
  const itemsPerPage = 10;

  const roleIcon: Record<string, React.ReactNode> = {
    SUPER_ADMIN: <Shield className="w-3.5 h-3.5 text-brand-700" />,
    SELLER: <Store className="w-3.5 h-3.5 text-[#3D6FED]" />,
    USER: <User className="w-3.5 h-3.5 text-ink-700" />,
  };

  const roleLabel: Record<string, string> = {
    SUPER_ADMIN: "Super Admin",
    SELLER: "Penjual / Pemilik",
    USER: "Pencari / Pengguna",
  };

  const roleBg: Record<string, string> = {
    SUPER_ADMIN: "bg-brand-100 text-brand-700 border-brand-600/20",
    SELLER: "bg-surface-tint text-[#3D6FED] border-[#3D6FED]/20",
    USER: "bg-surface-muted text-ink-700 border-line",
  };

  // Filter and Sort users
  const filteredAndSortedUsers = initialUsers
    .filter((user) => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTab = user.role === activeTab;
      
      return matchesSearch && matchesTab;
    })
    .sort((a, b) => {
      if (sortBy === "joined-desc") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === "joined-asc") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === "name-asc") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "kos-desc") {
        return b._count.kos - a._count.kos;
      }
      return 0;
    });

  // Calculate pagination slice
  const totalItems = filteredAndSortedUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedUsers = filteredAndSortedUsers.slice(startIndex, endIndex);

  // Dynamic user role counters
  const superAdminCount = initialUsers.filter((u) => u.role === "SUPER_ADMIN").length;
  const sellerCount = initialUsers.filter((u) => u.role === "SELLER").length;
  const standardCount = initialUsers.filter((u) => u.role === "USER").length;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus pengguna "${name}"?\nSemua properti kos, booking, dan chat room terkait pengguna ini akan dihapus secara permanen.`)) {
      try {
        await deleteUser(id);
      } catch (err: any) {
        alert("Gagal menghapus pengguna: " + err.message);
      }
    }
  };

  const handleUpdateUserSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingUser) return;

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const role = formData.get("role") as any;

    try {
      await updateUser(editingUser.id, name, email, role);
      setEditingUser(null);
    } catch (err: any) {
      alert("Gagal memperbarui pengguna: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Pencari Stat */}
        <button 
          onClick={() => { setActiveTab("USER"); setCurrentPage(1); }}
          className={`text-left bg-white rounded-2xl border p-5 flex items-center justify-between shadow-sm transition-all cursor-pointer ${
            activeTab === "USER" ? "ring-2 ring-brand-600/30 border-transparent bg-brand-100/30" : "hover:border-line"
          }`}
        >
          <div className="space-y-1">
            <div className="text-2xl font-semibold text-ink-900 tracking-tight leading-none">{standardCount}</div>
            <div className="text-[11px] font-bold text-ink-500 uppercase tracking-wider">Pencari / Pengguna</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-100 border border-brand-600/20 flex items-center justify-center">
            <User className="w-5 h-5 text-brand-700" />
          </div>
        </button>

        {/* Seller Stat */}
        <button 
          onClick={() => { setActiveTab("SELLER"); setCurrentPage(1); }}
          className={`text-left bg-white rounded-2xl border p-5 flex items-center justify-between shadow-sm transition-all cursor-pointer ${
            activeTab === "SELLER" ? "ring-2 ring-blue-400 border-transparent bg-blue-50/10" : "hover:border-line"
          }`}
        >
          <div className="space-y-1">
            <div className="text-2xl font-semibold text-ink-900 tracking-tight leading-none">{sellerCount}</div>
            <div className="text-[11px] font-bold text-ink-500 uppercase tracking-wider">Pemilik / Penjual (Seller)</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
            <Store className="w-5 h-5 text-blue-500" />
          </div>
        </button>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-line">
        <button 
          onClick={() => { setActiveTab("USER"); setCurrentPage(1); }} 
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "USER" 
              ? "border-brand-700 text-brand-700" 
              : "border-transparent text-ink-500 hover:text-ink-900 hover:border-line"
          }`}
        >
          Pencari Kos ({standardCount})
        </button>
        <button 
          onClick={() => { setActiveTab("SELLER"); setCurrentPage(1); }} 
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "SELLER" 
              ? "border-brand-700 text-brand-700" 
              : "border-transparent text-ink-500 hover:text-ink-900 hover:border-line"
          }`}
        >
          Pemilik / Penjual ({sellerCount})
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-border p-4 shadow-sm flex flex-col md:flex-row gap-3.5 items-stretch md:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 h-4.5 w-4.5 text-ink-500" />
          <input
            type="text"
            placeholder="Cari nama pengguna atau email..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 text-sm bg-surface-muted border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder-ink-500"
          />
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap gap-2.5 items-center">
          <div className="flex items-center gap-1.5 bg-surface-muted border border-line rounded-xl px-2.5 py-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-ink-500" />
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="bg-transparent text-xs font-bold text-ink-700 outline-none cursor-pointer pr-1"
            >
              <option value="joined-desc">Terbaru Bergabung</option>
              <option value="joined-asc">Terlama Bergabung</option>
              <option value="name-asc">Nama A-Z</option>
              <option value="kos-desc">Jumlah Kepemilikan Kos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="text-[11px] font-bold uppercase bg-surface-muted text-ink-500 border-b border-border">
              <tr>
                <th className="py-3.5 px-5">Nama Lengkap</th>
                <th className="py-3.5 px-5">Email Akun</th>
                <th className="py-3.5 px-5">Peran / Role</th>
                <th className="py-3.5 px-5">Listing Kos Terdaftar</th>
                <th className="py-3.5 px-5">Tanggal Registrasi</th>
                <th className="py-3.5 px-5 text-right w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedUsers.map((user) => {
                const init = user.name ? user.name[0].toUpperCase() : "?";
                return (
                  <tr key={user.id} className="hover:bg-surface-muted/50 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-muted border border-line text-ink-700 text-xs font-bold flex items-center justify-center shadow-inner">
                          {init}
                        </div>
                        <span className="font-bold text-ink-900 text-[13.5px]">{user.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-ink-500 font-medium">{user.email}</td>
                    <td className="py-4 px-5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${roleBg[user.role]}`}>
                        {roleIcon[user.role]} {roleLabel[user.role]}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-semibold text-ink-700">
                      {user._count.kos > 0 ? (
                        <span className="bg-surface-muted text-ink-700 border border-line px-2 py-0.5 rounded-lg text-xs font-bold">
                          {user._count.kos} Kos
                        </span>
                      ) : (
                        <span className="text-ink-500 text-xs font-normal">—</span>
                      )}
                    </td>
                    <td className="py-4 px-5 text-ink-500 text-xs font-medium">
                      {new Date(user.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="p-1.5 rounded-lg border border-line bg-white text-ink-500 hover:text-brand-700 hover:border-brand-600/40 hover:bg-brand-600/5 transition-all cursor-pointer"
                          title="Ubah Data Pengguna"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          className="p-1.5 rounded-lg border border-line bg-white text-ink-500 hover:text-rose-650 hover:border-rose-300 hover:bg-rose-50 transition-all cursor-pointer"
                          title="Hapus Akun Pengguna"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {totalItems === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-ink-500 italic">
                    Tidak ada akun pengguna yang cocok dengan kriteria filter Anda.
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
              <span className="font-semibold text-ink-700">{totalItems}</span> pengguna
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

      {/* Edit User Modal Dialog Overlay */}
      {editingUser && (
        <div className="fixed inset-0 bg-ink-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-line w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-line flex items-center justify-between bg-surface-muted/50">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-brand-700" />
                <h3 className="font-display font-semibold text-ink-900 text-[15px] tracking-[-0.02em]">Ubah Data Pengguna</h3>
              </div>
              <button 
                onClick={() => setEditingUser(null)}
                className="p-1 rounded-lg hover:bg-surface-muted text-ink-500 hover:text-ink-700 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleUpdateUserSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink-500">Nama Lengkap</label>
                <input 
                  type="text" 
                  name="name" 
                  defaultValue={editingUser.name} 
                  required 
                  className="w-full border border-line rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-brand-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink-500">Email Akun</label>
                <input 
                  type="email" 
                  name="email" 
                  defaultValue={editingUser.email} 
                  required 
                  className="w-full border border-line rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-brand-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink-500">Peran / Hak Akses (Role)</label>
                <select 
                  name="role" 
                  defaultValue={editingUser.role} 
                  className="w-full border border-line rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-brand-600 bg-white cursor-pointer"
                >
                  <option value="USER">Pencari / Pengguna (USER)</option>
                  <option value="SELLER">Penjual / Pemilik (SELLER)</option>
                  <option value="SUPER_ADMIN">Super Admin (SUPER_ADMIN)</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-line">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
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
