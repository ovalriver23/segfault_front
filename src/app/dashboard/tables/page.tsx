

'use client';

import type { UUID } from 'crypto';
import type QRCodeStyling from 'qr-code-styling';
import type { CornerDotType, CornerSquareType, DotType, DrawType, Options } from 'qr-code-styling';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/app/lib/context/AuthContext';
import jsPDF from 'jspdf';

interface Table {
    id: UUID;
    name: string;
    qrToken: UUID;
    capacity: number;
    status: string;
    restaurantId: UUID;
}

interface OrderItem {
    menuItemName: string;
    quantity: number;
    price: number;
    note: string | null;
}

interface Order {
    id: number;
    status: string;
    totalAmount: number;
    createdAt: string;
    generalNote: string | null;
    cancellationReason: string | null;
    items: OrderItem[];
}

type QRSize = 'small' | 'medium' | 'large';

interface QRCustomization {
    size: QRSize;
    dotsType: DotType;
    cornersSquareType: CornerSquareType;
    cornersDotType: CornerDotType;
    dotsColor: string;
    cornersSquareColor: string;
    cornersDotColor: string;
    backgroundColor: string;
    includeRestaurantLogo: boolean;
}

const TABLE_URL_BASE = 'https://easyorder.com.tr/table';

const ORDER_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
    RECEIVED: { label: 'Alındı', className: 'bg-blue-100 text-blue-700' },
    PENDING: { label: 'Onay Bekliyor', className: 'bg-amber-100 text-amber-700' },
    CONFIRMED: { label: 'Hazırlanıyor', className: 'bg-orange-100 text-orange-700' },
    PREPARING: { label: 'Hazırlanıyor', className: 'bg-orange-100 text-orange-700' },
    READY: { label: 'Hazır', className: 'bg-purple-100 text-purple-700' },
    DELIVERED: { label: 'Teslim Edildi', className: 'bg-cyan-100 text-cyan-700' },
    SERVED: { label: 'Servis Edildi', className: 'bg-cyan-100 text-cyan-700' },
    COMPLETED: { label: 'Tamamlandı', className: 'bg-green-100 text-green-700' },
    CANCELLED: { label: 'İptal Edildi', className: 'bg-red-100 text-red-700' },
};

const formatCurrency = (value: number) => new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
}).format(value);

const formatOrderDate = (value: string) => {
    const parts = value.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/);
    if (!parts) return value;

    const [, year, month, day, hour, minute, second = '0'] = parts;
    const date = new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hour) - 3,
        Number(minute),
        Number(second),
    );

    return Number.isNaN(date.getTime())
        ? value
        : new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
};

const DEFAULT_QR_CUSTOMIZATION: QRCustomization = {
    size: 'medium',
    dotsType: 'square',
    cornersSquareType: 'square',
    cornersDotType: 'square',
    dotsColor: '#171717',
    cornersSquareColor: '#171717',
    cornersDotColor: '#171717',
    backgroundColor: '#ffffff',
    includeRestaurantLogo: false,
};

const QR_SIZE_CONFIG: Record<QRSize, {
    label: string;
    sizeCm: number;
    pdfSizeMm: number;
    previewSizePx: number;
    columns: number;
}> = {
    small: { label: 'Küçük', sizeCm: 4, pdfSizeMm: 40, previewSizePx: 180, columns: 3 },
    medium: { label: 'Orta', sizeCm: 6, pdfSizeMm: 60, previewSizePx: 220, columns: 2 },
    large: { label: 'Büyük', sizeCm: 8, pdfSizeMm: 80, previewSizePx: 260, columns: 1 },
};

const QR_SIZE_OPTIONS: QRSize[] = ['small', 'medium', 'large'];

const DOT_STYLE_OPTIONS: Array<{ value: DotType; label: string }> = [
    { value: 'square', label: 'Kare' },
    { value: 'rounded', label: 'Yuvarlatılmış' },
    { value: 'dots', label: 'Nokta' },
    { value: 'classy', label: 'Modern' },
    { value: 'classy-rounded', label: 'Modern yuvarlak' },
    { value: 'extra-rounded', label: 'Ekstra yuvarlak' },
];

