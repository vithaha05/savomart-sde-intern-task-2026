import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axiosInstance from '../api/axios';

// Fix default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, zoom || 13);
  }, [center, zoom, map]);
  return null;
}

const purpleIcon = new L.DivIcon({
  html: `<div style="width:32px;height:32px;border-radius:50%;background:#782B90;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:16px;">🏪</div>`,
  iconSize: [32, 32], iconAnchor: [16, 16]
});

const nearestIcon = new L.DivIcon({
  html: `<div style="width:36px;height:36px;border-radius:50%;background:#FFF200;border:3px solid #782B90;box-shadow:0 2px 8px rgba(120,43,144,0.4);display:flex;align-items:center;justify-content:center;font-size:18px;">⭐</div>`,
  iconSize: [36, 36], iconAnchor: [18, 18]
});

export default function StoresPage() {
  const [viewMode, setViewMode] = useState('list');
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([12.9716, 77.5946]);
  const [mapZoom, setMapZoom] = useState(12);

  const { data: stores = [], isLoading } = useQuery({
    queryKey: ['stores'],
    queryFn: () => axiosInstance.get('/stores').then(r => r.data),
  });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setMapCenter([loc.lat, loc.lng]);
        setMapZoom(13);
      },
      () => {}, // ignore error
      { enableHighAccuracy: true }
    );
  }, []);

  const processedStores = stores.map(store => ({
    ...store,
    distance_km: userLocation ? haversineDistance(userLocation.lat, userLocation.lng, store.lat, store.lng) : store.distance_km
  }));

  const sortedStores = [...processedStores].sort((a, b) => (a.distance_km || 999) - (b.distance_km || 999));
  const nearestId = sortedStores[0]?.id;

  return (
    <div style={{ paddingBottom: '24px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#782B90', marginBottom: '4px' }}>Find Stores</h1>
      <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '16px' }}>{stores.length} Savomart stores</p>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button onClick={() => setViewMode('list')} style={{ padding: '8px 20px', borderRadius: '20px', fontWeight: '600', background: viewMode === 'list' ? '#782B90' : '#f3e8f7', color: viewMode === 'list' ? 'white' : '#782B90', border: 'none' }}>📋 List</button>
        <button onClick={() => setViewMode('map')} style={{ padding: '8px 20px', borderRadius: '20px', fontWeight: '600', background: viewMode === 'map' ? '#782B90' : '#f3e8f7', color: viewMode === 'map' ? 'white' : '#782B90', border: 'none' }}>🗺️ Map</button>
      </div>

      {viewMode === 'map' && (
        <div style={{ height: '460px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #f0e6f5', position: 'relative' }}>
          <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapController center={mapCenter} zoom={mapZoom} />
            {userLocation && <Marker position={[userLocation.lat, userLocation.lng]} />}
            {processedStores.map(store => (
              <Marker 
                key={store.id} 
                position={[store.lat, store.lng]} 
                icon={store.id === nearestId ? nearestIcon : purpleIcon}
              >
                <Popup>
                  <strong>{store.name}</strong><br />
                  {store.address}<br />
                  {store.distance_km && `${store.distance_km.toFixed(1)} km`}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          <button onClick={() => navigator.geolocation.getCurrentPosition(p => {
            const loc = { lat: p.coords.latitude, lng: p.coords.longitude };
            setUserLocation(loc);
            setMapCenter([loc.lat, loc.lng]);
            setMapZoom(14);
          })} 
            style={{ position: 'absolute', bottom: '16px', right: '16px', padding: '8px 16px', background: 'white', border: '1px solid #f0e6f5', borderRadius: '20px', fontWeight: '600', zIndex: 1000 }}>
            📍 Locate me
          </button>
        </div>
      )}
    </div>
  );
}
