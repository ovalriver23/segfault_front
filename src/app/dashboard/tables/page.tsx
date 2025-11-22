

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
            <h1 className="text-3xl font-semibold text-neutral-900 mb-8">Masalar</h1>

            {/* Summary Stats Grid */}
            <div className="grid grid-cols-4 gap-6 mb-10">
                {/* Total Tables Card */}
                <div className="bg-white border border-gray-300 rounded-xl p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500 mb-2">Toplam Masa</p>
                            <p className="text-4xl font-semibold text-neutral-900">{totalTables}</p>
                        </div>
                        <div aria-label="status" className="status status-neutral status-lg"></div>
                    </div>
                </div>

                {/* Available Tables Card */}
                <div className="bg-white border border-green-200 rounded-xl p-6">
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
                <div className="bg-white border border-red-300 rounded-xl p-6">
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
                <div className="bg-white border border-blue-200 rounded-xl p-6">
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
            <div className="grid sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {tables.map((table) => (
                    <div
                        key={table.id}
                        className={` min-w-34 bg-white rounded-xl p-6 relative border transition-all hover:shadow-md cursor-pointer ${table.status === 'occupied'
                                ? 'border-red-300'
                                : table.status === 'available'
                                    ? 'border-green-300'
                                    : 'border-blue-300'
                            }`}
                    >
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