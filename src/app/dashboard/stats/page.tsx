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

// --- Prop Tipleri (Önerilen Yöntem) ---
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

// --- Placeholder Veriler ---
const salesData = [
  { name: "1 Kas", value: 3200 },
  { name: "2 Kas", value: 2800 },
  { name: "3 Kas", value: 3500 },
  { name: "4 Kas", value: 4800 },
  { name: "5 Kas", value: 4600 },
  { name: "6 Kas", value: 5200 },
  { name: "7 Kas", value: 5500 },
  { name: "8 Kas", value: 6000 },
  { name: "9 Kas", value: 5800 },
  { name: "10 Kas", value: 6200 },
  { name: "11 Kas", value: 6500 },
  { name: "12 Kas", value: 6100 },
  { name: "13 Kas", value: 5900 },
  { name: "14 Kas", value: 6800 },
];

const busiestHoursData = [
  { hour: "09:00", value: 15 },
  { hour: "10:00", value: 25 },
  { hour: "11:00", value: 20 },
  { hour: "12:00", value: 45 },
  { hour: "13:00", value: 55 },
  { hour: "14:00", value: 35 },
  { hour: "15:00", value: 28 },
  { hour: "16:00", value: 18 },
  { hour: "17:00", value: 30 },
  { hour: "18:00", value: 50 },
  { hour: "19:00", value: 70 },
  { hour: "20:00", value: 60 },
  { hour: "21:00", value: 40 },
  { hour: "22:00", value: 25 },
];

const topFoods = [
  { name: "Lahmacun", orders: 145, revenue: 4350, change: 12 },
  { name: "İskender Kebap", orders: 58, revenue: 14700, change: 8 },
  { name: "Karışık Pide", orders: 80, revenue: 8170, change: 15 },
  { name: "Adana Kebap", orders: 72, revenue: 10800, change: 5 },
  { name: "Mercimek Çorbası", orders: 65, revenue: 1300, change: -3 },
];

const topTables = [
  { name: "Masa 12", customers: 48, revenue: 6720 },
  { name: "Masa 5", customers: 42, revenue: 5880 },
  { name: "Masa 8", customers: 38, revenue: 5320 },
  { name: "Masa 3", customers: 35, revenue: 4900 },
  { name: "Masa 15", customers: 32, revenue: 4480 },
  { name: "Masa 7", customers: 28, revenue: 3920 },
];

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

export default function StatsPage() {
  const [activeTab, setActiveTab] = useState("1 Hafta");

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Restoran İstatistikleri</h1>
        <div className="flex items-center space-x-1 bg-gray-200 p-1 rounded-lg">
          {["Bugün", "1 Hafta", "1 Ay", "Özel Tarih"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                activeTab === tab
                  ? "bg-white shadow text-gray-900 font-semibold"
                  : "text-gray-600 hover:bg-gray-300/50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Ana Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Satış Trendi (Geniş Alan) */}
        <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-sm">
          {/* Renk koyulaştırıldı */}
          <h2 className="font-bold text-lg mb-4 text-gray-800">Satış Trendi</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
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
        </div>

        {/* Özet Kartları */}
        <StatCard
          title="Toplam Gelir"
          value="45,231"
          change={12.5}
          currency={true}
        />
        <StatCard title="Toplam Sipariş" value="352" change={8.2} />
        <StatCard title="Müşteri Sayısı" value="1,234" change={15.3} />

        {/* En Çok Satanlar & En Yoğun Saatler */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
            {/* Renk koyulaştırıldı */}
            <h2 className="font-bold text-lg mb-4 text-gray-800">En Çok Satan Yemekler</h2>
            <ul className="space-y-4">
                {/* Örnek Veri (Dinamik veri ile dolacak) */}
                {topFoods.map((food, index) => (
                    <li key={food.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                            <span className="bg-orange-100 text-orange-600 rounded-full w-6 h-6 flex items-center justify-center mr-3 font-bold">
                                {index + 1}
                            </span>
                            <div>
                                <p className="font-semibold text-gray-800">{food.name}</p>
                                {/* Renk koyulaştırıldı */}
                                <p className="text-gray-600">{food.orders} sipariş</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-gray-800">
                                ₺{food.revenue.toLocaleString()}
                            </p>
                            <ChangePill value={food.change} />
                        </div>
                    </li>
                ))}
            </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
            {/* Renk koyulaştırıldı */}
            <h2 className="font-bold text-lg mb-4 text-gray-800">En Yoğun Saatler</h2>
            <ResponsiveContainer width="100%" height={200}>
                <BarChart data={busiestHoursData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
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
                      cursor={{fill: 'rgba(255, 159, 90, 0.1)'}}
                      contentStyle={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "0.5rem" }}
                      labelStyle={{ color: "#1f2937", fontWeight: "bold" }}
                      itemStyle={{ color: "#374151" }}
                    />
                    <Bar dataKey="value" fill="#FF9F5A" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>

        {/* En Çok Oturulan Masalar & Müşteri Yorumları */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
            {/* Renk koyulaştırıldı */}
            <h2 className="font-bold text-lg mb-4 text-gray-800">En Çok Oturulan Masalar</h2>
            <div className="space-y-2">
                {topTables.map((table) => (
                    <div key={table.name}>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="font-semibold text-gray-700">{table.name}</span>
                            <span className="text-gray-500">{table.customers} kişi</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-orange-400 h-2 rounded-full"
                                style={{
                                    width: `${(table.customers / 50) * 100}%`,
                                }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
            {/* Renk koyulaştırıldı */}
            <h2 className="font-bold text-lg mb-4 text-gray-800">Müşteri Yorumları</h2>
            <p className="text-sm text-gray-600">
                Yorum bileşeni yakında eklenecek.
            </p>
        </div>
      </div>

      {/* Bu kısmı dinamik veri geldiğinde güncelleyeceğiz */}
      <div className="text-center py-10">
        <h2 className="text-lg font-semibold">Dinamik Veri Bekleniyor</h2>
        <p className="text-gray-500">Lütfen endpoint'leri sağlayın.</p>
      </div>
    </div>
  );
}