export function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="1024" height="1024" rx="220" fill="#0B1020"/>
      <defs>
        <linearGradient id="icon_grad" x1="200" y1="200" x2="824" y2="824" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366F1"/>
          <stop offset="1" stopColor="#8B5CF6"/>
        </linearGradient>
        <filter id="glow" x="0" y="0" width="100%" height="100%">
          <feGaussianBlur stdDeviation="20" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
      </defs>
      {/* Business Card Base */}
      <rect x="212" y="312" width="600" height="400" rx="40" fill="url(#icon_grad)" fillOpacity="0.1" stroke="url(#icon_grad)" strokeWidth="40"/>
      {/* AI Spark / Lens */}
      <path d="M512 362L542 482L662 512L542 542L512 662L482 542L362 512L482 482L512 362Z" fill="url(#icon_grad)" filter="url(#glow)"/>
      <circle cx="512" cy="512" r="60" stroke="white" strokeWidth="8" strokeOpacity="0.5"/>
    </svg>
  );
}
