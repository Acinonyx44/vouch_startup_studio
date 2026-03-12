import PropTypes from 'prop-types';

/**
 * PhotoStrip — Horizontal scrollable photo carousel (up to 3).
 * Spec: page 9 — "Photo strip (if uploaded, up to 3)"
 */
export default function PhotoStrip({ photos }) {
  if (!photos || photos.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto hide-scrollbar">
      {photos.slice(0, 3).map((photo, i) => (
        <img
          key={i}
          src={photo}
          alt={`Photo ${i + 1}`}
          className="w-28 h-28 rounded-lg object-cover shrink-0 border border-stone-light"
        />
      ))}
    </div>
  );
}

PhotoStrip.propTypes = {
  photos: PropTypes.arrayOf(PropTypes.string),
};
