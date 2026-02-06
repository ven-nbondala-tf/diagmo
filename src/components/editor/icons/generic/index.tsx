import React from 'react'
/**
 * Generic and Office Icons
 * Includes Kubernetes, Docker, and Microsoft Office icons
 */

interface IconProps {
  size?: number
  className?: string
}

export const KubernetesIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <rect width="256" height="256" fill="#326DE6" rx="24"/>
    <circle cx="128" cy="128" r="56" fill="#FFFFFF"/>
    <path d="M128,48 L128,72 M128,184 L128,208 M48,128 L72,128 M184,128 L208,128 M73,73 L91,91 M165,165 L183,183 M183,73 L165,91 M91,165 L73,183" stroke="#FFFFFF" strokeWidth="16" strokeLinecap="round"/>
    <circle cx="128" cy="128" r="20" fill="#326DE6"/>
  </svg>
)

export const DockerIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <rect width="256" height="256" fill="#2496ED" rx="24"/>
    <g fill="#FFFFFF">
      <rect x="88" y="56" width="32" height="28" rx="2"/>
      <rect x="88" y="88" width="32" height="28" rx="2"/>
      <rect x="52" y="88" width="32" height="28" rx="2"/>
      <rect x="16" y="88" width="32" height="28" rx="2"/>
      <rect x="16" y="120" width="32" height="28" rx="2"/>
      <rect x="52" y="120" width="32" height="28" rx="2"/>
      <rect x="88" y="120" width="32" height="28" rx="2"/>
      <rect x="124" y="120" width="32" height="28" rx="2"/>
      <rect x="160" y="120" width="32" height="28" rx="2"/>
    </g>
    <path d="M240,140 c-8,-6 -24,-8 -40,-4 c-2,-16 -12,-28 -28,-40 l-8,12 c12,10 16,26 14,42 c-4,1 -12,4 -26,4 L16,154 c0,48 28,80 80,80 c72,0 116,-40 140,-100 c16,2 36,0 48,-20 l-44,-26 z" fill="#2496ED"/>
  </svg>
)

export const ApiIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <rect width="256" height="256" fill="#6B7280" rx="24"/>
    <path d="M56,176 L88,80 L112,80 L144,176 M68,148 L132,148" stroke="#FFFFFF" strokeWidth="14" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M160,80 L160,176 M160,80 L208,80 M160,128 L196,128" stroke="#FFFFFF" strokeWidth="14" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const GenericDatabaseIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <rect width="256" height="256" fill="#6B7280" rx="24"/>
    <ellipse cx="128" cy="72" rx="80" ry="32" fill="#FFFFFF"/>
    <path d="M48,72 L48,184 C48,200 83,216 128,216 C173,216 208,200 208,184 L208,72" fill="#FFFFFF"/>
    <ellipse cx="128" cy="128" rx="80" ry="32" fill="none" stroke="#6B7280" strokeWidth="4"/>
    <ellipse cx="128" cy="184" rx="80" ry="32" fill="none" stroke="#6B7280" strokeWidth="4"/>
  </svg>
)

export const CacheIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <rect width="256" height="256" fill="#6B7280" rx="24"/>
    <circle cx="128" cy="128" r="72" fill="none" stroke="#FFFFFF" strokeWidth="14"/>
    <circle cx="128" cy="128" r="40" fill="#FFFFFF"/>
    <path d="M128,32 L128,56 M128,200 L128,224 M32,128 L56,128 M200,128 L224,128" stroke="#FFFFFF" strokeWidth="14" strokeLinecap="round"/>
  </svg>
)

