'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Phone, ShoppingCart, DollarSign, Check, RefreshCw, Trash2, Undo2, BellRing, BellOff, ChefHat, Package, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePushNotification } from '@/lib/hooks/usePushNotification';

type RequestType = 'CALL_WAITER' | 'ORDER' | 'BILL_REQUEST';
type RequestStatus = 'PENDING' | 'COMPLETED';
type OrderStatus = 'RECEIVED' | 'PREPARING' | 'READY' | 'SERVED' | 'COMPLETED';
type TabType = 'requests' | 'orders' | 'done';

interface ServiceRequest {
  id: number;
  tableName: string;
  type: RequestType;
  status: RequestStatus;
  createdAt: string;
  completedAt?: string;
}

interface OrderItem {
  id: number;
  itemName: string;
  quantity: number;
  unitPrice: number;
  note?: string;
}

interface Order {
  id: number;
  tableName: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
}

const COMPLETED_REQUESTS_KEY = 'waiter_completed_requests';
const RESTORED_REQUESTS_KEY = 'waiter_restored_requests';
const COMPLETED_ORDERS_KEY = 'waiter_completed_orders';

export default function WaiterNotificationsPage() {
  const router = useRouter();
  const [pendingRequests, setPendingRequests] = useState<ServiceRequest[]>([]);
  const [completedRequests, setCompletedRequests] = useState<ServiceRequest[]>([]);
  const [restoredRequests, setRestoredRequests] = useState<ServiceRequest[]>([]);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('requests');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Push Notification Hook
  const {
    isSupported: pushSupported,
    isSubscribed: pushSubscribed,
    isLoading: pushLoading,
    error: pushError,
    subscribe: pushSubscribe,
    unsubscribe: pushUnsubscribe
  } = usePushNotification();

  // Ref ile güncel değerlere erişim
  const restoredRequestsRef = useRef<ServiceRequest[]>([]);
  const completedOrdersRef = useRef<Order[]>([]);
  const previousOrderCountRef = useRef<number | null>(null);

  // restoredRequests değiştiğinde ref'i güncelle
  useEffect(() => {
    restoredRequestsRef.current = restoredRequests;
  }, [restoredRequests]);

  // completedOrders değiştiğinde ref'i güncelle
  useEffect(() => {
    completedOrdersRef.current = completedOrders;
  }, [completedOrders]);

  // localStorage'dan tamamlanan ve geri alınan istekleri yükle
  useEffect(() => {
    // Tamamlananları yükle
    const savedCompleted = localStorage.getItem(COMPLETED_REQUESTS_KEY);
    if (savedCompleted) {
      try {
        const parsed = JSON.parse(savedCompleted);
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        const filtered = parsed.filter((r: ServiceRequest) =>
          r.completedAt && new Date(r.completedAt).getTime() > oneDayAgo
        );
        setCompletedRequests(filtered);
      } catch (e) {
        console.error('Error loading completed requests:', e);
      }
    }

    // Tamamlanan siparişleri yükle
    const savedCompletedOrders = localStorage.getItem(COMPLETED_ORDERS_KEY);
    if (savedCompletedOrders) {
      try {
        const parsed = JSON.parse(savedCompletedOrders);
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        const filtered = parsed.filter((o: Order) =>
          o.createdAt && new Date(o.createdAt).getTime() > oneDayAgo
        );
        setCompletedOrders(filtered);
      } catch (e) {
        console.error('Error loading completed orders:', e);
      }
    }

    // Geri alınanları yükle
    const savedRestored = localStorage.getItem(RESTORED_REQUESTS_KEY);
    if (savedRestored) {
      try {
        const parsed = JSON.parse(savedRestored);
        setRestoredRequests(parsed);
        restoredRequestsRef.current = parsed;
      } catch (e) {
        console.error('Error loading restored requests:', e);
      }
    }
  }, []);

  // Tamamlanan istekleri localStorage'a kaydet
  useEffect(() => {
    if (completedRequests.length > 0) {
      localStorage.setItem(COMPLETED_REQUESTS_KEY, JSON.stringify(completedRequests));
    } else {
      localStorage.removeItem(COMPLETED_REQUESTS_KEY);
    }
  }, [completedRequests]);

  // Tamamlanan siparişleri localStorage'a kaydet
  useEffect(() => {
    if (completedOrders.length > 0) {
      localStorage.setItem(COMPLETED_ORDERS_KEY, JSON.stringify(completedOrders));
    } else {
      localStorage.removeItem(COMPLETED_ORDERS_KEY);
    }
  }, [completedOrders]);

  // Geri alınan istekleri localStorage'a kaydet
  useEffect(() => {
    if (restoredRequests.length > 0) {
      localStorage.setItem(RESTORED_REQUESTS_KEY, JSON.stringify(restoredRequests));
    } else {
      localStorage.removeItem(RESTORED_REQUESTS_KEY);
    }
  }, [restoredRequests]);

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/waiter/requests/get', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        throw new Error('İstekler yüklenemedi');
      }

      const data = await response.json();
      const backendRequests: ServiceRequest[] = data.map((r: any) => ({ ...r, status: 'PENDING' as RequestStatus }));

      // Ref'ten güncel restored requests'i al
      const currentRestored = restoredRequestsRef.current;
      const restoredIds = currentRestored.map(r => r.id);

      // Backend'den gelenlerden restored olanları çıkar
      const backendOnly = backendRequests.filter(r => !restoredIds.includes(r.id));

      // Birleştir: önce restored, sonra backend'den gelenler
      const merged = [...currentRestored, ...backendOnly];

      setPendingRequests(merged);
      setError(null);
    } catch (err: any) {
      console.error('Fetch requests error:', err);
      setError(err.message || 'Bir hata oluştu');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/waiter/orders/active', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        throw new Error('Siparişler yüklenemedi');
      }

      const data = await response.json();

      // Ref'ten güncel completed orders'ı al
      const currentCompleted = completedOrdersRef.current;
      const completedIds = currentCompleted.map(o => o.id);

      // SERVED ve COMPLETED siparişleri filtreleyerek sadece aktif olanları al
      // Ayrıca completedOrders içinde olanları da çıkar
      const activeOnly = data.filter((order: Order) =>
        order.status !== 'SERVED' &&
        order.status !== 'COMPLETED' &&
        !completedIds.includes(order.id)
      );
      setActiveOrders(activeOnly);
    } catch (err: any) {
      console.error('Fetch orders error:', err);
      // Siparişlerdeki hata request hatası olarak gösterilmesin
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchOrders();
    const interval = setInterval(() => {
      fetchRequests();
      fetchOrders();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Yeni sipariş geldiğinde notification göster
  useEffect(() => {
    // İlk yükleme tamamlandıysa
    if (!isLoading) {
      // Sipariş sayısı arttıysa ve daha önce set edildiyse
      if (previousOrderCountRef.current !== null && activeOrders.length > previousOrderCountRef.current) {
        // Browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          const newOrdersCount = activeOrders.length - previousOrderCountRef.current;
          new Notification('Yeni Sipariş!', {
            body: `${newOrdersCount} yeni sipariş geldi`,
            icon: '/images/landing/logo.png',
            tag: 'new-order',
            requireInteraction: true
          });
        }
      }
      // Ref'i güncelle
      previousOrderCountRef.current = activeOrders.length;
    }
  }, [activeOrders, isLoading]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchRequests();
    fetchOrders();
  };

  const tableNames = [...new Set(pendingRequests.map(r => r.tableName))];

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
      // Önce geri alınanlardan mı kontrol et
      const isRestored = restoredRequestsRef.current.some(r => r.id === requestId);

      if (!isRestored) {
        // Sadece backend'den gelenler için API çağrısı yap
        const response = await fetch('/api/waiter/requests/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ requestId })
        });

        if (!response.ok) {
          throw new Error('İstek tamamlanamadı');
        }
      }

      // Pending'den bul ve completed'a taşı
      const completedRequest = pendingRequests.find(r => r.id === requestId);
      if (completedRequest) {
        const updatedRequest: ServiceRequest = {
          ...completedRequest,
          status: 'COMPLETED',
          completedAt: new Date().toISOString()
        };

        // Pending'den kaldır
        setPendingRequests(prev => prev.filter(r => r.id !== requestId));

        // Geri alınanlardan da kaldır
        const newRestored = restoredRequestsRef.current.filter(r => r.id !== requestId);
        setRestoredRequests(newRestored);
        restoredRequestsRef.current = newRestored;

        // Completed'a ekle (en başa)
        setCompletedRequests(prev => [updatedRequest, ...prev]);
      }
    } catch (err: any) {
      console.error('Complete request error:', err);
      alert(err.message || 'İstek tamamlanırken hata oluştu');
    }
  };

  const handleUndoComplete = (requestId: number) => {
    // Completed'dan bul ve pending'e taşı
    const request = completedRequests.find(r => r.id === requestId);
    if (request) {
      const restoredRequest: ServiceRequest = {
        ...request,
        status: 'PENDING',
        completedAt: undefined
      };

      // Completed'dan kaldır
      setCompletedRequests(prev => prev.filter(r => r.id !== requestId));

      // Geri alınanlara ekle (ref'i de güncelle)
      const newRestored = [restoredRequest, ...restoredRequestsRef.current];
      setRestoredRequests(newRestored);
      restoredRequestsRef.current = newRestored;

      // Pending'e ekle (en başa)
      setPendingRequests(prev => [restoredRequest, ...prev.filter(r => r.id !== requestId)]);
    }
  };

  const handleClearCompleted = () => {
    setCompletedRequests([]);
    setCompletedOrders([]);
    localStorage.removeItem(COMPLETED_REQUESTS_KEY);
    localStorage.removeItem(COMPLETED_ORDERS_KEY);
  };

  const handleServeOrder = async (orderId: number) => {
    try {
      const response = await fetch('/api/waiter/orders/update-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ orderId, status: 'SERVED' })
      });

      if (!response.ok) {
        throw new Error('Sipariş durumu güncellenemedi');
      }

      // Siparişi bulup completed'a taşı
      const servedOrder = activeOrders.find(o => o.id === orderId);
      if (servedOrder) {
        const completedOrder: Order = {
          ...servedOrder,
          status: 'SERVED'
        };

        // Active'den kaldır
        setActiveOrders(prev => prev.filter(o => o.id !== orderId));

        // Completed'a ekle (en başa) - duplicate kontrolü ile
        setCompletedOrders(prev => {
          // Zaten varsa ekleme
          if (prev.some(o => o.id === orderId)) {
            return prev;
          }
          return [completedOrder, ...prev];
        });
      }
    } catch (err: any) {
      console.error('Update order status error:', err);
      alert(err.message || 'Sipariş durumu güncellenirken hata oluştu');
    }
  };



  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
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
          Görev Paneli
        </h1>
        <div className="flex items-center gap-2">
          {/* Push Notification Toggle */}
          {pushSupported && (
            <button
              onClick={pushSubscribed ? pushUnsubscribe : pushSubscribe}
              disabled={pushLoading}
              className={`p-2 rounded-lg transition-colors ${pushSubscribed
                  ? 'bg-green-100 text-green-600 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              title={pushSubscribed ? 'Bildirimleri Kapat' : 'Bildirimleri Aç'}
            >
              {pushLoading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : pushSubscribed ? (
                <BellRing className="w-5 h-5" />
              ) : (
                <BellOff className="w-5 h-5" />
              )}
            </button>
          )}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Yenile"
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Push Notification Error */}
      {pushError && (
        <div className="mb-4 p-3 bg-yellow-50 border-2 border-yellow-300 rounded-lg text-yellow-700 text-sm">
          {pushError}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border-2 border-red-300 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('requests')}
          className={`flex-1 py-2 px-1 rounded-lg font-medium text-xs transition-all ${activeTab === 'requests'
              ? 'bg-white text-[#FF9F5A] shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          İstekler
          {pendingRequests.length > 0 && (
            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'requests' ? 'bg-[#FF9F5A] text-white' : 'bg-gray-200 text-gray-600'
              }`}>
              {pendingRequests.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex-1 py-2 px-1 rounded-lg font-medium text-xs transition-all ${activeTab === 'orders'
              ? 'bg-white text-[#FF9F5A] shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          Sipariş
          {activeOrders.length > 0 && (
            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'orders' ? 'bg-[#FF9F5A] text-white' : 'bg-gray-200 text-gray-600'
              }`}>
              {activeOrders.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('done')}
          className={`flex-1 py-2 px-1 rounded-lg font-medium text-xs transition-all ${activeTab === 'done'
              ? 'bg-white text-[#FF9F5A] shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          Tamamlandı
          {(completedRequests.length + completedOrders.length) > 0 && (
            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'done' ? 'bg-[#FF9F5A] text-white' : 'bg-gray-200 text-gray-600'
              }`}>
              {completedRequests.length + completedOrders.length}
            </span>
          )}
        </button>
      </div>

      {/* Tamamlananları temizle butonu */}
      {activeTab === 'done' && (completedRequests.length > 0 || completedOrders.length > 0) && (
        <button
          onClick={handleClearCompleted}
          className="mb-4 flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Tamamlananları temizle
        </button>
      )}

      <div className="flex flex-col gap-2.5">
        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <>
            {pendingRequests.length > 0 && (
              <div className="bg-pink-100 border-2 border-pink-500 rounded-lg p-3 flex items-start gap-2.5">
                <Bell className="w-4 h-4 text-pink-500 mt-0.5 shrink-0" />
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

            {pendingRequests.map((request) => (
              <div
                key={request.id}
                className="w-full rounded-lg p-2.5 transition-all border-2 bg-white border-text-500 hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="shrink-0">
                      {getRequestIcon(request.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-black">
                        {request.tableName}
                      </h3>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-[#FF9F5A]" />
                        <p className="text-gray-500 text-xs truncate">
                          {getRequestMessage(request.type)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleMarkAsDone(request.id)}
                    className="shrink-0 p-2 bg-[#FF9F5A] hover:bg-[#e88d48] text-white rounded-lg transition-colors"
                    title="Tamamlandı"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {pendingRequests.length === 0 && (
              <div className="text-center py-12">
                <Phone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Bekleyen istek yok</p>
              </div>
            )}
          </>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <>
            {activeOrders.length > 0 && (
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-3 flex items-center gap-2.5">
                <ChefHat className="w-5 h-5 text-blue-500 shrink-0" />
                <p className="text-blue-600 font-semibold text-sm">
                  {activeOrders.length} aktif sipariş
                </p>
              </div>
            )}

            {activeOrders.map((order) => (
              <div
                key={order.id}
                className="w-full rounded-lg p-3 transition-all border-2 bg-white border-text-500 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Package className="w-4 h-4 text-[#8B4513] shrink-0" />
                    <h3 className="text-sm font-semibold text-black truncate">
                      {order.tableName}
                    </h3>
                  </div>
                  <span className="text-sm font-semibold text-[#FF9F5A] shrink-0">
                    ₺{order.totalAmount.toFixed(2)}
                  </span>
                </div>

                {/* Order Items */}
                <div className="bg-gray-50 rounded-lg p-2 mb-2">
                  {order.items.map((item, idx) => (
                    <div key={`${order.id}-${item.id}-${idx}`} className={`flex justify-between text-xs ${idx > 0 ? 'mt-1 pt-1 border-t border-gray-200' : ''}`}>
                      <span className="text-gray-700">
                        {item.quantity}x {item.itemName}
                        {item.note && <span className="text-gray-400 ml-1">({item.note})</span>}
                      </span>
                      <span className="text-gray-500">₺{(item.unitPrice * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Servis Et Button */}
                <button
                  onClick={() => handleServeOrder(order.id)}
                  className="w-full py-2 bg-[#FF9F5A] hover:bg-[#e88d48] text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Servis Et
                </button>
              </div>
            ))}

            {activeOrders.length === 0 && (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Aktif sipariş yok</p>
              </div>
            )}
          </>
        )}

        {/* Completed Tab */}
        {activeTab === 'done' && (
          <>
            {/* Completed Requests */}
            {completedRequests.map((request) => (
              <div
                key={`request-${request.id}`}
                className="w-full rounded-lg p-2.5 transition-all border-2 bg-gray-50 border-gray-300"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="shrink-0">
                      {getRequestIcon(request.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-black truncate">
                        {request.tableName}
                      </h3>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-green-500" />
                        <p className="text-gray-500 text-xs truncate">
                          {getRequestMessage(request.type)}
                        </p>
                        {request.completedAt && (
                          <span className="text-gray-400 text-xs">
                            • {formatTime(request.completedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUndoComplete(request.id)}
                      className="shrink-0 p-2 bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-lg transition-colors"
                      title="Geri Al"
                    >
                      <Undo2 className="w-4 h-4" />
                    </button>
                    <div className="shrink-0 p-2 bg-green-100 text-green-600 rounded-lg">
                      <Check className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Completed Orders */}
            {completedOrders.map((order) => (
              <div
                key={`order-${order.id}`}
                className="w-full rounded-lg p-3 transition-all border-2 bg-gray-50 border-gray-300"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Package className="w-4 h-4 text-green-600 shrink-0" />
                    <h3 className="text-sm font-semibold text-black truncate">
                      {order.tableName}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-300 whitespace-nowrap shrink-0">
                      Servis Edildi
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-600 shrink-0">
                    ₺{order.totalAmount.toFixed(2)}
                  </span>
                </div>

                {/* Order Items */}
                <div className="bg-white rounded-lg p-2">
                  {order.items.map((item, idx) => (
                    <div key={`${order.id}-${item.id}-${idx}`} className={`flex justify-between text-xs ${idx > 0 ? 'mt-1 pt-1 border-t border-gray-200' : ''}`}>
                      <span className="text-gray-700">
                        {item.quantity}x {item.itemName}
                        {item.note && <span className="text-gray-400 ml-1">({item.note})</span>}
                      </span>
                      <span className="text-gray-500">₺{(item.unitPrice * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {completedRequests.length === 0 && completedOrders.length === 0 && (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Tamamlanmış bildirim yok</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}