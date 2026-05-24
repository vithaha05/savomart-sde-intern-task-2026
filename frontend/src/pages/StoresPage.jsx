import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axiosInstance from '../api/axios';

// Fix Leaflet default icon paths broken by bundlers
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
  useEffect(() => { if (center) map.setView(center, zoom || 13, { animate: true }); }, [center, zoom, map]);
  return null;
}

const purpleIcon = new L.DivIcon({
  className: '',
  html: `<div style="width:28px;height:28px;border-radius:50%;background:#782B90;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:12px;">🏪</div>`,
  iconSize: [28, 28], iconAnchor: [14, 14], popupAnchor: [0, -16],
});

const nearestIcon = new L.DivIcon({
  className: '',
  html: `<div style="width:34px;height:34px;border-radius:50%;background:#FFF200;border:2px solid #782B90;box-shadow:0 2px 8px rgba(120,43,144,0.4);display:flex;align-items:center;justify-content:center;font-size:14px;">⭐</div>`,
  iconSize: [34, 34], iconAnchor: [17, 17], popupAnchor: [0, -18],
});

const userIcon = new L.DivIcon({
  className: '',
  html: `<div style="width:16px;height:16px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 2px 6px rgba(59,130,246,0.5);"></div>`,
  iconSize: [16, 16], iconAnchor: [8, 8],
});

