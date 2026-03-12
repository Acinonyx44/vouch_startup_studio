import PropTypes from 'prop-types';

/**
 * ScoreBreakdown — Three horizontal bars for Vibe / Value / Experience.
 * Shown on listing pages. Spec: page 10
 */
export default function ScoreBreakdown({ vibe, value, experience }) {
  const dimensions = [
    { label: 'Vibe', score: vibe },
    { label: 'Value', score: value },
    { label: 'Experience', score: experience },
  ];

  return (
    <div className="flex flex-col gap-2">
      {dimensions.map(({ label, score }) => (
        <div key={label} className="flex items-center gap-3">
          <span className="text-xs text-secondary-text w-20 shrink-0">{label}</span>
          <div className="flex-1 h-2 bg-divider rounded-full overflow-hidden">
            <div
              className="h-full bg-amber rounded-full transition-all duration-300"
              style={{ width: `${(score / 10) * 100}%` }}
            />
          </div>
          <span className="font-serif text-sm font-bold text-primary-text w-6 text-right">
            {score}
          </span>
        </div>
      ))}
    </div>
  );
}

ScoreBreakdown.propTypes = {
  vibe: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
  experience: PropTypes.number.isRequired,
};
