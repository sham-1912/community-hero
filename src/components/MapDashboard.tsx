import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, ThumbsUp, AlertTriangle, Info, X, Filter } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { sectorRisks } from '../utils/mockData';
import type { Issue, SectorRisk } from '../utils/mockData';

interface MapDashboardProps {
  issues: Issue[];
  onUpvoteIssue: (id: string) => void;
  onVerifyIssue: (id: string) => void;
  onAddPoints: (points: number) => void;
  onAddNotification: (text: string) => void;
}

export const MapDashboard: React.FC<MapDashboardProps> = ({
  issues,
  onUpvoteIssue,
  onVerifyIssue,
  onAddPoints,
  onAddNotification,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [showPredictiveOverlay, setShowPredictiveOverlay] = useState<boolean>(true);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [selectedSector, setSelectedSector] = useState<SectorRisk | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.730610, -73.935242]);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const sectorsGroupRef = useRef<L.LayerGroup | null>(null);

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Pothole': return '#F59E0B'; // amber
      case 'Waste Management': return '#EC4899'; // pink
      case 'Water Leakage': return '#3B82F6'; // blue
      case 'Streetlight Failure': return '#EAB308'; // yellow
      default: return '#8B5CF6';
    }
  };

  const getRiskColor = (risk: 'Low' | 'Medium' | 'High') => {
    if (risk === 'High') return '#EF4444';
    if (risk === 'Medium') return '#F59E0B';
    return '#10B981';
  };

  const createCustomIcon = (color: string, isSelected: boolean) => {
    const size = isSelected ? 18 : 12;
    const border = isSelected ? '3px solid #FFF' : '2px solid #FFF';
    const shadow = isSelected ? `0 0 12px ${color}` : `0 0 6px ${color}`;
    
    return L.divIcon({
      html: `<div style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; border: ${border}; box-shadow: ${shadow}; transition: all 200ms;"></div>`,
      className: 'custom-map-marker',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    });
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create Map
    const defaultCenter: L.LatLngExpression = [40.730610, -73.935242];
    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 14,
      zoomControl: false
    });

    // Dark theme CartoDB basemap tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 20
    }).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);

    // Create Layer Groups
    const sectorsGroup = L.layerGroup().addTo(map);
    const markersGroup = L.layerGroup().addTo(map);

    mapRef.current = map;
    sectorsGroupRef.current = sectorsGroup;
    markersGroupRef.current = markersGroup;

    // Query Geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          
          setMapCenter([userLat, userLng]);
          map.setView([userLat, userLng], 14);

          // Add a pulsing blue dot at the user's location
          const userIcon = L.divIcon({
            html: `<div style="background-color: #3B82F6; width: 14px; height: 14px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 10px #3B82F6; position: relative;">
                     <div style="position: absolute; top: -6px; left: -6px; width: 26px; height: 26px; border-radius: 50%; background-color: rgba(59, 130, 246, 0.3); animation: ping 1.5s infinite ease-in-out;"></div>
                   </div>`,
            className: 'user-current-location-marker',
            iconSize: [14, 14],
            iconAnchor: [7, 7]
          });
          
          const userMarker = L.marker([userLat, userLng], { icon: userIcon });
          userMarker.bindTooltip("You are here", { permanent: false, direction: 'top' });
          userMarker.addTo(map);

          onAddNotification(`GPS ACCESS GRANTED: Map centered on your neighborhood coordinates (${userLat.toFixed(4)}, ${userLng.toFixed(4)}).`);
        },
        (error) => {
          console.warn('Geolocation error:', error);
          onAddNotification('GPS Access declined or unavailable. Falling back to default city view.');
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      onAddNotification('Geolocation not supported by browser. Using default city coordinates.');
    }

    // Cleanup
    return () => {
      map.remove();
      mapRef.current = null;
      sectorsGroupRef.current = null;
      markersGroupRef.current = null;
    };
  }, []);

  // Filtered issues
  const filteredIssues = issues.filter(issue => {
    const catMatch = selectedCategory === 'All' || issue.category === selectedCategory;
    const statusMatch = selectedStatus === 'All' || issue.status === selectedStatus;
    return catMatch && statusMatch;
  });

  // Render Markers and Sectors
  useEffect(() => {
    const map = mapRef.current;
    const markersGroup = markersGroupRef.current;
    const sectorsGroup = sectorsGroupRef.current;

    if (!map || !markersGroup || !sectorsGroup) return;

    markersGroup.clearLayers();
    sectorsGroup.clearLayers();

    // 1. Add Sector Polygons (Heatmaps) if overlay active
    if (showPredictiveOverlay) {
      const lat = mapCenter[0];
      const lng = mapCenter[1];
      const offset = 0.008; // size of sector quadrant offsets

      const sectorPolys = [
        {
          risk: sectorRisks[0],
          coords: [
            [lat + offset, lng - offset],
            [lat + offset, lng],
            [lat, lng],
            [lat, lng - offset]
          ]
        },
        {
          risk: sectorRisks[1],
          coords: [
            [lat + offset, lng],
            [lat + offset, lng + offset],
            [lat, lng + offset],
            [lat, lng]
          ]
        },
        {
          risk: sectorRisks[2],
          coords: [
            [lat, lng - offset],
            [lat, lng],
            [lat - offset, lng],
            [lat - offset, lng - offset]
          ]
        },
        {
          risk: sectorRisks[3],
          coords: [
            [lat, lng],
            [lat, lng + offset],
            [lat - offset, lng + offset],
            [lat - offset, lng]
          ]
        }
      ];

      sectorPolys.forEach(sp => {
        const riskLevel = sp.risk.potholeRisk === 'High' || sp.risk.waterLeakRisk === 'High' ? 'High' : 
                         sp.risk.potholeRisk === 'Medium' || sp.risk.waterLeakRisk === 'Medium' ? 'Medium' : 'Low';
        const color = getRiskColor(riskLevel);

        const poly = L.polygon(sp.coords as L.LatLngExpression[], {
          color,
          fillColor: color,
          fillOpacity: 0.15,
          weight: 1.5,
          dashArray: '4, 4'
        });

        poly.on('click', () => {
          setSelectedSector(sp.risk);
          setSelectedIssue(null);
        });

        poly.addTo(sectorsGroup);
      });
    }

    // 2. Add Issues Markers
    filteredIssues.forEach(issue => {
      const isSelected = selectedIssue?.id === issue.id;
      const markerColor = getCategoryColor(issue.category);
      const icon = createCustomIcon(markerColor, isSelected);

      const marker = L.marker([issue.location.lat, issue.location.lng], { icon });

      marker.on('click', () => {
        setSelectedIssue(issue);
        setSelectedSector(null);
      });

      marker.addTo(markersGroup);
    });

  }, [filteredIssues, showPredictiveOverlay, selectedIssue]);

  // Adjust view when selectedIssue changes (recenter map)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedIssue) return;
    map.setView([selectedIssue.location.lat, selectedIssue.location.lng], 15);
  }, [selectedIssue]);

  return (
    <div className="dashboard-grid">
      {/* Map Column */}
      <div>
        <div className="glass-card p-4 mb-4 border border-white/10" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          {/* Filters */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
              <Filter size={14} /> Filter Issues:
            </span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-select"
              style={{ padding: '6px 12px', fontSize: '0.85rem', borderRadius: '8px', background: 'rgba(255,255,255,0.04)' }}
            >
              <option value="All" style={{ background: 'var(--bg-surface-solid)' }}>All Categories</option>
              <option value="Pothole" style={{ background: 'var(--bg-surface-solid)' }}>Potholes</option>
              <option value="Waste Management" style={{ background: 'var(--bg-surface-solid)' }}>Waste Management</option>
              <option value="Water Leakage" style={{ background: 'var(--bg-surface-solid)' }}>Water Leakage</option>
              <option value="Streetlight Failure" style={{ background: 'var(--bg-surface-solid)' }}>Streetlight Failure</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="form-select"
              style={{ padding: '6px 12px', fontSize: '0.85rem', borderRadius: '8px', background: 'rgba(255,255,255,0.04)' }}
            >
              <option value="All" style={{ background: 'var(--bg-surface-solid)' }}>All Statuses</option>
              <option value="Pending" style={{ background: 'var(--bg-surface-solid)' }}>Pending</option>
              <option value="Investigating" style={{ background: 'var(--bg-surface-solid)' }}>Investigating</option>
              <option value="In Progress" style={{ background: 'var(--bg-surface-solid)' }}>In Progress</option>
              <option value="Resolved" style={{ background: 'var(--bg-surface-solid)' }}>Resolved</option>
            </select>
          </div>

          {/* AI Toggle */}
          <button
            onClick={() => setShowPredictiveOverlay(!showPredictiveOverlay)}
            style={{
              padding: '8px 16px',
              fontSize: '0.85rem',
              borderRadius: '8px',
              border: '1px solid',
              background: showPredictiveOverlay ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255,255,255,0.05)',
              borderColor: showPredictiveOverlay ? 'var(--primary)' : 'var(--border)',
              color: showPredictiveOverlay ? 'var(--text-primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all var(--transition-fast)'
            }}
          >
            🧠 AI Predictions {showPredictiveOverlay ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Map Area */}
        <div className="map-canvas-container">
          {/* Leaflet container */}
          <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />

          {/* Map Legends */}
          <div className="map-legends glass-card" style={{ padding: '10px 14px', fontSize: '0.75rem', background: 'rgba(7, 9, 19, 0.85)', display: 'flex', flexDirection: 'column', gap: '6px', zIndex: 10 }}>
            <div style={{ fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Category Keys</div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }}></span> Pothole</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EC4899' }}></span> Waste Mgmt</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3B82F6' }}></span> Water Leak</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EAB308' }}></span> Streetlight</span>
            </div>
            {showPredictiveOverlay && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px', marginTop: '4px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)', fontWeight: 600 }}>
                  🧠 AI Risk Heatmap Active
                </span>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px', color: 'var(--text-muted)' }}>
                  <span>🟥 High Risk</span>
                  <span>🟨 Med Risk</span>
                  <span>🟩 Low Risk</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Details Side Panel Column */}
      <div>
        {selectedIssue ? (
          <div className="glass-card p-5 border border-white/10 animate-fade-in" style={{ height: '100%', position: 'relative' }}>
            <button
              onClick={() => setSelectedIssue(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', zIndex: 5 }}
            >
              <X size={18} />
            </button>

            <span className={`status-pill ${
              selectedIssue.status === 'Pending' ? 'status-pending' :
              selectedIssue.status === 'Investigating' ? 'status-investigating' :
              selectedIssue.status === 'In Progress' ? 'status-progress' : 'status-resolved'
            }`} style={{ marginBottom: '12px' }}>
              {selectedIssue.status}
            </span>

            <h3 style={{ fontSize: '1.15rem', marginBottom: '8px', marginTop: '4px' }}>{selectedIssue.title}</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '14px' }}>
              📍 {selectedIssue.location.address}
            </span>

            {selectedIssue.mediaCID && (
              <div style={{ position: 'relative', width: '100%', height: '150px', borderRadius: '8px', overflow: 'hidden', marginBottom: '14px', border: '1px solid rgba(255,255,255,0.1)' }}>
                {selectedIssue.mediaCID.startsWith('data:video/') ? (
                  <video
                    src={selectedIssue.mediaCID}
                    controls
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <img
                    src={selectedIssue.mediaCID.startsWith('http') || selectedIssue.mediaCID.startsWith('data:image/') ? selectedIssue.mediaCID : 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=500&auto=format&fit=crop&q=60'}
                    alt="Issue evidence"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                )}
                <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(7, 9, 19, 0.8)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.65rem', fontFamily: 'var(--font-mono)', zIndex: 10 }}>
                  IPFS: {selectedIssue.mediaCID.substring(0, 10)}...
                </div>
              </div>
            )}

            <p style={{ fontSize: '0.85rem', marginBottom: '16px', minHeight: '60px' }}>
              {selectedIssue.description}
            </p>

            <div style={{ display: 'flex', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px' }}>
              <span>Priority: <strong style={{ color: '#FFF' }}>{selectedIssue.priority}</strong></span>
              <span>•</span>
              <span>By: <span style={{ fontFamily: 'var(--font-mono)' }}>{selectedIssue.reporterHash}</span></span>
            </div>

            {selectedIssue.status !== 'Resolved' ? (
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button
                  onClick={() => {
                    onUpvoteIssue(selectedIssue.id);
                    onAddPoints(5);
                    onAddNotification(`Upvoted "${selectedIssue.title}". +5 Karma points awarded!`);
                    setSelectedIssue(prev => prev ? { ...prev, upvotes: prev.upvotes + 1 } : null);
                  }}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '8px', fontSize: '0.85rem' }}
                >
                  <ThumbsUp size={14} color="var(--primary)" />
                  Upvote ({selectedIssue.upvotes})
                </button>

                <button
                  onClick={() => {
                    onVerifyIssue(selectedIssue.id);
                    onAddPoints(10);
                    onAddNotification(`Verified status for "${selectedIssue.title}". +10 Karma points awarded!`);
                    setSelectedIssue(prev => prev ? { ...prev, verifications: prev.verifications + 1 } : null);
                  }}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '8px', fontSize: '0.85rem' }}
                >
                  <ShieldCheck size={14} color="var(--emerald)" />
                  Verify ({selectedIssue.verifications})
                </button>
              </div>
            ) : (
              <div className="glass-card" style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.2)', marginBottom: '20px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <ShieldCheck size={16} color="var(--emerald)" />
                <span style={{ fontSize: '0.8rem', color: 'var(--emerald)', fontWeight: 600 }}>
                  This issue has been resolved and cryptographic sign-off is committed.
                </span>
              </div>
            )}

            <div style={{ fontSize: '0.8rem' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>Citizen & Authority Activity Log</div>
              {selectedIssue.comments && selectedIssue.comments.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '140px', overflowY: 'auto' }}>
                  {selectedIssue.comments.map(c => (
                    <div key={c.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600, color: c.role === 'Authority' ? 'var(--amber)' : c.role === 'Moderator' ? 'var(--primary)' : 'var(--text-primary)' }}>
                          {c.username} {c.role && <span style={{ fontSize: '0.65rem', border: '1px solid currentColor', padding: '1px 4px', borderRadius: '3px', marginLeft: '4px' }}>{c.role}</span>}
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{new Date(c.timestamp).toLocaleDateString()}</span>
                      </div>
                      <div style={{ color: 'var(--text-secondary)' }}>{c.text}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No discussion yet. Upvote or verify above.</div>
              )}
            </div>
          </div>
        ) : selectedSector && showPredictiveOverlay ? (
          <div className="glass-card p-5 border border-white/10 animate-fade-in" style={{ height: '100%', position: 'relative' }}>
            <button
              onClick={() => setSelectedSector(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', zIndex: 5 }}
            >
              <X size={18} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <AlertTriangle size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '1.05rem', margin: 0 }}>AI Risk Forecast</h3>
            </div>
            
            <h4 style={{ fontSize: '1.15rem', color: '#FFF', marginBottom: '4px' }}>{selectedSector.name}</h4>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '16px' }}>
              Infrastructure Age: <strong>{selectedSector.infrastructureAgeYears} years</strong>
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                <span style={{ fontSize: '0.85rem' }}>Monsoon Pothole Risk:</span>
                <span className="priority-pill" style={{
                  background: selectedSector.potholeRisk === 'High' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.1)',
                  color: selectedSector.potholeRisk === 'High' ? '#EF4444' : 'var(--amber)'
                }}>{selectedSector.potholeRisk}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                <span style={{ fontSize: '0.85rem' }}>Water Pipe Rupture Risk:</span>
                <span className="priority-pill" style={{
                  background: selectedSector.waterLeakRisk === 'High' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.1)',
                  color: selectedSector.waterLeakRisk === 'High' ? '#EF4444' : 'var(--amber)'
                }}>{selectedSector.waterLeakRisk}</span>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', fontSize: '0.85rem' }}>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Info size={14} color="var(--primary)" /> Predictive Rationale
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {selectedSector.description}
              </p>
            </div>
          </div>
        ) : (
          <div className="glass-card p-5 border border-white/10" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
            <AlertTriangle size={36} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Select an Map Item</h3>
            <p style={{ fontSize: '0.8rem' }}>
              Click any active dot on the map or click within sector boundary lines to inspect local AI forecast details and verify reports.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
