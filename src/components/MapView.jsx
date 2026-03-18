import { useEffect, useRef } from 'react';

export default function MapView({ lat, lng, issues = [], onLocationChange, draggable = false, height = '300px' }) {
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const L = window.L;
    if (!L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => initMap();
      document.head.appendChild(script);
      return;
    }
    initMap();
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current) {
      if (lat && lng && !issues.length) {
        mapInstanceRef.current.setView([lat, lng], 15);
        if (markersRef.current[0]) {
          markersRef.current[0].setLatLng([lat, lng]);
        }
      } else if (issues.length) {
        updateMarkers();
      }
    }
  }, [lat, lng, issues]);

  const updateMarkers = () => {
    const L = window.L;
    if (!L || !mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const blueIcon = L.divIcon({
      html: `<div style="width:32px;height:32px;border-radius:50% 50% 50% 0;background:linear-gradient(135deg,#3b82f6,#8b5cf6);border:3px solid white;box-shadow:0 4px 15px rgba(59,130,246,0.5);transform:rotate(-45deg);margin-top:-16px;margin-left:-16px;"></div>`,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    if (issues.length) {
      issues.forEach(issue => {
        if (!issue.latitude || !issue.longitude) return;
        const marker = L.marker([issue.latitude, issue.longitude], { icon: blueIcon })
          .addTo(mapInstanceRef.current)
          .bindPopup(`
            <div style="padding: 5px;">
              <h4 style="margin: 0 0 5px 0;">${issue.title}</h4>
              <p style="margin: 0; font-size: 0.8rem; color: #666;">${issue.category} • ${issue.status}</p>
              <a href="/issues/${issue._id || issue.id}" style="display: block; margin-top: 8px; color: var(--color-primary); text-decoration: none; font-weight: 600;">View Details</a>
            </div>
          `);
        markersRef.current.push(marker);
      });

      // Fit bounds if multiple issues
      if (issues.length > 0) {
        const group = new L.featureGroup(markersRef.current);
        mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
      }
    } else if (lat && lng) {
        const marker = L.marker([lat, lng], {
            icon: blueIcon,
            draggable: draggable,
          }).addTo(mapInstanceRef.current);
          
          if (draggable && onLocationChange) {
            marker.on('dragend', () => {
              const pos = marker.getLatLng();
              onLocationChange({ lat: pos.lat, lng: pos.lng });
            });
            mapInstanceRef.current.on('click', (e) => {
                marker.setLatLng(e.latlng);
                onLocationChange({ lat: e.latlng.lat, lng: e.latlng.lng });
              });
          }
          markersRef.current.push(marker);
    }
  };

  const initMap = () => {
    const L = window.L;
    if (!L || mapInstanceRef.current) return;

    const defaultLat = lat || 13.0827;
    const defaultLng = lng || 80.2707;

    const map = L.map(mapRef.current, {
      center: [defaultLat, defaultLng],
      zoom: 14,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    mapInstanceRef.current = map;
    updateMarkers();

    setTimeout(() => map.invalidateSize(), 100);
  };

  return (
    <div
      ref={mapRef}
      style={{
        height,
        width: '100%',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        border: '1px solid var(--border-glass)',
        position: 'relative',
        zIndex: 1,
      }}
    />
  );
}
