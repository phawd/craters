import { useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { MAP_PROVIDERS, PELHAM_RANGE_CENTER } from '../constants';
import { Crater } from '../types';

// Cluster styles
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

// Custom marker icon with confidence ring
const getConfidenceIcon = (confidence: number) => {
  const color = 
    confidence > 0.75 ? '#22C55E' : // Success (Green)
    confidence > 0.4 ? '#EAB308' :  // Warning (Yellow)
    '#EF4444';                      // Danger (Red)

  const opacity = 0.2 + (confidence * 0.8);

  return L.divIcon({
    html: `
      <div class="relative w-10 h-10 -translate-x-1/4 -translate-y-1/4">
        <div class="absolute inset-0 rounded-full border-2" style="border-color: ${color}; opacity: ${opacity}; transform: scale(${1 + (1 - confidence)}); transition: all 0.5s ease;"></div>
        <div class="absolute inset-[15px] rounded-full bg-[#1A1A1A] border-2 border-white shadow-lg"></div>
        <div class="absolute inset-[18px] rounded-full" style="background-color: ${color}"></div>
      </div>
    `,
    className: 'confidence-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });
};

// Custom cluster icon generator
const createClusterCustomIcon = (cluster: any) => {
  return L.divIcon({
    html: `<div class="flex items-center justify-center w-10 h-10 rounded-full bg-[#8C2F1E] text-white font-serif italic text-xs shadow-xl border border-white/20">
            ${cluster.getChildCount()}
          </div>`,
    className: 'custom-marker-cluster',
    iconSize: L.point(40, 40, true),
  });
};

interface MapComponentProps {
  craters: Crater[];
  center: [number, number];
  zoom: number;
  onAreaChange: (lat: number, lng: number, zoom: number) => void;
  onMarkerAdd: (lat: number, lng: number) => void;
  provider: string;
}

/** 
 * MapUpdater: Handles programmatic movement (e.g. from search results or findings list)
 * while avoiding interference with manual user interaction.
 */
function MapUpdater({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();

  useEffect(() => {
    const currentCenter = map.getCenter();
    const currentZoom = map.getZoom();
    
    // Check if we are already broadly at the target to avoid redundant snaps
    const isSameCenter = Math.abs(currentCenter.lat - center[0]) < 0.0001 && Math.abs(currentCenter.lng - center[1]) < 0.0001;
    const isSameZoom = currentZoom === zoom;

    if (!isSameCenter || !isSameZoom) {
      map.setView(center, zoom, { animate: true });
    }
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

export default function MapComponent({ craters, center, zoom, onAreaChange, onMarkerAdd, provider }: MapComponentProps) {
  return (
    <MapContainer 
      center={center} 
      zoom={zoom} 
      className="w-full h-full"
      zoomControl={true}
      doubleClickZoom={false}
      dragging={true}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; ESRI & USGS'
        url={provider}
        key={provider}
      />
      
      <MapUpdater center={center} zoom={zoom} />
      <MapEvents onAreaChange={onAreaChange} onMarkerAdd={onMarkerAdd} />

      {/* Circle Overlays for context/sizing */}
      {craters.map((crater) => (
        <Circle 
          key={`circle-${crater.id}`}
          center={[crater.lat, crater.lng]}
          radius={crater.radius_meters || (crater.type === 'impact' ? 15 : 25)}
          pathOptions={{
            color: crater.confidence > 0.75 ? '#22C55E' : '#8C2F1E',
            fillColor: crater.confidence > 0.75 ? '#22C55E' : '#8C2F1E',
            fillOpacity: 0.1,
            weight: 1,
            dashArray: '5, 5'
          }}
        />
      ))}

      <MarkerClusterGroup
        chunkedLoading
        iconCreateFunction={createClusterCustomIcon}
        maxClusterRadius={50}
      >
        {craters.map((crater) => (
          <Marker 
            key={crater.id} 
            position={[crater.lat, crater.lng]}
            icon={getConfidenceIcon(crater.confidence || 0.5)}
          >
            <Popup pointerEvents="auto">
              <div className="p-2 min-w-[200px]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: crater.confidence > 0.75 ? '#22C55E' : '#8C2F1E' }} 
                    />
                    <h3 className="font-serif italic font-bold text-sm">
                      {crater.type === 'impact' ? 'Impact Signature' : 'Anomaly'}
                    </h3>
                  </div>
                  <span className="text-[8px] font-mono font-bold uppercase tracking-widest opacity-40">
                    {(crater.confidence * 100).toFixed(0)}% Conf
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed opacity-70 border-l border-[#D9D7D2] pl-3 mb-2">
                  {crater.description}
                </p>
                <div className="flex items-center justify-between text-[9px] font-mono opacity-40 uppercase tracking-widest border-t border-[#D9D7D2] pt-2 mt-1">
                  <span>Ø {crater.radius_meters || (crater.type === 'impact' ? 15 : 25)}m</span>
                  <div className="flex gap-2">
                    <span>{crater.lat.toFixed(4)}</span>
                    <span>{crater.lng.toFixed(4)}</span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
