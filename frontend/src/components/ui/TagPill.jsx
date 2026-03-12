import PropTypes from 'prop-types';

/**
 * TagPill — Brand Orange outline pill for user-selectable tags.
 * Spec: page 9 — "User tags in Brand Orange"
 * Tags: 'Great for dates', 'Worth the hype', 'Hidden gem', etc.
 */
export default function TagPill({ tag, selected = false, onClick }) {
  return (
    <span
      onClick={onClick}
      className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-vouch whitespace-nowrap
        ${onClick ? 'cursor-pointer' : ''}
        ${selected
          ? 'bg-charcoal text-cream border-charcoal'
          : 'bg-transparent text-terracotta border-stone hover:border-terracotta'
        }`}
      role={onClick ? 'button' : undefined}
    >
      {tag}
    </span>
  );
}

TagPill.propTypes = {
  tag: PropTypes.string.isRequired,
  selected: PropTypes.bool,
  onClick: PropTypes.func,
};
