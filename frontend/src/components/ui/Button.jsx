import PropTypes from 'prop-types';

/**
 * Button — Primary (Brand Orange) and secondary (gray) button.
 * Spec: page 5 — Orange as a highlighter, not a fill color (used sparingly).
 */
export default function Button({ children, variant = 'primary', size = 'md', onClick, disabled = false, className = '', type = 'button' }) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-full transition-vouch focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-charcoal text-cream hover:bg-terracotta focus:ring-terracotta',
    secondary: 'bg-transparent text-charcoal border border-stone hover:border-terracotta hover:text-terracotta focus:ring-stone',
    ghost: 'bg-transparent text-terracotta hover:bg-terracotta/5 focus:ring-terracotta',
  };

  const sizes = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-sm px-4 py-2.5',
    lg: 'text-base px-6 py-3',
  };

  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  type: PropTypes.string,
};