export default function StoresPage() {
  const [viewMode, setViewMode] = useState('list');
  const [userLocation, setUserLocation] = useState(null);
  const [geoStatus, setGeoStatus] = useState('prompt');
  const [mapCenter, setMapCenter] = useState([12.9716, 77.5946]);
  const [mapZoom, setMapZoom] = useState(12);

  const { data: stores = [], isLoading, error } = useQuery({
    queryKey: ['stores'],
    queryFn: () => axiosInstance.get('/stores').then(r => r.data),
  });

  useEffect(() => {
    if (!navigator.geolocation) { setGeoStatus('error'); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(c); setGeoStatus('granted');
        setMapCenter([c.lat, c.lng]); setMapZoom(13);
      },
      (err) => { setGeoStatus(err.code === 1 ? 'denied' : 'error'); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    if (stores.length > 0 && !userLocation) setMapCenter([stores[0].lat, stores[0].lng]);
  }, [stores, userLocation]);

  const processedStores = stores.map(store => {
    const dist = userLocation ? haversineDistance(userLocation.lat, userLocation.lng, store.lat, store.lng) : store.distance_km;
    return { ...store, distance_km: dist };
  });

  const sortedStores = [...processedStores].sort((a, b) =>
    userLocation ? (a.distance_km||999) - (b.distance_km||999) : 0
  );

  const nearestId = userLocation && sortedStores.length > 0 ? sortedStores[0].id : null;

  const handleLocateMe = () => {
    navigator.geolocation?.getCurrentPosition(
      pos => {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(c); setGeoStatus('granted');
        setMapCenter([c.lat, c.lng]); setMapZoom(14);
      },
      () => alert('Enable location permissions in browser settings.'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const s = {
    page: { padding: '0 0 24px' },
    heading: { fontSize: '22px', fontWeight: '800', color: '#782B90', margin: '0 0 4px' },
    sub: { fontSize: '13px', color: '#9ca3af', margin: '0 0 20px' },
    toggleRow: { display: 'flex', gap: '8px', marginBottom: '16px' },
    tabActive: { padding: '8px 20px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', border: 'none', cursor: 'pointer', background: '#782B90', color: 'white' },
    tabInactive: { padding: '8px 20px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', border: 'none', cursor: 'pointer', background: '#f3e8f7', color: '#782B90' },
    banner: { background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', color: '#92400e', marginBottom: '16px', display: 'flex', gap: '10px', alignItems: 'flex-start' },
    storeCard: { background: 'white', borderRadius: '12px', border: '1px solid #f0e6f5', borderLeft: '4px solid #782B90', padding: '14px 16px', marginBottom: '10px', boxShadow: '0 1px 4px rgba(120,43,144,0.06)' },
    nearestCard: { background: 'white', borderRadius: '12px', border: '1px solid #f0e6f5', borderLeft: '4px solid #FFF200', padding: '14px 16px', marginBottom: '10px', boxShadow: '0 1px 4px rgba(120,43,144,0.06)' },
    storeName: { fontSize: '14px', fontWeight: '700', color: '#1f2937', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '6px' },
    storeAddr: { fontSize: '12px', color: '#6b7280', marginBottom: '8px' },
    storeFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    distBadge: { fontSize: '11px', fontWeight: '700', color: '#166534', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '10px' },
    mapBtn: { fontSize: '12px', fontWeight: '700', color: '#782B90', background: 'none', border: 'none', cursor: 'pointer', padding: 0 },
    nearestBadge: { fontSize: '10px', fontWeight: '800', color: '#782B90', background: '#FFF200', padding: '2px 8px', borderRadius: '10px' },
    mapBox: { borderRadius: '12px', overflow: 'hidden', border: '1px solid #f0e6f5', position: 'relative', height: '420px', boxShadow: '0 1px 4px rgba(120,43,144,0.08)' },
    locateBtn: { position: 'absolute', bottom: '16px', right: '16px', zIndex: 999, background: 'white', color: '#782B90', border: '1px solid #f0e6f5', borderRadius: '20px', padding: '8px 16px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' },
  };

  return (
    <div style={s.page}>
      <h1 style={s.heading}>Find Stores</h1>
      <p style={s.sub}>{stores.length > 0 ? `${stores.length} Savomart stores` : 'Locating stores...'}</p>

      <div style={s.toggleRow}>
        <button style={viewMode === 'list' ? s.tabActive : s.tabInactive} onClick={() => setViewMode('list')}>📋 List</button>
        <button style={viewMode === 'map' ? s.tabActive : s.tabInactive} onClick={() => setViewMode('map')}>🗺️ Map</button>
      </div>

      {geoStatus === 'denied' && (
        <div style={s.banner}>
          <span>📍</span>
          <div>
            <strong>Location access denied.</strong> Enable location in browser settings to see distances and your nearest store.
          </div>
        </div>
      )}

      {isLoading && (
        <div style={{ textAlign: 'center', padding: '48px', color: '#782B90', fontSize: '14px' }}>
          Loading stores...
        </div>
      )}

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '16px', color: '#dc2626', fontSize: '13px' }}>
          ⚠️ Failed to load stores. Check your connection.
        </div>
      )}

      {!isLoading && !error && viewMode === 'list' && (
        <div>
          {sortedStores.map(store => {
            const isNearest = store.id === nearestId;
            return (
              <div key={store.id} style={isNearest ? s.nearestCard : s.storeCard}>
                <div style={s.storeName}>
                  {store.name}
                  {isNearest && <span style={s.nearestBadge}>⭐ Nearest</span>}
                </div>
                <div style={s.storeAddr}>{store.address}, {store.city}</div>
                {store.phone && <div style={{ fontSize: '12px', color: '#782B90', fontWeight: '600', marginBottom: '8px' }}>📞 {store.phone}</div>}
                <div style={s.storeFooter}>
                  {store.distance_km != null
                    ? <span style={s.distBadge}>📍 {store.distance_km.toFixed(2)} km</span>
                    : <span style={{ fontSize: '11px', color: '#9ca3af' }}>Distance unavailable</span>}
                  <button style={s.mapBtn} onClick={() => { setMapCenter([store.lat, store.lng]); setMapZoom(15); setViewMode('map'); }}>
                    View on map →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!isLoading && !error && viewMode === 'map' && (
        <div style={s.mapBox}>
          <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapController center={mapCenter} zoom={mapZoom} />
            {userLocation && (
              <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                <Popup><strong>You are here</strong></Popup>
              </Marker>
            )}
            {processedStores.map(store => (
              <Marker key={store.id} position={[store.lat, store.lng]} icon={store.id === nearestId ? nearestIcon : purpleIcon}>
                <Popup>
                  <div style={{ minWidth: '160px' }}>
                    <strong style={{ fontSize: '13px' }}>{store.name}</strong>
                    {store.id === nearestId && <span style={{ color: '#782B90', fontSize: '11px' }}> ⭐ Nearest</span>}
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0' }}>{store.address}, {store.city}</p>
                    {store.phone && <p style={{ fontSize: '12px', color: '#782B90', margin: 0 }}>📞 {store.phone}</p>}
                    {store.distance_km != null && <p style={{ fontSize: '11px', color: '#166534', fontWeight: '700', marginTop: '4px' }}>📍 {store.distance_km.toFixed(2)} km</p>}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          <button style={s.locateBtn} onClick={handleLocateMe}>🎯 Locate me</button>
        </div>
      )}
    </div>
  );
}
