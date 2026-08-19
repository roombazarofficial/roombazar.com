/**
 * Design #4: Subtle Architectural & Geometric Pattern for RoomBazar Hero.
 *
 * Implements the DESIGN #4 color-infused visual direction:
 * - Clean warm-white canvas (#FFFAF8 / #FFFDFC)
 * - Restrained palette: Peach (#F7C8BA), Soft Peach (#FCE0D8), Light Orange (#F6B58D),
 *   Warm Orange (#F2A65A), Soft Yellow (#F6D889), and RoomBazar Red (#D13421)
 * - Shapes inspired by floor plans, rooms, doorways, window slits, and structural geometry.
 * - Corner and edge placement keeps the center (headline & search) 100% clean.
 */
export function HeroArchitecturalPattern() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden select-none"
    >
      {/* =========================================================================
          TOP LEFT: Architectural floor-plan structure + Soft peach/orange solid block
          ========================================================================= */}
      <div className="absolute left-0 top-0 hidden opacity-90 sm:block md:opacity-100">
        <svg
          width="340"
          height="240"
          viewBox="0 0 340 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main room boundary with subtle cream fill */}
          <rect
            x="16"
            y="16"
            width="170"
            height="130"
            stroke="#D13421"
            strokeOpacity="0.18"
            strokeWidth="1"
            fill="#FFF4ED"
            fillOpacity="0.6"
          />

          {/* Small peach/orange filled sub-room accent */}
          <rect
            x="16"
            y="16"
            width="65"
            height="55"
            stroke="#F6B58D"
            strokeWidth="1"
            fill="#F7C8BA"
            fillOpacity="0.45"
          />

          {/* Internal room partition */}
          <line
            x1="16"
            y1="85"
            x2="120"
            y2="85"
            stroke="#D13421"
            strokeOpacity="0.16"
            strokeWidth="1"
          />

          {/* Doorway gap with swing arc */}
          <path
            d="M120 85 A22 22 0 0 1 142 63"
            stroke="#D13421"
            strokeOpacity="0.2"
            strokeWidth="1"
            strokeDasharray="2 2"
          />

          {/* Window / Aperture indicator on outer wall */}
          <line
            x1="60"
            y1="16"
            x2="105"
            y2="16"
            stroke="#D13421"
            strokeOpacity="0.35"
            strokeWidth="2"
          />

          {/* Secondary angled structural line */}
          <line
            x1="186"
            y1="16"
            x2="260"
            y2="90"
            stroke="#F2A65A"
            strokeOpacity="0.22"
            strokeWidth="1"
          />

          {/* Subtle architectural corner ticks */}
          <rect x="14" y="14" width="4" height="4" fill="#D13421" fillOpacity="0.25" />
          <rect x="184" y="14" width="4" height="4" fill="#D13421" fillOpacity="0.25" />
          <rect x="14" y="144" width="4" height="4" fill="#D13421" fillOpacity="0.25" />
          <rect x="184" y="144" width="4" height="4" fill="#D13421" fillOpacity="0.25" />
        </svg>
      </div>

      {/* =========================================================================
          TOP RIGHT: Outlined diamond & square forms + Soft yellow/orange accent
          ========================================================================= */}
      <div className="absolute right-0 top-0 hidden opacity-90 sm:block md:opacity-100">
        <svg
          width="360"
          height="260"
          viewBox="0 0 360 260"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Rotated geometric diamond space with soft peach/yellow accent */}
          <rect
            x="240"
            y="30"
            width="85"
            height="85"
            transform="rotate(45 240 30)"
            stroke="#F2A65A"
            strokeOpacity="0.25"
            strokeWidth="1"
            fill="#F6D889"
            fillOpacity="0.3"
          />

          {/* Rectangular room partition */}
          <rect
            x="150"
            y="35"
            width="140"
            height="110"
            stroke="#D13421"
            strokeOpacity="0.14"
            strokeWidth="1"
            fill="#FFF4ED"
            fillOpacity="0.4"
          />

          {/* Inner small room with peach fill */}
          <rect
            x="190"
            y="65"
            width="60"
            height="50"
            stroke="#F6B58D"
            strokeWidth="1"
            fill="#FCE0D8"
            fillOpacity="0.55"
          />

          {/* Thin dashed structural alignment ray */}
          <line
            x1="80"
            y1="90"
            x2="150"
            y2="90"
            stroke="#D13421"
            strokeOpacity="0.12"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          <line
            x1="290"
            y1="145"
            x2="350"
            y2="205"
            stroke="#F2A65A"
            strokeOpacity="0.18"
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* =========================================================================
          BOTTOM LEFT: Partial peach geometric shape + Intersecting connecting lines
          ========================================================================= */}
      <div className="absolute bottom-0 left-0 hidden opacity-85 md:block md:opacity-100">
        <svg
          width="300"
          height="190"
          viewBox="0 0 300 190"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Base structural grid lines */}
          <line
            x1="0"
            y1="130"
            x2="250"
            y2="130"
            stroke="#D13421"
            strokeOpacity="0.14"
            strokeWidth="1"
          />
          <line
            x1="130"
            y1="20"
            x2="130"
            y2="190"
            stroke="#D13421"
            strokeOpacity="0.14"
            strokeWidth="1"
          />

          {/* Partial peach geometric corner shape entering from bottom edge */}
          <rect
            x="40"
            y="70"
            width="90"
            height="60"
            stroke="#F6B58D"
            strokeWidth="1"
            fill="#F7C8BA"
            fillOpacity="0.4"
          />

          {/* Small warm yellow inner block */}
          <rect
            x="40"
            y="70"
            width="35"
            height="30"
            stroke="#F2A65A"
            strokeOpacity="0.3"
            strokeWidth="1"
            fill="#F6D889"
            fillOpacity="0.35"
          />

          {/* Dimension ticks */}
          <line
            x1="35"
            y1="70"
            x2="45"
            y2="70"
            stroke="#D13421"
            strokeOpacity="0.25"
            strokeWidth="1"
          />
          <line
            x1="35"
            y1="130"
            x2="45"
            y2="130"
            stroke="#D13421"
            strokeOpacity="0.25"
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* =========================================================================
          BOTTOM RIGHT: Larger soft peach/orange corner shape + Outlined frames
          ========================================================================= */}
      <div className="absolute bottom-0 right-0 hidden opacity-85 sm:block md:opacity-100">
        <svg
          width="320"
          height="210"
          viewBox="0 0 320 210"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer room frame */}
          <rect
            x="90"
            y="40"
            width="220"
            height="160"
            stroke="#D13421"
            strokeOpacity="0.15"
            strokeWidth="1"
            fill="#FFF4ED"
            fillOpacity="0.5"
          />

          {/* Larger soft peach/orange corner block */}
          <rect
            x="160"
            y="80"
            width="150"
            height="120"
            stroke="#F6B58D"
            strokeWidth="1"
            fill="#FCE0D8"
            fillOpacity="0.55"
          />

          {/* Sub-room partition inside peach block */}
          <rect
            x="160"
            y="80"
            width="75"
            height="65"
            stroke="#F2A65A"
            strokeOpacity="0.3"
            strokeWidth="1"
            fill="#F7C8BA"
            fillOpacity="0.35"
          />

          {/* Entrance doorway aperture */}
          <line
            x1="135"
            y1="40"
            x2="175"
            y2="40"
            stroke="#D13421"
            strokeOpacity="0.3"
            strokeWidth="2"
          />

          {/* Dashed alignment ray */}
          <line
            x1="10"
            y1="40"
            x2="90"
            y2="40"
            stroke="#D13421"
            strokeOpacity="0.1"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        </svg>
      </div>

      {/* =========================================================================
          MOBILE VIEW: Ultra-subtle minimal corner cue (non-intrusive)
          ========================================================================= */}
      <div className="absolute right-0 top-0 opacity-70 sm:hidden">
        <svg
          width="130"
          height="100"
          viewBox="0 0 130 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="40"
            y="10"
            width="80"
            height="60"
            stroke="#F6B58D"
            strokeWidth="1"
            fill="#FCE0D8"
            fillOpacity="0.4"
          />
        </svg>
      </div>
    </div>
  );
}
