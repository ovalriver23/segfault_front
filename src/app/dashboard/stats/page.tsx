"use client";

import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import CustomDatePicker from "@/components/CustomDatePicker";

// --- Prop Tipleri ---
type StatCardProps = {
  title: string;
  value: string;
  change?: number;
  icon?: React.ReactNode;
  currency?: boolean;
};

type ChangePillProps = {
  value: number;
};

type DashboardStats = {
  totalRevenue: number;
  revenueChangePercent: number;
  totalOrderCount: number;
  orderChangePercent: number;
  totalCustomerCount: number;
  customerChangePercent: number;
  activeTableCount: number;
  pendingRequestCount: number;
  salesTrend: { date: string; revenue: number }[] | null;
  hourlySalesTrend: { hour: string; revenue: number }[] | null;
  topMenuItems: { name: string; orderCount: number; revenue: number; changePercent: number }[];
  busyHours: { hour: string; orderCount: number }[];
  topTables: { tableName: string; sessionCount: number }[];
};

// --- Bileşenler (Güncellenmiş Hali) ---

const StatCard = ({ title, value, change, icon, currency = false }: StatCardProps) => (
  <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col justify-between">
    <div className="flex justify-between items-start">
      {/* Renk koyulaştırıldı */}
      <span className="text-gray-600 text-sm font-medium">{title}</span>
      {icon}
    </div>
    {/* Renk koyulaştırıldı */}
    <p className="text-2xl font-bold mt-2 text-gray-900">{currency && "₺"}{value}</p>
    {change && (
      <p className={`text-xs ${change > 0 ? "text-green-500" : "text-red-500"}`}>
        {change > 0 ? "↑" : "↓"} {Math.abs(change)}%
      </p>
    )}
  </div>
);