const CORNER_SQUARE_STYLE_OPTIONS: Array<{ value: CornerSquareType; label: string }> = [
    { value: 'square', label: 'Kare' },
    { value: 'dot', label: 'Daire' },
    { value: 'extra-rounded', label: 'Yuvarlatılmış' },
];

const CORNER_DOT_STYLE_OPTIONS: Array<{ value: CornerDotType; label: string }> = [
    { value: 'square', label: 'Kare' },
    { value: 'dot', label: 'Daire' },
];

const getTableUrl = (qrToken: UUID) => `${TABLE_URL_BASE}/${qrToken}`;

const getQRCodeOptions = (
    data: string,
    customization: QRCustomization,
    size: number,
    type: DrawType,
    restaurantLogoUrl?: string | null,
): Options => ({
    width: size,
    height: size,
    type,
    data,
    image: customization.includeRestaurantLogo && restaurantLogoUrl ? restaurantLogoUrl : undefined,
    margin: Math.round(size * 0.05),
    qrOptions: {
        errorCorrectionLevel: 'H',
    },
    imageOptions: {
        hideBackgroundDots: true,
        imageSize: 0.35,
        margin: Math.round(size * 0.015),
        crossOrigin: 'anonymous',
        saveAsBlob: true,
    },
    dotsOptions: {
        type: customization.dotsType,
        color: customization.dotsColor,
    },
    cornersSquareOptions: {
        type: customization.cornersSquareType,
        color: customization.cornersSquareColor,
    },
    cornersDotOptions: {
        type: customization.cornersDotType,
        color: customization.cornersDotColor,
    },
    backgroundOptions: {
        color: customization.backgroundColor,
    },
});

const blobToDataUrl = (blob: Blob) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error('QR kodu görsele dönüştürülemedi.'));
    reader.readAsDataURL(blob);
});

