"use client";

import React from "react";

// --- SAHTE VERİLER ---
const summaryData = [
  { title: "Aktif Çalışan Personel", value: "3", color: "text-red-500" },
  { title: "Aktif Masa", value: "9", color: "text-red-500" },
  { title: "Rezervasyon", value: "7", color: "text-red-500" },
];

const recentOrders = [
  { id: "#1234", table: 7, items: "Hamburger, Cola", total: 145, status: "Hazırlanıyor", time: "5 dk önce" },
  { id: "#1234", table: 6, items: "Pizza, Ayran", total: 230, status: "Tamamlandı", time: "5 dk önce" },
  { id: "#1234", table: 5, items: "Lahmacun, Şalgam", total: 95, status: "Hazırlanıyor", time: "5 dk önce" },
  { id: "#1234", table: 1, items: "Köfte, Pilav", total: 180, status: "Tamamlandı", time: "5 dk önce" },
  { id: "#1234", table: 12, items: "Döner, Kola", total: 120, status: "Hazırlanıyor", time: "5 dk önce" },
];

const popularItems = [
  { name: "Hamburger", orders: 45 },
  { name: "Pizza", orders: 38 },
  { name: "Lahmacun", orders: 32 },
  { name: "Döner", orders: 28 },
  { name: "Köfte", orders: 24 },
];

// --- ALT BİLEŞENLER ---

// Durum Etiketi (Pill)
const StatusPill = ({ status }: { status: string }) => {
  const baseClasses = "px-3 py-1 text-xs font-semibold rounded-full";
  const statusClasses = {
    "Hazırlanıyor": "bg-orange-100 text-orange-600",
    "Tamamlandı": "bg-green-100 text-green-600",
  };
  return <span className={`${baseClasses} ${statusClasses[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>;
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
  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* Üst Kısım: Özet Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {summaryData.map((item) => (
          <SummaryCard key={item.title} title={item.title} value={item.value} color={item.color} />
        ))}
      </div>

      {/* Alt Kısım: Siparişler ve Popülerler */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Son Siparişler Tablosu */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Son Siparişler</h2>
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
                {recentOrders.map((order, index) => (
                  <tr key={index} className="border-b last:border-none">
                    <td className="py-4 px-2 font-medium text-gray-700">{order.id}</td>
                    <td className="py-4 px-2 text-gray-600">{order.table}</td>
                    <td className="py-4 px-2 text-gray-600">{order.items}</td>
                    <td className="py-4 px-2 font-semibold text-gray-700">₺{order.total}</td>
                    <td className="py-4 px-2"><StatusPill status={order.status} /></td>
                    <td className="py-4 px-2 text-gray-500">{order.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Popüler Ürünler */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Popüler</h2>
          <div className="space-y-4">
            {popularItems.map((item) => (
              <div key={item.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold text-gray-700">{item.name}</span>
                  <span className="text-gray-500">{item.orders} sipariş</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full" 
                    style={{ width: `${(item.orders / popularItems[0].orders) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}