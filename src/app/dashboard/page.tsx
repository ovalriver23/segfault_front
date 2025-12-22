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

// --- SAHTE VERİLER (Özet Kartları için) ---
const summaryData = [
  { title: "Aktif Çalışan Personel", value: "3", color: "text-red-500" },
  { title: "Aktif Masa", value: "9", color: "text-red-500" },
  { title: "Rezervasyon", value: "7", color: "text-red-500" },
];

// --- ALT BİLEŞENLER ---

// Durum Etiketi (Pill)
const StatusPill = ({ status }: { status: string }) => {
  const baseClasses = "px-3 py-1 text-xs font-semibold rounded-full";
  const statusClasses: Record<string, string> = {
    "RECEIVED": "bg-blue-100 text-blue-600",
    "PREPARING": "bg-orange-100 text-orange-600",
    "READY": "bg-purple-100 text-purple-600",
    "SERVED": "bg-cyan-100 text-cyan-600",
    "COMPLETED": "bg-green-100 text-green-600",
    "CANCELLED": "bg-red-100 text-red-600",
  };

  const statusLabels: Record<string, string> = {
    "RECEIVED": "Alındı",
    "PREPARING": "Hazırlanıyor",
    "READY": "Hazır",
    "SERVED": "Servis Edildi",
    "COMPLETED": "Tamamlandı",
    "CANCELLED": "İptal",
  };

  return (
    <span className={`${baseClasses} ${statusClasses[status] || 'bg-gray-100 text-gray-600'}`}>
      {statusLabels[status] || status}
    </span>
  );
};

// Özet Kartı
const SummaryCard = ({ title, value, color }: { title: string; value: string; color: string }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <p className="text-sm text-gray-500">{title}</p>
    <p className={`text-4xl font-bold mt-2 ${color}`}>{value}</p>
  </div>
);

// --- ANA DASHBOARD SAYFASI ---
export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [tableNameFilter, setTableNameFilter] = useState<string>("");
  const [startDateFilter, setStartDateFilter] = useState<Date | null>(null);
  const [endDateFilter, setEndDateFilter] = useState<Date | null>(null);
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<string>("DESC");
  const [showFilters, setShowFilters] = useState<boolean>(false);

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter, tableNameFilter, startDateFilter, endDateFilter, sortBy, sortDirection]);

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

      const response = await fetch(`/api/manager/orders?${params.toString()}`);

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
        {summaryData.map((item) => (
          <SummaryCard key={item.title} title={item.title} value={item.value} color={item.color} />
        ))}
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
                      <td className="py-4 px-2 text-gray-500">{order.timeAgo}</td>
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
    </div>
  );
}