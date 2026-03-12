import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Star, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import { CATEGORIES } from '../lib/constants';
import { useAuth } from '../context/AuthContext';

const TABS = [
  { key: 'places', label: 'Discover Places' },
  { key: 'events', label: 'Find Events' },
  { key: 'local', label: 'Vouched' },
];

/**
 * Search page — search our DB, Google Places, and Ticketmaster.
 */
export default function SearchPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('places');
  const [category, setCategory] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [importing, setImporting] = useState(null);
  const [vouchedItems, setVouchedItems] = useState([]);
  const [vouchedLoaded, setVouchedLoaded] = useState(false);

  // Auto-load user's rated experiences when Vouched tab is active
  useEffect(() => {
    if (activeTab !== 'local' || !user?.id) return;
    if (vouchedLoaded) return;
    setLoading(true);
    api.users.getRatings(user.id)
      .then((ratings) => {
        const items = ratings.map((r) => ({
          id: r.experience_id,
          name: r.experience_name,
          category: r.experience_category,
          cover_photo_url: r.experience_cover_photo,
          overall_score: r.overall_score,
        }));
        setVouchedItems(items);
        setVouchedLoaded(true);
      })
      .catch(() => setVouchedItems([]))
      .finally(() => setLoading(false));
  }, [activeTab, user?.id, vouchedLoaded]);

  const doSearch = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      if (activeTab === 'local') {
        const data = await api.experiences.search(query, category || undefined);
        setResults(data);
      } else if (activeTab === 'places') {
        const data = await api.experiences.searchPlaces(query);
        setResults(data.results || []);
      } else {
        const data = await api.experiences.searchEvents(query);
        setResults(data.results || []);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query, activeTab, category]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') doSearch();
  };

  /** Navigate to experience detail; for external results, import first. */
  const navigateTo = async (item, tab) => {
    if ((tab === 'local' || tab === 'vouched') && item.id) {
      navigate(`/experience/${item.id}`);
      return;
    }
    // External result — import to our DB first
    if (item.google_place_id || item.ticketmaster_id) {
      try {
        setImporting(item.google_place_id || item.ticketmaster_id);
        const exp = await api.experiences.create({
          name: item.name,
          category: item.category || 'Food & Drink',
          subcategory: item.subcategory || '',
          address: item.address || '',
          description: item.description || '',
          google_place_id: item.google_place_id || null,
          ticketmaster_id: item.ticketmaster_id || null,
          cover_photo_url: item.cover_photo_url || '',
          latitude: item.latitude || null,
          longitude: item.longitude || null,
          is_event: item.is_event || false,
          event_date: item.event_date || null,
        });
        navigate(`/experience/${exp.id}`);
      } catch {
        // If creation fails (e.g., already imported), try fetching by name
        navigate('/search');
      } finally {
        setImporting(null);
      }
    }
  };

  return (
    <div className="pb-20 lg:pb-8">
      <div className="px-4 lg:px-8 pt-4 max-w-6xl mx-auto">

        {/* Search input */}
        <div className="bg-warm-white border border-stone rounded-full px-4 py-3 flex items-center gap-2 max-w-2xl">
          <Search className="w-4 h-4 text-secondary-text shrink-0" />
          <input
            type="text"
            placeholder="Search places, events, restaurants…"
            className="bg-transparent outline-none text-sm w-full text-primary-text placeholder:text-secondary-text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setResults([]); setSearched(false); }}
              className="text-secondary-text text-xs hover:text-primary-text"
            >
              Clear
            </button>
          )}
        </div>

        {/* Source tabs */}
        <div className="flex gap-4 mt-4 border-b border-stone-light overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setResults([]); setSearched(false); }}
              className={`pb-2 text-sm font-semibold whitespace-nowrap transition-vouch ${
                activeTab === tab.key
                  ? 'text-terracotta border-b-2 border-terracotta'
                  : 'text-text-muted hover:text-charcoal'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Category filter (local tab — filters vouched items) */}
        {activeTab === 'local' && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            <button
              onClick={() => setCategory('')}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-vouch ${
                !category
                  ? 'bg-charcoal text-cream'
                  : 'bg-warm-white border border-stone text-text-muted hover:text-charcoal'
              }`}
            >
              All
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-vouch ${
                  category === cat
                    ? 'bg-charcoal text-cream'
                    : 'bg-warm-white border border-stone text-text-muted hover:text-charcoal'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Results */}
        <div className="mt-4">
          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-terracotta animate-spin" />
            </div>
          )}

          {/* Vouched tab — show user's rated experiences */}
          {!loading && activeTab === 'local' && (() => {
            const filtered = category
              ? vouchedItems.filter((v) => v.category === category)
              : vouchedItems;
            if (filtered.length > 0) {
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map((item) => (
                    <ResultCard key={item.id} item={item} tab="local" navigate={navigateTo} />
                  ))}
                </div>
              );
            }
            if (vouchedLoaded) {
              return (
                <div className="text-center py-16">
                  <Star className="w-10 h-10 text-divider mx-auto mb-3" />
                  <p className="text-secondary-text text-sm">
                    {category
                      ? `No vouched experiences in ${category} yet.`
                      : "You haven\u2019t rated any experiences yet."}
                  </p>
                  <p className="text-secondary-text/60 text-xs mt-1">
                    Discover places and rate them to build your vouched list.
                  </p>
                </div>
              );
            }
            return null;
          })()}

          {/* Places / Events tabs — search-driven results */}
          {!loading && activeTab !== 'local' && searched && results.length === 0 && (
            <div className="text-center py-16">
              <p className="text-secondary-text text-sm">
                No results found for &ldquo;{query}&rdquo;.
              </p>
            </div>
          )}

          {!loading && activeTab !== 'local' && results.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((item, i) => (
                <ResultCard key={item.id || item.google_place_id || item.ticketmaster_id || i} item={item} tab={activeTab} navigate={navigateTo} />
              ))}
            </div>
          )}

          {/* Default state for search tabs */}
          {!loading && activeTab !== 'local' && !searched && (
            <div className="text-center py-16 lg:py-24">
              <Search className="w-10 h-10 text-divider mx-auto mb-3" />
              <p className="text-secondary-text text-sm">
                Search for restaurants, bars, concerts, fitness classes, and more.
              </p>
              <p className="text-secondary-text/60 text-xs mt-1">
                {activeTab === 'places' && 'Powered by Google Places'}
                {activeTab === 'events' && 'Powered by Ticketmaster'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


/** Single result card used across all tabs. */
function ResultCard({ item, tab, navigate }) {
  const isEvent = tab === 'events' || item.is_event;

  return (
    <div
      className="bg-warm-white border border-stone-light rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-vouch cursor-pointer"
      onClick={() => navigate(item, tab)}
    >
      {/* Cover image or placeholder */}
      {item.cover_photo_url ? (
        <img
          src={item.cover_photo_url}
          alt={item.name}
          className="w-full h-36 object-cover"
        />
      ) : (
        <div className="w-full h-36 bg-surface flex items-center justify-center">
          {isEvent
            ? <Calendar className="w-8 h-8 text-divider" />
            : <MapPin className="w-8 h-8 text-divider" />}
        </div>
      )}

      <div className="p-3">
        <h3 className="font-serif font-bold text-sm text-primary-text line-clamp-1">{item.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs px-2 py-0.5 bg-surface rounded-full text-secondary-text">
            {item.category}
          </span>
          {item.subcategory && item.subcategory !== item.category && (
            <span className="text-xs text-secondary-text">{item.subcategory}</span>
          )}
        </div>

        {item.address && (
          <p className="text-xs text-secondary-text mt-1 flex items-center gap-1 line-clamp-1">
            <MapPin className="w-3 h-3 shrink-0" />
            {item.address}
          </p>
        )}

        {item.description && (
          <p className="text-xs text-secondary-text/80 mt-1 line-clamp-2">{item.description}</p>
        )}

        {/* Show overall score for local results */}
        {tab === 'local' && item.overall_score && (
          <div className="flex items-center gap-1 mt-2">
            <Star className="w-3 h-3 text-amber fill-amber" />
            <span className="text-xs font-semibold">{item.overall_score}</span>
          </div>
        )}
      </div>
    </div>
  );
}
