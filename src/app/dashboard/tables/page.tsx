

'use client';

import { UUID } from 'crypto';
import { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';

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

    // PDF generation state
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const pdfDebounceTimeout = useRef<NodeJS.Timeout | null>(null);

    // Fetch tables on component mount
    useEffect(() => {
        fetchTables();
    }, []);

    // Cleanup debounce timeout on unmount
    useEffect(() => {
        return () => {
            if (pdfDebounceTimeout.current) {
                clearTimeout(pdfDebounceTimeout.current);
            }
        };
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
            setTableList(tables);
        } catch (error) {
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
            setEditFormError('Bağlantı hatası. Lütfen tekrar deneyin.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Delete table handler
    const handleDeleteTable = async () => {
        if (!editingTable) return;

        if (!confirm(`"${editingTable.name}" adlı masayı silmek istediğinizden emin misiniz?`)) {
            return;
        }

        setIsSubmitting(true);
        setEditFormError('');

        try {
            const response = await fetch('/api/dashboard/tables/delete', {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: editingTable.id
                })
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMessage = data.message || 'Masa silinirken bir hata oluştu';
                setEditFormError(errorMessage);
                return;
            }

            // Success - remove table from the list
            setTableList(prev => prev.filter(table => table.id !== editingTable.id));

            closeEditModal();
        } catch (error) {
            setEditFormError('Bağlantı hatası. Lütfen tekrar deneyin.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Generate PDF with QR codes
    const handleGeneratePDF = () => {
        // Clear existing timeout
        if (pdfDebounceTimeout.current) {
            clearTimeout(pdfDebounceTimeout.current);
        }

        // Set new timeout for debouncing (500ms)
        pdfDebounceTimeout.current = setTimeout(async () => {
            if (tableList.length === 0) {
                alert('QR kodu oluşturmak için en az bir masa bulunmalıdır.');
                return;
            }

            if (isGeneratingPDF) {
                return;
            }

            setIsGeneratingPDF(true);

            try {
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                });

                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();
                const margin = 20;
                const qrSize = 60;
                const spacing = 15;
                const cols = 2;
                const itemWidth = (pageWidth - (2 * margin) - spacing) / cols;
                const itemHeight = qrSize + 25;

                let currentX = margin;
                let currentY = margin;
                let itemsOnPage = 0;
                const itemsPerPage = Math.floor((pageHeight - 2 * margin) / (itemHeight + spacing)) * cols;

                // Add title to first page
                pdf.setFontSize(20);
                pdf.setFont('helvetica', 'bold');
                // Use text rendering mode for better UTF-8 support
                const title = 'Masa QR Kodlari';
                pdf.text(title, pageWidth / 2, currentY, { align: 'center' });
                currentY += 15;

                for (let i = 0; i < tableList.length; i++) {
                    const table = tableList[i];

                    // Check if we need a new page
                    if (itemsOnPage > 0 && itemsOnPage % itemsPerPage === 0) {
                        pdf.addPage();
                        currentY = margin;
                        currentX = margin;
                        itemsOnPage = 0;
                    }

                    // Fetch QR code image
                    try {
                        const response = await fetch(`/api/dashboard/qr?tableId=${table.id}&size=300`);

                        if (!response.ok) {
                            console.error(`Failed to fetch QR code for table ${table.name}`);
                            continue;
                        }

                        const blob = await response.blob();
                        const imageDataUrl = await new Promise<string>((resolve) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result as string);
                            reader.readAsDataURL(blob);
                        });

                        // Calculate position
                        const col = itemsOnPage % cols;
                        const row = Math.floor(itemsOnPage / cols);
                        currentX = margin + col * (itemWidth + spacing);
                        currentY = margin + 15 + row * (itemHeight + spacing);

                        // Draw border
                        pdf.setDrawColor(200);
                        pdf.setLineWidth(0.5);
                        pdf.rect(currentX, currentY, itemWidth, itemHeight);

                        // Add table name - convert Turkish chars
                        pdf.setFontSize(12);
                        pdf.setFont('helvetica', 'bold');
                        const textY = currentY + 8;
                        // Convert Turkish characters for PDF compatibility
                        const tableName = table.name
                            .replace(/İ/g, 'I')
                            .replace(/ı/g, 'i')
                            .replace(/Ş/g, 'S')
                            .replace(/ş/g, 's')
                            .replace(/Ğ/g, 'G')
                            .replace(/ğ/g, 'g')
                            .replace(/Ü/g, 'U')
                            .replace(/ü/g, 'u')
                            .replace(/Ö/g, 'O')
                            .replace(/ö/g, 'o')
                            .replace(/Ç/g, 'C')
                            .replace(/ç/g, 'c');
                        pdf.text(tableName, currentX + itemWidth / 2, textY, { align: 'center' });

                        // Add QR code
                        const qrX = currentX + (itemWidth - qrSize) / 2;
                        const qrY = currentY + 12;
                        pdf.addImage(imageDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

                        // Add capacity info - convert Turkish chars
                        pdf.setFontSize(9);
                        pdf.setFont('helvetica', 'normal');
                        const capacityY = qrY + qrSize + 5;
                        const capacityText = `Kapasite: ${table.capacity} kisi`;
                        pdf.text(capacityText, currentX + itemWidth / 2, capacityY, { align: 'center' });

                        itemsOnPage++;
                    } catch (error) {
                        console.error(`Error processing QR code for table ${table.name}:`, error);
                    }
                }

                // Save PDF
                const timestamp = new Date().toISOString().split('T')[0];
                pdf.save(`masa-qr-kodlari-${timestamp}.pdf`);

            } catch (error) {
                console.error('Error generating PDF:', error);
                alert('PDF oluşturulurken bir hata oluştu.');
            } finally {
                setIsGeneratingPDF(false);
            }
        }, 800);
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Header */}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900">Masalar</h1>

                <div className="flex gap-3">
                    {/* QR Code Button */}
                    <button
                        onClick={handleGeneratePDF}
                        disabled={isGeneratingPDF || tableList.length === 0}
                        className="btn btn-primary bg-orange-500 hover:bg-orange-600 border-none text-white gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGeneratingPDF ? (
                            <>
                                <span className="loading loading-spinner loading-sm"></span>
                                Oluşturuluyor...
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1z" clipRule="evenodd" />
                                    <path d="M11 4a1 1 0 10-2 0v1a1 1 0 002 0V4zM10 7a1 1 0 011 1v1h2a1 1 0 110 2h-3a1 1 0 01-1-1V8a1 1 0 011-1zM16 9a1 1 0 100 2 1 1 0 000-2zM9 13a1 1 0 011-1h1a1 1 0 110 2v2a1 1 0 11-2 0v-3zM7 11a1 1 0 100-2H4a1 1 0 100 2h3zM17 13a1 1 0 01-1 1h-2a1 1 0 110-2h2a1 1 0 011 1zM16 17a1 1 0 100-2h-3a1 1 0 100 2h3z" />
                                </svg>
                                QR Kodları
                            </>
                        )}
                    </button>

                    {/* Add Dropdown */}
                    <div className="dropdown dropdown-end">
                        <button tabIndex={0} role="button" className="btn btn-primary bg-secondary-500 hover:bg-secondary-600 border-none ml-2 rounded-3xl text-white gap-2">
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
                            <div className="flex justify-between items-center w-full">
                                {/* Delete Button */}
                                <div className="tooltip tooltip-right" data-tip="Masayı Sil">
                                    <button
                                        type="button"
                                        onClick={handleDeleteTable}
                                        disabled={isSubmitting}
                                        className="btn btn-sm p-2 h-10 min-h-10 w-10 bg-red-600 hover:bg-red-700 border-none rounded-full shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" className="text-white">
                                            <path fill="currentColor" d="M7 21q-.825 0-1.412-.587T5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413T17 21zM17 6H7v13h10zM9 17h2V8H9zm4 0h2V8h-2zM7 6v13z" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="flex gap-3">
                                    {/* Cancel Button */}
                                    <button
                                        type="button"
                                        onClick={closeEditModal}
                                        disabled={isSubmitting}
                                        className="btn bg-white shadow-2xs border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg"
                                    >
                                        İptal
                                    </button>
                                    {/* Update Button */}
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="btn shadow-sm bg-[#e63997] hover:bg-[#d12e86] border-none text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? 'Güncelleniyor...' : 'Güncelle'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button onClick={closeEditModal}>close</button>
                </form>
            </dialog>


            {/* Summary Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-12">
                {/* Total Tables Card */}
                <div className="bg-white border border-gray-300 rounded-xl p-6 shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">Toplam Masa</p>
                            <p className="text-2xl sm:text-4xl font-semibold text-neutral-900">{totalTables}</p>
                        </div>
                        <div aria-label="status" className="status status-neutral status-lg"></div>
                    </div>
                </div>

                {/* Available Tables Card */}
                <div className="bg-white border border-green-200 rounded-xl p-6 shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">Müsait</p>
                            <p className="text-2xl sm:text-4xl font-semibold text-green-600">{availableTables}</p>
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
                            <p className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">Dolu</p>
                            <p className="text-2xl sm:text-4xl font-semibold text-orange-600">{occupiedTables}</p>
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
                            <p className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">Rezerve</p>
                            <p className="text-2xl sm:text-4xl font-semibold text-blue-600">{reservedTables}</p>
                        </div>
                        <div className="inline-grid *:[grid-area:1/1]">
                            <div className="status status-lg status-info"></div>
                        </div>
                    </div>
                </div>
            </div>


            {/* Tables Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
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
                            className={`indicator w-full min-w-34 bg-white rounded-xl p-6 relative border transition-all hover:shadow-md cursor-pointer group ${table.status === 'EMPTY' ? 'border-green-300' : 'border-red-300'
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
                                    <div className={`status ${table.status === 'EMPTY' ? 'status-success' : 'status-error'
                                        } animate-ping`}></div>
                                    <div className={`status ${table.status === 'EMPTY' ? 'status-success' : 'status-error'
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