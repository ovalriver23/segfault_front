"use client";

import { useMemo } from "react";
import { CircleMarker, MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

interface LocationPickerProps {
  latitude: string;
  longitude: string;
  onChange: (lat: string, lng: string) => void;
}

const ClickHandler = ({ onChange }: { onChange: (lat: string, lng: string) => void }) => {
  useMapEvents({
    click: (e) => {
      onChange(e.latlng.lat.toFixed(6), e.latlng.lng.toFixed(6));
    },
  });

  return null;
};

const LocationPicker = ({ latitude, longitude, onChange }: LocationPickerProps) => {
  const hasLocation =
    latitude !== "" &&
    longitude !== "" &&
    !Number.isNaN(Number(latitude)) &&
    !Number.isNaN(Number(longitude));

  const center = useMemo<LatLngExpression>(() => {
    if (hasLocation) {
      return [Number(latitude), Number(longitude)];
    }
    // Default to Istanbul if no location picked yet
    return [40.8079, 29.3560];
  }, [hasLocation, latitude, longitude]);

  return (
    <div className="h-80 w-full overflow-hidden rounded-2xl border border-orange-200 bg-orange-50 shadow-inner">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap"
        />
        <ClickHandler onChange={onChange} />
        {hasLocation && (
          <CircleMarker
            center={[Number(latitude), Number(longitude)]}
            radius={10}
            pathOptions={{ color: "#E11383", fillColor: "#E11383", fillOpacity: 0.8 }}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default LocationPicker;
