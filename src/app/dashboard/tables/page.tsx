

'use client';

export default function Tables() {
    // Static table data
    const tables = [
        { id: 1, capacity: 4, status: 'occupied' },
        { id: 2, capacity: 4, status: 'available' },
        { id: 3, capacity: 4, status: 'occupied' },
        { id: 4, capacity: 4, status: 'occupied' },
        { id: 5, capacity: 4, status: 'occupied' },
        { id: 6, capacity: 4, status: 'available' },
        { id: 7, capacity: 4, status: 'occupied' },
        { id: 8, capacity: 4, status: 'occupied' },
        { id: 9, capacity: 4, status: 'occupied' },
        { id: 10, capacity: 4, status: 'occupied' },
        { id: 11, capacity: 4, status: 'reserved' },
        { id: 12, capacity: 4, status: 'occupied' },
        { id: 13, capacity: 4, status: 'occupied' },
        { id: 14, capacity: 4, status: 'occupied' },
        { id: 15, capacity: 4, status: 'available' },
    ];

    // Calculate summary stats
    const totalTables = tables.length;
    const availableTables = tables.filter(t => t.status === 'available').length;
    const occupiedTables = tables.filter(t => t.status === 'occupied').length;
    const reservedTables = tables.filter(t => t.status === 'reserved').length;

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-semibold text-neutral-900">Masalar</h1>

                {/* Add Dropdown */}
                <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn shadow-2xs h-10 min-h-10 w-[130px] bg-[#e63997] hover:bg-[#d12e86] border-[#d1d5dc] text-black font-bold text-[18.549px] rounded-md gap-2">
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
                    </div>
                    <ul tabIndex={0} className="dropdown-content menu bg-white border border-gray-300 rounded-xl mt-1 z-1 w-64 p-3 shadow-lg">
                        <li><a className="text-neutral-900 hover:bg-gray-100 rounded-lg text-base py-3">Masa Ekle</a></li>
                        <li><a className="text-neutral-900 hover:bg-gray-100 rounded-lg text-base py-3">Toplu Masa Ekle</a></li>
                    </ul>
                </div>

            </div>

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
                            <div className="status status-lg status-success animate-ping"></div>
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
                            <div className="status status-lg status-error animate-ping"></div>
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
                            <div className="status status-lg status-info animate-ping"></div>
                            <div className="status status-lg status-info"></div>
                        </div>
                    </div>
                </div>
            </div>


            {/* Tables Grid */}
            <div className="grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {tables.map((table) => (
                    <div
                        key={table.id}
                        className={`indicator w-full min-w-34 bg-white rounded-xl p-6 relative border transition-all hover:shadow-md cursor-pointer group ${table.status === 'occupied'
                            ? 'border-red-300'
                            : table.status === 'available'
                                ? 'border-green-300'
                                : 'border-blue-300'
                            }`}
                    >
                        {/* Edit Button Indicator - Shows only on hover */}
                        <div className="indicator-item indicator-top opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="btn btn-sm p-2 h-9 min-h-9 w-9 bg-white hover:bg-gray-50 border border-gray-300 rounded-full shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" className="text-gray-700">
                                    <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83l3.75 3.75z"/>
                                </svg>
                            </button>
                        </div>

                        {/* Status Badge - Positioned in top right */}
                        <div className="absolute right-5 top-3">
                            {table.status === 'available' && (

                                <div className="inline-grid *:[grid-area:1/1]">
                                    <div className="status status-success animate-ping"></div>
                                    <div className="status status-success"></div>
                                </div>

                            )}
                            {table.status === 'occupied' && (
                                <div className="inline-grid *:[grid-area:1/1]">
                                    <div className="status status-error animate-ping"></div>
                                    <div className="status status-error"></div>
                                </div>
                            )}
                            {table.status === 'reserved' && (
                                <div className="inline-grid *:[grid-area:1/1]">
                                    <div className="status status-info animate-ping"></div>
                                    <div className="status status-info"></div>
                                </div>
                            )}
                        </div>

                        {/* Table Info */}
                        <div className="mt-8">
                            <p className="text-xl font-medium text-neutral-900 mb-2">
                                Masa No: {table.id}
                            </p>
                            <p className="text-sm text-gray-600">
                                {table.capacity} kişilik
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}