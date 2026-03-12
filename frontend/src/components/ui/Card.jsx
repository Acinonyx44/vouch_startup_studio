import PropTypes from 'prop-types';

/**
 * Card — Base card with off-white surface (#F5F5F3) and subtle border.
 * Spec: page 5 — generous whitespace, no heavy borders or shadows.
 */
export default function Card({ children, className = '', onClick }) {
  return (
    <div
      className={`bg-warm-white border border-stone-light rounded-xl p-4 ${onClick ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.99] transition-vouch' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  onClick: PropTypes.func,
};
