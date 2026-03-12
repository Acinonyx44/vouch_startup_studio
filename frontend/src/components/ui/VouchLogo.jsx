/**
 * VouchLogo — The "Vouch." wordmark with terracotta dot.
 * Matches the branding from the marketing site.
 */
export default function VouchLogo({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-5xl lg:text-6xl',
  };

  return (
    <span className={`font-serif font-bold tracking-tight text-charcoal ${sizes[size]} ${className}`}>
      Vouch<span className="text-terracotta">.</span>
    </span>
  );
}
