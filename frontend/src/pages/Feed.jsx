import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Star, Search, Loader2, Flame, Award } from 'lucide-react';
import BookmarkIcon from '../components/ui/BookmarkIcon';
import { CATEGORIES } from '../lib/constants';
import { api } from '../lib/api';

const TABS = [
  { key: 'all', label: 'For You' },
  { key: 'vouch_picks', label: 'Vouch Picks' },
  ...CATEGORIES.map((c) => ({ key: c, label: c })),
];

export default function Feed() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [experiencesByCategory, setExperiencesByCategory] = useState({});
  const [loading, setLoading] = useState({});
  const [savedState, setSavedState] = useState({});
  // Maps experience_id → 'vouch_pick' | 'trending'
  const [feedTags, setFeedTags] = useState({});

  // Load wishlist on mount
  useEffect(() => {
    api.wishlist.get()
      .then((items) => {
        const map = {};
        (items || []).forEach((w) => { map[w.experience_id] = true; });
        setSavedState(map);
      })
      .catch(() => {});
  }, []);

  // Fetch feed tags (vouch_pick / trending) from the feed API
  useEffect(() => {
    api.feed.get(null, null)
      .then((data) => {
        const tags = {};
        (data?.items || []).forEach((item) => {
          if (item.experience?.id && (item.type === 'vouch_pick' || item.type === 'trending')) {
            // Only set if not already tagged (vouch_pick takes priority)
            if (!tags[item.experience.id]) {
              tags[item.experience.id] = item.type;
            }
          }
        });
        setFeedTags(tags);
      })
      .catch(() => {});
  }, []);

  const toggleWishlist = async (e, expId) => {
    e.stopPropagation();
    const wasSaved = savedState[expId];
    setSavedState((s) => ({ ...s, [expId]: !wasSaved }));
    try {
      if (wasSaved) await api.wishlist.remove(expId);
      else await api.wishlist.add(expId);
    } catch {
      setSavedState((s) => ({ ...s, [expId]: wasSaved }));
    }
  };

  // Track which categories have been loaded (stable ref, no stale closures)
  const loadedRef = useRef(new Set());

  // Fetch experiences for a specific category (or all)
  const fetchCategory = useCallback(async (cat) => {
    const cacheKey = cat || 'all';
    if (loadedRef.current.has(cacheKey)) return;
    loadedRef.current.add(cacheKey);
    setLoading((l) => ({ ...l, [cacheKey]: true }));
    try {
      const params = cat ? { category: cat, limit: 50 } : { limit: 50 };
      const data = await api.experiences.list(params);
      // Deduplicate by id
      const seen = new Set();
      const unique = (data || []).filter((exp) => {
        if (seen.has(exp.id)) return false;
        seen.add(exp.id);
        return true;
      });
      setExperiencesByCategory((prev) => ({ ...prev, [cacheKey]: unique }));
    } catch {
      loadedRef.current.delete(cacheKey); // allow retry on failure
      setExperiencesByCategory((prev) => ({ ...prev, [cacheKey]: [] }));
    } finally {
      setLoading((l) => ({ ...l, [cacheKey]: false }));
    }
  }, []);

  // Fetch on tab change — vouch_picks and trending use the 'all' data
  useEffect(() => {
    if (activeTab === 'vouch_picks') {
      fetchCategory(null); // ensure 'all' is loaded
    } else {
      const cat = activeTab === 'all' ? null : activeTab;
      fetchCategory(cat);
    }
  }, [activeTab, fetchCategory]);

  const cacheKey = (activeTab === 'vouch_picks') ? 'all' : (activeTab === 'all' ? 'all' : activeTab);
  const rawExperiences = experiencesByCategory[cacheKey] || [];
  const isLoading = loading[cacheKey];

  // Filter for Vouch Picks / Trending tabs
  const experiences = activeTab === 'vouch_picks'
    ? rawExperiences.filter((exp) => feedTags[exp.id] === 'vouch_pick')
    : activeTab === 'trending'
      ? rawExperiences.filter((exp) => feedTags[exp.id] === 'trending')
      : rawExperiences;

  // Scroll-reveal observer — query DOM directly to avoid ref timing issues
  const gridRef = useRef(null);
  useEffect(() => {
    if (!gridRef.current) return;
    const cards = gridRef.current.children;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('opacity-100', 'translate-y-0');
            e.target.classList.remove('opacity-0', 'translate-y-5');
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' },
    );
    Array.from(cards).forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [activeTab, experiences]);

  return (
    <div className="pb-20 lg:pb-8">
      {/* Search bar */}
      <div className="px-4 lg:px-8 pt-4 pb-1 max-w-6xl mx-auto">
        <div
          className="bg-warm-white border border-stone rounded-full px-4 py-3 flex items-center gap-2 cursor-pointer hover:border-terracotta transition-vouch"
          onClick={() => navigate('/search')}
        >
          <Search className="w-4 h-4 text-secondary-text" />
          <span className="text-secondary-text text-sm">What do you want to do today?</span>
        </div>
      </div>

      {/* Category tabs */}
      <div className="px-4 lg:px-8 mt-3 max-w-6xl mx-auto">
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-2 text-sm font-semibold whitespace-nowrap transition-vouch border-b-2 ${
                activeTab === tab.key
                  ? 'text-terracotta border-terracotta'
                  : 'text-text-muted border-transparent hover:text-charcoal'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-16">
          <Loader2 className="w-7 h-7 text-terracotta animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && experiences.length === 0 && (
        <div className="px-4 lg:px-8 max-w-6xl mx-auto text-center py-16">
          <Search className="w-10 h-10 text-divider mx-auto mb-3" />
          <h3 className="font-serif text-lg font-bold mb-1">
            No experiences yet
          </h3>
          <p className="text-sm text-secondary-text mb-4">
            {activeTab === 'all'
              ? 'Discover and add places to see them here.'
              : `No ${activeTab} experiences found yet.`}
          </p>
          <button
            onClick={() => navigate('/search')}
            className="bg-charcoal text-cream px-6 py-2 rounded-full font-semibold text-sm hover:bg-terracotta transition-vouch"
          >
            Discover experiences
          </button>
        </div>
      )}

      {/* Experience grid */}
      {!isLoading && experiences.length > 0 && (
        <div className="px-4 lg:px-8 max-w-6xl mx-auto mt-4">
          <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
            {experiences.map((exp, i) => (
              <div
                key={exp.id}
                className="opacity-0 translate-y-5 transition-all duration-500 ease-out"
                style={{ transitionDelay: `${Math.min(i % 6, 5) * 60}ms` }}
              >
                <ExperienceCard
                  exp={exp}
                  tag={feedTags[exp.id]}
                  saved={savedState[exp.id] || false}
                  onToggleSave={toggleWishlist}
                  onClick={() => navigate(`/experience/${exp.id}`)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** Experience card for the feed grid. */
function ExperienceCard({ exp, tag, saved, onToggleSave, onClick }) {
  const isEvent = exp.is_event;

  return (
    <div
      className="bg-warm-white border border-stone-light rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-vouch cursor-pointer group"
      onClick={onClick}
    >
      {/* Cover image */}
      <div className="relative">
        {exp.cover_photo_url ? (
          <img
            src={exp.cover_photo_url}
            alt={exp.name}
            className="w-full h-40 object-cover"
          />
        ) : (
          <div className="w-full h-40 bg-surface flex items-center justify-center">
            {isEvent
              ? <Calendar className="w-8 h-8 text-divider" />
              : <MapPin className="w-8 h-8 text-divider" />}
          </div>
        )}
        <div className="absolute top-2 right-2">
          <BookmarkIcon
            saved={saved}
            onToggle={(e) => onToggleSave(e, exp.id)}
          />
        </div>
        {/* Feed tag badge */}
        {tag === 'vouch_pick' && (
          <div className="absolute top-2 left-2 bg-terracotta text-cream text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
            <Award className="w-3 h-3" />
            Vouch Pick
          </div>
        )}
        {tag === 'trending' && (
          <div className="absolute top-2 left-2 bg-amber text-cream text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
            <Flame className="w-3 h-3" />
            Trending
          </div>
        )}
        {exp.is_event && exp.event_date && (
          <div className="absolute bottom-2 left-2 bg-charcoal/80 text-cream text-xs px-2 py-1 rounded-full">
            {new Date(exp.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-serif font-bold text-sm text-primary-text line-clamp-1 group-hover:text-terracotta transition-vouch">
          {exp.name}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs px-2 py-0.5 bg-surface rounded-full text-secondary-text">
            {exp.category}
          </span>
          {exp.subcategory && exp.subcategory !== exp.category && (
            <span className="text-xs text-secondary-text">{exp.subcategory}</span>
          )}
        </div>
        {exp.neighborhood && (
          <p className="text-xs text-secondary-text mt-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 shrink-0" />
            {exp.neighborhood}
          </p>
        )}
        {!exp.neighborhood && exp.address && (
          <p className="text-xs text-secondary-text mt-1 flex items-center gap-1 line-clamp-1">
            <MapPin className="w-3 h-3 shrink-0" />
            {exp.address}
          </p>
        )}
        {exp.description && (
          <p className="text-xs text-secondary-text/80 mt-1 line-clamp-2">{exp.description}</p>
        )}
      </div>
    </div>
  );
}
