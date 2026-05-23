import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import axiosInstance from '../api/axios';

// Haversine formula to compute distance between two coordinates
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Map controller to programmatically pan/zoom
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || 13, { animate: true, duration: 0.8 });
    }
  }, [center, zoom, map]);
  return null;
}

export default function StoresPage() {
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'
  const [userLocation, setUserLocation] = useState(null);
  const [geoStatus, setGeoStatus] = useState('prompt'); // 'prompt', 'granted', 'denied', 'error'
  const [mapCenter, setMapCenter] = useState([12.9716, 77.5946]); // Default: Bangalore
  const [mapZoom, setMapZoom] = useState(12);

  // Fetch all operational stores
  const { data: stores = [], isLoading: isLoadingStores, error: errorStores } = useQuery({
    queryKey: ['stores'],
    queryFn: () => axiosInstance.get('/stores').then((res) => res.data),
  });

  // Fetch nearest store if geolocation permission granted
  const { data: nearestStoreFromApi, isLoading: isLoadingNearest } = useQuery({
    queryKey: ['stores', 'nearest', userLocation?.lat, userLocation?.lng],
    queryFn: () =>
      axiosInstance
        .get('/stores/nearest', {
          params: { lat: userLocation.lat, lng: userLocation.lng },
        })
        .then((res) => res.data),
    enabled: !!userLocation && geoStatus === 'granted',
  });

  // Check geolocation API availability and state
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoStatus('error');
      return;
    }

    // Try to query permission status
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setGeoStatus(result.state);
        result.onchange = () => {
          setGeoStatus(result.state);
          if (result.state === 'granted') {
            requestUserLocation();
          } else if (result.state === 'denied') {
            setUserLocation(null);
          }
        };
      });
    }

    // Request location on mount to test
    requestUserLocation(false); // Don't alert/force on initial load
  }, []);

  const requestUserLocation = (forceAlert = true) => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(coords);
        setGeoStatus('granted');
        setMapCenter([coords.lat, coords.lng]);
        setMapZoom(13);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setGeoStatus('denied');
          setUserLocation(null);
        } else {
          setGeoStatus('error');
        }
        if (forceAlert && error.code === error.PERMISSION_DENIED) {
          alert('Location access is denied. Please enable location permissions in your browser settings.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleLocateMe = () => {
    requestUserLocation(true);
  };

  // Center map on a specific store
  const handleSelectStoreOnMap = (store) => {
    setMapCenter([store.lat, store.lng]);
    setMapZoom(15);
    setViewMode('map');
  };

  // Identify nearest store
  // Prefer API response, fallback to frontend haversine calculation if we have userLocation
  const calculatedNearestStore = (() => {
    if (nearestStoreFromApi) return nearestStoreFromApi;
    if (!userLocation || stores.length === 0) return null;

    let minDistance = Infinity;
    let nearest = null;
    stores.forEach((store) => {
      const dist = haversineDistance(userLocation.lat, userLocation.lng, store.lat, store.lng);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = store;
      }
    });
    return nearest;
  })();

  // Prepare stores with distance computed locally if userLocation is available
  const processedStores = stores.map((store) => {
    const isNearest = calculatedNearestStore && calculatedNearestStore.id === store.id;
    let distance = store.distance_km;

    if (userLocation) {
      distance = haversineDistance(userLocation.lat, userLocation.lng, store.lat, store.lng);
    }

    return {
      ...store,
      distance_km: distance,
      isNearest,
    };
  });

  // Sort list: if userLocation available, sort by distance. Otherwise, default.
  const sortedStores = [...processedStores].sort((a, b) => {
    if (userLocation) {
      return (a.distance_km || 0) - (b.distance_km || 0);
    }
    return 0; // maintain original order
  });

  // Leaflet custom marker icons
  const createPurpleIcon = () =>
    new L.DivIcon({
      className: 'custom-purple-marker',
      html: `
        <div class="w-7 h-7 rounded-full bg-brand-purple border-2 border-white shadow-lg flex items-center justify-center transition-transform hover:scale-110 duration-200">
          <span class="text-[10px] text-white">🏪</span>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -14],
    });

  const createNearestIcon = () =>
    new L.DivIcon({
      className: 'custom-nearest-marker',
      html: `
        <div class="relative flex items-center justify-center w-9 h-9">
          <div class="absolute w-9 h-9 rounded-full bg-brand-yellow/40 animate-ping"></div>
          <div class="relative w-7 h-7 rounded-full bg-brand-yellow border-2 border-brand-purple shadow-lg flex items-center justify-center transition-transform hover:scale-110 duration-200">
            <span class="text-[10px]">⭐</span>
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -18],
    });

  const createUserIcon = () =>
    new L.DivIcon({
      className: 'custom-user-marker',
      html: `
        <div class="relative flex items-center justify-center w-8 h-8">
          <div class="absolute w-8 h-8 rounded-full bg-blue-400/40 animate-ping"></div>
          <div class="relative w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-md"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

  // Adjust map center on initial load if stores are loaded and no userLocation
  useEffect(() => {
    if (stores.length > 0 && !userLocation) {
      setMapCenter([stores[0].lat, stores[0].lng]);
    }
  }, [stores, userLocation]);

  return (
    <div className="min-h-screen bg-page-bg py-6">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header & Toggle */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-ink tracking-tight mb-2">
              Find Stores
            </h1>
            <p className="text-muted text-sm md:text-base">
              Locate your nearest Savomart store and check operating hours.
            </p>
          </div>

          <div className="flex gap-2 p-1 bg-white border border-border rounded-xl shadow-sm self-start md:self-auto">
            <button
              onClick={() => setViewMode('map')}
              className={`py-2 px-5 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                viewMode === 'map'
                  ? 'bg-brand-purple text-white shadow-sm'
                  : 'text-muted hover:text-brand-purple hover:bg-brand-purple/5'
              }`}
            >
              <span>🗺️</span> Map View
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`py-2 px-5 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                viewMode === 'list'
                  ? 'bg-brand-purple text-white shadow-sm'
                  : 'text-muted hover:text-brand-purple hover:bg-brand-purple/5'
              }`}
            >
              <span>📋</span> List View
            </button>
          </div>
        </div>

        {/* Info Banner when geolocation is denied or not granted */}
        {geoStatus === 'denied' && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl flex items-start gap-3 shadow-sm">
            <span className="text-xl">📍</span>
            <div className="text-sm">
              <p className="font-bold">Location Access Denied</p>
              <p className="text-amber-700 mt-0.5">
                We couldn't access your location. Showing stores without distance calculations. Enable location permissions for a better experience.
              </p>
            </div>
          </div>
        )}

        {/* Loading and Error states for stores */}
        {isLoadingStores && (
          <div className="bg-white rounded-2xl border border-border p-12 text-center shadow-sm max-w-md mx-auto">
            <div className="w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted font-medium">Loading store list...</p>
          </div>
        )}

        {errorStores && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center max-w-md mx-auto shadow-sm">
            <span className="text-3xl">⚠️</span>
            <h3 className="text-lg font-bold text-red-800 mt-2">Failed to load stores</h3>
            <p className="text-red-600 text-sm mt-1">
              Could not retrieve store locations. Please check your network connection.
            </p>
          </div>
        )}

        {/* Main Content Layout */}
        {!isLoadingStores && !errorStores && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* View Area */}
            <div className="lg:col-span-2">
              {viewMode === 'map' ? (
                <div className="relative rounded-3xl overflow-hidden border border-border bg-white shadow-md">
                  {/* Map Height: 60vh on mobile, 500px on desktop */}
                  <div className="h-[60vh] md:h-[500px] w-full">
                    <MapContainer
                      center={mapCenter}
                      zoom={mapZoom}
                      style={{ height: '100%', width: '100%', zIndex: 1 }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      
                      <MapController center={mapCenter} zoom={mapZoom} />

                      {/* User Location Marker */}
                      {userLocation && (
                        <Marker position={[userLocation.lat, userLocation.lng]} icon={createUserIcon()}>
                          <Popup>
                            <div className="text-xs font-semibold text-ink">You are here</div>
                          </Popup>
                        </Marker>
                      )}

                      {/* Store Markers */}
                      {processedStores.map((store) => (
                        <Marker
                          key={store.id}
                          position={[store.lat, store.lng]}
                          icon={store.isNearest ? createNearestIcon() : createPurpleIcon()}
                        >
                          <Popup>
                            <div className="p-1">
                              <h4 className="font-bold text-sm text-ink mb-1">
                                {store.name} {store.isNearest && '⭐'}
                              </h4>
                              <p className="text-xs text-muted leading-relaxed mb-2">
                                {store.address}, {store.city}
                              </p>
                              {store.phone && (
                                <p className="text-xs text-brand-purple font-semibold flex items-center gap-1">
                                  📞 {store.phone}
                                </p>
                              )}
                              {store.distance_km !== undefined && store.distance_km !== null && (
                                <p className="text-[10px] text-green-600 font-bold mt-1.5 uppercase tracking-wider bg-green-50 px-1.5 py-0.5 rounded border border-green-100 inline-block">
                                  {store.distance_km.toFixed(2)} km away
                                </p>
                              )}
                            </div>
                          </Popup>
                        </Marker>
                      ))}
                    </MapContainer>
                  </div>

                  {/* Locate Me Floating Action Button */}
                  <button
                    onClick={handleLocateMe}
                    className="absolute bottom-4 right-4 z-[999] bg-white text-brand-purple font-bold text-xs md:text-sm py-2.5 px-4 rounded-full shadow-lg border border-border hover:bg-brand-purple hover:text-white transition-all flex items-center gap-1.5"
                  >
                    🎯 Locate me
                  </button>
                </div>
              ) : (
                /* List View - sorted by distance if geolocation granted */
                <div className="grid gap-4 sm:grid-cols-2">
                  {sortedStores.map((store) => (
                    <div
                      key={store.id}
                      className={`bg-white rounded-2xl p-5 border border-border transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between ${
                        store.isNearest
                          ? 'border-l-4 border-l-brand-yellow'
                          : 'border-l-4 border-l-brand-purple/20'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <h3 className="font-bold text-ink text-lg leading-tight">
                            {store.name}
                          </h3>
                          {store.isNearest && (
                            <span className="bg-brand-yellow text-brand-purple text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                              Nearest
                            </span>
                          )}
                        </div>

                        <p className="text-muted text-sm leading-relaxed mb-4">
                          {store.address}, {store.city}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 mt-auto border-t border-border/60 pt-3">
                        {store.phone && (
                          <div className="text-xs text-brand-purple font-semibold flex items-center gap-1">
                            <span>📞</span> {store.phone}
                          </div>
                        )}

                        <div className="flex justify-between items-center mt-1">
                          {store.distance_km !== undefined && store.distance_km !== null ? (
                            <span className="text-xs text-green-600 font-bold bg-green-50 border border-green-200/50 px-2 py-0.5 rounded-full">
                              📍 {store.distance_km.toFixed(2)} km
                            </span>
                          ) : (
                            <span className="text-[10px] text-muted italic">
                              Distance unavailable
                            </span>
                          )}

                          <button
                            onClick={() => handleSelectStoreOnMap(store)}
                            className="text-xs text-brand-purple hover:text-brand-purple-dark font-extrabold flex items-center gap-0.5 group"
                          >
                            Show on map <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar quick info list */}
            <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
              <h3 className="font-bold text-ink text-lg mb-4">
                Savomart Stores ({stores.length})
              </h3>
              <div className="divide-y divide-border max-h-[350px] overflow-y-auto pr-1">
                {sortedStores.map((store) => (
                  <div
                    key={store.id}
                    onClick={() => handleSelectStoreOnMap(store)}
                    className="py-3 cursor-pointer hover:bg-page-bg rounded-lg px-2 transition-colors flex justify-between items-center gap-3"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-ink truncate">{store.name}</p>
                      <p className="text-xs text-muted truncate">{store.address}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      {store.distance_km !== undefined && store.distance_km !== null ? (
                        <p className="text-xs text-green-600 font-bold">
                          {store.distance_km.toFixed(1)} km
                        </p>
                      ) : (
                        <p className="text-[10px] text-muted">--</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick instructions */}
              <div className="mt-5 pt-4 border-t border-border/80 text-xs text-muted space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-purple border border-white shadow-sm flex-shrink-0"></span>
                  <span>Savomart Stores</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-yellow opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-yellow"></span>
                  </span>
                  <span>Nearest Operational Store</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
