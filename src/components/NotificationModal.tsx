/**
 * NotificationModal - Simple notification/alert modal using DaisyUI
 * 
 * Replaces browser alert() with a styled modal
 */

"use client";

import React from "react";

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface NotificationModalProps {
    modalId: string;
    type: NotificationType;
    title?: string;
    message: string;
    onClose?: () => void;
}

const typeConfig: Record<NotificationType, { icon: React.ReactNode; titleColor: string; iconBg: string }> = {
    success: {
        titleColor: 'text-green-600',
        iconBg: 'bg-green-100',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
        )
    },
    error: {
        titleColor: 'text-red-600',
        iconBg: 'bg-red-100',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        )
    },
    warning: {
        titleColor: 'text-orange-600',
        iconBg: 'bg-orange-100',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        )
    },
    info: {
        titleColor: 'text-blue-600',
        iconBg: 'bg-blue-100',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )
    }
};

const defaultTitles: Record<NotificationType, string> = {
    success: 'Başarılı',
    error: 'Hata',
    warning: 'Uyarı',
    info: 'Bilgi'
};

export default function NotificationModal({
    modalId,
    type,
    title,
    message,
    onClose
}: NotificationModalProps) {
    const config = typeConfig[type];
    const displayTitle = title || defaultTitles[type];

    const handleClose = () => {
        const modal = document.getElementById(modalId) as HTMLDialogElement;
        modal?.close();
        onClose?.();
    };

    return (
        <dialog id={modalId} className="modal modal-bottom sm:modal-middle">
            <div className="modal-box bg-white max-w-sm mx-auto">
                <div className="flex flex-col items-center text-center py-4">
                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-full ${config.iconBg} flex items-center justify-center mb-4`}>
                        {config.icon}
                    </div>

                    {/* Title */}
                    <h3 className={`text-xl font-bold ${config.titleColor} mb-2`}>
                        {displayTitle}
                    </h3>

                    {/* Message */}
                    <p className="text-gray-600">
                        {message}
                    </p>
                </div>

                <div className="modal-action justify-center">
                    <button
                        onClick={handleClose}
                        className="btn bg-pink-500 hover:bg-pink-600 text-white border-none px-8"
                    >
                        Tamam
                    </button>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>
    );
}

// Helper function to show the notification modal
export function showNotification(modalId: string) {
    const modal = document.getElementById(modalId) as HTMLDialogElement;
    modal?.showModal();
}
