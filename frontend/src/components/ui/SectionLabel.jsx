import PropTypes from 'prop-types';

/**
 * SectionLabel — Orange all-caps section marker.
 * Matches 'YOUR TASTE PROFILE', 'NETWORK DISCOVERY' from the landing page.
 * Spec: page 5
 */
export default function SectionLabel({ text }) {
  return (
    <span className="section-label">
      {text}
    </span>
  );
}

SectionLabel.propTypes = {
  text: PropTypes.string.isRequired,
};
