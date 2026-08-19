/**
 * RoomBazar Bengaluru Cityscape & Skyline Illustration (Design Matching Reference).
 *
 * Features:
 * - Left side: Modern high-rise towers, apartment complexes with window grids, urban buildings, trees, clouds, birds.
 * - Right side: Heritage landmark domes (Vidhana Soudha style), clock towers, trees, clouds, and the iconic location pin.
 * - Soft peach/coral outlines (#F59E8B, #F8B4A5, #FDE8E2) with subtle warm fills.
 * - Sits behind the hero search bar with zero visual interference on the text.
 */
export function HeroCityscapePattern() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden select-none"
    >
      <svg
        className="absolute bottom-0 left-1/2 w-[1400px] -translate-x-1/2 md:w-full md:min-w-[1200px]"
        viewBox="0 0 1440 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMax meet"
      >
        <defs>
          {/* Subtle warm skyline stroke & fill colors */}
          <linearGradient id="skylineStroke" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F59E8B" stopOpacity="0.45" />
            <stop offset="25%" stopColor="#E88370" stopOpacity="0.38" />
            <stop offset="50%" stopColor="#F59E8B" stopOpacity="0.25" />
            <stop offset="75%" stopColor="#E88370" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#F59E8B" stopOpacity="0.45" />
          </linearGradient>
          <linearGradient id="buildingFill" x1="0" y1="0" x2="0" y2="320" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFF4EF" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#FFF9F6" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="pinGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F48773" />
            <stop offset="100%" stopColor="#D13421" />
          </linearGradient>
        </defs>

        {/* =========================================================================
            BACKGROUND CLOUDS & BIRDS
            ========================================================================= */}
        {/* Left Clouds */}
        <path
          d="M80 80 C70 80 60 90 60 100 C50 100 45 110 50 120 C55 125 130 125 135 120 C140 110 135 95 125 95 C120 85 105 80 95 85 C90 80 85 80 80 80 Z"
          stroke="#F8B4A5"
          strokeWidth="1"
          strokeOpacity="0.5"
          fill="#FFF9F6"
          fillOpacity="0.4"
        />
        {/* Right Clouds */}
        <path
          d="M1280 60 C1270 60 1260 70 1260 80 C1250 80 1245 90 1250 100 C1255 105 1330 105 1335 100 C1340 90 1335 75 1325 75 C1320 65 1305 60 1295 65 C1290 60 1285 60 1280 60 Z"
          stroke="#F8B4A5"
          strokeWidth="1"
          strokeOpacity="0.5"
          fill="#FFF9F6"
          fillOpacity="0.4"
        />
        {/* Birds flying */}
        <path
          d="M170 65 Q176 58 182 65 Q188 58 194 65"
          stroke="#E88370"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeOpacity="0.45"
          fill="none"
        />
        <path
          d="M190 75 Q195 70 200 75 Q205 70 210 75"
          stroke="#E88370"
          strokeWidth="1"
          strokeLinecap="round"
          strokeOpacity="0.35"
          fill="none"
        />

        {/* =========================================================================
            LEFT SKYLINE: Modern Towers, Residential Apartments & Balconies
            ========================================================================= */}
        {/* Far Background Skyline Left */}
        <rect x="50" y="140" width="45" height="180" stroke="url(#skylineStroke)" strokeWidth="1" fill="url(#buildingFill)" />
        <line x1="50" y1="160" x2="95" y2="160" stroke="url(#skylineStroke)" strokeWidth="0.75" />
        <line x1="50" y1="180" x2="95" y2="180" stroke="url(#skylineStroke)" strokeWidth="0.75" />
        <line x1="50" y1="200" x2="95" y2="200" stroke="url(#skylineStroke)" strokeWidth="0.75" />

        {/* High-Rise Residential Tower Left */}
        <path
          d="M100 90 L135 50 L170 90 L170 320 L100 320 Z"
          stroke="url(#skylineStroke)"
          strokeWidth="1.2"
          fill="url(#buildingFill)"
        />
        {/* Tower spire */}
        <line x1="135" y1="50" x2="135" y2="25" stroke="url(#skylineStroke)" strokeWidth="1.5" />
        <circle cx="135" cy="22" r="3" fill="#E88370" fillOpacity="0.6" />
        {/* High-Rise Windows Grid */}
        {[105, 130, 155, 180, 205, 230, 255].map((y) => (
          <g key={y}>
            <rect x="112" y={y} width="16" height="16" stroke="url(#skylineStroke)" strokeWidth="0.8" />
            <rect x="142" y={y} width="16" height="16" stroke="url(#skylineStroke)" strokeWidth="0.8" />
          </g>
        ))}

        {/* Commercial Building Left */}
        <rect x="180" y="130" width="70" height="190" stroke="url(#skylineStroke)" strokeWidth="1.2" fill="url(#buildingFill)" />
        {/* Rooftop Terrace / Garden railing */}
        <line x1="175" y1="130" x2="255" y2="130" stroke="url(#skylineStroke)" strokeWidth="1.5" />
        <line x1="180" y1="122" x2="250" y2="122" stroke="url(#skylineStroke)" strokeWidth="0.8" />
        {/* Grid Windows */}
        {[145, 175, 205, 235].map((y) => (
          <g key={y}>
            <rect x="190" y={y} width="12" height="18" stroke="url(#skylineStroke)" strokeWidth="0.8" />
            <rect x="209" y={y} width="12" height="18" stroke="url(#skylineStroke)" strokeWidth="0.8" />
            <rect x="228" y={y} width="12" height="18" stroke="url(#skylineStroke)" strokeWidth="0.8" />
          </g>
        ))}

        {/* Stepped Urban Complex (Left foreground) */}
        <path
          d="M10 210 L10 320 L80 320 L80 180 L50 180 L50 210 Z"
          stroke="url(#skylineStroke)"
          strokeWidth="1.2"
          fill="url(#buildingFill)"
        />
        {/* Windows on stepped building */}
        <rect x="20" y="225" width="10" height="12" stroke="url(#skylineStroke)" strokeWidth="0.8" />
        <rect x="35" y="225" width="10" height="12" stroke="url(#skylineStroke)" strokeWidth="0.8" />
        <rect x="20" y="250" width="10" height="12" stroke="url(#skylineStroke)" strokeWidth="0.8" />
        <rect x="35" y="250" width="10" height="12" stroke="url(#skylineStroke)" strokeWidth="0.8" />
        <rect x="58" y="195" width="12" height="16" stroke="url(#skylineStroke)" strokeWidth="0.8" />

        {/* Trees & Foliage (Left Side) */}
        <g stroke="url(#skylineStroke)" strokeWidth="1" fill="#FFF2EC" fillOpacity="0.6">
          <circle cx="260" cy="275" r="22" />
          <line x1="260" y1="297" x2="260" y2="320" stroke="url(#skylineStroke)" strokeWidth="1.5" />
          <circle cx="290" cy="285" r="18" />
          <line x1="290" y1="303" x2="290" y2="320" stroke="url(#skylineStroke)" strokeWidth="1.5" />
          <circle cx="315" cy="292" r="14" />
          <line x1="315" y1="306" x2="315" y2="320" stroke="url(#skylineStroke)" strokeWidth="1.2" />
        </g>

        {/* =========================================================================
            RIGHT SKYLINE: Heritage Dome (Vidhana Soudha motif), Towers, Pin & Trees
            ========================================================================= */}
        {/* Heritage Monument / Palace Dome Structure (Right) */}
        <g>
          {/* Main Base & Pillars */}
          <rect x="1100" y="190" width="140" height="130" stroke="url(#skylineStroke)" strokeWidth="1.2" fill="url(#buildingFill)" />
          <line x1="1090" y1="190" x2="1250" y2="190" stroke="url(#skylineStroke)" strokeWidth="1.5" />
          {/* Grand Arch */}
          <path
            d="M1140 320 L1140 250 Q1170 215 1200 250 L1200 320"
            stroke="url(#skylineStroke)"
            strokeWidth="1.2"
            fill="#FFF1EB"
            fillOpacity="0.4"
          />
          {/* Central Heritage Dome */}
          <path
            d="M1130 190 Q1170 110 1210 190 Z"
            stroke="url(#skylineStroke)"
            strokeWidth="1.3"
            fill="#FFEBE4"
            fillOpacity="0.7"
          />
          {/* Dome Spire / Finial */}
          <line x1="1170" y1="125" x2="1170" y2="95" stroke="url(#skylineStroke)" strokeWidth="1.5" />
          <circle cx="1170" cy="92" r="3.5" fill="#E88370" fillOpacity="0.7" />
          {/* Side Mini-Domes */}
          <path d="M1095 190 Q1110 160 1125 190" stroke="url(#skylineStroke)" strokeWidth="1" fill="#FFEBE4" fillOpacity="0.5" />
          <path d="M1215 190 Q1230 160 1245 190" stroke="url(#skylineStroke)" strokeWidth="1" fill="#FFEBE4" fillOpacity="0.5" />
        </g>

        {/* Modern Glass Tower (Right Far) */}
        <path
          d="M1270 80 Q1310 60 1350 80 L1350 320 L1270 320 Z"
          stroke="url(#skylineStroke)"
          strokeWidth="1.2"
          fill="url(#buildingFill)"
        />
        {/* Angled Facade Stripes */}
        {[100, 125, 150, 175, 200, 225, 250, 275].map((y) => (
          <line key={y} x1="1270" y1={y} x2="1350" y2={y - 12} stroke="url(#skylineStroke)" strokeWidth="0.8" />
        ))}

        {/* Traditional Clock Tower / Apartment Block (Right Near) */}
        <rect x="1000" y="160" width="80" height="160" stroke="url(#skylineStroke)" strokeWidth="1.2" fill="url(#buildingFill)" />
        <polygon points="1000,160 1040,120 1080,160" stroke="url(#skylineStroke)" strokeWidth="1.2" fill="#FFEBE4" fillOpacity="0.5" />
        <circle cx="1040" cy="175" r="10" stroke="url(#skylineStroke)" strokeWidth="1" fill="#FFF9F6" />
        <line x1="1040" y1="175" x2="1040" y2="169" stroke="#E88370" strokeWidth="1" />
        <line x1="1040" y1="175" x2="1045" y2="175" stroke="#E88370" strokeWidth="1" />
        {/* Balcony windows */}
        {[200, 235, 270].map((y) => (
          <g key={y}>
            <rect x="1012" y={y} width="22" height="18" stroke="url(#skylineStroke)" strokeWidth="0.8" />
            <rect x="1046" y={y} width="22" height="18" stroke="url(#skylineStroke)" strokeWidth="0.8" />
          </g>
        ))}

        {/* Right Trees & Landscape */}
        <g stroke="url(#skylineStroke)" strokeWidth="1" fill="#FFF2EC" fillOpacity="0.6">
          <circle cx="950" cy="285" r="20" />
          <line x1="950" y1="305" x2="950" y2="320" stroke="url(#skylineStroke)" strokeWidth="1.5" />
          <circle cx="920" cy="292" r="15" />
          <line x1="920" y1="307" x2="920" y2="320" stroke="url(#skylineStroke)" strokeWidth="1.2" />
          <circle cx="1375" cy="275" r="24" />
          <line x1="1375" y1="299" x2="1375" y2="320" stroke="url(#skylineStroke)" strokeWidth="1.5" />
        </g>

        {/* =========================================================================
            ICONIC LOCATION PIN (Positioned prominent on right near search bar)
            ========================================================================= */}
        <g transform="translate(1180, 68) scale(1.15)">
          {/* Drop shadow / subtle glow for pin */}
          <ellipse cx="14" cy="42" rx="6" ry="2.5" fill="#E88370" fillOpacity="0.25" />
          {/* Map Pin Body */}
          <path
            d="M14 0 C6.268 0 0 6.268 0 14 C0 24.5 14 38 14 38 C14 38 28 24.5 28 14 C28 6.268 21.732 0 14 0 Z"
            fill="url(#pinGradient)"
            fillOpacity="0.85"
          />
          {/* Inner Pin Dot */}
          <circle cx="14" cy="13" r="5" fill="#FFFFFF" />
        </g>

        {/* Ground Baseline */}
        <line x1="0" y1="319" x2="1440" y2="319" stroke="#F8B4A5" strokeWidth="1" strokeOpacity="0.6" />
      </svg>
    </div>
  );
}