const ChangePill = ({ value }: ChangePillProps) => (
  <span className={`text-xs font-semibold ${value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
    {value >= 0 ? `+${value}%` : `${value}%`}
  </span>
);

// Map period to Turkish
const periodMapping: Record<string, string> = {
  'today': 'Bugün',
  'week': 'Bu Hafta',
  'month': 'Bu Ay',
  'custom': 'Özel Tarih'
};

export default function StatsPage() {
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'month' | 'custom'>('week');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);

  useEffect(() => {
    // Don't fetch if custom period is selected but dates are not provided
    if (activeTab === 'custom' && (!customStartDate || !customEndDate)) {
      return;
    }
    fetchStats();
  }, [activeTab, customStartDate, customEndDate]);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);

    try {
      let url = `/api/dashboard/stats?period=${activeTab}`;

      if (activeTab === 'custom' && customStartDate && customEndDate) {
        const formatDate = (date: Date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };
        url += `&startDate=${formatDate(customStartDate)}&endDate=${formatDate(customEndDate)}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        setError('Veriler yüklenirken bir hata oluştu!');
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('tr-TR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  // X-axis için gün isimleri (Pazartesi'den başlayarak)
  const dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Pazar'];

  // Ayın son gününü hesapla
  const getLastDayOfMonth = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  };

  // X-axis etiketlerini formatlama fonksiyonu
  const formatXAxisLabel = (value: string, index: number) => {
    if (activeTab === 'week') {
      // Hafta görünümü: Gerçek tarihi parse edip gün ismini bul
      // value formatı: "28 Dec" gibi olabilir
      try {
        const currentYear = new Date().getFullYear();
        const dateStr = `${value} ${currentYear}`;
        const parsedDate = new Date(dateStr);

        if (!isNaN(parsedDate.getTime())) {
          // JavaScript getDay(): 0=Pazar, 1=Pazartesi, ..., 6=Cumartesi
          // dayNames dizisi: 0=Pzt, 1=Sal, ..., 6=Paz (Pazartesi'den başlıyor)
          const jsDay = parsedDate.getDay();
          // Pazar(0) -> 6, Pazartesi(1) -> 0, Salı(2) -> 1, ...
          const adjustedIndex = jsDay === 0 ? 6 : jsDay - 1;
          return dayNames[adjustedIndex];
        }
      } catch {
        // Parse edilemezse orijinal değeri döndür
      }
      return value;
    } else if (activeTab === 'month') {
      // Ay görünümü: Tarihten gün numarasını çıkar
      try {
        const currentYear = new Date().getFullYear();
        const dateStr = `${value} ${currentYear}`;
        const parsedDate = new Date(dateStr);

        if (!isNaN(parsedDate.getTime())) {
          return parsedDate.getDate().toString();
        }
      } catch {
        // Parse edilemezse index + 1 döndür
      }
      return (index + 1).toString();
    }
    return value;
  };

  const salesChartData = stats?.salesTrend?.map((item, index) => ({
    name: item.date,
    index: index,
    value: item.revenue
  })) || stats?.hourlySalesTrend?.map((item, index) => ({
    name: item.hour,
    index: index,
    value: item.revenue
  })) || [];

  const busyHoursChartData = stats?.busyHours?.map(item => ({
    hour: item.hour,
    value: item.orderCount
  })) || [];

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Restoran İstatistikleri</h1>
        <div className="flex items-center space-x-1 bg-gray-200 p-1 rounded-lg">
          {(['today', 'week', 'month', 'custom'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${activeTab === tab
                ? "bg-white shadow text-gray-900 font-semibold"
                : "text-gray-600 hover:bg-gray-300/50"
                }`}
            >
              {periodMapping[tab]}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Range Picker */}
      {activeTab === 'custom' && (
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Başlangıç:</label>
            <CustomDatePicker
              selected={customStartDate}
              onChange={setCustomStartDate}
              placeholderText="Başlangıç tarihi"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Bitiş:</label>
            <CustomDatePicker
              selected={customEndDate}
              onChange={setCustomEndDate}
              placeholderText="Bitiş tarihi"
            />
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[calc(100vh-250px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      ) : null}

      {/* Error State */}
      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-semibold">Hata:</p>
          <p>{error}</p>
        </div>
      ) : null}

      {/* Data Display */}
      {!loading && !error && stats ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Satış Trendi (Geniş Alan) */}
          <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-sm">
            <h2 className="font-bold text-lg mb-4 text-gray-800">Satış Trendi</h2>
            {salesChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value, index) => formatXAxisLabel(value, index)}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "0.5rem" }}
                    labelStyle={{ color: "#1f2937", fontWeight: "bold" }}
                    itemStyle={{ color: "#374151" }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#FF9F5A" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                <p className="text-sm">Henüz veri yok</p>
              </div>
            )}
          </div>

          {/* Özet Kartları */}
          <StatCard
            title="Toplam Gelir"
            value={formatCurrency(stats.totalRevenue)}
            change={stats.revenueChangePercent}
            currency={true}
          />
          <StatCard
            title="Toplam Sipariş"
            value={stats.totalOrderCount.toString()}
            change={stats.orderChangePercent}
          />
          <StatCard
            title="Müşteri Sayısı"
            value={stats.totalCustomerCount.toString()}
            change={stats.customerChangePercent}
          />

          {/* En Çok Satanlar & En Yoğun Saatler */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
            <h2 className="font-bold text-lg mb-4 text-gray-800">En Çok Satan Yemekler</h2>
            {stats.topMenuItems.length > 0 ? (
              <ul className="space-y-4">
                {stats.topMenuItems.map((food, index) => (
                  <li key={food.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <span className="bg-orange-100 text-orange-600 rounded-full w-6 h-6 flex items-center justify-center mr-3 font-bold">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-semibold text-gray-800">{food.name}</p>
                        <p className="text-gray-600">{food.orderCount} sipariş</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">
                        ₺{formatCurrency(food.revenue)}
                      </p>
                      <ChangePill value={food.changePercent} />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">Henüz veri yok</p>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="font-bold text-lg mb-4 text-gray-800">En Yoğun Saatler</h2>
            {busyHoursChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={busyHoursChartData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                  <XAxis
                    dataKey="hour"
                    tick={{ fontSize: 10 }}
                    interval={1}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(255, 159, 90, 0.1)' }}
                    contentStyle={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "0.5rem" }}
                    labelStyle={{ color: "#1f2937", fontWeight: "bold" }}
                    itemStyle={{ color: "#374151" }}
                  />
                  <Bar dataKey="value" fill="#FF9F5A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-500">Henüz veri yok</p>
            )}
          </div>

          {/* En Çok Oturulan Masalar */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
            <h2 className="font-bold text-lg mb-4 text-gray-800">En Çok Oturulan Masalar</h2>
            {stats.topTables.length > 0 ? (
              <div className="space-y-2">
                {stats.topTables.map((table) => {
                  const maxSessions = Math.max(...stats.topTables.map(t => t.sessionCount));
                  return (
                    <div key={table.tableName}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-semibold text-gray-700">{table.tableName}</span>
                        <span className="text-gray-500">{table.sessionCount} oturum</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-orange-400 h-2 rounded-full"
                          style={{
                            width: `${(table.sessionCount / maxSessions) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Henüz veri yok</p>
            )}
          </div>

          {/* Additional Stats Cards */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="font-bold text-lg mb-4 text-gray-800">Diğer İstatistikler</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Aktif Masa</span>
                <span className="text-lg font-bold text-gray-900">{stats.activeTableCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Bekleyen İstek</span>
                <span className="text-lg font-bold text-gray-900">{stats.pendingRequestCount}</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}