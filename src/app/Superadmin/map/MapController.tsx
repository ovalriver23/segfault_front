'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

interface MapControllerProps {
    center: [number, number] | null;
    zoom: number;
}

export default function MapController({ center, zoom }: MapControllerProps) {
    const map = useMap();

    useEffect(() => {
        if (center) {
            map.flyTo(center, zoom, { duration: 1 });
        }
    }, [center, zoom, map]);

    return null;
}
