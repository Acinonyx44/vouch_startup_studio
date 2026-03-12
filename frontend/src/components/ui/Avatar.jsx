import PropTypes from 'prop-types';
import { getInitials } from '../../lib/utils';

/**
 * Avatar — Circular user avatar with fallback initials.
 * Spec: page 9 — friend attribution with avatar + name.
 */
export default function Avatar({ src, name, size = 'md' }) {
  const sizes = {
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-9 h-9 text-xs',
    lg: 'w-14 h-14 text-base',
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'User avatar'}
        className={`${sizes[size]} rounded-full object-cover border border-divider`}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} rounded-full bg-terracotta/10 text-terracotta font-bold flex items-center justify-center border border-stone-light`}
    >
      {getInitials(name)}
    </div>
  );
}

Avatar.propTypes = {
  src: PropTypes.string,
  name: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
};
