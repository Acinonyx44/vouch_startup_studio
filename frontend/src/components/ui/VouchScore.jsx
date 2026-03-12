import PropTypes from 'prop-types';

/**
 * VouchScore — The brand's signature UI element.
 * Displays a score in Georgia serif, Brand Yellow, at various sizes.
 * Spec: pages 5–6
 */
export default function VouchScore({ score, size = 'md', showOutOf = false }) {
  const sizeClass = {
    sm: 'score-display-sm',
    md: 'score-display-md',
    lg: 'score-display-lg',
  }[size];

  const rounded = Math.round(score);
  const colorClass = rounded >= 9 ? 'score-high' : rounded >= 7 ? 'score-good' : rounded >= 5 ? 'score-mid' : 'score-low';

  return (
    <span className={`score-display ${sizeClass} ${colorClass}`}>
      {rounded}
      {showOutOf && <span className="text-secondary-text text-[0.4em] font-sans font-normal">/10</span>}
    </span>
  );
}

VouchScore.propTypes = {
  score: PropTypes.number.isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  showOutOf: PropTypes.bool,
};
