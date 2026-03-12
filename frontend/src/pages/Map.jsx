import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import ChipStrip from '../components/ui/ChipStrip';
import VouchScore from '../components/ui/VouchScore';
import CategoryTag from '../components/ui/CategoryTag';
import { CATEGORIES, COLORS } from '../lib/constants';
import { api } from '../lib/api';

// ── Custom marker icons by score band ──────────────────────────
function createIcon(color, size = 28) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size + 8}" viewBox="0 0 ${size} ${size + 8}">
    <path d="M${size / 2} ${size + 6} C${size / 2} ${size + 6} ${size} ${size * 0.65} ${size} ${size / 2}
      A${size / 2} ${size / 2} 0 0 0 0 ${size / 2}
      C0 ${size * 0.65} ${size / 2} ${size + 6} ${size / 2} ${size + 6}Z"
      fill="${color}" stroke="white" stroke-width="2"/>
    <circle cx="${size / 2}" cy="${size / 2}" r="${size / 4}" fill="white" opacity="0.9"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [size, size + 8],
    iconAnchor: [size / 2, size + 8],
    popupAnchor: [0, -(size + 4)],
  });
}

const SCORE_COLORS = {
  high: COLORS.sage,          // 9-10
  good: COLORS.amber,         // 7-8
  mid: COLORS.stone,          // 5-6
  low: COLORS.terracotta,     // 0-4
  none: '#9B9B9B',            // unrated
};

function iconForScore(avg) {
  if (avg >= 9) return createIcon(SCORE_COLORS.high);
  if (avg >= 7) return createIcon(SCORE_COLORS.good);
  if (avg >= 5) return createIcon(SCORE_COLORS.mid);
  if (avg > 0) return createIcon(SCORE_COLORS.low);
  return createIcon(SCORE_COLORS.none);
}

// ── Layer definitions ──────────────────────────────────────────
const LAYERS = [
  { key: 'all', label: 'All' },
  { key: 'mine', label: 'My Ratings' },
  { key: 'friends', label: 'Friends' },
  { key: 'wishlist', label: 'Wishlist' },
];