export const QueueIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <rect width="256" height="256" fill="#6B7280" rx="24"/>
    <rect x="24" y="72" width="56" height="112" rx="8" fill="#FFFFFF"/>
    <rect x="100" y="72" width="56" height="112" rx="8" fill="#FFFFFF"/>
    <rect x="176" y="72" width="56" height="112" rx="8" fill="#FFFFFF"/>
    <path d="M80,128 L100,128 M156,128 L176,128" stroke="#FFFFFF" strokeWidth="8"/>
    <path d="M88,128 L100,120 M88,128 L100,136 M164,128 L176,120 M164,128 L176,136" stroke="#FFFFFF" strokeWidth="4" fill="none"/>
  </svg>
)

export const LoadBalancerIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <rect width="256" height="256" fill="#6B7280" rx="24"/>
    <rect x="88" y="24" width="80" height="56" rx="8" fill="#FFFFFF"/>
    <rect x="24" y="176" width="56" height="56" rx="8" fill="#FFFFFF"/>
    <rect x="100" y="176" width="56" height="56" rx="8" fill="#FFFFFF"/>
    <rect x="176" y="176" width="56" height="56" rx="8" fill="#FFFFFF"/>
    <path d="M128,80 L128,128 M128,128 L52,176 M128,128 L128,176 M128,128 L204,176" stroke="#FFFFFF" strokeWidth="10"/>
  </svg>
)

export const CdnIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <rect width="256" height="256" fill="#6B7280" rx="24"/>
    <circle cx="128" cy="128" r="80" fill="none" stroke="#FFFFFF" strokeWidth="12"/>
    <ellipse cx="128" cy="128" rx="80" ry="32" fill="none" stroke="#FFFFFF" strokeWidth="8"/>
    <path d="M128,48 L128,208" stroke="#FFFFFF" strokeWidth="8"/>
    <circle cx="64" cy="96" r="14" fill="#FFFFFF"/>
    <circle cx="192" cy="96" r="14" fill="#FFFFFF"/>
    <circle cx="80" cy="176" r="14" fill="#FFFFFF"/>
    <circle cx="176" cy="176" r="14" fill="#FFFFFF"/>
  </svg>
)

// ============================================================================
// MICROSOFT OFFICE ICONS - Microsoft 365 Fluent Design (2019+)
// ============================================================================

// Microsoft Office icons - Simple square design matching Microsoft 365 style
export const OfficeWordIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="word-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#41A5EE"/>
        <stop offset="100%" stopColor="#2B7CD3"/>
      </linearGradient>
    </defs>
    <rect fill="url(#word-grad)" width="256" height="256" rx="24"/>
    <path d="M80 80h24l16 64 16-64h24l-28 96h-24l-28-96z" fill="#fff"/>
  </svg>
)

export const OfficeExcelIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="excel-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#33C481"/>
        <stop offset="100%" stopColor="#21A366"/>
      </linearGradient>
    </defs>
    <rect fill="url(#excel-grad)" width="256" height="256" rx="24"/>
    <path d="M80 80l32 48-32 48h28l18-30 18 30h28l-32-48 32-48h-28l-18 30-18-30h-28z" fill="#fff"/>
  </svg>
)

export const OfficePowerPointIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="ppt-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FF8F6B"/>
        <stop offset="100%" stopColor="#D35230"/>
      </linearGradient>
    </defs>
    <rect fill="url(#ppt-grad)" width="256" height="256" rx="24"/>
    <path d="M88 80v96h24v-32h24c22 0 40-16 40-32s-18-32-40-32h-48zm24 20h20c10 0 18 6 18 12s-8 12-18 12h-20v-24z" fill="#fff"/>
  </svg>
)

export const OfficeOutlookIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="outlook-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#28A8EA"/>
        <stop offset="100%" stopColor="#0078D4"/>
      </linearGradient>
    </defs>
    <rect fill="url(#outlook-grad)" width="256" height="256" rx="24"/>
    <ellipse cx="128" cy="128" rx="40" ry="48" fill="none" stroke="#fff" strokeWidth="20"/>
  </svg>
)

