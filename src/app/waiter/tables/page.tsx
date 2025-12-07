'use client';

import React from 'react';

// Görseldeki veriyi simüle eden yapı
const tables = [
  { id: 1, name: 'Masa 1', status: 'Dolu', waiter: 'Ceren', hasAlert: true },
  { id: 2, name: 'Masa 2', status: 'Boş', waiter: '-', hasAlert: false },
  { id: 3, name: 'Masa 3', status: 'Boş', waiter: '-', hasAlert: false },
  { id: 4, name: 'Masa 4', status: 'Boş', waiter: '-', hasAlert: false },
  { id: 5, name: 'Masa 5', status: 'Boş', waiter: '-', hasAlert: false },
  { id: 6, name: 'Masa 6', status: 'Boş', waiter: '-', hasAlert: false },
  { id: 7, name: 'Masa 7', status: 'Boş', waiter: '-', hasAlert: false },
  { id: 8, name: 'Masa 8', status: 'Boş', waiter: '-', hasAlert: false },
];

export default function WaiterTablesPage() {
  return (
    <div className="px-6 pt-12 pb-6">
      <h1 className="text-3xl font-normal text-black mb-8" style={{ fontFamily: 'Pontano Sans, sans-serif' }}>
        Masalar
      </h1>

      <div className="grid grid-cols-2 gap-4">
        {tables.map((table) => {
          // Dolu masa stili
          const isOccupied = table.status === 'Dolu';
          
          return (
            <div
              key={table.id}
              className={`
                relative p-5 rounded-[2rem] h-32 flex flex-col justify-between transition-all
                ${isOccupied 
                  ? 'bg-white border-2 border-[#ff9ec6] shadow-sm' // Pembe kenarlık (Görseldeki gibi)
                  : 'bg-[#f0f0f0] border border-transparent'      // Gri arka plan
                }
              `}
            >
              <div className="flex justify-between items-start">
                <span className={`text-base font-medium ${isOccupied ? 'text-black' : 'text-gray-700'}`}>
                  {table.name}
                </span>
                <span className={`text-xs ${isOccupied ? 'text-gray-400' : 'text-gray-400'}`}>
                  {table.status}
                </span>
              </div>

              <div className="flex justify-between items-end mt-2">
                <div className="flex flex-col">
                  <span className="text-xs text-black font-medium">
                    Garson: {table.waiter}
                  </span>
                </div>

                {/* Eğer masada uyarı varsa zil ikonu göster */}
                {table.hasAlert && (
                  <div className="text-[#e11383]">
                    <svg 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}