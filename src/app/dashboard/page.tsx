"use client";

import React, { useState, useEffect } from "react";
import CustomDatePicker from "@/components/CustomDatePicker";
import CustomSelect from "@/components/CustomSelect";

// --- TİPLER ---
type Order = {
  id: number;
  tableName: string;
  itemNames: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  timeAgo: string;
  minutesAgo: number;
};

type OrdersResponse = {
  content: Order[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
};

interface TableStats {
  activeTables: number;
  totalTables: number;
}

interface StaffStats {
  activeStaff: number;
  totalStaff: number;
}

// --- SAHTE VERİLER (Özet Kartları için) ---
// Rezervasyon kartı için mock data
const mockReservationCount = 0;

// --- ALT BİLEŞENLER ---

// Durum Etiketi (Pill)
const statusLabels: Record<string, string> = {
  RECEIVED: "Alındı",
  PREPARING: "Hazırlanıyor",
  READY: "Hazır",
  SERVED: "Servis Edildi",
  COMPLETED: "Tamamlandı",
  CANCELLED: "İptal",
};

const StatusPill = ({ status }: { status: string }) => {
  const baseClasses = "px-3 py-1 text-xs font-semibold rounded-full";
  const statusClasses: Record<string, string> = {
    RECEIVED: "bg-blue-100 text-blue-600",
    PREPARING: "bg-orange-100 text-orange-600",
    READY: "bg-purple-100 text-purple-600",
    SERVED: "bg-cyan-100 text-cyan-600",
    COMPLETED: "bg-green-100 text-green-600",
    CANCELLED: "bg-red-100 text-red-600",
  };

  return (
    <span className={`${baseClasses} ${statusClasses[status] || "bg-gray-100 text-gray-600"}`}>
      {statusLabels[status] || status}
    </span>
  );
};

const parseOrderDate = (value: string) => {
  const parts = value.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/);

  if (!parts) return null;

  const [, year, month, day, hour, minute, second = "0"] = parts;
  // The backend clock is three hours ahead; Date handles day/month rollover.
  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour) - 3,
    Number(minute),
    Number(second),
  );
};

const formatOrderDateTime = (value: string) => {
  const date = parseOrderDate(value);

  if (!date || Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "long",
    timeStyle: "medium",
  }).format(date);
};

const getOrderElapsedMinutes = (value: string) => {
  const date = parseOrderDate(value);

  if (!date || Number.isNaN(date.getTime())) return 0;

  return Math.max(0, Math.floor((Date.now() - date.getTime()) / 60_000));
};

