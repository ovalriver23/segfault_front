'use client';

import { useEffect } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';

interface MapClickHandlerProps {
    onMapClick: (lat: number, lng: number) => void;
    center: [number, number];
}

export default function MapClickHandler({ onMapClick, center }: MapClickHandlerProps) {
    const map = useMap();

    // Update map center when props change
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);

    // Handle map click events
    useMapEvents({
        click(e) {
            onMapClick(e.latlng.lat, e.latlng.lng);
        },
    });

    return null;
}