// ── Center map on pins ─────────────────────────────────────────
function FitBounds({ pins }) {
  const map = useMap();
  useEffect(() => {
    if (pins.length > 0) {
      const bounds = L.latLngBounds(pins.map((p) => [p.latitude, p.longitude]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [pins, map]);
  return null;
}

// ── Neighborhood list panel ────────────────────────────────────
function NeighborhoodPanel({ neighborhoods, onSelect }) {
  if (!neighborhoods.length) return null;
  return (
    <div className="bg-warm-white/95 backdrop-blur-sm rounded-xl border border-stone-light shadow-lg p-3 max-h-64 overflow-y-auto">
      <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
        Neighborhoods
      </h3>
      <div className="space-y-1">
        {neighborhoods.map((n) => (
          <button
            key={n.name}
            onClick={() => onSelect(n.name)}
            className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-cream-deep transition-vouch flex items-center justify-between"
          >
            <span className="text-sm font-medium text-charcoal">{n.name}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted">{n.experience_count} places</span>
              {n.avg_score > 0 && (
                <span className="text-xs font-bold text-terracotta">{n.avg_score}</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main map component ─────────────────────────────────────────
export default function MapPage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeLayer, setActiveLayer] = useState('all');
  const [pins, setPins] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPanel, setShowPanel] = useState(false);

  // Default center: Manhattan, NYC
  const defaultCenter = [40.7580, -73.9855];

  const loadPins = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (activeLayer !== 'all') params.layer = activeLayer;
      const data = await api.map.getPins(params);
      setPins(data || []);
    } catch {
      setPins([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, activeLayer]);

  const loadNeighborhoods = useCallback(async () => {
    try {
      const data = await api.map.getNeighborhoods(selectedCategory || undefined);
      setNeighborhoods(data || []);
    } catch {
      setNeighborhoods([]);
    }
  }, [selectedCategory]);

  useEffect(() => {
    loadPins();
    loadNeighborhoods();
  }, [loadPins, loadNeighborhoods]);

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat === selectedCategory ? null : cat);
  };

  return (
    <div className="pb-20 lg:pb-0 h-[100dvh] flex flex-col">

      {/* Category filter */}
      <div className="px-4 lg:px-8 py-2">
        <ChipStrip
          chips={CATEGORIES}
          selected={selectedCategory}
          onSelect={handleCategoryChange}
        />
      </div>

      {/* Layer toggles */}
      <div className="px-4 lg:px-8 flex gap-2 mb-2">
        {LAYERS.map((layer) => (
          <button
            key={layer.key}
            onClick={() => setActiveLayer(layer.key)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-vouch ${
              activeLayer === layer.key
                ? 'bg-charcoal text-cream shadow-sm'
                : 'bg-warm-white border border-stone text-text-muted hover:border-terracotta'
            }`}
          >
            {layer.label}
          </button>
        ))}

        {/* Neighborhood toggle */}
        <button
          onClick={() => setShowPanel((s) => !s)}
          className={`text-xs px-3 py-1.5 rounded-full font-medium transition-vouch ml-auto ${
            showPanel
              ? 'bg-charcoal text-cream'
              : 'bg-warm-white border border-stone text-text-muted hover:border-terracotta'
          }`}
        >
          Neighborhoods
        </button>
      </div>

      {/* Map + overlays */}
      <div className="flex-1 relative mx-4 lg:mx-8 mb-4 rounded-xl overflow-hidden border border-divider">
        {loading && (
          <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-cream/60">
            <div className="w-8 h-8 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Neighborhood panel overlay */}
        {showPanel && (
          <div className="absolute top-3 right-3 z-[1000] w-64">
            <NeighborhoodPanel neighborhoods={neighborhoods} onSelect={(name) => {
              // Filter by neighborhood — for now just close panel
              setShowPanel(false);
            }} />
          </div>
        )}

        {/* Pin count badge */}
        <div className="absolute top-3 left-3 z-[1000] bg-warm-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-sm border border-stone-light">
          <span className="text-xs font-semibold text-primary-text">{pins.length} places</span>
        </div>

        <MapContainer
          center={defaultCenter}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {pins.length > 0 && <FitBounds pins={pins} />}

          {pins.map((pin) => (
            <Marker
              key={pin.id}
              position={[pin.latitude, pin.longitude]}
              icon={iconForScore(pin.avg_score)}
            >
              <Popup>
                <div className="min-w-[200px]">
                  {/* Cover photo */}
                  {pin.cover_photo_url && (
                    <img
                      src={pin.cover_photo_url}
                      alt={pin.name}
                      className="w-full h-24 object-cover rounded-t-lg -mt-3 -mx-3 mb-2"
                      style={{ width: 'calc(100% + 24px)' }}
                    />
                  )}

                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3
                        className="font-bold text-sm cursor-pointer hover:text-terracotta transition-vouch"
                        onClick={() => navigate(`/experience/${pin.id}`)}
                      >
                        {pin.name}
                      </h3>
                      <span className="text-[10px] px-1.5 py-0.5 bg-stone-light rounded text-text-muted inline-block mt-1">
                        {pin.category}
                      </span>
                    </div>
                    {pin.avg_score > 0 && (
                      <div className="text-center shrink-0">
                        <div className="w-9 h-9 rounded-full bg-terracotta text-white font-bold flex items-center justify-center text-sm">
                          {pin.avg_score}
                        </div>
                        <span className="text-[9px] text-text-muted">{pin.num_ratings}r</span>
                      </div>
                    )}
                  </div>

                  {pin.address && (
                    <p className="text-[11px] text-text-muted mt-1">{pin.address}</p>
                  )}

                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => navigate(`/experience/${pin.id}`)}
                      className="flex-1 bg-charcoal text-cream text-[11px] font-semibold py-1.5 rounded-full hover:bg-terracotta transition-vouch"
                    >
                      View
                    </button>
                    <button
                      onClick={() => navigate(`/rate/${pin.id}`)}
                      className="flex-1 border border-terracotta text-terracotta text-[11px] font-semibold py-1.5 rounded-full hover:bg-terracotta/5 transition-vouch"
                    >
                      Rate
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 z-[1000] bg-warm-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm border border-stone-light">
          <div className="flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: SCORE_COLORS.high }} />
              9-10
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: SCORE_COLORS.good }} />
              7-8
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: SCORE_COLORS.mid }} />
              5-6
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: SCORE_COLORS.low }} />
              0-4
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: SCORE_COLORS.none }} />
              N/A
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
