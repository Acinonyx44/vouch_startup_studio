import { NavLink, useLocation } from 'react-router-dom';
import { Compass, Search, Map, User } from 'lucide-react';
import { NAV_ITEMS } from '../../lib/constants';

const ICONS = {
  feed: Compass,
  search: Search,
  map: Map,
  profile: User,
};

/**
 * BottomNav — 4-tab persistent bottom navigation bar.
 * Spec: page 2 — "persistent bottom navigation bar"
 * Tabs: Explore, Search, Map, Profile
 */
export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-cream/95 backdrop-blur-md border-t border-stone-light z-50 lg:hidden">
      <div className="max-w-lg mx-auto flex items-center justify-around h-14">
        {NAV_ITEMS.map(({ key, label, path }) => {
          const Icon = ICONS[key];
          const isActive = location.pathname === path || (path === '/' && location.pathname === '/feed');

          return (
            <NavLink
              key={key}
              to={path}
              className="flex flex-col items-center gap-0.5 py-1 px-3 min-w-[56px]"
            >
              <Icon
                size={22}
                className={isActive ? 'text-terracotta' : 'text-text-muted'}
                strokeWidth={isActive ? 2.2 : 1.8}
              />
              <span
                className={`text-[10px] font-semibold ${isActive ? 'text-terracotta' : 'text-text-muted'}`}
              >
                {label}
              </span>
            </NavLink>
          );
        })}
      </div>
      {/* Safe area padding for iPhone notch */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
