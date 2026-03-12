import PropTypes from 'prop-types';

/**
 * CategoryTag — Orange pill-style chip for category labels.
 * Spec: page 5 — category tags in Brand Orange or Secondary Gray.
 */
export default function CategoryTag({ category, variant = 'orange' }) {
  const styles = {
    orange: 'bg-terracotta/10 text-terracotta',
    gray: 'bg-stone-light text-text-muted',
  };

  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide ${styles[variant]}`}
    >
      {category}
    </span>
  );
}

CategoryTag.propTypes = {
  category: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['orange', 'gray']),
};
