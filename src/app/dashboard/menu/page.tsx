'use client';

import { useState, useEffect } from "react";
import Image from "next/image";

interface CategoryItem {
    id: number;
    name: string;
    menuItems: any[];
    restaurantId: string;
}

interface MenuItem {
    id: number;
    name: string;
    description: string | null;
    price: number;
    available: boolean;
    imageUrl: string | null;
    style: string | null;
}

interface CategoryWithItems {
    categoryId: number;
    categoryName: string;
    items: MenuItem[];
}

export default function Menu() {
    const [categories, setCategories] = useState<CategoryItem[]>([])
    const [menuItemsByCategory, setMenuItemsByCategory] = useState<CategoryWithItems[]>([])
    const [categoryForm, setCategoryForm] = useState("")
    const [categoryFormError, setCategoryFormError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingItems, setIsLoadingItems] = useState(false)
    const [fetchError, setFetchError] = useState("")
    const [fetchItemsError, setFetchItemsError] = useState("")

    // Edit category state
    const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null)
    const [editCategoryName, setEditCategoryName] = useState('')
    const [editCategoryError, setEditCategoryError] = useState('')

    // Alert state
    const [alertMessage, setAlertMessage] = useState('')
    const [showAlert, setShowAlert] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [showError, setShowError] = useState(false)

    // Menu item form state
    const [menuItemForm, setMenuItemForm] = useState({
        categoryId: '',
        name: '',
        description: '',
        price: ''
    })
    const [menuItemFormError, setMenuItemFormError] = useState('')

    // Edit menu item state
    const [editingMenuItem, setEditingMenuItem] = useState<MenuItem & { categoryId: number } | null>(null)
    const [editMenuItemForm, setEditMenuItemForm] = useState({
        categoryId: '',
        name: '',
        description: '',
        price: ''
    })
    const [editMenuItemError, setEditMenuItemError] = useState('')

    // View menu item detail state
    const [viewingMenuItem, setViewingMenuItem] = useState<MenuItem & { categoryId: number, categoryName: string } | null>(null)

    // Debounce timer for availability toggle
    const [debounceTimers, setDebounceTimers] = useState<Record<number, NodeJS.Timeout>>({})

    // Cleanup debounce timers on unmount
    useEffect(() => {
        return () => {
            Object.values(debounceTimers).forEach(timer => clearTimeout(timer));
        };
    }, [debounceTimers]);
    // Show alert with auto-hide
    const showSuccessAlert = (message: string) => {
        setAlertMessage(message)
        setShowAlert(true)
        setTimeout(() => {
            setShowAlert(false)
        }, 4000)
    }

    const showErrorAlert = (message: string) => {
        setErrorMessage(message)
        setShowError(true)
        setTimeout(() => {
            setShowError(false)
        }, 4000)
    }

    // Get all menu items flattened
    const allMenuItems = menuItemsByCategory.flatMap(cat =>
        cat.items.map(item => ({ ...item, categoryId: cat.categoryId, categoryName: cat.categoryName }))
    );

    // Filter menu items based on selected category
    const filteredMenuItems = selectedCategory
        ? allMenuItems.filter(item => item.categoryId === selectedCategory)
        : allMenuItems

    // Fetch categories and menu items on component mount
    useEffect(() => {
        fetchCategories();
        fetchMenuItems();
    }, []);

    const fetchCategories = async () => {
        try {
            setIsLoading(true);
            setFetchError('');
            const response = await fetch('/api/dashboard/menu/category', {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.message || 'Kategoriler yüklenirken bir hata oluştu';
                setFetchError(errorMessage);
                return;
            }

            const categories: CategoryItem[] = await response.json();
            setCategories(categories);
        } catch (error) {
            setFetchError('Bağlantı hatası. Lütfen sayfayı yenileyin.');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMenuItems = async () => {
        try {
            setIsLoadingItems(true);
            setFetchItemsError('');
            const response = await fetch('/api/dashboard/menu/item', {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.message || 'Menü öğeleri yüklenirken bir hata oluştu';
                setFetchItemsError(errorMessage);
                return;
            }

            const items: CategoryWithItems[] = await response.json();
            setMenuItemsByCategory(items);
        } catch (error) {
            setFetchItemsError('Bağlantı hatası. Lütfen sayfayı yenileyin.');
        } finally {
            setIsLoadingItems(false);
        }
    };






    // Modal handlers
    const openCategoryModal = () => {
        setCategoryForm('');
        (document.getElementById('Add_Category') as HTMLDialogElement)?.showModal();
    };
    const openMenuModal = () => {
        setMenuItemForm({
            categoryId: '',
            name: '',
            description: '',
            price: ''
        });
        setMenuItemFormError('');
        (document.getElementById('Add_Menu') as HTMLDialogElement)?.showModal();
    };

    const closeCategoryModal = () => {
        (document.getElementById('Add_Category') as HTMLDialogElement)?.close();
    };


    const closeMenuModal = () => {
        (document.getElementById('Add_Menu') as HTMLDialogElement)?.close();
        setMenuItemForm({
            categoryId: '',
            name: '',
            description: '',
            price: ''
        });
        setMenuItemFormError('');
    };

    const openEditCategoryModal = (category: CategoryItem) => {
        setEditingCategory(category);
        setEditCategoryName(category.name);
        setEditCategoryError('');
        (document.getElementById('Edit_Category') as HTMLDialogElement)?.showModal();
    };

    const closeEditCategoryModal = () => {
        (document.getElementById('Edit_Category') as HTMLDialogElement)?.close();
        setEditingCategory(null);
        setEditCategoryName('');
        setEditCategoryError('');
    };

    const openEditMenuItemModal = (item: MenuItem & { categoryId: number, categoryName: string }) => {
        setEditingMenuItem(item);
        setEditMenuItemForm({
            categoryId: '', // Not used in edit, but kept for form consistency
            name: item.name,
            description: item.description || '',
            price: item.price.toString()
        });
        setEditMenuItemError('');
        (document.getElementById('Edit_Menu_Item') as HTMLDialogElement)?.showModal();
    };

    const closeEditMenuItemModal = () => {
        (document.getElementById('Edit_Menu_Item') as HTMLDialogElement)?.close();
        setEditingMenuItem(null);
        setEditMenuItemForm({
            categoryId: '',
            name: '',
            description: '',
            price: ''
        });
        setEditMenuItemError('');
    };

    const openViewMenuItemModal = (item: MenuItem & { categoryId: number, categoryName: string }) => {
        setViewingMenuItem(item);
        (document.getElementById('View_Menu_Item') as HTMLDialogElement)?.showModal();
    };

    const closeViewMenuItemModal = () => {
        (document.getElementById('View_Menu_Item') as HTMLDialogElement)?.close();
        // Delay clearing state to allow modal close animation
        setTimeout(() => {
            setViewingMenuItem(null);
        }, 200);
    };


    // Add table handler
    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();

        const trimmedName = categoryForm.trim();
        if (!trimmedName) {
            setCategoryFormError('Kategori adı gereklidir');
            return;
        }

        setIsSubmitting(true);
        setCategoryFormError('');

        try {
            const response = await fetch('/api/dashboard/menu/category', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: trimmedName })
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle error responses
                const errorMessage = data.message || 'Kategori eklenirken bir hata oluştu';
                setCategoryFormError(errorMessage);
                return;
            }

            // Success - append new table to the list
            setCategories(prev => [...prev, {
                id: data.id,
                name: data.name,
                menuItems: [],
                restaurantId: data.restaurantId || ''
            }]);

            showSuccessAlert('Kategori başarıyla eklendi');
            closeCategoryModal();
        } catch (error) {
            setCategoryFormError('Bağlantı hatası. Lütfen tekrar deneyin.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditCategory = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingCategory) return;

        const trimmedName = editCategoryName.trim();
        if (!trimmedName) {
            setEditCategoryError('Kategori adı gereklidir');
            return;
        }

        setIsSubmitting(true);
        setEditCategoryError('');

        try {
            const response = await fetch(`/api/dashboard/menu/category?id=${editingCategory.id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: trimmedName })
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMessage = data.message || 'Kategori güncellenirken bir hata oluştu';
                setEditCategoryError(errorMessage);
                return;
            }

            // Success - update category in the list
            setCategories(prev => prev.map(cat =>
                cat.id === editingCategory.id ? {
                    ...cat,
                    name: data.name
                } : cat
            ));

            showSuccessAlert('Kategori başarıyla güncellendi');
            closeEditCategoryModal();
        } catch (error) {
            setEditCategoryError('Bağlantı hatası. Lütfen tekrar deneyin.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteCategory = async () => {
        if (!editingCategory) return;

        if (!confirm(`"${editingCategory.name}" kategorisini silmek istediğinizden emin misiniz? İçindeki tüm ürünler de silinecektir.`)) {
            return;
        }

        setIsSubmitting(true);
        setEditCategoryError('');

        try {
            const response = await fetch(`/api/dashboard/menu/category?id=${editingCategory.id}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMessage = data.message || 'Kategori silinirken bir hata oluştu';
                setEditCategoryError(errorMessage);
                return;
            }

            // Success - remove category from the list
            setCategories(prev => prev.filter(cat => cat.id !== editingCategory.id));

            // Clear selected category if it was deleted
            if (selectedCategory === editingCategory.id) {
                setSelectedCategory(null);
            }

            showSuccessAlert('Kategori başarıyla silindi');
            closeEditCategoryModal();
        } catch (error) {
            setEditCategoryError('Bağlantı hatası. Lütfen tekrar deneyin.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddMenuItem = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate required fields
        if (!menuItemForm.categoryId) {
            setMenuItemFormError('Kategori seçimi gereklidir');
            return;
        }

        const trimmedName = menuItemForm.name.trim();
        if (!trimmedName) {
            setMenuItemFormError('Ürün adı gereklidir');
            return;
        }

        const price = parseFloat(menuItemForm.price);
        if (isNaN(price) || price <= 0) {
            setMenuItemFormError('Geçerli bir fiyat giriniz');
            return;
        }

        setIsSubmitting(true);
        setMenuItemFormError('');

        try {
            const response = await fetch('/api/dashboard/menu/item', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: trimmedName,
                    description: menuItemForm.description.trim() || undefined,
                    price: price,
                    categoryId: parseInt(menuItemForm.categoryId),
                    imageUrl: null,
                    style: 'NONE'
                })
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMessage = data.message || 'Ürün eklenirken bir hata oluştu';
                setMenuItemFormError(errorMessage);
                return;
            }

            // Success - refresh menu items or add to list
            showSuccessAlert('Ürün başarıyla eklendi');
            closeMenuModal();

            // Refresh menu items list
            fetchMenuItems();
        } catch (error) {
            setMenuItemFormError('Bağlantı hatası. Lütfen tekrar deneyin.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle availability toggle with debouncing
    const handleAvailabilityToggle = async (itemId: number, currentAvailable: boolean) => {
        const newAvailable = !currentAvailable;

        // Clear existing timer for this item
        if (debounceTimers[itemId]) {
            clearTimeout(debounceTimers[itemId]);
        }

        // Optimistically update the UI
        setMenuItemsByCategory(prev =>
            prev.map(cat => ({
                ...cat,
                items: cat.items.map(item =>
                    item.id === itemId ? { ...item, available: newAvailable } : item
                )
            }))
        );

        // Set new debounced timer
        const timer = setTimeout(async () => {
            try {
                const response = await fetch(`/api/dashboard/menu/item?id=${itemId}`, {
                    method: 'PATCH',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ available: newAvailable })
                });

                if (!response.ok) {
                    // Revert on error
                    setMenuItemsByCategory(prev =>
                        prev.map(cat => ({
                            ...cat,
                            items: cat.items.map(item =>
                                item.id === itemId ? { ...item, available: currentAvailable } : item
                            )
                        }))
                    );

                    const errorData = await response.json().catch(() => ({}));
                    const errorMessage = errorData.message || 'Durum güncellenirken hata oluştu';
                    showErrorAlert(errorMessage);
                } else {
                    showSuccessAlert(newAvailable ? 'Ürün stokta olarak işaretlendi' : 'Ürün tükendi olarak işaretlendi');
                }
            } catch (error) {
                // Revert on error
                setMenuItemsByCategory(prev =>
                    prev.map(cat => ({
                        ...cat,
                        items: cat.items.map(item =>
                            item.id === itemId ? { ...item, available: currentAvailable } : item
                        )
                    }))
                );
                showErrorAlert('Bağlantı hatası oluştu');
            } finally {
                // Clean up the timer from state
                setDebounceTimers(prev => {
                    const newTimers = { ...prev };
                    delete newTimers[itemId];
                    return newTimers;
                });
            }
        }, 800); // 800ms debounce

        // Store the timer
        setDebounceTimers(prev => ({
            ...prev,
            [itemId]: timer
        }));
    };

    // Handle edit menu item
    const handleEditMenuItem = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingMenuItem) return;

        // Validate required fields
        const trimmedName = editMenuItemForm.name.trim();
        if (!trimmedName) {
            setEditMenuItemError('Ürün adı gereklidir');
            return;
        }

        const price = parseFloat(editMenuItemForm.price);
        if (isNaN(price) || price <= 0) {
            setEditMenuItemError('Geçerli bir fiyat giriniz');
            return;
        }

        setIsSubmitting(true);
        setEditMenuItemError('');

        try {
            const response = await fetch(`/api/dashboard/menu/item?id=${editingMenuItem.id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: trimmedName,
                    description: editMenuItemForm.description.trim() || undefined,
                    price: price,
                    imageUrl: editingMenuItem.imageUrl,
                    style: editingMenuItem.style || 'NONE',
                    available: editingMenuItem.available
                })
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMessage = data.message || 'Ürün güncellenirken bir hata oluştu';
                setEditMenuItemError(errorMessage);
                return;
            }

            // Success - refresh menu items
            showSuccessAlert('Ürün başarıyla güncellendi');
            closeEditMenuItemModal();
            fetchMenuItems();
        } catch (error) {
            setEditMenuItemError('Bağlantı hatası. Lütfen tekrar deneyin.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle delete menu item
    const handleDeleteMenuItem = async (itemId: number, itemName: string) => {
        if (!confirm(`"${itemName}" ürününü silmek istediğinizden emin misiniz?`)) {
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(`/api/dashboard/menu/item?id=${itemId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMessage = data.message || 'Ürün silinirken bir hata oluştu';
                showErrorAlert(errorMessage);
                return;
            }

            // Success - remove item from the list
            setMenuItemsByCategory(prev =>
                prev.map(cat => ({
                    ...cat,
                    items: cat.items.filter(item => item.id !== itemId)
                }))
            );

            showSuccessAlert('Ürün başarıyla silindi');
        } catch (error) {
            showErrorAlert('Bağlantı hatası. Lütfen tekrar deneyin.');
        } finally {
            setIsSubmitting(false);
        }
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
                        <li><button className="text-neutral-900 hover:bg-gray-100 rounded-lg text-base py-3" onClick={openCategoryModal} >Kategori</button></li>
                        <li><button className="text-neutral-900 hover:bg-gray-100 rounded-lg text-base py-3" onClick={openMenuModal}>Menü Öğesi</button></li>
                    </ul>
                </div>
            </div>

            {/* Adding CATEGORY Modal */}
            <dialog id="Add_Category" className="modal">
                <div className="modal-box bg-white rounded-xl shadow-xl p-6">
                    <form onSubmit={handleAddCategory} >
                        {/* Modal Header */}
                        <h3 className="font-bold text-2xl text-neutral-900 mb-6">Kategori Ekle</h3>

                        {/* Input Field */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Kategori Adı
                            </label>
                            <input
                                type="text"
                                placeholder="Kategori adını giriniz"
                                value={categoryForm}
                                onChange={(e) => setCategoryForm(e.target.value)}
                                className="input input-bordered text-text-500 w-full bg-white border-gray-300 focus:border-[#e63997] focus:outline-none focus:ring-2 focus:ring-[#e63997] focus:ring-opacity-20"
                            />
                            {categoryFormError && (
                                <p className="text-sm text-red-600 mt-2">{categoryFormError}</p>
                            )}
                        </div>

                        {/* Modal Action Buttons */}
                        <div className="modal-action mt-8">
                            <div className="flex gap-3 w-full">
                                {/* Cancel Button */}
                                <button
                                    disabled={isSubmitting}
                                    onClick={closeCategoryModal}
                                    type="button"
                                    className="btn flex-1 bg-white shadow-2xs border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg"
                                >
                                    İptal
                                </button>
                                {/* Add Button */}
                                <button
                                    disabled={isSubmitting}
                                    type="submit"
                                    className="btn shadow-sm flex-1 bg-[#e63997] hover:bg-[#d12e86] border-none text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Ekleniyor...' : 'Ekle'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button >close</button>
                </form>
            </dialog>


            {/* Adding Menu Item Modal */}
            <dialog id="Add_Menu" className="modal">
                <div className="modal-box bg-white rounded-xl shadow-xl p-6">
                    <form onSubmit={handleAddMenuItem}>
                        {/* Modal Header */}
                        <h3 className="font-bold text-2xl text-neutral-900 mb-6">Ürün Ekle</h3>

                        {/* Input Field */}
                        <div className="mb-6">
                            <label htmlFor="category_choose" className="block text-sm font-medium text-gray-700 mb-2">
                                Kategori
                            </label>
                            <select
                                id="category_choose"
                                value={menuItemForm.categoryId}
                                onChange={(e) => setMenuItemForm(prev => ({ ...prev, categoryId: e.target.value }))}
                                className="select bg-background-500 text-text-400 border-gray-300 mb-4 w-full"
                            >
                                <option value="">Kategori Seç</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ürün adı
                            </label>
                            <input
                                type="text"
                                placeholder="Ürün adını giriniz"
                                value={menuItemForm.name}
                                onChange={(e) => setMenuItemForm(prev => ({ ...prev, name: e.target.value }))}
                                className="input input-bordered text-text-500 w-full bg-white border-gray-300 focus:border-[#e63997] focus:outline-none focus:ring-2 focus:ring-[#e63997] focus:ring-opacity-20 mb-4"
                            />
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ürün Açıklaması
                            </label>
                            <input
                                maxLength={255}
                                type="text"
                                placeholder="Ürün açıklamasını giriniz"
                                value={menuItemForm.description}
                                onChange={(e) => setMenuItemForm(prev => ({ ...prev, description: e.target.value }))}
                                className="input input-bordered text-text-500 w-full bg-white border-gray-300 focus:border-[#e63997] focus:outline-none focus:ring-2 focus:ring-[#e63997] focus:ring-opacity-20 mb-4"
                            />
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Fiyat
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="Ürün Fiyatını giriniz"
                                value={menuItemForm.price}
                                onChange={(e) => setMenuItemForm(prev => ({ ...prev, price: e.target.value }))}
                                className="input input-bordered text-text-500 w-full bg-white border-gray-300 focus:border-[#e63997] focus:outline-none focus:ring-2 focus:ring-[#e63997] focus:ring-opacity-20"
                            />
                            {menuItemFormError && (
                                <p className="text-sm text-red-600 mt-2">{menuItemFormError}</p>
                            )}
                        </div>

                        {/* Modal Action Buttons */}
                        <div className="modal-action mt-8">
                            <div className="flex gap-3 w-full">
                                {/* Cancel Button */}
                                <button
                                    onClick={closeMenuModal}
                                    type="button"
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
                    <button>close</button>
                </form>
            </dialog>


            {/* View Menu Item Detail Modal */}
            <dialog id="View_Menu_Item" className="modal">
                {viewingMenuItem && (
                    <div className="modal-box bg-white rounded-xl shadow-xl p-6 max-w-2xl">
                        {/* Modal Header */}
                        <h3 className="font-bold text-2xl text-neutral-900 mb-6">Ürün Detayları</h3>

                        {/* Item Image */}
                        {viewingMenuItem.imageUrl ? (
                            <div className="mb-6 rounded-lg overflow-hidden bg-gray-100 relative h-64">
                                <Image 
                                    src={viewingMenuItem.imageUrl} 
                                    alt={viewingMenuItem.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        ) : (
                            <div className="mb-6 rounded-lg bg-gray-100 h-64 flex items-center justify-center">
                                <div className="text-center text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <p className="text-sm">Görsel bulunmuyor</p>
                                </div>
                            </div>
                        )}

                        {/* Item Details Grid */}
                        <div className="space-y-4">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Ürün Adı</label>
                                <p className="text-lg font-semibold text-gray-900">{viewingMenuItem.name}</p>
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Kategori</label>
                                <span className="badge badge-lg bg-orange-100 text-orange-600 border-none font-medium">
                                    {viewingMenuItem.categoryName}
                                </span>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Açıklama</label>
                                {viewingMenuItem.description ? (
                                    <p className="text-gray-700">{viewingMenuItem.description}</p>
                                ) : (
                                    <p className="text-gray-400 italic">Açıklama bulunmuyor</p>
                                )}
                            </div>

                            {/* Price and Availability */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Fiyat</label>
                                    <p className="text-xl font-bold text-gray-900">₺{viewingMenuItem.price.toFixed(2)}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Durum</label>
                                    {viewingMenuItem.available ? (
                                        <span className="badge badge-lg bg-green-100 text-green-700 border-none font-medium">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            Stokta
                                        </span>
                                    ) : (
                                        <span className="badge badge-lg bg-red-100 text-red-700 border-none font-medium">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                            Tükendi
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Style */}
                            {viewingMenuItem.style && viewingMenuItem.style !== 'NONE' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Stil</label>
                                    <p className="text-gray-700">{viewingMenuItem.style}</p>
                                </div>
                            )}
                        </div>

                        {/* Modal Actions */}
                        <div className="modal-action mt-8">
                            <button
                                onClick={closeViewMenuItemModal}
                                className="btn bg-white shadow-2xs border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg"
                            >
                                Kapat
                            </button>
                        </div>
                    </div>
                )}
                <form method="dialog" className="modal-backdrop">
                    <button onClick={closeViewMenuItemModal}>close</button>
                </form>
            </dialog>

            {/* Edit Menu Item Modal */}
            <dialog id="Edit_Menu_Item" className="modal">
                <div className="modal-box bg-white rounded-xl shadow-xl p-6">
                    <form onSubmit={handleEditMenuItem}>
                        {/* Modal Header */}
                        <h3 className="font-bold text-2xl text-neutral-900 mb-6">Ürün Düzenle</h3>

                        {/* Input Fields */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ürün adı
                            </label>
                            <input
                                type="text"
                                placeholder="Ürün adını giriniz"
                                value={editMenuItemForm.name}
                                onChange={(e) => setEditMenuItemForm(prev => ({ ...prev, name: e.target.value }))}
                                className="input input-bordered text-text-500 w-full bg-white border-gray-300 focus:border-[#e63997] focus:outline-none focus:ring-2 focus:ring-[#e63997] focus:ring-opacity-20 mb-4"
                            />
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ürün Açıklaması
                            </label>
                            <input
                                maxLength={255}
                                type="text"
                                placeholder="Ürün açıklamasını giriniz"
                                value={editMenuItemForm.description}
                                onChange={(e) => setEditMenuItemForm(prev => ({ ...prev, description: e.target.value }))}
                                className="input input-bordered text-text-500 w-full bg-white border-gray-300 focus:border-[#e63997] focus:outline-none focus:ring-2 focus:ring-[#e63997] focus:ring-opacity-20 mb-4"
                            />
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Fiyat
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="Ürün Fiyatını giriniz"
                                value={editMenuItemForm.price}
                                onChange={(e) => setEditMenuItemForm(prev => ({ ...prev, price: e.target.value }))}
                                className="input input-bordered text-text-500 w-full bg-white border-gray-300 focus:border-[#e63997] focus:outline-none focus:ring-2 focus:ring-[#e63997] focus:ring-opacity-20"
                            />
                            {editMenuItemError && (
                                <p className="text-sm text-red-600 mt-2">{editMenuItemError}</p>
                            )}
                        </div>

                        {/* Modal Action Buttons */}
                        <div className="modal-action mt-8">
                            <div className="flex justify-end items-center w-full">
                                <div className="flex items-end justify-end gap-3">
                                    {/* Cancel Button */}
                                    <button
                                        type="button"
                                        onClick={closeEditMenuItemModal}
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
                    <button onClick={closeEditMenuItemModal}>close</button>
                </form>
            </dialog>

            {/* Edit Category Modal */}
            <dialog id="Edit_Category" className="modal">
                <div className="modal-box bg-white rounded-xl shadow-xl p-6">
                    <form onSubmit={handleEditCategory}>
                        {/* Modal Header */}
                        <h3 className="font-bold text-2xl text-neutral-900 mb-6">Kategori Düzenle</h3>

                        {/* Input Field */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Kategori Adı
                            </label>
                            <input
                                type="text"
                                placeholder="Kategori adını giriniz"
                                value={editCategoryName}
                                onChange={(e) => setEditCategoryName(e.target.value)}
                                className="input input-bordered text-text-500 w-full bg-white border-gray-300 focus:border-[#e63997] focus:outline-none focus:ring-2 focus:ring-[#e63997] focus:ring-opacity-20"
                            />
                            {editCategoryError && (
                                <p className="text-sm text-red-600 mt-2">{editCategoryError}</p>
                            )}
                        </div>

                        {/* Modal Action Buttons */}
                        <div className="modal-action mt-8">
                            <div className="flex justify-between items-center w-full">
                                {/* Delete Button */}
                                <div className="tooltip tooltip-right" data-tip="Kategoriyi Sil">
                                    <button
                                        type="button"
                                        onClick={handleDeleteCategory}
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
                                        onClick={closeEditCategoryModal}
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
                    <button onClick={closeEditCategoryModal}>close</button>
                </form>
            </dialog>


            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-6 mr-6">
                {/* Left Side - Phone Mockup */}
                <div className="flex flex-col items-center gap-2">
                    {/* Phone Mockup */}
                    <div className="mockup-phone border-primary scale-80 -mt-24">
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

                    {/* Category Filter Section */}
                    <div className="mb-4 pb-4 border-b border-gray-200 overflow-hidden">
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <div key="skeleton-1" className="skeleton h-10 w-24 bg-gray-200"></div>
                                <div key="skeleton-2" className="skeleton h-10 w-32 bg-gray-200"></div>
                                <div key="skeleton-3" className="skeleton h-10 w-28 bg-gray-200"></div>
                            </div>
                        ) : fetchError ? (
                            <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm">{fetchError}</span>
                            </div>
                        ) : (
                            <div className="carousel carousel-center rounded-box gap-2 p-2 w-full max-w-full">
                                <div className="carousel-item">
                                    <button
                                        onClick={() => setSelectedCategory(null)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${selectedCategory === null
                                            ? 'bg-[#e63997] text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        Tümü ({allMenuItems.length})
                                    </button>
                                </div>
                                {categories.map((category) => {
                                    const count = allMenuItems.filter(
                                        item => item.categoryId === category.id
                                    ).length;
                                    return (
                                        <div key={category.id} className="carousel-item">
                                            <div className="indicator group">
                                                {/* Edit Button Indicator */}
                                                <div className="indicator-item indicator-top mt-1 indicator-end opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openEditCategoryModal(category);
                                                        }}
                                                        className="btn btn-xs p-1 h-6 min-h-6 w-6 bg-white hover:bg-gray-50 border border-gray-300 rounded-full shadow-sm"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" className="text-gray-700">
                                                            <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83l3.75 3.75z" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => setSelectedCategory(category.id)}
                                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${selectedCategory === category.id
                                                        ? 'bg-[#e63997] text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {category.name} ({count})
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Menu Items Table */}
                    <div className="overflow-x-auto">
                        {isLoadingItems ? (
                            <div className="flex flex-col gap-2 py-4">
                                <div className="skeleton h-12 w-full bg-gray-200"></div>
                                <div className="skeleton h-12 w-full bg-gray-200"></div>
                                <div className="skeleton h-12 w-full bg-gray-200"></div>
                            </div>
                        ) : fetchItemsError ? (
                            <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm">{fetchItemsError}</span>
                            </div>
                        ) : filteredMenuItems.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <p>Henüz menü öğesi bulunmamaktadır.</p>
                            </div>
                        ) : (
                            <table className="table table-lg  ">
                                {/* Table Head */}
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="text-[0.78rem] font-semibold text-gray-600 uppercase">Ürün Adı</th>
                                        <th className="text-[0.78rem] font-semibold text-gray-600 uppercase">Kategori</th>
                                        <th className="text-[0.78rem] font-semibold text-gray-600 uppercase">Fiyat</th>
                                        <th className="text-[0.78rem] font-semibold text-gray-600 uppercase">Mevcut</th>
                                        <th className="text-[0.78rem] font-semibold text-gray-600 uppercase pl-11">İşlemler</th>
                                    </tr>
                                </thead>
                                {/* Table Body */}
                                <tbody>
                                    {filteredMenuItems.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="text-[0.9375rem] text-gray-900 font-medium">{item.name}</td>
                                            <td>
                                                <span className="badge badge-sm bg-orange-100 text-orange-600 border-none font-medium">
                                                    {item.categoryName}
                                                </span>
                                            </td>
                                            <td className="text-[0.9375rem] text-gray-900 font-medium">₺{item.price.toFixed(2)}</td>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    className="toggle toggle-sm border-gray-400  text-gray-500 checked:border-secondary-500 checked:bg-secondary-400 checked:text-secondary-800"
                                                    checked={item.available}
                                                    onChange={() => handleAvailabilityToggle(item.id, item.available)}
                                                />
                                            </td>
                                            <td>
                                                <div className="flex gap-1.5">
                                                    {/* Info Button */}
                                                    <button 
                                                        onClick={() => openViewMenuItemModal(item)}
                                                        className="btn btn-ghost btn-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth={1.5}
                                                            stroke="currentColor"
                                                            className="w-3.75 h-3.75"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                                                            />
                                                        </svg>
                                                    </button>
                                                    {/* Edit Button */}
                                                    <button
                                                        onClick={() => openEditMenuItemModal(item)}
                                                        className="btn btn-ghost btn-sm text-gray-600 hover:text-green-600 hover:bg-green-50 hover:border-green-200">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth={1.5}
                                                            stroke="currentColor"
                                                            className="w-3.75 h-3.75"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                                                            />
                                                        </svg>
                                                    </button>
                                                    {/* Delete Button */}
                                                    <button
                                                        onClick={() => handleDeleteMenuItem(item.id, item.name)}
                                                        disabled={isSubmitting}
                                                        className="btn btn-ghost btn-sm text-red-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth={1.5}
                                                            stroke="currentColor"
                                                            className="w-3.75 h-3.75"
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
                        )}
                    </div>
                </div>
            </div>

            {/* Success Alert Toast */}
            {showAlert && (
                <div className="toast toast-end toast-bottom z-50">
                    <div className="alert alert-success shadow-lg">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 shrink-0 stroke-current"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <span>{alertMessage}</span>
                    </div>
                </div>
            )}

            {/* Error Alert Toast */}
            {showError && (
                <div className="toast toast-end toast-bottom z-50">
                    <div className="alert alert-error shadow-lg">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 shrink-0 stroke-current"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <span>{errorMessage}</span>
                    </div>
                </div>
            )}
        </div>
    );
}