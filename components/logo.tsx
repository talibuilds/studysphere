export function Logo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </linearGradient>
          <linearGradient id="sGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>
        </defs>
        
        {/* Main Sphere */}
        <circle cx="50" cy="50" r="35" fill="url(#blueGrad)" />
        
        {/* Orbit Ring */}
        <ellipse cx="50" cy="50" rx="45" ry="20" transform="rotate(-15 50 50)" stroke="url(#blueGrad)" strokeWidth="2" fill="none" opacity="0.8" />
        
        {/* Orbit Planet */}
        <circle cx="85" cy="35" r="3.5" fill="#60a5fa" />
        
        {/* Star */}
        <path d="M 65 15 L 68 22 L 75 25 L 68 28 L 65 35 L 62 28 L 55 25 L 62 22 Z" fill="#60a5fa" />
        
        {/* 'S' Shape (Stylized) */}
        <path 
          d="M 62 38 C 50 35, 42 40, 48 50 C 55 60, 48 65, 38 62" 
          stroke="url(#sGrad)" 
          strokeWidth="12" 
          strokeLinecap="round" 
          fill="none" 
        />
      </svg>
    </div>
  )
}
