"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";

const pinIcon = L.divIcon({
  className: "",
  html: `<span style="display:block;width:14px;height:14px;border-radius:9999px;background:#000;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.35)"></span>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

interface TaskMapThumbnailProps {
  lat: number;
  lng: number;
  className?: string;
}

export function TaskMapThumbnail({ lat, lng, className = "" }: TaskMapThumbnailProps) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={14}
      className={className}
      style={{ width: "100%", height: "100%" }}
      zoomControl={false}
      dragging={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      touchZoom={false}
      boxZoom={false}
      keyboard={false}
      attributionControl={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[lat, lng]} icon={pinIcon} />
    </MapContainer>
  );
}
