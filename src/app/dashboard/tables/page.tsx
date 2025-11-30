

'use client';

import { UUID } from 'crypto';
import { useState, useEffect } from 'react';

interface Table {
    id: UUID;
    name: string;
    qrToken: UUID;
    capacity: number;
    status: string;
    restaurantId: UUID;
}

export default function Tables() {
    // State management
    const [tableList, setTableList] = useState<Table[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [tableName, setTableName] = useState('');
    const [tableCapacity, setTableCapacity] = useState<string>('4');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [fetchError, setFetchError] = useState('');
    
    // Edit modal state
    const [editingTable, setEditingTable] = useState<Table | null>(null);
    const [editTableName, setEditTableName] = useState('');
    const [editTableCapacity, setEditTableCapacity] = useState<string>('4');
    const [editTableStatus, setEditTableStatus] = useState<string>('EMPTY');
    const [editFormError, setEditFormError] = useState('');

    // Fetch tables on component mount
    useEffect(() => {
            fetchTables();
    }, []);

    const fetchTables = async () => {
        try {
            setIsLoading(true);
            setFetchError('');
            const response = await fetch('/api/dashboard/tables/get', {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.message || 'Masalar yüklenirken bir hata oluştu';
                setFetchError(errorMessage);
                return;
            }

            const tables: Table[] = await response.json();
            console.log(tables);
            setTableList(tables);
        } catch (error) {
            console.error('Error fetching tables:', error);
            setFetchError('Bağlantı hatası. Lütfen sayfayı yenileyin.');
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate summary stats from tableList
    const totalTables = tableList.length;
    const availableTables = tableList.filter(t => t.status === 'EMPTY').length;
    const occupiedTables = tableList.filter(t => t.status === 'OCCUPIED').length;
    const reservedTables = 0;

    // Modal handlers
    const openModal = () => {
        setTableName('');
        setTableCapacity('4');
        setFormError('');
        (document.getElementById('Add_Table') as HTMLDialogElement)?.showModal();
    };

    const closeModal = () => {
        (document.getElementById('Add_Table') as HTMLDialogElement)?.close();
        setTableName('');
        setTableCapacity('4');
        setFormError('');
    };

    // Edit modal handlers
    const openEditModal = (table: Table) => {
        setEditingTable(table);
        setEditTableName(table.name);
        setEditTableCapacity(table.capacity.toString());
        setEditTableStatus(table.status);
        setEditFormError('');
        (document.getElementById('Edit_Table') as HTMLDialogElement)?.showModal();
    };

    const closeEditModal = () => {
        (document.getElementById('Edit_Table') as HTMLDialogElement)?.close();
        setEditingTable(null);
        setEditTableName('');
        setEditTableCapacity('4');
        setEditTableStatus('EMPTY');
        setEditFormError('');
    };

    // Add table handler
    const handleAddTable = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const trimmedName = tableName.trim();
        if (!trimmedName) {
            setFormError('Masa adı gereklidir');
            return;
        }

        const capacity = parseInt(tableCapacity);
        if (!tableCapacity || isNaN(capacity) || capacity < 1) {
            setFormError('Kapasite en az 1 olmalıdır');
            return;
        }

        setIsSubmitting(true);
        setFormError('');

        try {
            const response = await fetch('/api/dashboard/tables/add', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    name: trimmedName,
                    capacity: capacity 
                })
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle error responses
                const errorMessage = data.message || 'Masa eklenirken bir hata oluştu';
                setFormError(errorMessage);
                return;
            }

            // Success - append new table to the list
            setTableList(prev => [...prev, {
                id: data.id,
                name: data.name,
                qrToken: data.qrToken,
                capacity: data.capacity,
                status: data.status,
                restaurantId: data.restaurantId
            }]);

            closeModal();
        } catch (error) {
            console.error('Error adding table:', error);
            setFormError('Bağlantı hatası. Lütfen tekrar deneyin.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Edit table handler
    const handleEditTable = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!editingTable) return;

        const trimmedName = editTableName.trim();
        if (!trimmedName) {
            setEditFormError('Masa adı gereklidir');
            return;
        }

        const capacity = parseInt(editTableCapacity);
        if (!editTableCapacity || isNaN(capacity) || capacity < 1) {
            setEditFormError('Kapasite en az 1 olmalıdır');
            return;
        }

        setIsSubmitting(true);
        setEditFormError('');

        try {
            const response = await fetch('/api/dashboard/tables/edit', {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    id: editingTable.id,
                    name: trimmedName,
                    capacity: capacity,
                    status: editTableStatus
                })
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMessage = data.message || 'Masa güncellenirken bir hata oluştu';
                setEditFormError(errorMessage);
                return;
            }

            // Success - update table in the list
            setTableList(prev => prev.map(table => 
                table.id === editingTable.id ? {
                    id: data.id,
                    name: data.name,
                    qrToken: data.qrToken,
                    capacity: data.capacity,
                    status: data.status,
                    restaurantId: data.restaurantId
                } : table
            ));

            closeEditModal();
        } catch (error) {
            console.error('Error editing table:', error);
            setEditFormError('Bağlantı hatası. Lütfen tekrar deneyin.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Header */}

            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-semibold text-neutral-900">Masalar</h1>

                {/* Add Dropdown */}
                <div className="dropdown dropdown-end">
                    <button tabIndex={0} role="button" className="btn shadow-2xs h-10 min-h-10 w-[130px] bg-[#e63997] hover:bg-[#d12e86] border-[#d1d5dc] text-black font-bold text-[18.549px] rounded-md gap-2">
                        <svg
                            width="19"
                            height="19"
                            viewBox="0 0 13 13"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-[18.547px] h-[18.547px]"
                        >
                            <path
                                d="M7.214 5.786V1.143H5.786V5.786H1.143V7.214H5.786V11.857H7.214V7.214H11.857V5.786H7.214Z"
                                fill="currentColor"
                            />
                        </svg>
                        Ekle
                    </button>
                    <ul tabIndex={0} className="dropdown-content menu bg-white border border-gray-300 rounded-xl mt-1 z-1 w-64 p-3 shadow-lg">
                        <li><button className="text-neutral-900 hover:bg-gray-100 rounded-lg text-base py" onClick={openModal}>Masa Ekle</button></li>
                        {/*Need API support for this 
                       <li><a className="text-neutral-900 hover:bg-gray-100 rounded-lg text-base py-3">Toplu Masa Ekle</a></li>
    */}
                    </ul>
                </div>

            </div>


            {/* Adding Table Modal */}
            <dialog id="Add_Table" className="modal">
                <div className="modal-box bg-white rounded-xl shadow-xl p-6">
                    <form onSubmit={handleAddTable}>
                        {/* Modal Header */}
                        <h3 className="font-bold text-2xl text-neutral-900 mb-6">Masa Ekle</h3>
                        
                        {/* Table Name Input Field */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Masa Adı
                            </label>
                            <input
                                type="text"
                                placeholder="Masa adını giriniz"
                                value={tableName}
                                onChange={(e) => setTableName(e.target.value)}
                                className="input input-bordered text-text-500 w-full bg-white border-gray-300 focus:border-[#e63997] focus:outline-none focus:ring-2 focus:ring-[#e63997] focus:ring-opacity-20"
                            />
                        </div>

                        {/* Capacity Input Field */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Kapasite
                            </label>
                            <input
                                type="number"
                                placeholder="Kişi sayısı"
                                min="1"
                                value={tableCapacity}
                                onChange={(e) => setTableCapacity(e.target.value)}
                                className="input input-bordered text-text-500 w-full bg-white border-gray-300 focus:border-[#e63997] focus:outline-none focus:ring-2 focus:ring-[#e63997] focus:ring-opacity-20"
                            />
                            {formError && (
                                <p className="text-sm text-red-600 mt-2">{formError}</p>
                            )}
                        </div>
                        
                        {/* Modal Action Buttons */}
                        <div className="modal-action mt-8">
                            <div className="flex gap-3 w-full">
                                {/* Cancel Button */}
                                <button 
                                    type="button"
                                    onClick={closeModal}
                                    disabled={isSubmitting}
                                    className="btn flex-1 bg-white shadow-2xs border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg"
                                >
                                    İptal
                                </button>
                                {/* Add Button */}
                                <button 
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="btn shadow-sm flex-1 bg-[#e63997] hover:bg-[#d12e86] border-none text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Ekleniyor...' : 'Ekle'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button onClick={closeModal}>close</button>
                </form>
            </dialog>


            {/* Edit Table Modal */}
            <dialog id="Edit_Table" className="modal">
                <div className="modal-box bg-white rounded-xl shadow-xl p-6">
                    <form onSubmit={handleEditTable}>
                        {/* Modal Header */}
                        <h3 className="font-bold text-2xl text-neutral-900 mb-6">Masa Düzenle</h3>
                        
                        {/* Table Name Input Field */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Masa Adı
                            </label>
                            <input
                                type="text"
                                placeholder="Masa adını giriniz"
                                value={editTableName}
                                onChange={(e) => setEditTableName(e.target.value)}
                                className="input input-bordered text-text-500 w-full bg-white border-gray-300 focus:border-[#e63997] focus:outline-none focus:ring-2 focus:ring-[#e63997] focus:ring-opacity-20"
                            />
                        </div>

                        {/* Capacity Input Field */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Kapasite
                            </label>
                            <input
                                type="number"
                                placeholder="Kişi sayısı"
                                min="1"
                                value={editTableCapacity}
                                onChange={(e) => setEditTableCapacity(e.target.value)}
                                className="input input-bordered text-text-500 w-full bg-white border-gray-300 focus:border-[#e63997] focus:outline-none focus:ring-2 focus:ring-[#e63997] focus:ring-opacity-20"
                            />
                        </div>

                        {/* Status Select Field */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Durum
                            </label>
                            <select
                                value={editTableStatus}
                                onChange={(e) => setEditTableStatus(e.target.value)}
                                className="select select-bordered text-text-500 w-full bg-white border-gray-300 focus:border-[#e63997] focus:outline-none focus:ring-2 focus:ring-[#e63997] focus:ring-opacity-20"
                            >
                                <option value="EMPTY">Müsait</option>
                                <option value="OCCUPIED">Dolu</option>
                            </select>
                            {editFormError && (
                                <p className="text-sm text-red-600 mt-2">{editFormError}</p>
                            )}
                        </div>
                        
                        {/* Modal Action Buttons */}
                        <div className="modal-action mt-8">
                            <div className="flex gap-3 w-full">
                                {/* Cancel Button */}
                                <button 
                                    type="button"
                                    onClick={closeEditModal}
                                    disabled={isSubmitting}
                                    className="btn flex-1 bg-white shadow-2xs border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg"
                                >
                                    İptal
                                </button>
                                {/* Update Button */}
                                <button 
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="btn shadow-sm flex-1 bg-[#e63997] hover:bg-[#d12e86] border-none text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Güncelleniyor...' : 'Güncelle'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button onClick={closeEditModal}>close</button>
                </form>
            </dialog>


            {/* Summary Stats Grid */}
            <div className="grid grid-cols-4 gap-6 mb-12">
                {/* Total Tables Card */}
                <div className="bg-white border border-gray-300 rounded-xl p-6 shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500 mb-2">Toplam Masa</p>
                            <p className="text-4xl font-semibold text-neutral-900">{totalTables}</p>
                        </div>
                        <div aria-label="status" className="status status-neutral status-lg"></div>
                    </div>
                </div>

                {/* Available Tables Card */}
                <div className="bg-white border border-green-200 rounded-xl p-6 shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500 mb-2">Müsait</p>
                            <p className="text-4xl font-semibold text-green-600">{availableTables}</p>
                        </div>
                        <div className="inline-grid *:[grid-area:1/1]">
                            <div className="status status-lg status-success"></div>
                        </div>
                    </div>
                </div>

                {/* Occupied Tables Card */}
                <div className="bg-white border border-red-300 rounded-xl p-6 shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500 mb-2">Dolu</p>
                            <p className="text-4xl font-semibold text-orange-600">{occupiedTables}</p>
                        </div>
                        <div className="inline-grid *:[grid-area:1/1]">
                            <div className="status status-lg status-error"></div>
                        </div>
                    </div>
                </div>

                {/* Reserved Tables Card */}
                <div className="bg-white border border-blue-200 rounded-xl p-6 shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500 mb-2">Rezerve</p>
                            <p className="text-4xl font-semibold text-blue-600">{reservedTables}</p>
                        </div>
                        <div className="inline-grid *:[grid-area:1/1]">
                            <div className="status status-lg status-info"></div>
                        </div>
                    </div>
                </div>
            </div>


            {/* Tables Grid */}
            <div className="grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {isLoading ? (
                    <>
                        {[...Array(10)].map((_, index) => (
                                        <div key={index} className="skeleton h-32 w-full text-pri bg-gray-100 text-prim rounded-xl [--color-base-100:#fbd0a9]"></div>
                        ))}
                    </>
                ) : fetchError ? (
                    <div className="col-span-full">
                        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-red-600 font-medium mb-2">{fetchError}</p>
                            <button 
                                onClick={fetchTables}
                                className="btn btn-sm bg-red-600 hover:bg-red-700 text-white border-none mt-2"
                            >
                                Tekrar Dene
                            </button>
                        </div>
                    </div>
                ) : tableList.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        Henüz masa eklenmemiş
                    </div>
                ) : (
                    
                    tableList.map((table) => (
                        <div
                            key={table.id}
                            className={`indicator w-full min-w-34 bg-white rounded-xl p-6 relative border transition-all hover:shadow-md cursor-pointer group ${
                                table.status === 'EMPTY' ? 'border-green-300' : 'border-red-300'
                            }`}
                        >
                            {/* Edit Button Indicator - Shows only on hover */}
                            <div className="indicator-item indicator-top opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openEditModal(table);
                                    }}
                                    className="btn btn-sm p-2 h-9 min-h-9 w-9 bg-white hover:bg-gray-50 border border-gray-300 rounded-full shadow-sm"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" className="text-gray-700">
                                        <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83l3.75 3.75z" />
                                    </svg>
                                </button>
                            </div>

                            {/* Status Badge - Positioned in top right */}

                            <div className="absolute right-5 top-3">
                                <div className="inline-grid *:[grid-area:1/1]">
                                    <div className={`status ${
                                        table.status === 'EMPTY' ? 'status-success' : 'status-error'
                                    } animate-ping`}></div>
                                    <div className={`status ${
                                        table.status === 'EMPTY' ? 'status-success' : 'status-error'
                                    }`}></div>
                                </div>
                            </div>

                            {/* Table Info */}
                            <div className="mt-8">
                                <p className="text-xl font-medium text-neutral-900 mb-2">
                                    {table.name}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {table.capacity ? table.capacity : "*"} kişilik
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}