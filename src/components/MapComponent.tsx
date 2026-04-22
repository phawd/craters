import { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MAP_PROVIDERS, PELHAM_RANGE_CENTER } from '../constants';
import { Crater } from '../types';

// Fix for default marker icons in React-Leaflet
const markerIcon = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const markerShadow = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapComponentProps {
  craters: Crater[];
  center: [number, number];
  zoom: number;
  onAreaChange: (lat: number, lng: number, zoom: number) => void;
  onMarkerAdd: (lat: number, lng: number) => void;
}

function MapUpdater({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useMemo(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

function MapEvents({ onAreaChange, onMarkerAdd }: { onAreaChange: (lat: number, lng: number, zoom: number) => void, onMarkerAdd: (lat: number, lng: number) => void }) {
  const map = useMapEvents({
    moveend: () => {
      const center = map.getCenter();
      onAreaChange(center.lat, center.lng, map.getZoom());
    },
    dblclick: (e) => {
      onMarkerAdd(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

export default function MapComponent({ craters, center, zoom, onAreaChange, onMarkerAdd }: MapComponentProps) {
  return (
    <MapContainer 
      center={center} 
      zoom={zoom} 
      className="w-full h-full"
      zoomControl={true}
      doubleClickZoom={false}
    >
      <TileLayer
        attribution='&copy; ESRI World Imagery'
        url={MAP_PROVIDERS.SATELLITE}
      />
      
      <MapUpdater center={center} zoom={zoom} />
      <MapEvents onAreaChange={onAreaChange} onMarkerAdd={onMarkerAdd} />

      {craters.map((crater) => (
        <Marker key={crater.id} position={[crater.lat, crater.lng]}>
          <Popup pointerEvents="auto">
            <div className="p-2 min-w-[200px]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-[#8C2F1E]" />
                <h3 className="font-serif italic font-bold text-sm">Anomaly recorded</h3>
              </div>
              <p className="text-[11px] leading-relaxed opacity-70 border-l border-[#D9D7D2] pl-3 mb-3">{crater.description}</p>
              <div className="flex justify-between items-center text-[9px] font-mono opacity-40 uppercase tracking-widest border-t border-[#D9D7D2] pt-2">
                <span>Lat: {crater.lat.toFixed(4)}</span>
                <span>Lng: {crater.lng.toFixed(4)}</span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
