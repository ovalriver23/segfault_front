"use client";

import React from "react";
import DatePicker from "react-datepicker";
import { tr } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";

interface CustomDatePickerProps {
    selected: Date | null;
    onChange: (date: Date | null) => void;
    placeholderText?: string;
    className?: string;
}

export default function CustomDatePicker({
    selected,
    onChange,
    placeholderText = "Tarih seçin",
    className = "",
}: CustomDatePickerProps) {
    return (
        <div className="custom-datepicker-wrapper">
            <DatePicker
                selected={selected}
                onChange={onChange}
                dateFormat="dd.MM.yyyy"
                locale={tr}
                placeholderText={placeholderText}
                className={`px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-colors w-full ${className}`}
                calendarClassName="custom-calendar"
                wrapperClassName="w-full"
            />
        </div>
    );
}