export const OfficeTeamsIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="teams-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#7B83EB"/>
        <stop offset="100%" stopColor="#5059C9"/>
      </linearGradient>
    </defs>
    <rect fill="url(#teams-grad)" width="256" height="256" rx="24"/>
    <path d="M72 88h112v-20H72v20zm40 0v88h32V88h-32z" fill="#fff"/>
  </svg>
)

export const OfficeOneDriveIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="onedrive-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#28A8EA"/>
        <stop offset="100%" stopColor="#0078D4"/>
      </linearGradient>
    </defs>
    <rect fill="url(#onedrive-grad)" width="256" height="256" rx="24"/>
    <path d="M200 160c17.6 0 32-14.4 32-32 0-14.4-9.6-26.4-22.4-30.4 1.6-4 2.4-8.8 2.4-13.6 0-22-18-40-40-40-16.8 0-31.2 10.4-36.8 24.8-4-3.2-9.6-4.8-14.4-4.8-17.6 0-32 14.4-32 32 0 3.2.8 6.4 1.6 9.6C76.8 111.2 64 127.2 64 146c0 22 18 40 40 40h96z" fill="#fff"/>
  </svg>
)

export const OfficeSharePointIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="sharepoint-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#038387"/>
        <stop offset="100%" stopColor="#036C70"/>
      </linearGradient>
    </defs>
    <rect fill="url(#sharepoint-grad)" width="256" height="256" rx="24"/>
    <path d="M88 80c28 0 48 12 48 28s-20 28-48 28h-16v40h-20V80h36zm-16 40h14c14 0 26-5 26-12s-12-12-26-12h-14v24z" fill="#fff"/>
    <circle cx="160" cy="100" r="32" fill="#fff" opacity="0.6"/>
    <circle cx="180" cy="156" r="24" fill="#fff" opacity="0.4"/>
  </svg>
)

export const OfficeOneNoteIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="onenote-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#CA64EA"/>
        <stop offset="100%" stopColor="#7719AA"/>
      </linearGradient>
    </defs>
    <rect fill="url(#onenote-grad)" width="256" height="256" rx="24"/>
    <path d="M80 80v96h20v-56l40 56h24V80h-20v56l-40-56h-24z" fill="#fff"/>
  </svg>
)

export const OfficeAccessIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="access-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#E25C5C"/>
        <stop offset="100%" stopColor="#A4373A"/>
      </linearGradient>
    </defs>
    <rect fill="url(#access-grad)" width="256" height="256" rx="24"/>
    <path d="M128 72l-48 104h24l10-24h28l10 24h24l-48-104zm0 32l10 28h-20l10-28z" fill="#fff"/>
  </svg>
)

export const OfficePublisherIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="publisher-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2D9B9B"/>
        <stop offset="100%" stopColor="#077568"/>
      </linearGradient>
    </defs>
    <rect fill="url(#publisher-grad)" width="256" height="256" rx="24"/>
    <path d="M88 80v96h24v-32h24c22 0 40-16 40-32s-18-32-40-32h-48zm24 20h20c10 0 18 6 18 12s-8 12-18 12h-20v-24z" fill="#fff"/>
  </svg>
)

export const OfficeVisioIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="visio-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#5C81E5"/>
        <stop offset="100%" stopColor="#3955A3"/>
      </linearGradient>
    </defs>
    <rect fill="url(#visio-grad)" width="256" height="256" rx="24"/>
    <path d="M80 80h24l24 64 24-64h24l-36 96h-24l-36-96z" fill="#fff"/>
  </svg>
)

export const OfficeProjectIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="project-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4CAF50"/>
        <stop offset="100%" stopColor="#31752F"/>
      </linearGradient>
    </defs>
    <rect fill="url(#project-grad)" width="256" height="256" rx="24"/>
    <path d="M88 80v96h24v-32h24c22 0 40-16 40-32s-18-32-40-32h-48zm24 20h20c10 0 18 6 18 12s-8 12-18 12h-20v-24z" fill="#fff"/>
  </svg>
)

// Icon map for easy lookup