export default function Tables() {
    const { user } = useAuth();

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

    // Occupied table details modal state
    const [selectedTable, setSelectedTable] = useState<Table | null>(null);
    const [tableOrders, setTableOrders] = useState<Order[]>([]);
    const [isLoadingTableOrders, setIsLoadingTableOrders] = useState(false);
    const [tableOrdersError, setTableOrdersError] = useState('');

    // QR customization and PDF generation state
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [qrCustomization, setQrCustomization] = useState<QRCustomization>(DEFAULT_QR_CUSTOMIZATION);
    const qrPreviewContainerRef = useRef<HTMLDivElement>(null);
    const qrPreviewRef = useRef<QRCodeStyling | null>(null);

    // Fetch tables on component mount
    useEffect(() => {
        fetchTables();
    }, []);

    // Keep the modal preview in sync with the selected QR appearance.
    useEffect(() => {
        let isCancelled = false;

        const renderPreview = async () => {
            const container = qrPreviewContainerRef.current;
            if (!container) return;

            const { default: QRCodeStylingClass } = await import('qr-code-styling');
            if (isCancelled) return;

            const previewToken = tableList[0]?.qrToken ?? ('preview' as UUID);
            const sizeConfig = QR_SIZE_CONFIG[qrCustomization.size];
            const options = getQRCodeOptions(
                getTableUrl(previewToken),
                qrCustomization,
                sizeConfig.previewSizePx,
                'svg',
                user?.restaurantLogoUrl,
            );

            if (qrPreviewRef.current) {
                qrPreviewRef.current.update(options);
            } else {
                qrPreviewRef.current = new QRCodeStylingClass(options);
                qrPreviewRef.current.append(container);
            }
        };

        renderPreview().catch((error) => {
            console.error('Error rendering QR preview:', error);
        });

        return () => {
            isCancelled = true;
        };
    }, [qrCustomization, tableList, user?.restaurantLogoUrl]);

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

    const fetchTableOrders = async (table: Table) => {
        setIsLoadingTableOrders(true);
        setTableOrdersError('');
        setTableOrders([]);

        try {
            const response = await fetch(`/api/public/table/order?qrToken=${encodeURIComponent(table.qrToken)}`, {
                method: 'GET',
                credentials: 'include',
            });
            const data = await response.json().catch(() => null);

            if (!response.ok) {
                const message = data?.message || data?.error || 'Siparişler yüklenirken bir hata oluştu.';
                throw new Error(message);
            }

            setTableOrders(Array.isArray(data) ? data : []);
        } catch (error) {
            setTableOrdersError(error instanceof Error ? error.message : 'Siparişler yüklenirken bir hata oluştu.');
        } finally {
            setIsLoadingTableOrders(false);
        }
    };

    const openTableDetails = (table: Table) => {
        if (table.status !== 'OCCUPIED') return;

        setSelectedTable(table);
        void fetchTableOrders(table);
    };

    const closeTableDetails = () => {
        setSelectedTable(null);
        setTableOrders([]);
        setTableOrdersError('');
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

    const openQrCustomizationModal = () => {
        if (tableList.length === 0) {
            alert('QR kodu oluşturmak için en az bir masa bulunmalıdır.');
            return;
        }

        (document.getElementById('QR_Customization') as HTMLDialogElement)?.showModal();
    };

    const closeQrCustomizationModal = () => {
        (document.getElementById('QR_Customization') as HTMLDialogElement)?.close();
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

    // Generate the styled QR codes locally and place them into the existing PDF layout.
    const handleGeneratePDF = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (tableList.length === 0) {
            alert('QR kodu oluşturmak için en az bir masa bulunmalıdır.');
            return;
        }

        if (isGeneratingPDF) return;

        setIsGeneratingPDF(true);

        try {
            const { default: QRCodeStylingClass } = await import('qr-code-styling');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const sizeConfig = QR_SIZE_CONFIG[qrCustomization.size];
            const margin = 20;
            const qrSize = sizeConfig.pdfSizeMm;
            const spacing = 15;
            const cols = sizeConfig.columns;
            const itemWidth = (pageWidth - (2 * margin) - (spacing * (cols - 1))) / cols;
            const itemHeight = qrSize + 25;

            let itemsOnPage = 0;
            const itemsPerPage = Math.floor((pageHeight - 2 * margin) / (itemHeight + spacing)) * cols;

            pdf.setFontSize(20);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Masa QR Kodlari', pageWidth / 2, margin, { align: 'center' });

            for (const table of tableList) {
                if (itemsOnPage > 0 && itemsOnPage % itemsPerPage === 0) {
                    pdf.addPage();
                    itemsOnPage = 0;
                }

                const qrCode = new QRCodeStylingClass(
                    getQRCodeOptions(
                        getTableUrl(table.qrToken),
                        qrCustomization,
                        600,
                        'canvas',
                        user?.restaurantLogoUrl,
                    )
                );
                const rawQrImage = await qrCode.getRawData('png');

                if (!(rawQrImage instanceof Blob)) {
                    throw new Error(`QR code could not be generated for table ${table.name}.`);
                }

                const imageDataUrl = await blobToDataUrl(rawQrImage);
                const col = itemsOnPage % cols;
                const row = Math.floor(itemsOnPage / cols);
                const currentX = margin + col * (itemWidth + spacing);
                const currentY = margin + 15 + row * (itemHeight + spacing);

                pdf.setDrawColor(200);
                pdf.setLineWidth(0.5);
                pdf.rect(currentX, currentY, itemWidth, itemHeight);

                pdf.setFontSize(12);
                pdf.setFont('helvetica', 'bold');
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
                pdf.text(tableName, currentX + itemWidth / 2, currentY + 8, { align: 'center' });

                const qrX = currentX + (itemWidth - qrSize) / 2;
                const qrY = currentY + 12;
                pdf.addImage(imageDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

                pdf.setFontSize(9);
                pdf.setFont('helvetica', 'normal');
                pdf.text(
                    `Kapasite: ${table.capacity} kisi`,
                    currentX + itemWidth / 2,
                    qrY + qrSize + 5,
                    { align: 'center' }
                );

                itemsOnPage++;
            }

            const timestamp = new Date().toISOString().split('T')[0];
            pdf.save(`masa-qr-kodlari-${timestamp}.pdf`);
            closeQrCustomizationModal();
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('PDF oluşturulurken bir hata oluştu. Lütfen QR tasarımını kontrol edip tekrar deneyin.');
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Header */}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900">Masalar</h1>

                <div className="flex gap-3">
                    {/* QR Code Button */}
                    <button
                        onClick={openQrCustomizationModal}
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


            {/* QR Customization Modal */}
            <dialog
                id="QR_Customization"
                className="modal"
                onCancel={(event) => {
                    if (isGeneratingPDF) event.preventDefault();
                }}
            >
                <div className="modal-box max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-xl p-6">
                    <form onSubmit={handleGeneratePDF}>
                        <div className="flex items-start justify-between gap-4 mb-6">
                            <div>
                                <h3 className="font-bold text-2xl text-neutral-900">QR Kodlarını Özelleştir</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Tüm masa QR kodlarına uygulanacak tasarımı seçin.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setQrCustomization(DEFAULT_QR_CUSTOMIZATION)}
                                disabled={isGeneratingPDF}
                                className="btn btn-sm bg-white border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg"
                            >
                                Sıfırla
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_300px] gap-6">
                            <div className="space-y-6">
                                <div>
                                    <h4 className="font-semibold text-neutral-900 mb-3">QR Boyutu</h4>
                                    <div className="grid grid-cols-3 gap-3">
                                        {QR_SIZE_OPTIONS.map((size) => {
                                            const option = QR_SIZE_CONFIG[size];
                                            const isSelected = qrCustomization.size === size;

                                            return (
                                                <button
                                                    key={size}
                                                    type="button"
                                                    onClick={() => setQrCustomization((current) => ({ ...current, size }))}
                                                    disabled={isGeneratingPDF}
                                                    aria-pressed={isSelected}
                                                    className={`rounded-lg border p-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${isSelected
                                                        ? 'border-[#e63997] bg-pink-50 ring-2 ring-[#e63997]/20'
                                                        : 'border-gray-300 bg-white hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <span className={`block text-sm font-semibold ${isSelected ? 'text-[#e63997]' : 'text-neutral-900'}`}>
                                                        {option.label}
                                                    </span>
                                                    <span className="block text-xs text-gray-500 mt-1">
                                                        {option.sizeCm} × {option.sizeCm} cm
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-neutral-900 mb-3">Şekil</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <label className="block text-sm font-medium text-gray-700">
                                            <span className="block mb-2">Kod deseni</span>
                                            <select
                                                value={qrCustomization.dotsType}
                                                onChange={(event) => setQrCustomization((current) => ({
                                                    ...current,
                                                    dotsType: event.target.value as DotType,
                                                }))}
                                                disabled={isGeneratingPDF}
                                                className="select select-bordered text-text-500 w-full bg-white border-gray-300 focus:border-[#e63997] focus:outline-none focus:ring-2 focus:ring-[#e63997] focus:ring-opacity-20"
                                            >
                                                {DOT_STYLE_OPTIONS.map((option) => (
                                                    <option key={option.value} value={option.value}>{option.label}</option>
                                                ))}
                                            </select>
                                        </label>

                                        <label className="block text-sm font-medium text-gray-700">
                                            <span className="block mb-2">Dış köşeler</span>
                                            <select
                                                value={qrCustomization.cornersSquareType}
                                                onChange={(event) => setQrCustomization((current) => ({
                                                    ...current,
                                                    cornersSquareType: event.target.value as CornerSquareType,
                                                }))}
                                                disabled={isGeneratingPDF}
                                                className="select select-bordered text-text-500 w-full bg-white border-gray-300 focus:border-[#e63997] focus:outline-none focus:ring-2 focus:ring-[#e63997] focus:ring-opacity-20"
                                            >
                                                {CORNER_SQUARE_STYLE_OPTIONS.map((option) => (
                                                    <option key={option.value} value={option.value}>{option.label}</option>
                                                ))}
                                            </select>
                                        </label>

                                        <label className="block text-sm font-medium text-gray-700">
                                            <span className="block mb-2">İç köşeler</span>
                                            <select
                                                value={qrCustomization.cornersDotType}
                                                onChange={(event) => setQrCustomization((current) => ({
                                                    ...current,
                                                    cornersDotType: event.target.value as CornerDotType,
                                                }))}
                                                disabled={isGeneratingPDF}
                                                className="select select-bordered text-text-500 w-full bg-white border-gray-300 focus:border-[#e63997] focus:outline-none focus:ring-2 focus:ring-[#e63997] focus:ring-opacity-20"
                                            >
                                                {CORNER_DOT_STYLE_OPTIONS.map((option) => (
                                                    <option key={option.value} value={option.value}>{option.label}</option>
                                                ))}
                                            </select>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-neutral-900 mb-3">Renkler</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <label className="flex items-center justify-between gap-3 border border-gray-300 rounded-lg p-3 text-sm font-medium text-gray-700">
                                            <span>Kod rengi</span>
                                            <span className="flex items-center gap-2 font-mono text-xs uppercase text-gray-500">
                                                {qrCustomization.dotsColor}
                                                <input
                                                    type="color"
                                                    value={qrCustomization.dotsColor}
                                                    onChange={(event) => setQrCustomization((current) => ({ ...current, dotsColor: event.target.value }))}
                                                    disabled={isGeneratingPDF}
                                                    className="h-9 w-11 cursor-pointer rounded border border-gray-300 bg-white p-1 disabled:cursor-not-allowed"
                                                />
                                            </span>
                                        </label>

                                        <label className="flex items-center justify-between gap-3 border border-gray-300 rounded-lg p-3 text-sm font-medium text-gray-700">
                                            <span>Dış köşe rengi</span>
                                            <span className="flex items-center gap-2 font-mono text-xs uppercase text-gray-500">
                                                {qrCustomization.cornersSquareColor}
                                                <input
                                                    type="color"
                                                    value={qrCustomization.cornersSquareColor}
                                                    onChange={(event) => setQrCustomization((current) => ({ ...current, cornersSquareColor: event.target.value }))}
                                                    disabled={isGeneratingPDF}
                                                    className="h-9 w-11 cursor-pointer rounded border border-gray-300 bg-white p-1 disabled:cursor-not-allowed"
                                                />
                                            </span>
                                        </label>

                                        <label className="flex items-center justify-between gap-3 border border-gray-300 rounded-lg p-3 text-sm font-medium text-gray-700">
                                            <span>İç köşe rengi</span>
                                            <span className="flex items-center gap-2 font-mono text-xs uppercase text-gray-500">
                                                {qrCustomization.cornersDotColor}
                                                <input
                                                    type="color"
                                                    value={qrCustomization.cornersDotColor}
                                                    onChange={(event) => setQrCustomization((current) => ({ ...current, cornersDotColor: event.target.value }))}
                                                    disabled={isGeneratingPDF}
                                                    className="h-9 w-11 cursor-pointer rounded border border-gray-300 bg-white p-1 disabled:cursor-not-allowed"
                                                />
                                            </span>
                                        </label>

                                        <label className="flex items-center justify-between gap-3 border border-gray-300 rounded-lg p-3 text-sm font-medium text-gray-700">
                                            <span>Arka plan</span>
                                            <span className="flex items-center gap-2 font-mono text-xs uppercase text-gray-500">
                                                {qrCustomization.backgroundColor}
                                                <input
                                                    type="color"
                                                    value={qrCustomization.backgroundColor}
                                                    onChange={(event) => setQrCustomization((current) => ({ ...current, backgroundColor: event.target.value }))}
                                                    disabled={isGeneratingPDF}
                                                    className="h-9 w-11 cursor-pointer rounded border border-gray-300 bg-white p-1 disabled:cursor-not-allowed"
                                                />
                                            </span>
                                        </label>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-3">
                                        Kolay tarama için kod ve arka plan arasında yüksek kontrast kullanın.
                                    </p>
                                </div>

                                {user?.restaurantLogoUrl && (
                                    <div>
                                        <h4 className="font-semibold text-neutral-900 mb-3">Restoran Logosu</h4>
                                        <label className="flex items-center justify-between gap-4 border border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                                            <span className="flex items-center gap-3">
                                                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-50 text-[#e63997]">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l3.5-4.5 2.5 3 1.5-2L16 15zM13.5 8a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" clipRule="evenodd" />
                                                    </svg>
                                                </span>
                                                <span>
                                                    <span className="block text-sm font-medium text-neutral-900">Logoyu QR koduna ekle</span>
                                                    <span className="block text-xs text-gray-500 mt-1">Logo, QR kodlarının merkezinde gösterilir.</span>
                                                </span>
                                            </span>
                                            <input
                                                type="checkbox"
                                                checked={qrCustomization.includeRestaurantLogo}
                                                onChange={(event) => setQrCustomization((current) => ({
                                                    ...current,
                                                    includeRestaurantLogo: event.target.checked,
                                                }))}
                                                disabled={isGeneratingPDF}
                                                className="checkbox checkbox-sm border-gray-400 checked:border-[#e63997] checked:bg-[#e63997]"
                                            />
                                        </label>
                                    </div>
                                )}
                            </div>

                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center self-start">
                                <div className="w-full flex items-center justify-between gap-3 mb-3">
                                    <p className="text-sm font-semibold text-neutral-900">Canlı Önizleme</p>
                                    <span className="badge border-pink-200 bg-pink-50 text-[#e63997] font-medium">
                                        {QR_SIZE_CONFIG[qrCustomization.size].sizeCm} × {QR_SIZE_CONFIG[qrCustomization.size].sizeCm} cm
                                    </span>
                                </div>
                                <div
                                    ref={qrPreviewContainerRef}
                                    className="w-full min-h-[260px] flex items-center justify-center overflow-hidden [&>svg]:h-auto [&>svg]:max-w-full"
                                />
                                <p className="text-sm font-medium text-neutral-900 mt-3">
                                    {tableList[0]?.name ?? 'Örnek Masa'}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">PDF&apos;te tüm masalara uygulanır</p>
                            </div>
                        </div>

                        <div className="modal-action mt-8">
                            <div className="flex gap-3 w-full sm:w-auto sm:min-w-80">
                                <button
                                    type="button"
                                    onClick={closeQrCustomizationModal}
                                    disabled={isGeneratingPDF}
                                    className="btn flex-1 bg-white shadow-2xs border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isGeneratingPDF}
                                    className="btn shadow-sm flex-1 bg-[#e63997] hover:bg-[#d12e86] border-none text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isGeneratingPDF ? (
                                        <>
                                            <span className="loading loading-spinner loading-sm"></span>
                                            Oluşturuluyor...
                                        </>
                                    ) : 'PDF Oluştur'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button onClick={closeQrCustomizationModal} disabled={isGeneratingPDF}>close</button>
                </form>
            </dialog>

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


            {/* Occupied Table Details Modal */}
            {selectedTable && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-neutral-950/60 p-4 backdrop-blur-sm"
                    role="presentation"
                    onMouseDown={closeTableDetails}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="table-details-title"
                        className="my-auto flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <header className="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-4 sm:px-6">
                            <div>
                                <div className="mb-2 flex items-center gap-2">
                                    <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                                    <span className="text-xs font-semibold uppercase tracking-wider text-red-600">Dolu Masa</span>
                                </div>
                                <h2 id="table-details-title" className="text-2xl font-bold text-neutral-900">
                                    {selectedTable.name}
                                </h2>
                                <p className="mt-1 text-sm text-gray-500">Masa ve mevcut sipariş detayları</p>
                            </div>
                            <button
                                type="button"
                                onClick={closeTableDetails}
                                aria-label="Masa detaylarını kapat"
                                className="btn btn-sm btn-circle border border-gray-200 bg-white text-gray-500 shadow-none hover:bg-gray-100"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </header>

                        <div className="overflow-y-auto p-5 sm:p-6">
                            <dl className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                                    <dt className="text-xs font-medium text-gray-500">Masa Adı</dt>
                                    <dd className="mt-1 font-semibold text-neutral-900">{selectedTable.name}</dd>
                                </div>
                                <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                                    <dt className="text-xs font-medium text-gray-500">Kapasite</dt>
                                    <dd className="mt-1 font-semibold text-neutral-900">{selectedTable.capacity} kişi</dd>
                                </div>
                                <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                                    <dt className="text-xs font-medium text-red-600">Durum</dt>
                                    <dd className="mt-1 font-semibold text-red-700">Dolu</dd>
                                </div>
                                <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                                    <dt className="text-xs font-medium text-gray-500">Sipariş Toplamı</dt>
                                    <dd className="mt-1 font-semibold text-neutral-900">
                                        {isLoadingTableOrders
                                            ? '—'
                                            : formatCurrency(tableOrders
                                                .filter((order) => order.status !== 'CANCELLED')
                                                .reduce((total, order) => total + order.totalAmount, 0))}
                                    </dd>
                                </div>
                            </dl>

                            <div className="mb-3 flex items-center justify-between gap-4">
                                <h3 className="text-lg font-semibold text-neutral-900">Siparişler</h3>
                                {!isLoadingTableOrders && !tableOrdersError && (
                                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                                        {tableOrders.length} sipariş
                                    </span>
                                )}
                            </div>

                            {isLoadingTableOrders ? (
                                <div className="flex min-h-40 items-center justify-center rounded-xl border border-gray-200">
                                    <span className="loading loading-spinner loading-md text-[#e63997]" />
                                </div>
                            ) : tableOrdersError ? (
                                <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-center">
                                    <p className="text-sm font-medium text-red-700">{tableOrdersError}</p>
                                    <button
                                        type="button"
                                        onClick={() => void fetchTableOrders(selectedTable)}
                                        className="btn btn-sm mt-4 border-none bg-red-600 text-white hover:bg-red-700"
                                    >
                                        Tekrar Dene
                                    </button>
                                </div>
                            ) : tableOrders.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-gray-300 px-5 py-10 text-center text-sm text-gray-500">
                                    Bu masa için sipariş bulunamadı.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {tableOrders.map((order) => {
                                        const status = ORDER_STATUS_CONFIG[order.status] || {
                                            label: order.status,
                                            className: 'bg-gray-100 text-gray-700',
                                        };

                                        return (
                                            <article key={order.id} className="overflow-hidden rounded-xl border border-gray-200">
                                                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-neutral-900">Sipariş #{order.id}</span>
                                                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}>
                                                            {status.label}
                                                        </span>
                                                    </div>
                                                    <time className="text-xs text-gray-500" dateTime={order.createdAt}>
                                                        {formatOrderDate(order.createdAt)}
                                                    </time>
                                                </div>

                                                <div className="p-4">
                                                    <div className="space-y-3">
                                                        {order.items?.length > 0 ? order.items.map((item, index) => (
                                                            <div key={`${order.id}-${index}`} className="flex items-start justify-between gap-4">
                                                                <div className="min-w-0">
                                                                    <p className="font-medium text-neutral-900">
                                                                        <span className="mr-2 text-[#e63997]">{item.quantity}×</span>
                                                                        {item.menuItemName}
                                                                    </p>
                                                                    {item.note && <p className="mt-1 text-xs text-amber-700">Not: {item.note}</p>}
                                                                </div>
                                                                <span className="shrink-0 text-sm font-semibold text-neutral-800">
                                                                    {formatCurrency(item.price * item.quantity)}
                                                                </span>
                                                            </div>
                                                        )) : (
                                                            <p className="text-sm text-gray-500">Ürün detayı bulunmuyor.</p>
                                                        )}
                                                    </div>

                                                    {order.generalNote && (
                                                        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                                                            <span className="font-semibold">Genel not:</span> {order.generalNote}
                                                        </div>
                                                    )}


                                                    <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-3">
                                                        <span className="text-sm font-medium text-gray-600">Sipariş Toplamı</span>
                                                        <span className="text-lg font-bold text-[#e63997]">{formatCurrency(order.totalAmount)}</span>
                                                    </div>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            )}

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
                            role={table.status === 'OCCUPIED' ? 'button' : undefined}
                            tabIndex={table.status === 'OCCUPIED' ? 0 : undefined}
                            aria-label={table.status === 'OCCUPIED' ? `${table.name} sipariş detaylarını görüntüle` : undefined}
                            onClick={() => openTableDetails(table)}
                            onKeyDown={(event) => {
                                if (table.status === 'OCCUPIED' && (event.key === 'Enter' || event.key === ' ')) {
                                    event.preventDefault();
                                    openTableDetails(table);
                                }
                            }}
                            className={`indicator w-full min-w-34 bg-white rounded-xl p-6 relative border transition-all group ${table.status === 'EMPTY'
                                ? 'border-green-300'
                                : 'cursor-pointer border-red-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#e63997] focus:ring-offset-2'
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