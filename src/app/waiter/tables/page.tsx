'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Table {
  id: string;
  name: string;
  capacity: number;
  qrToken: string;
  status: string;
}

export default function WaiterTablesPage() {
  const router = useRouter();
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTables = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/waiter/tables/get', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        const errorMsg = errorData.error || errorData.message || '';

        if (response.status === 403 && (
            errorMsg.includes("şifrenizi değiştirmeniz") || 
            errorMsg.includes("password")
        )) {
            router.push('/waiter/change-password?reason=forced');
            return; 
        }

        throw new Error(errorMsg || 'Masalar yüklenemedi');
      }

      const data = await response.json();
      setTables(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Bağlantı hatası. Lütfen sayfayı yenileyin.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
    const interval = setInterval(fetchTables, 30000);
    return () => clearInterval(interval);
  }, []);

  // İstatistikleri hesapla
  const totalTables = tables.length;
  const occupiedTables = tables.filter(t => t.status !== 'EMPTY').length;
  const availableTables = totalTables - occupiedTables;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen pb-20">
        <span className="loading loading-spinner loading-lg text-[#E11383]"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen px-6 text-center pb-20">
        <p className="text-red-500 mb-4 font-medium">{error}</p>
        <button 
          onClick={fetchTables}
          className="btn bg-[#E11383] text-white hover:bg-[#c00f6f] border-none"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  return (
    <div className="px-6 pt-8 pb-24 font-sans">
      {/* Header ve Yenileme Butonu */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-normal text-black" style={{ fontFamily: 'Pontano Sans, sans-serif' }}>
          Masalar
        </h1>
        <button onClick={fetchTables} className="btn btn-sm btn-ghost btn-circle text-[#E11383] hover:bg-pink-50">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
        </button>
      </div>

      {/* Kompakt Özet Kartları - Resimdeki gibi Outline Tasarım */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {/* Toplam */}
        <div className="bg-white border border-gray-300 rounded-lg p-3 shadow-sm flex flex-col justify-between h-20">
          <div className="flex justify-between items-start">
            <span className="text-[11px] text-gray-500 font-medium">Toplam Masa</span>
            <div className="w-2 h-2 rounded-full bg-gray-500 shadow-sm"></div>
          </div>
          <span className="text-2xl font-normal text-black">{totalTables}</span>
        </div>

        {/* Müsait */}
        <div className="bg-white border border-[#34C759] rounded-lg p-3 shadow-sm flex flex-col justify-between h-20">
          <div className="flex justify-between items-start">
            <span className="text-[11px] text-gray-500 font-medium">Müsait</span>
            <div className="inline-grid *:[grid-area:1/1]">
              <div className="w-2 h-2 rounded-full bg-[#34C759] shadow-[0_0_4px_#34C759] animate-ping opacity-75"></div>
              <div className="w-2 h-2 rounded-full bg-[#34C759] shadow-[0_0_4px_#34C759]"></div>
            </div>
          </div>
          <span className="text-2xl font-normal text-[#34C759]">{availableTables}</span>
        </div>

        {/* Dolu */}
        <div className="bg-white border border-[#F73753] rounded-lg p-3 shadow-sm flex flex-col justify-between h-20">
          <div className="flex justify-between items-start">
            <span className="text-[11px] text-gray-500 font-medium">Dolu</span>
            <div className="inline-grid *:[grid-area:1/1]">
              <div className="w-2 h-2 rounded-full bg-[#F73753] shadow-[0_0_4px_#F73753] animate-ping opacity-75"></div>
              <div className="w-2 h-2 rounded-full bg-[#F73753] shadow-[0_0_4px_#F73753]"></div>
            </div>
          </div>
          <span className="text-2xl font-normal text-[#F73753]">{occupiedTables}</span>
        </div>
      </div>

      {/* Masa Listesi */}
      {tables.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-10 text-gray-400">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
           </svg>
           <p>Henüz masa bulunmuyor.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {tables.map((table) => {
            const isOccupied = table.status !== 'EMPTY';
            // Görseldeki renk kodları
            const borderColor = isOccupied ? 'border-[#F73753]' : 'border-[#34C759]';
            const dotColor = isOccupied ? 'bg-[#F73753] shadow-[0_0_4px_#F73753]' : 'bg-[#34C759] shadow-[0_0_4px_#34C759]';
            
            return (
              <div
                key={table.id}
                className={`
                  relative p-5 rounded-3xl h-32 flex flex-col justify-center transition-all bg-white border ${borderColor}
                `}
              >
                {/* Sağ Üstteki Nokta */}
                <div className="absolute top-4 right-4">
                    <div className="inline-grid *:[grid-area:1/1]">
                        <div className={`w-2.5 h-2.5 rounded-full ${dotColor} animate-ping opacity-75`}></div>
                        <div className={`w-2.5 h-2.5 rounded-full ${dotColor}`}></div>
                    </div>
                </div>

                {/* Masa Adı */}
                <div className="mb-1">
                  <span className="text-xl text-black font-normal truncate block w-full pr-4">
                    {table.name}
                  </span>
                </div>

                {/* Kapasite */}
                <div>
                  <span className="text-sm text-gray-500 font-light">
                    {table.capacity} kişilik
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}