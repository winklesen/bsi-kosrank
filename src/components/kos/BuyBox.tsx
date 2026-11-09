"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Phone, Shield, Send, X, MessageSquare, CheckCircle, Calendar, Clock, Loader2, Check, UserCheck, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface BuyBoxProps {
  kosId: string;
  kosName: string;
  price: number;
  ownerId: string | null;
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
  sender: {
    name: string;
  };
}

export function BuyBox({ kosId, kosName, price, ownerId }: BuyBoxProps) {
  const { data: session } = useSession();
  const router = useRouter();

  // Dialog/Modal States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSewaOpen, setIsSewaOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authActionName, setAuthActionName] = useState("");
  
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");

  // Chat States
  const [roomId, setRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [sendingLoading, setSendingLoading] = useState(false);

  // Rental states
  const [duration, setDuration] = useState(1);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const isOwner = session?.user && ownerId && session.user.id === ownerId;

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom();
    }
  }, [messages, isChatOpen]);

  // Clean up polling on chat close
  useEffect(() => {
    if (!isChatOpen && pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [isChatOpen]);

  // Handle Login Check
  const checkAuth = (actionName: string) => {
    if (!session) {
      setAuthActionName(actionName);
      setIsAuthModalOpen(true);
      return false;
    }
    return true;
  };

  // ─── Sewa / Booking Logic ────────────────────────────────────────────────
  const handleAjukanSewa = async () => {
    if (!checkAuth("mengajukan sewa")) return;
    if (!agreeTerms) {
      setBookingError("Anda harus menyetujui syarat dan ketentuan.");
      return;
    }
    setBookingLoading(true);
    setBookingError("");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kosId, durationMonths: duration }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal mengajukan sewa.");
      }

      setBookingSuccess(true);
      setTimeout(() => {
        setIsSewaOpen(false);
        setBookingSuccess(false);
      }, 3500);
    } catch (err: any) {
      setBookingError(err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  // ─── Chat Logic ──────────────────────────────────────────────────────────
  const handleOpenChat = async () => {
    if (!checkAuth("bertanya ke pemilik")) return;
    if (!ownerId) {
      setBookingError("Pemilik kos tidak teridentifikasi.");
      return;
    }

    setIsChatOpen(true);
    setChatLoading(true);

    try {
      const roomRes = await fetch("/api/chats/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kosId, sellerId: ownerId }),
      });
      const roomData = await roomRes.json();

      if (!roomRes.ok) {
        throw new Error(roomData.error || "Gagal memuat ruang obrolan.");
      }

      setRoomId(roomData.id);

      await fetchMessages(roomData.id);

      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = setInterval(() => {
        fetchMessages(roomData.id);
      }, 3000);

    } catch (err: any) {
      alert(err.message);
      setIsChatOpen(false);
    } finally {
      setChatLoading(false);
    }
  };

  const fetchMessages = async (id: string) => {
    try {
      const res = await fetch(`/api/chats/rooms/${id}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error("Gagal memuat pesan:", err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !roomId || sendingLoading) return;

    setSendingLoading(true);
    const textToSend = newMessage;
    setNewMessage("");

    try {
      const res = await fetch(`/api/chats/rooms/${roomId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToSend }),
      });

      if (!res.ok) {
        throw new Error("Gagal mengirim pesan");
      }

      const data = await res.json();
      setMessages((prev) => [...prev, data]);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSendingLoading(false);
    }
  };

  // Helper for names initials
  const getInitials = (name: string) => {
    return name ? name.substring(0, 2).toUpperCase() : "PM";
  };

  return (
    <>
      {/* ─── Buy Box Sidebar Box ─── */}
      <div className="bg-white border border-line rounded-2xl p-5 text-left shadow-[0_4px_16px_rgba(15,15,20,0.06)] relative overflow-hidden">
        {/* Subtle accent border top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-700 to-brand-600" />
        
        {/* Price section */}
        <div className="flex items-baseline gap-0.5 text-ink-900 mb-1">
          <span className="text-[13px] font-normal align-super">Rp</span>
          <span className="font-display text-[26px] font-bold leading-none tracking-[-0.02em]">
            {price.toLocaleString("id-ID")}
          </span>
          <span className="text-[12px] text-ink-500 font-normal ml-0.5">/bulan</span>
        </div>

        {/* Delivery/Survey details */}
        <div className="text-[13px] text-ink-900 mt-3 space-y-2 border-b border-line pb-3.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-eco" />
            <span>Survei Lokasi: <span className="font-semibold text-eco">Bisa Hari Ini</span></span>
          </div>
          <p className="text-ink-500 text-[12px] leading-relaxed pl-3.5">
            Kunjungi kos secara langsung bersama pemilik untuk mencocokkan kelayakan fasilitas kamar.
          </p>
        </div>

        {/* Owner View vs Seeker View */}
        {isOwner ? (
          <div className="mt-4 bg-brand-100 border border-brand-600/30 rounded-xl p-3 text-left">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4.5 h-4.5 text-brand-700 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold text-[12px] text-brand-700">Iklan Kos Anda</span>
                <p className="text-ink-700 text-[11px] leading-relaxed">
                  Ini adalah properti kos yang Anda daftarkan. Anda dapat memantau pengajuan sewa dan pesan masuk dari Dashboard Penjual Anda.
                </p>
                <Link 
                  href="/seller" 
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-700 hover:text-brand-600 transition-colors pt-1"
                >
                  Buka Dashboard Penjual <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Availability Status Indicator Banner */}
            <div className="mt-3.5 bg-brand-100 border border-brand-600/20 rounded-xl p-2.5 flex items-center gap-2">
              <CheckCircle className="w-4.5 h-4.5 text-brand-700" />
              <div className="text-[12px]">
                <span className="font-semibold text-brand-700">Status Kamar: </span>
                <span className="text-ink-700">Tersedia untuk disewa</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 space-y-2.5">
              {/* Primary: Ajukan Sewa */}
              <button 
                onClick={() => setIsSewaOpen(true)}
                className="w-full bg-brand-700 hover:bg-brand-600 text-white rounded-lg text-[13px] font-semibold h-10 flex items-center justify-center gap-2 transition-all hover:-translate-y-px active:translate-y-0 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                Ajukan Sewa Sekarang
              </button>

              {/* Secondary: Tanya Pemilik */}
              <button 
                onClick={handleOpenChat}
                className="w-full bg-white hover:bg-brand-100 text-brand-700 border border-brand-600 rounded-lg text-[13px] font-semibold h-10 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                Tanya Pemilik (Chat App)
              </button>
            </div>
          </>
        )}

        {/* Trust Signal */}
        <div className="mt-5 pt-3.5 border-t border-line flex items-start gap-2.5 text-[11px] text-ink-500 leading-relaxed">
          <Shield className="w-4 h-4 text-brand-700 flex-shrink-0 mt-0.5" />
          <span>
            <strong className="text-ink-900">Keamanan KosRank.</strong> Data kamar, harga, dan koordinat diverifikasi objektif via metode SPK SAW.
          </span>
        </div>
      </div>


      {/* ─── MODAL 1: AJUKAN SEWA (Direct Lease Slip Style) ──────────────── */}
      <AnimatePresence>
        {isSewaOpen && (
          <div className="fixed inset-0 bg-ink-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-[1px]">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-line rounded-2xl max-w-md w-full overflow-hidden shadow-[0_4px_16px_rgba(15,15,20,0.12)]"
            >
              {/* Header */}
              <div className="bg-brand-700 text-white px-4 py-3.5 flex items-center justify-between">
                <h3 className="font-display font-semibold text-[14px] tracking-wide flex items-center gap-2">
                  <Calendar className="w-4.5 h-4.5 text-brand-100" />
                  Pengajuan Sewa Resmi
                </h3>
                <button 
                  onClick={() => setIsSewaOpen(false)}
                  aria-label="Tutup"
                  className="text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                {bookingSuccess ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
                    <div className="w-14 h-14 rounded-full bg-brand-100 flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-eco" />
                    </div>
                    <div>
                      <h4 className="font-display font-semibold text-ink-900 text-[16px]">Pengajuan Sewa Terkirim!</h4>
                      <p className="text-xs text-ink-500 mt-1.5 max-w-[300px] leading-relaxed">
                        Data pemesanan sewa Anda telah dicatat di database. Pemilik kos akan segera memberi persetujuan atau menolak via dashboard.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <div className="text-[11px] text-ink-500 uppercase tracking-wider font-semibold">Nama Kos</div>
                      <div className="text-[14px] font-semibold text-ink-900 mt-0.5">{kosName}</div>
                    </div>

                    {/* Receipt Price slip */}
                    <div className="bg-surface-tint border border-line p-3 rounded-xl space-y-2">
                      <div className="flex justify-between items-center text-[12px]">
                        <span className="text-ink-500">Tarif Kamar</span>
                        <span className="font-semibold text-ink-900">Rp {price.toLocaleString("id-ID")} /bulan</span>
                      </div>
                      
                      {/* Select Duration */}
                      <div className="space-y-1 pt-1.5 border-t border-line">
                        <label className="block text-[12px] font-semibold text-ink-900">
                          Pilih Jangka Waktu Sewa:
                        </label>
                        <select 
                          value={duration} 
                          onChange={(e) => setDuration(parseInt(e.target.value))}
                          className="w-full border border-line bg-white rounded-lg px-2.5 py-1.5 text-[13px] text-ink-900 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 cursor-pointer"
                        >
                          <option value={1}>1 Bulan</option>
                          <option value={3}>3 Bulan</option>
                          <option value={6}>6 Bulan</option>
                          <option value={12}>12 Bulan (1 Tahun)</option>
                        </select>
                      </div>
                    </div>

                    {/* Total Price Statement */}
                    <div className="flex justify-between items-baseline pt-3 border-t border-line">
                      <span className="text-[13px] text-ink-900 font-semibold">Estimasi Tagihan:</span>
                      <span className="font-display text-[20px] font-bold text-ink-900 tracking-[-0.02em]">
                        Rp {(price * duration).toLocaleString("id-ID")}
                      </span>
                    </div>

                    {/* Checkbox agreement */}
                    <label className="flex items-start gap-2.5 cursor-pointer select-none py-1">
                      <input 
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="mt-0.5 accent-brand-700 rounded cursor-pointer"
                      />
                      <span className="text-[11px] text-ink-500 leading-normal">
                        Saya menyetujui survei lokasi awal dan berkomitmen mengikuti syarat pengisian sewa di KosRank.
                      </span>
                    </label>

                    {bookingError && (
                      <div className="text-xs text-red-600 bg-red-50 border border-red-200 p-2.5 rounded-lg">
                        {bookingError}
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      onClick={handleAjukanSewa}
                      disabled={bookingLoading || !agreeTerms}
                      className="w-full bg-brand-700 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-[13px] font-semibold h-10 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {bookingLoading ? (
                        <>
                          <Loader2 className="w-4.5 h-4.5 animate-spin" />
                          Memproses Pengajuan...
                        </>
                      ) : (
                        "Kirim Form Sewa Ke Pemilik"
                      )}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* ─── MODAL 2: AUTH REQUIRED PROMPT ─── */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="fixed inset-0 bg-ink-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-[1px]">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-line rounded-2xl max-w-sm w-full overflow-hidden shadow-[0_4px_16px_rgba(15,15,20,0.12)]"
            >
              {/* Header */}
              <div className="bg-brand-700 text-white px-4 py-3.5 flex items-center justify-between">
                <h3 className="font-display font-semibold text-[14px] tracking-wide flex items-center gap-2">
                  <Shield className="w-4.5 h-4.5 text-brand-100" />
                  Akses Masuk Diperlukan
                </h3>
                <button 
                  onClick={() => setIsAuthModalOpen(false)}
                  aria-label="Tutup"
                  className="text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4 text-left">
                <p className="text-[13px] text-ink-700 leading-relaxed">
                  Untuk dapat <span className="font-semibold text-ink-900">{authActionName}</span>, Anda wajib masuk (login) terlebih dahulu menggunakan akun pencari kos Anda.
                </p>

                <div className="flex gap-3 pt-2">
                  {/* Cancel */}
                  <button
                    onClick={() => setIsAuthModalOpen(false)}
                    className="flex-1 bg-white hover:border-brand-600 hover:text-brand-600 text-ink-900 border border-line rounded-lg text-[13px] font-semibold h-9 transition-colors cursor-pointer"
                  >
                    Batal
                  </button>

                  {/* Login */}
                  <button
                    onClick={() => {
                      setIsAuthModalOpen(false);
                      router.push("/auth/login");
                    }}
                    className="flex-1 bg-brand-700 hover:bg-brand-600 text-white rounded-lg text-[13px] font-semibold h-9 flex items-center justify-center transition-all hover:-translate-y-px cursor-pointer"
                  >
                    Masuk Sekarang
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* ─── DRAWER: FLOATING CHAT DRAWER ─── */}
      <AnimatePresence>
        {isChatOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-ink-900/50 z-40 backdrop-blur-[0.5px]" 
              onClick={() => setIsChatOpen(false)}
            />

            {/* Sidebar drawer content */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className="fixed top-0 right-0 h-full w-full max-w-[420px] bg-surface-muted shadow-2xl z-50 flex flex-col border-l border-line"
            >
              {/* Drawer Header */}
              <div className="bg-brand-700 text-white px-4 h-16 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  {/* Initials Avatar */}
                  <div className="w-9 h-9 rounded-full bg-white text-brand-700 font-display font-bold text-[13px] flex items-center justify-center">
                    {getInitials(kosName)}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-display text-[13px] font-semibold truncate max-w-[220px]">
                      {kosName}
                    </span>
                    <span className="text-[10px] text-white/80 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-eco animate-pulse" />
                      Pemilik Kos Terverifikasi
                    </span>
                  </div>
                </div>
                
                <button 
                  onClick={() => setIsChatOpen(false)}
                  aria-label="Tutup obrolan"
                  className="text-white/70 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Chat Messages Body with Radial Dot Grid Background Pattern */}
              <div 
                className="flex-1 overflow-y-auto p-4 space-y-4"
                style={{
                  backgroundImage: "radial-gradient(#6D3FE0 0.6px, transparent 0.6px), radial-gradient(#6D3FE0 0.6px, #F5F5F7 0.6px)",
                  backgroundSize: "24px 24px",
                  backgroundPosition: "0 0, 12px 12px",
                  opacity: 0.95
                }}
              >
                {chatLoading ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-ink-500">
                    <Loader2 className="w-7 h-7 animate-spin text-brand-700" />
                    <span className="text-xs font-semibold">Menghubungkan obrolan...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center px-6 space-y-2 bg-white/70 backdrop-blur-[2px] rounded-2xl m-4 p-6 border border-line">
                    <MessageSquare className="w-10 h-10 text-brand-700 opacity-80" />
                    <h5 className="font-display font-semibold text-[14px] text-ink-900">Mulai Diskusi Kos</h5>
                    <p className="text-[11px] text-ink-500 leading-relaxed">
                      Tanyakan langsung kepada pemilik mengenai negosiasi harga, ketersediaan kamar, aturan parkir, atau atur janji temu.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderId === session?.user?.id;
                    return (
                      <div 
                        key={msg.id}
                        className={`flex gap-2 items-end max-w-[85%] ${
                          isMe ? "ml-auto flex-row-reverse" : "mr-auto"
                        }`}
                      >
                        {/* Chat bubble avatar */}
                        {!isMe && (
                          <div className="w-6 h-6 rounded-full bg-brand-700 text-white text-[10px] font-semibold flex items-center justify-center flex-shrink-0">
                            {getInitials(msg.sender.name)}
                          </div>
                        )}
                        
                        <div className="flex flex-col items-end">
                          <div 
                            className={`rounded-2xl px-3 py-2 text-[13px] leading-relaxed border ${
                              isMe 
                                ? "bg-brand-100 border-brand-600/20 text-ink-900 rounded-tr-none"
                                : "bg-white border-line text-ink-900 rounded-tl-none"
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                          </div>
                          
                          {/* Timestamp and verify checks */}
                          <div className="flex items-center gap-1 text-[9px] text-ink-500 mt-1 px-1">
                            <span>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isMe && <span className="text-brand-700 font-semibold">✓✓</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Form Input Area */}
              <form 
                onSubmit={handleSendMessage}
                className="bg-white border-t border-line p-3 flex gap-2 items-center flex-shrink-0"
              >
                <input 
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Ketik pertanyaan Anda..."
                  disabled={chatLoading || sendingLoading}
                  className="flex-1 border border-line rounded-full px-4 h-9 text-[13px] text-ink-900 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 transition-colors"
                />
                
                <button
                  type="submit"
                  disabled={chatLoading || sendingLoading || !newMessage.trim()}
                  aria-label="Kirim pesan"
                  className="bg-brand-700 hover:bg-brand-600 disabled:bg-surface-muted disabled:text-ink-500 disabled:border-line text-white border border-transparent h-9 w-9 flex items-center justify-center rounded-full cursor-pointer transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
