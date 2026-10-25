// 3D text logo: a candlestick mark, a gold italic "Fx" and "Sadnan" with an extruded shadow.
export default function Logo({ size = 'md' }) {
  return (
    <span className={`logo logo-${size}`} aria-label="FxSadnan">
      <svg className="logo-mark" viewBox="0 0 24 28" aria-hidden="true">
        <line x1="5" y1="9" x2="5" y2="25" className="lm-down" />
        <rect x="2" y="12" width="6" height="9" rx="1" className="lm-down" />
        <line x1="12" y1="5" x2="12" y2="21" className="lm-up" />
        <rect x="9" y="8" width="6" height="10" rx="1" className="lm-up" />
        <line x1="19" y1="1" x2="19" y2="15" className="lm-up" />
        <rect x="16" y="3" width="6" height="9" rx="1" className="lm-up" />
      </svg>
      <span className="logo-fx" aria-hidden="true">
        Fx
      </span>
      <span className="logo-name" aria-hidden="true">
        Sadnan
      </span>
    </span>
  )
}
