

'use client';

export default function Menu() {
    // Static data for categories
    const categories = [
        { id: 1, name: 'Kategori', active: false },
        { id: 2, name: 'Ürün', active: true },
    ];

    // Static data for menu items
    const menuItems = [
        { id: 1, name: 'Margarita Pizza', category: 'Pizza', price: '₺185.00', status: true },
        { id: 2, name: 'Pepperoni Pizza', category: 'Pizza', price: '₺210.00', status: true },
        { id: 3, name: 'Tavuklu Salata', category: 'Salatalar', price: '₺95.00', status: true },
        { id: 4, name: 'Izgara Köfte', category: 'Ana Yemek', price: '₺165.00', status: false },
        { id: 5, name: 'Mantı', category: 'Ana Yemek', price: '₺145.00', status: true },
        { id: 6, name: 'Limonata', category: 'İçecekler', price: '₺45.00', status: true },
        { id: 7, name: 'Tiramisu', category: 'Tatlılar', price: '₺85.00', status: true },
        { id: 8, name: 'Sezar Salata', category: 'Salatalar', price: '₺105.00', status: true },
    ];

        // Modal handlers
    const openModal = () => {
        (document.getElementById('Add_Table') as HTMLDialogElement)?.showModal();
    };

    const closeModal = () => {
        (document.getElementById('Add_Table') as HTMLDialogElement)?.close();
    };



    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-semibold text-neutral-900">Menü</h1>
                    
                    {/* Phone Mockup Toggle */}
                    <div className="flex items-center gap-3 pl-24">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                            <path fill="#000000" fillRule="evenodd" d="M1.606 6.08a1 1 0 0 1 1.313.526L2 7l.92-.394v-.001l.003.009l.021.045l.094.194c.086.172.219.424.4.729a13.4 13.4 0 0 0 1.67 2.237a12 12 0 0 0 .59.592C7.18 11.8 9.251 13 12 13a8.7 8.7 0 0 0 3.22-.602c1.227-.483 2.254-1.21 3.096-1.998a13 13 0 0 0 2.733-3.725l.027-.058l.005-.011a1 1 0 0 1 1.838.788L22 7l.92.394l-.003.005l-.004.008l-.011.026l-.04.087a14 14 0 0 1-.741 1.348a15.4 15.4 0 0 1-1.711 2.256l.797.797a1 1 0 0 1-1.414 1.415l-.84-.84a12 12 0 0 1-1.897 1.256l.782 1.202a1 1 0 1 1-1.676 1.091l-.986-1.514c-.679.208-1.404.355-2.176.424V16.5a1 1 0 0 1-2 0v-1.544c-.775-.07-1.5-.217-2.177-.425l-.985 1.514a1 1 0 0 1-1.676-1.09l.782-1.203c-.7-.37-1.332-.8-1.897-1.257l-.84.84a1 1 0 0 1-1.414-1.414l.797-.797a15.4 15.4 0 0 1-1.87-2.519a14 14 0 0 1-.591-1.107l-.033-.072l-.01-.021l-.002-.007l-.001-.002v-.001C1.08 7.395 1.08 7.394 2 7l-.919.395a1 1 0 0 1 .525-1.314" clipRule="evenodd" />
                        </svg>
                        <input type="checkbox" className="toggle toggle-md border-gray-500 bg-background-500 text-gray-500 checked:border-primary-500 checked:bg-primary-400 checked:text-primary-800" defaultChecked />
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 20 20">
                            <g fill="#000000">
                                <path fillRule="evenodd" d="M10 16c4.658 0 8.5-2.161 8.5-5S14.658 6 10 6s-8.5 2.161-8.5 5s3.842 5 8.5 5m0-9c4.179 0 7.5 1.868 7.5 4s-3.321 4-7.5 4s-7.5-1.868-7.5-4S5.821 7 10 7" clipRule="evenodd" />
                                <path d="M9.5 3.5a.5.5 0 0 1 1 0v3a.5.5 0 0 1-1 0zm4.01.402a.5.5 0 0 1 .98.196l-.5 2.5a.5.5 0 0 1-.98-.196zm-7.02 0a.5.5 0 0 0-.98.196l.5 2.5a.5.5 0 0 0 .98-.196zM2.429 5.243a.5.5 0 0 0-.858.514l1.5 2.5a.5.5 0 0 0 .858-.514zm15.142 0a.5.5 0 1 1 .858.514l-1.5 2.5a.5.5 0 1 1-.858-.514zM13 10.5a3 3 0 1 1-6 0a3 3 0 0 1 6 0" />
                            </g>
                        </svg>
                    </div>
                </div>

                {/* Add Button */}
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
                        <li><button className="text-neutral-900 hover:bg-gray-100 rounded-lg text-base py" onClick={openModal} >Kategori</button></li>
                       <li><a className="text-neutral-900 hover:bg-gray-100 rounded-lg text-base py-3" onClick={openModal}>Menü Öğesi</a></li>
                    </ul>
                </div>
            </div>

            {/* Adding Table Modal */}
            <dialog id="Add_Table" className="modal">
                <div className="modal-box bg-white rounded-xl shadow-xl p-6">
                    <form >
                        {/* Modal Header */}
                        <h3 className="font-bold text-2xl text-neutral-900 mb-6">Masa Ekle</h3>
                        
                        {/* Input Field */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Masa Adı
                            </label>
                            <input
                                type="text"
                                placeholder="Masa adını giriniz"
                                className="input input-bordered text-text-500 w-full bg-white border-gray-300 focus:border-[#e63997] focus:outline-none focus:ring-2 focus:ring-[#e63997] focus:ring-opacity-20"
                            />
                        </div>
                        
                        {/* Modal Action Buttons */}
                        <div className="modal-action mt-8">
                            <div className="flex gap-3 w-full">
                                {/* Cancel Button */}
                                <button 
                                    onClick={closeModal}
                                    type="button"
                                    className="btn flex-1 bg-white shadow-2xs border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg"
                                >
                                    İptal
                                </button>
                                {/* Add Button */}
                                <button 
                                    type="submit"
                                    className="btn shadow-sm flex-1 bg-[#e63997] hover:bg-[#d12e86] border-none text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Ekle
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button >close</button>
                </form>
            </dialog>



            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-6 mr-6">
                {/* Left Side - Phone Mockup */}
                <div className="flex flex-col items-center gap-2">
                    {/* Phone Mockup */}
                    <div className="mockup-phone border-primary scale-70 -mt-38">
                        <div className="camera"></div>
                        <div className="display">
                            <div className="artboard artboard-demo phone-1 bg-white">
                                {/* Phone content would go here */}
                                <div className="flex items-center justify-center h-full text-gray-400">
                                    <p>Menü Önizleme</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Menu Management */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4.5">
                    

                    {/* Section Header */}
                    <div className="mb-3">
                        <h2 className="text-lg font-semibold text-neutral-900">Menü Öğeleri</h2>
                        <p className="text-xs text-gray-500">Tüm menü ürünlerini yönetin</p>
                    </div>

                    {/* Menu Items Table */}
                    <div className="overflow-x-auto">
                        <table className="table w-full ">
                            {/* Table Head */}
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="text-[0.625rem] font-semibold text-gray-600 uppercase">Ürün Adı</th>
                                    <th className="text-[0.625rem] font-semibold text-gray-600 uppercase">Kategori</th>
                                    <th className="text-[0.625rem] font-semibold text-gray-600 uppercase">Fiyat</th>
                                    <th className="text-[0.625rem] font-semibold text-gray-600 uppercase">Mevcut</th>
                                    <th className="text-[0.625rem] font-semibold text-gray-600 uppercase pl-11">İşlemler</th>
                                </tr>
                            </thead>
                            {/* Table Body */}
                            <tbody>
                                {menuItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="text-xs text-gray-900 font-medium">{item.name}</td>
                                        <td>
                                            <span className="badge badge-xs bg-orange-100 text-orange-600 border-none font-medium">
                                                {item.category}
                                            </span>
                                        </td>
                                        <td className="text-xs text-gray-900 font-medium">{item.price}</td>
                                        <td>
                                            <input
                                                type="checkbox"
                                                className="toggle toggle-xs border-gray-400  text-gray-500 checked:border-secondary-500 checked:bg-secondary-400 checked:text-secondary-800"
                                                defaultChecked={item.status}
                                            />
                                        </td>
                                        <td>
                                            <div className="flex gap-1.5">
                                                {/* Info Button */}
                                                <button className="btn btn-ghost btn-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={1.5}
                                                        stroke="currentColor"
                                                        className="w-3 h-3"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                                                        />
                                                    </svg>
                                                </button>
                                                {/* Edit Button */}
                                                <button className="btn btn-ghost btn-xs text-gray-600 hover:text-green-600 hover:bg-green-50 hover:border-green-200">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={1.5}
                                                        stroke="currentColor"
                                                        className="w-3 h-3"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                                                        />
                                                    </svg>
                                                </button>
                                                {/* Delete Button */}
                                                <button className="btn btn-ghost btn-xs text-red-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={1.5}
                                                        stroke="currentColor"
                                                        className="w-3 h-3"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                                        />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}