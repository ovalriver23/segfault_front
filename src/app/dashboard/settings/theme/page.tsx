"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePageTitle } from "../../layout";
import { useEffect } from "react";

type Theme = "DEFAULT" | "MODERN" | "ELEGANT";

export default function ThemePage() {
    const router = useRouter();
    const { setPageTitle } = usePageTitle();
    const [selectedTheme, setSelectedTheme] = useState<Theme>("DEFAULT");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        setPageTitle("Menü Teması");

        const fetchCurrentTheme = async () => {
            try {
                const res = await fetch("/api/manager/menu-theme", { cache: 'no-store' });
                if (res.ok) {
                    const data = await res.json();
                    if (data.theme) {
                        setSelectedTheme(data.theme as Theme);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch theme", error);
            }
        };

        fetchCurrentTheme();
    }, [setPageTitle]);

    const handleSave = async () => {
        setIsLoading(true);
        setMessage(null);

        try {
            const response = await fetch("/api/manager/menu-theme", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ theme: selectedTheme }),
            });

            if (response.ok) {
                setMessage({ type: "success", text: "Tema başarıyla güncellendi!" });
            } else {
                const errorData = await response.json().catch(() => ({}));
                setMessage({ type: "error", text: errorData.message || "Tema güncellenirken bir hata oluştu." });
            }
        } catch (error) {
            setMessage({ type: "error", text: "Bağlantı hatası." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            <div className="mb-8 flex items-center gap-4">
                <button onClick={() => router.back()} className="btn btn-circle btn-ghost btn-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m15 18-6-6 6-6" />
                    </svg>
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-text-500">Menü Teması</h1>
                    <p className="text-text-300">Restoranınızın dijital menü görünümünü seçin</p>
                </div>
            </div>

            {message && (
                <div className={`alert ${message.type === "success" ? "alert-success" : "alert-error"} mb-6 text-white`}>
                    <span>{message.text}</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* DEFAULT THEME */}
                <div
                    className={`card bg-base-100 shadow-xl cursor-pointer transition-all border-4 ${selectedTheme === "DEFAULT" ? "border-primary-500 scale-105" : "border-transparent hover:border-gray-200"}`}
                    onClick={() => setSelectedTheme("DEFAULT")}
                >
                    <figure className="h-48 bg-gray-100 flex items-center justify-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-white opacity-90 flex flex-col items-center justify-center p-4">
                            {/* Mock UI for Default */}
                            <div className="w-24 h-4 rounded bg-orange-400 mb-2"></div>
                            <div className="w-32 h-2 rounded bg-gray-200 mb-4"></div>
                            <div className="grid grid-cols-2 gap-2 w-full px-4">
                                <div className="h-16 bg-white shadow rounded"></div>
                                <div className="h-16 bg-white shadow rounded"></div>
                            </div>
                        </div>
                        <span className="badge badge-lg bg-white absolute bottom-4 shadow-sm text-gray-700">Önizleme</span>
                    </figure>
                    <div className="card-body p-6 text-center">
                        <h2 className="card-title justify-center text-gray-800">Varsayılan</h2>
                        <p className="text-sm text-gray-500">Standart, temiz ve kullanışlı arayüz.</p>
                        {selectedTheme === "DEFAULT" && <div className="badge badge-primary mt-2">Seçili</div>}
                    </div>
                </div>

                {/* MODERN THEME */}
                <div
                    className={`card bg-base-100 shadow-xl cursor-pointer transition-all border-4 ${selectedTheme === "MODERN" ? "border-primary-500 scale-105" : "border-transparent hover:border-gray-200"}`}
                    onClick={() => setSelectedTheme("MODERN")}
                >
                    <figure className="h-48 bg-gray-900 flex items-center justify-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[#1a1a1a] opacity-90 flex flex-col items-center justify-center p-4">
                            {/* Mock UI for Modern */}
                            <div className="w-24 h-4 rounded bg-[#ea580c] mb-2"></div>
                            <div className="w-32 h-2 rounded bg-[#f8a45a] mb-4"></div>
                            <div className="w-full px-4 flex flex-col gap-2">
                                <div className="h-12 bg-gray-800 rounded border border-gray-700 flex items-center px-2">
                                    <div className="w-8 h-8 rounded-full bg-gray-600"></div>
                                </div>
                                <div className="h-12 bg-gray-800 rounded border border-gray-700 flex items-center px-2">
                                    <div className="w-8 h-8 rounded-full bg-gray-600"></div>
                                </div>
                            </div>
                        </div>
                        <span className="badge badge-lg bg-gray-800 text-white border-none absolute bottom-4 shadow-sm">Önizleme</span>
                    </figure>
                    <div className="card-body p-6 text-center">
                        <h2 className="card-title justify-center text-gray-800">Modern</h2>
                        <p className="text-sm text-gray-500">Koyu mod, canlı renkler ve geniş kartlar.</p>
                        {selectedTheme === "MODERN" && <div className="badge badge-primary mt-2">Seçili</div>}
                    </div>
                </div>

                {/* ELEGANT THEME */}
                <div
                    className={`card bg-base-100 shadow-xl cursor-pointer transition-all border-4 ${selectedTheme === "ELEGANT" ? "border-primary-500 scale-105" : "border-transparent hover:border-gray-200"}`}
                    onClick={() => setSelectedTheme("ELEGANT")}
                >
                    <figure className="h-48 bg-[#f5f5dc] flex items-center justify-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[#f8f5f2] opacity-90 flex flex-col items-center justify-center p-4">
                            {/* Mock UI for Elegant */}
                            <div className="w-24 h-4 rounded bg-[#8b4513] mb-2 font-serif"></div>
                            <div className="w-32 h-2 rounded bg-[#d2b48c] mb-4"></div>
                            <div className="w-full px-6 text-center space-y-2">
                                <div className="border-b border-[#d2b48c] pb-1">
                                    <div className="h-2 w-full bg-[#e6dcc3] rounded"></div>
                                </div>
                                <div className="border-b border-[#d2b48c] pb-1">
                                    <div className="h-2 w-3/4 mx-auto bg-[#e6dcc3] rounded"></div>
                                </div>
                            </div>
                        </div>
                        <span className="badge badge-lg bg-[#f0e6d2] text-[#5c4033] border-none absolute bottom-4 shadow-sm">Önizleme</span>
                    </figure>
                    <div className="card-body p-6 text-center">
                        <h2 className="card-title justify-center text-gray-800">Elegant</h2>
                        <p className="text-sm text-gray-500">Şık, minimalist ve sofistike tasarım.</p>
                        {selectedTheme === "ELEGANT" && <div className="badge badge-primary mt-2">Seçili</div>}
                    </div>
                </div>

            </div>

            <div className="flex justify-end">
                <button
                    className="btn btn-primary bg-primary-500 hover:bg-primary-600 border-none text-white px-8"
                    onClick={handleSave}
                    disabled={isLoading}
                >
                    {isLoading ? <span className="loading loading-spinner"></span> : "Kaydet ve Uygula"}
                </button>
            </div>
        </div>
    );
}
