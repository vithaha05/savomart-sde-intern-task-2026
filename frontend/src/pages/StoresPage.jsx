import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axiosInstance from '../api/axios';

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
  useEffect(() => { if (center) map.setView(center, zoom || 12); }, [center, zoom, map]);
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
  const [mapCenter, setMapCenter] = useState([11.0168, 76.9558]); // Coimbatore default
  const [mapZoom, setMapZoom] = useState(12);

  const { data: stores = [], isLoading } = useQuery({
    queryKey: ['stores'],
    queryFn: () => axiosInstance.get('/stores').then(r => r.data),
  });

  // Try to get location silently
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setMapCenter([loc.lat, loc.lng]);
        setMapZoom(13);
      },
      () => {}, // silent fail - use Coimbatore default
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  const processedStores = stores.map(store => ({
    ...store,
    distance_km: userLocation 
      ? haversineDistance(userLocation.lat, userLocation.lng, store.lat, store.lng) 
      : (store.distance_km || 5)
  }));

  const sortedStores = [...processedStores].sort((a, b) => a.distance_km - b.distance_km);
  const nearestId = sortedStores[0]?.id;

  const handleLocateMe = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setMapCenter([loc.lat, loc.lng]);
        setMapZoom(14);
      },
      (err) => alert("Location access blocked. Please allow it in browser settings."),
      { enableHighAccuracy: true }
    );
  };

  return (
    <div style={{ paddingBottom: '24px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#782B90', marginBottom: '4px' }}>Find Stores</h1>
      <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '16px' }}>{stores.length} Savomart stores</p>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button onClick={() => setViewMode('list')} style={{ padding: '8px 20px', borderRadius: '20px', fontWeight: viewMode === 'list' ? '700' : '600', background: viewMode === 'list' ? '#782B90' : '#f3e8f7', color: viewMode === 'list' ? 'white' : '#782B90', border: 'none' }}>📋 List</button>
        <button onClick={() => setViewMode('map')} style={{ padding: '8px 20px', borderRadius: '20px', fontWeight: viewMode === 'map' ? '700' : '600', background: viewMode === 'map' ? '#782B90' : '#f3e8f7', color: viewMode === 'map' ? 'white' : '#782B90', border: 'none' }}>🗺️ Map</button>
      </div>

      {/* LIST VIEW */}
      {viewMode === 'list' && (
        <div>
          {sortedStores.map(store => {
            const isNearest = store.id === nearestId;
            return (
              <div key={store.id} style={{
                background: 'white',
                borderRadius: '12px',
                border: isNearest ? '2px solid #FFF200' : '1px solid #f0e6f5',
                padding: '16px',
                marginBottom: '12px'
              }}>
                <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '6px' }}>
                  {store.name} {isNearest && '⭐ Nearest'}
                </div>
                <div style={{ fontSize: '13px', color: '#6b7280' }}>
                  {store.address}, {store.city}
                </div>
                {store.distance_km && (
                  <div style={{ marginTop: '8px', fontSize: '13px', fontWeight: '600', color: '#166534' }}>
                    📍 {store.distance_km.toFixed(1)} km away
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MAP VIEW */}
      {viewMode === 'map' && (
        <div style={{ height: '480px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #f0e6f5', position: 'relative' }}>
          <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
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

          <button 
            onClick={handleLocateMe}
            style={{ 
              position: 'absolute', bottom: '16px', right: '16px', padding: '10px 16px', 
              background: 'white', border: '1px solid #f0e6f5', borderRadius: '20px', 
              fontWeight: '700', zIndex: 1000, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' 
            }}
          >
            📍 Locate me
          </button>
        </div>
      )}
    </div>
  );
}
