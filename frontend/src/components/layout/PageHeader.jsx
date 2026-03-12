import PropTypes from 'prop-types';

/**
 * PageHeader — Top header bar with optional back button and actions.
 */
export default function PageHeader({ title, subtitle, children }) {
  return (
    <header className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-divider z-40 px-4 lg:px-8 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div>
          <h1 className="font-serif text-xl font-bold text-primary-text leading-tight">{title}</h1>
          {subtitle && (
            <p className="text-xs text-secondary-text mt-0.5">{subtitle}</p>
          )}
        </div>
        {children && <div className="flex items-center gap-2">{children}</div>}
      </div>
    </header>
  );
}

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  children: PropTypes.node,
};