const formatOrderElapsedTime = (minutes: number) => {
  if (minutes < 1) return "Az önce";
  if (minutes < 60) return `${minutes} dakika önce`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} saat önce`;

  return `${Math.floor(hours / 24)} gün önce`;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(value);

const OrderInvoiceModal = ({ order, onClose }: { order: Order; onClose: () => void }) => {
  const items = order.itemNames
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
  const elapsedMinutes = getOrderElapsedMinutes(order.createdAt);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gray-950/60 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-invoice-title"
        className="relative my-auto w-full max-w-lg overflow-hidden rounded-2xl bg-[#fffdf8] text-gray-800 shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Sipariş detayını kapat"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="border-b border-dashed border-gray-300 px-6 pb-6 pt-8 text-center sm:px-8">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 text-pink-700">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 14l2 2 4-4m5-3.5A5.5 5.5 0 0114.5 3h-5A5.5 5.5 0 004 8.5v7A5.5 5.5 0 009.5 21h5a5.5 5.5 0 005.5-5.5v-7z" />
            </svg>
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-pink-700">Sipariş Faturası</p>
          <h2 id="order-invoice-title" className="mt-2 text-2xl font-bold text-gray-900">
            Sipariş #{order.id}
          </h2>
          <p className="mt-1 text-sm text-gray-500">{formatOrderDateTime(order.createdAt)}</p>
        </div>

        <div className="space-y-6 px-6 py-6 sm:px-8">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Masa</dt>
              <dd className="mt-1 font-semibold text-gray-800">{order.tableName || "Belirtilmedi"}</dd>
            </div>
            <div className="text-right">
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Durum</dt>
              <dd className="mt-1"><StatusPill status={order.status} /></dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Sipariş No</dt>
              <dd className="mt-1 font-medium">#{order.id}</dd>
            </div>
            <div className="text-right">
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Geçen Süre</dt>
              <dd className="mt-1 font-medium">{formatOrderElapsedTime(elapsedMinutes)}</dd>
            </div>
          </dl>

          <div>
            <div className="mb-3 flex items-center justify-between border-b border-gray-200 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <span>Ürünler</span>
              <span>Detay</span>
            </div>
            {items.length > 0 ? (
              <ul className="space-y-3">
                {items.map((item, index) => (
                  <li key={`${item}-${index}`} className="flex items-start justify-between gap-4 text-sm">
                    <span className="flex min-w-0 items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-500">
                        {index + 1}
                      </span>
                      <span className="wrap-break-word pt-0.5 text-gray-700">{item}</span>
                    </span>
                    <span className="shrink-0 pt-0.5 text-gray-400">—</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-lg border border-dashed border-gray-300 bg-white/60 px-4 py-5 text-center text-sm text-gray-500">
                Bu sipariş için ürün bilgisi bulunmuyor.
              </div>
            )}
          </div>

          <div className="border-y border-dashed border-gray-300 py-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-700">Toplam Tutar</span>
              <span className="text-2xl font-bold text-gray-900">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>

          <dl className="space-y-2 text-xs text-gray-500">
            <div className="flex justify-between gap-4">
              <dt>Oluşturulma zamanı</dt>
              <dd className="text-right font-medium text-gray-600">{formatOrderDateTime(order.createdAt)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Geçen dakika</dt>
              <dd className="text-right font-medium text-gray-600">{elapsedMinutes} dakika</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Durum kodu</dt>
              <dd className="text-right font-mono font-medium text-gray-600">{order.status}</dd>
            </div>
          </dl>
        </div>

        <div className="border-t border-dashed border-gray-300 bg-white/50 px-6 py-4 text-center text-xs text-gray-400">
          Sipariş detayları sistemde kayıtlı bilgilere göre hazırlanmıştır.
        </div>
      </section>
    </div>
  );
};

// Özet Kartı
const SummaryCard = ({ title, value, color }: { title: string; value: string; color: string }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <p className="text-sm text-gray-500">{title}</p>
    <p className={`text-4xl font-bold mt-2 ${color}`}>{value}</p>
  </div>
);

// Yakında - Gray Radial Progress (Rezervasyon için)
const ComingSoonRadialCard = ({ title, count }: { title: string; count: number }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col items-center justify-center">
      <p className="text-sm text-gray-500 mb-4">{title}</p>
      <div
        className="radial-progress bg-gray-200 text-gray-400"
        style={{ "--value": 0, "--size": "12rem", "--thickness": "1.6rem" } as React.CSSProperties}
        role="progressbar"
        aria-valuenow={0}
      >
        <div className="bg-white rounded-full flex flex-col items-center justify-center" style={{ width: '8.8rem', height: '8.8rem' }}>
          <div className="text-3xl font-bold text-gray-400">{count}</div>
          <div className="text-sm text-gray-400">Rezerve</div>
        </div>
      </div>
      <p className="text-xs text-gray-400 font-medium mt-4">Yakında</p>
    </div>
  );
};

// Radial Progress Kartı
const RadialProgressCard = ({ activeTables, totalTables, title = "Aktif Masa" }: { activeTables: number; totalTables: number; title?: string }) => {
  const percentage = totalTables > 0 ? Math.round((activeTables / totalTables) * 100) : 0;

  // Yüzdeye göre dinamik renk seçimi
  const getColors = () => {
    if (percentage < 25) {
      return {
        bg: "bg-green-200",
        text: "text-green-700",
        label: "text-green-600"
      };
    } else if (percentage < 50) {
      return {
        bg: "bg-yellow-200",
        text: "text-yellow-700",
        label: "text-yellow-600"
      };
    } else if (percentage < 75) {
      return {
        bg: "bg-orange-200",
        text: "text-orange-700",
        label: "text-orange-600"
      };
    } else {
      return {
        bg: "bg-red-200",
        text: "text-red-700",
        label: "text-red-600"
      };
    }
  };

  const colors = getColors();

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col items-center justify-center">
      <p className="text-sm text-gray-500 mb-4">{title}</p>
      <div
        className={`radial-progress ${colors.bg} ${colors.text}`}
        style={{ "--value": percentage, "--size": "12rem", "--thickness": "1.6rem" } as React.CSSProperties}
        role="progressbar"
        aria-valuenow={percentage}
      >
        <div className="bg-white rounded-full flex flex-col items-center justify-center" style={{ width: '8.8rem', height: '8.8rem' }}>
          <div className="text-3xl font-bold text-gray-800">{activeTables}</div>
          <div className="text-sm text-gray-500">/ {totalTables}</div>
        </div>
      </div>
      <p className={`text-xs ${colors.label} font-medium mt-4`}>%{percentage} Doluluk</p>
    </div>
  );
};

// --- ANA DASHBOARD SAYFASI ---
export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [tableStats, setTableStats] = useState<TableStats>({ activeTables: 0, totalTables: 0 });
  const [tableStatsLoading, setTableStatsLoading] = useState(true);
  const [staffStats, setStaffStats] = useState<StaffStats>({ activeStaff: 0, totalStaff: 0 });
  const [staffStatsLoading, setStaffStatsLoading] = useState(true);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [tableNameFilter, setTableNameFilter] = useState<string>("");
  const [startDateFilter, setStartDateFilter] = useState<Date | null>(null);
  const [endDateFilter, setEndDateFilter] = useState<Date | null>(null);
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<string>("DESC");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchTableStats();
    fetchStaffStats();
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter, tableNameFilter, startDateFilter, endDateFilter, sortBy, sortDirection]);

  useEffect(() => {
    if (!selectedOrder) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedOrder(null);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedOrder]);

  const fetchTableStats = async () => {
    try {
      const response = await fetch('/api/dashboard/manager/table-stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTableStats(data);
      } else {
        console.error('Failed to fetch table stats:', response.status);
      }
    } catch (error) {
      console.error('Error fetching table stats:', error);
    } finally {
      setTableStatsLoading(false);
    }
  };

  const fetchStaffStats = async () => {
    try {
      const response = await fetch('/api/dashboard/manager/staff-stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStaffStats(data);
      } else {
        console.error('Failed to fetch staff stats:', response.status);
      }
    } catch (error) {
      console.error('Error fetching staff stats:', error);
    } finally {
      setStaffStatsLoading(false);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      // Build query string with filters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        size: "10",
        sortBy,
        sortDirection,
      });

      if (statusFilter) params.append("status", statusFilter);
      if (tableNameFilter) params.append("tableName", tableNameFilter);
      if (startDateFilter) {
        const formatted = formatDate(startDateFilter);
        params.append("startDate", formatted);
      }
      if (endDateFilter) {
        const formatted = formatDate(endDateFilter);
        params.append("endDate", formatted);
      }

      const response = await fetch(`/api/dashboard/manager/orders?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Siparişler yüklenemedi');
      }

      const data: OrdersResponse = await response.json();
      setOrders(data.content);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleResetFilters = () => {
    setStatusFilter("");
    setTableNameFilter("");
    setStartDateFilter(null);
    setEndDateFilter(null);
    setSortBy("createdAt");
    setSortDirection("DESC");
    setCurrentPage(0);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* Üst Kısım: Özet Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* Radial Progress for Active Tables */}
        {tableStatsLoading ? (
          <div className="bg-white p-6 rounded-lg shadow-sm flex items-center justify-center">
            <span className="loading loading-spinner loading-lg text-pink-700"></span>
          </div>
        ) : (
          <RadialProgressCard activeTables={tableStats.activeTables} totalTables={tableStats.totalTables} title="Aktif Masa" />
        )}

        {/* Radial Progress for Active Staff */}
        {staffStatsLoading ? (
          <div className="bg-white p-6 rounded-lg shadow-sm flex items-center justify-center">
            <span className="loading loading-spinner loading-lg text-pink-700"></span>
          </div>
        ) : (
          <RadialProgressCard activeTables={staffStats.activeStaff} totalTables={staffStats.totalStaff} title="Aktif Çalışan Personel" />
        )}

        {/* Coming Soon Radial Progress for Reservations */}
        <ComingSoonRadialCard title="Rezervasyon" count={mockReservationCount} />
      </div>

      {/* Alt Kısım: Son Siparişler */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-800">Son Siparişler</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filtreler
          </button>
        </div>

        {/* Filtreler */}
        {showFilters && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Durum Filtresi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
                <CustomSelect
                  value={statusFilter}
                  onChange={(value) => {
                    setStatusFilter(value);
                    setCurrentPage(0);
                  }}
                  options={[
                    { value: '', label: 'Tümü' },
                    { value: 'RECEIVED', label: 'Alındı' },
                    { value: 'SERVED', label: 'Servis Edildi' },
                    { value: 'COMPLETED', label: 'Tamamlandı' },
                    { value: 'CANCELLED', label: 'İptal' },
                  ]}
                />
              </div>

              {/* Masa Adı Filtresi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Masa Adı</label>
                <input
                  type="text"
                  value={tableNameFilter}
                  onChange={(e) => {
                    setTableNameFilter(e.target.value);
                    setCurrentPage(0);
                  }}
                  placeholder="Masa ara..."
                  className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                />
              </div>

              {/* Başlangıç Tarihi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç Tarihi</label>
                <CustomDatePicker
                  selected={startDateFilter}
                  onChange={(date) => {
                    setStartDateFilter(date);
                    setCurrentPage(0);
                  }}
                  placeholderText="Başlangıç tarihi"
                />
              </div>

              {/* Bitiş Tarihi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bitiş Tarihi</label>
                <CustomDatePicker
                  selected={endDateFilter}
                  onChange={(date) => {
                    setEndDateFilter(date);
                    setCurrentPage(0);
                  }}
                  placeholderText="Bitiş tarihi"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Sıralama Seçimi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sıralama</label>
                <CustomSelect
                  value={`${sortBy}-${sortDirection}`}
                  onChange={(value) => {
                    const [newSortBy, newDirection] = value.split('-');
                    setSortBy(newSortBy);
                    setSortDirection(newDirection);
                    setCurrentPage(0);
                  }}
                  options={[
                    { value: 'createdAt-DESC', label: 'En Yeni Önce' },
                    { value: 'createdAt-ASC', label: 'En Eski Önce' },
                    { value: 'totalAmount-DESC', label: 'Tutar Yüksekten Düşüğe' },
                    { value: 'totalAmount-ASC', label: 'Tutar Düşükten Yükseğe' },
                    { value: 'tableName-ASC', label: 'Masa Adı A-Z' },
                    { value: 'tableName-DESC', label: 'Masa Adı Z-A' },
                  ]}
                />
              </div>

              {/* Boş alan */}
              <div></div>

              {/* Sıfırla Butonu */}
              <div className="flex items-end">
                <button
                  onClick={handleResetFilters}
                  className="w-full px-4 py-2 text-sm font-medium text-white bg-pink-600 border border-pink-600 rounded-lg hover:bg-pink-700 transition-colors"
                >
                  Filtreleri Sıfırla
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-semibold">Hata:</p>
            <p>{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Henüz sipariş yok</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase border-b">
                  <tr>
                    <th className="py-3 px-2">Sipariş No</th>
                    <th className="py-3 px-2">Masa</th>
                    <th className="py-3 px-2">Ürünler</th>
                    <th className="py-3 px-2">Tutar</th>
                    <th className="py-3 px-2">Durum</th>
                    <th className="py-3 px-2">Zaman</th>
                    <th className="py-3 px-2 text-center"><span className="sr-only">Detay</span></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b last:border-none">
                      <td className="py-4 px-2 font-medium text-gray-700">#{order.id}</td>
                      <td className="py-4 px-2 text-gray-600">{order.tableName}</td>
                      <td className="py-4 px-2 text-gray-600">{order.itemNames}</td>
                      <td className="py-4 px-2 font-semibold text-gray-700">₺{order.totalAmount.toFixed(2)}</td>
                      <td className="py-4 px-2"><StatusPill status={order.status} /></td>
                      <td className="py-4 px-2 text-gray-500">
                                              {formatOrderElapsedTime(getOrderElapsedMinutes(order.createdAt))}
                                            </td>
                      <td className="py-4 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          aria-label={`Sipariş #${order.id} detaylarını göster`}
                          title="Sipariş detayını göster"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-pink-200 bg-pink-50 text-pink-700 transition hover:border-pink-300 hover:bg-pink-100 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 17v-6m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Önceki
                </button>
                <span className="text-sm text-gray-600">
                  Sayfa {currentPage + 1} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sonraki
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {selectedOrder && (
        <OrderInvoiceModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
}