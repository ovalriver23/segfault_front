'use client';

import { useState, useEffect } from 'react';
import { Bell, Phone, ShoppingCart, DollarSign, Check, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

type RequestType = 'CALL_WAITER' | 'ORDER' | 'BILL_REQUEST';
type RequestStatus = 'PENDING' | 'COMPLETED';

interface ServiceRequest {
  id: number;
  tableName: string;
  type: RequestType;
  status: RequestStatus;
  createdAt: string;
}

export default function WaiterNotificationsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [filter, setFilter] = useState<'active' | 'done'>('active');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/waiter/requests/get', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      // Add this temporarily for debugging
      console.log('Fetching from:', '/api/waiter/requests/get');
      console.log('Response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        throw new Error('İstekler yüklenemedi');
      }

      const data = await response.json();
      setRequests(data);
      setError(null);
    } catch (err: any) {
      console.error('Fetch requests error:', err);
      setError(err.message || 'Bir hata oluştu');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchRequests();
  };

  const pendingRequests = requests.filter(r => r.status === 'PENDING');
  const completedRequests = requests.filter(r => r.status === 'COMPLETED');
  const tableNames = [...new Set(pendingRequests.map(r => r.tableName))];
  const filteredRequests = filter === 'active' ? pendingRequests : completedRequests;

  const getRequestIcon = (type: RequestType) => {
    switch (type) {
      case 'CALL_WAITER':
        return <Phone className="w-4 h-4 text-[#8B4513]" />;
      case 'ORDER':
        return <ShoppingCart className="w-4 h-4 text-[#8B4513]" />;
      case 'BILL_REQUEST':
        return <DollarSign className="w-4 h-4 text-[#8B4513]" />;
      default:
        return <Bell className="w-4 h-4 text-[#8B4513]" />;
    }
  };

  const getRequestMessage = (type: RequestType) => {
    switch (type) {
      case 'CALL_WAITER':
        return 'Garson Çağrısı';
      case 'ORDER':
        return 'Sipariş Verme';
      case 'BILL_REQUEST':
        return 'Hesap İstedi';
      default:
        return type;
    }
  };

  const handleMarkAsDone = async (requestId: number) => {
    try {
      const response = await fetch('/api/waiter/requests/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ requestId })
      });

      if (!response.ok) {
        throw new Error('İstek tamamlanamadı');
      }

      setRequests(prev =>
        prev.map(r => (r.id === requestId ? { ...r, status: 'COMPLETED' as RequestStatus } : r))
      );
    } catch (err: any) {
      console.error('Complete request error:', err);
      alert(err.message || 'İstek tamamlanırken hata oluştu');
    }
  };

  if (isLoading) {
    return (
      <div className="px-6 pt-12 pb-6">
        <div className="flex items-center justify-center py-12">
          <div className="loading loading-spinner loading-lg text-[#FF9F5A]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pt-12 pb-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-normal text-black" style={{ fontFamily: 'Pontano Sans, sans-serif' }}>
          Bildirimler
        </h1>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Yenile"
        >
          <RefreshCw className={`w-5 h-5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border-2 border-red-300 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3 mb-6 bg-gray-100 p-1.5 rounded-xl">
        <button
          onClick={() => setFilter('active')}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
            filter === 'active'
              ? 'bg-white text-[#FF9F5A] shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Active
          {pendingRequests.length > 0 && (
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
              filter === 'active' ? 'bg-[#FF9F5A] text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {pendingRequests.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setFilter('done')}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
            filter === 'done'
              ? 'bg-white text-[#FF9F5A] shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Done
          {completedRequests.length > 0 && (
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
              filter === 'done' ? 'bg-[#FF9F5A] text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {completedRequests.length}
            </span>
          )}
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        {filter === 'active' && pendingRequests.length > 0 && (
          <div className="bg-pink-100 border-2 border-pink-500 rounded-lg p-3 flex items-start gap-2.5">
            <Bell className="w-4 h-4 text-pink-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-pink-600 font-semibold text-sm">
                {tableNames.length} masa sizi bekliyor
              </p>
              <p className="text-gray-600 text-xs mt-0.5">
                {tableNames.join(', ')}
              </p>
            </div>
          </div>
        )}

        {filteredRequests.map((request) => (
          <div
            key={request.id}
            className={`w-full rounded-lg p-2.5 transition-all border-2 ${
              request.status === 'COMPLETED'
                ? 'bg-gray-50 border-gray-300'
                : 'bg-white border-[#683817] hover:shadow-md'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1">
                <div className="flex-shrink-0">
                  {getRequestIcon(request.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-black">
                    {request.tableName}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      request.status === 'COMPLETED' ? 'bg-gray-400' : 'bg-[#FF9F5A]'
                    }`} />
                    <p className="text-gray-500 text-xs truncate">
                      {getRequestMessage(request.type)}
                    </p>
                  </div>
                </div>
              </div>
              
              {request.status === 'PENDING' && (
                <button
                  onClick={() => handleMarkAsDone(request.id)}
                  className="flex-shrink-0 p-2 bg-[#FF9F5A] hover:bg-[#e88d48] text-white rounded-lg transition-colors"
                  title="Mark as Done"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}

        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {filter === 'active' ? 'Henüz bildirim yok' : 'Tamamlanmış bildirim yok'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}