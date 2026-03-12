import PropTypes from 'prop-types';
import { getScoreLabel } from '../../lib/utils';

/**
 * ScoreLabel — Auto-assigned text label based on score.
 * AVOID / MEH / RELIABLE / GREAT / TELL EVERYONE
 * Displayed in Brand Orange, all-caps, 11px bold. Spec: page 6
 */
export default function ScoreLabel({ score }) {
  const label = getScoreLabel(score);
  if (!label) return null;

  return (
    <span className="section-label">
      {label}
    </span>
  );
}

ScoreLabel.propTypes = {
  score: PropTypes.number.isRequired,
};
