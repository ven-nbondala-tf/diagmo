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
// MICROSOFT OFFICE ICONS - Official Microsoft 365 Fluent Design
// Based on Microsoft's official icon design system
// ============================================================================

// Word - Blue with W lettermark
export const OfficeWordIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 96 96" className={className}>
    <defs>
      <linearGradient id="word-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#41A5EE"/>
        <stop offset="50%" stopColor="#2B7CD3"/>
        <stop offset="100%" stopColor="#185ABD"/>
      </linearGradient>
    </defs>
    <rect width="96" height="96" rx="8" fill="url(#word-bg)"/>
    <rect x="52" y="16" width="32" height="64" rx="3" fill="#fff"/>
    <path d="M12 24h32c2 0 4 2 4 4v44c0 2-2 4-4 4H12V24z" fill="#185ABD"/>
    <path d="M20 36l4 24 4-18 4 18 4-24" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

// Excel - Green with X lettermark
export const OfficeExcelIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 96 96" className={className}>
    <defs>
      <linearGradient id="excel-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#33C481"/>
        <stop offset="50%" stopColor="#21A366"/>
        <stop offset="100%" stopColor="#107C41"/>
      </linearGradient>
    </defs>
    <rect width="96" height="96" rx="8" fill="url(#excel-bg)"/>
    <rect x="52" y="16" width="32" height="64" rx="3" fill="#fff"/>
    <rect x="56" y="24" width="10" height="10" fill="#21A366"/>
    <rect x="70" y="24" width="10" height="10" fill="#21A366"/>
    <rect x="56" y="38" width="10" height="10" fill="#21A366"/>
    <rect x="70" y="38" width="10" height="10" fill="#21A366"/>
    <rect x="56" y="52" width="10" height="10" fill="#21A366"/>
    <rect x="70" y="52" width="10" height="10" fill="#21A366"/>
    <rect x="56" y="66" width="10" height="10" fill="#21A366"/>
    <rect x="70" y="66" width="10" height="10" fill="#21A366"/>
    <path d="M12 24h32c2 0 4 2 4 4v44c0 2-2 4-4 4H12V24z" fill="#107C41"/>
    <path d="M20 36l8 12-8 12M36 36l-8 12 8 12" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

// PowerPoint - Orange/Red with P lettermark
export const OfficePowerPointIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 96 96" className={className}>
    <defs>
      <linearGradient id="ppt-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FF8F6B"/>
        <stop offset="50%" stopColor="#ED6C47"/>
        <stop offset="100%" stopColor="#C43E1C"/>
      </linearGradient>
    </defs>
    <rect width="96" height="96" rx="8" fill="url(#ppt-bg)"/>
    <rect x="52" y="24" width="32" height="48" rx="3" fill="#fff"/>
    <path d="M12 24h32c2 0 4 2 4 4v44c0 2-2 4-4 4H12V24z" fill="#C43E1C"/>
    <path d="M22 36v24M22 36h8c4 0 8 3 8 7s-4 7-8 7h-8" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

// Outlook - Blue with O lettermark
export const OfficeOutlookIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 96 96" className={className}>
    <defs>
      <linearGradient id="outlook-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#28A8EA"/>
        <stop offset="50%" stopColor="#0F78D4"/>
        <stop offset="100%" stopColor="#0364B8"/>
      </linearGradient>
    </defs>
    <rect width="96" height="96" rx="8" fill="url(#outlook-bg)"/>
    <path d="M52 24h28c2 0 4 2 4 4v44c0 2-2 4-4 4H52V24z" fill="#fff"/>
    <path d="M52 32l20 14-20 14" stroke="#0364B8" strokeWidth="2" fill="none"/>
    <path d="M12 24h32c2 0 4 2 4 4v44c0 2-2 4-4 4H12V24z" fill="#0364B8"/>
    <ellipse cx="28" cy="48" rx="8" ry="10" stroke="#fff" strokeWidth="3" fill="none"/>
  </svg>
)

// Teams - Purple with T lettermark and people
export const OfficeTeamsIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 96 96" className={className}>
    <defs>
      <linearGradient id="teams-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#7B83EB"/>
        <stop offset="50%" stopColor="#5C64C7"/>
        <stop offset="100%" stopColor="#464EB8"/>
      </linearGradient>
    </defs>
    <rect width="96" height="96" rx="8" fill="url(#teams-bg)"/>
    <circle cx="68" cy="28" r="10" fill="#fff"/>
    <path d="M58 44h20c4 0 6 2 6 6v18H52V50c0-4 2-6 6-6z" fill="#fff"/>
    <circle cx="48" cy="32" r="12" fill="#7B83EB" stroke="#fff" strokeWidth="2"/>
    <path d="M12 24h32c2 0 4 2 4 4v44c0 2-2 4-4 4H12V24z" fill="#464EB8"/>
    <path d="M22 40h12M28 40v16" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round"/>
  </svg>
)

// OneDrive - Blue cloud
export const OfficeOneDriveIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 96 96" className={className}>
    <defs>
      <linearGradient id="onedrive-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#28A8EA"/>
        <stop offset="100%" stopColor="#0078D4"/>
      </linearGradient>
    </defs>
    <rect width="96" height="96" rx="8" fill="url(#onedrive-bg)"/>
    <path d="M72 58c8 0 14-6 14-14 0-6-4-12-10-13 0-2 1-4 1-6 0-10-8-17-18-17-8 0-14 4-17 11-2-1-4-2-6-2-8 0-14 6-14 14 0 1 0 3 1 4-5 2-9 7-9 13 0 8 6 14 14 14h44z" fill="#fff"/>
  </svg>
)

// SharePoint - Teal with S lettermark
export const OfficeSharePointIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 96 96" className={className}>
    <defs>
      <linearGradient id="sharepoint-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#03787C"/>
        <stop offset="100%" stopColor="#036C70"/>
      </linearGradient>
    </defs>
    <rect width="96" height="96" rx="8" fill="url(#sharepoint-bg)"/>
    <circle cx="60" cy="34" r="18" fill="#fff"/>
    <circle cx="72" cy="56" r="14" fill="#fff" opacity="0.8"/>
    <circle cx="58" cy="68" r="10" fill="#fff" opacity="0.6"/>
    <path d="M12 24h32c2 0 4 2 4 4v44c0 2-2 4-4 4H12V24z" fill="#036C70"/>
    <path d="M34 40c-6 0-10 2-10 6s3 4 8 5c5 1 8 2 8 5s-4 6-10 6" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round"/>
  </svg>
)

// OneNote - Purple with N lettermark
export const OfficeOneNoteIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 96 96" className={className}>
    <defs>
      <linearGradient id="onenote-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#CA64EA"/>
        <stop offset="50%" stopColor="#9332BF"/>
        <stop offset="100%" stopColor="#7719AA"/>
      </linearGradient>
    </defs>
    <rect width="96" height="96" rx="8" fill="url(#onenote-bg)"/>
    <rect x="52" y="16" width="32" height="64" rx="3" fill="#fff"/>
    <path d="M12 24h32c2 0 4 2 4 4v44c0 2-2 4-4 4H12V24z" fill="#7719AA"/>
    <path d="M20 36v24M20 36l16 24M36 36v24" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

// Access - Red with A lettermark
export const OfficeAccessIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 96 96" className={className}>
    <defs>
      <linearGradient id="access-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#E25C5C"/>
        <stop offset="100%" stopColor="#A4262C"/>
      </linearGradient>
    </defs>
    <rect width="96" height="96" rx="8" fill="url(#access-bg)"/>
    <rect x="52" y="16" width="32" height="64" rx="3" fill="#fff"/>
    <path d="M12 24h32c2 0 4 2 4 4v44c0 2-2 4-4 4H12V24z" fill="#A4262C"/>
    <path d="M22 60l6-24 6 24M24 52h8" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

// Publisher - Teal with P lettermark
export const OfficePublisherIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 96 96" className={className}>
    <defs>
      <linearGradient id="publisher-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2D9B9B"/>
        <stop offset="100%" stopColor="#077568"/>
      </linearGradient>
    </defs>
    <rect width="96" height="96" rx="8" fill="url(#publisher-bg)"/>
    <rect x="52" y="16" width="32" height="64" rx="3" fill="#fff"/>
    <path d="M12 24h32c2 0 4 2 4 4v44c0 2-2 4-4 4H12V24z" fill="#077568"/>
    <path d="M22 36v24M22 36h8c4 0 8 3 8 7s-4 7-8 7h-8" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

// Visio - Blue with V lettermark
export const OfficeVisioIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 96 96" className={className}>
    <defs>
      <linearGradient id="visio-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#5C81E5"/>
        <stop offset="100%" stopColor="#3955A3"/>
      </linearGradient>
    </defs>
    <rect width="96" height="96" rx="8" fill="url(#visio-bg)"/>
    <rect x="52" y="24" width="32" height="48" rx="3" fill="#fff"/>
    <polygon points="60,32 68,52 76,32" stroke="#3955A3" strokeWidth="2" fill="none"/>
    <polygon points="60,48 68,68 76,48" stroke="#3955A3" strokeWidth="2" fill="none"/>
    <path d="M12 24h32c2 0 4 2 4 4v44c0 2-2 4-4 4H12V24z" fill="#3955A3"/>
    <path d="M20 36l8 24 8-24" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

// Project - Green with P lettermark and Gantt bars
export const OfficeProjectIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 96 96" className={className}>
    <defs>
      <linearGradient id="project-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4CAF50"/>
        <stop offset="100%" stopColor="#31752F"/>
      </linearGradient>
    </defs>
    <rect width="96" height="96" rx="8" fill="url(#project-bg)"/>
    <rect x="52" y="16" width="32" height="64" rx="3" fill="#fff"/>
    <rect x="56" y="24" width="16" height="6" rx="2" fill="#31752F"/>
    <rect x="60" y="36" width="20" height="6" rx="2" fill="#31752F"/>
    <rect x="56" y="48" width="12" height="6" rx="2" fill="#31752F"/>
    <rect x="64" y="60" width="16" height="6" rx="2" fill="#31752F"/>
    <path d="M12 24h32c2 0 4 2 4 4v44c0 2-2 4-4 4H12V24z" fill="#31752F"/>
    <path d="M22 36v24M22 36h8c4 0 8 3 8 7s-4 7-8 7h-8" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

// ============================================================================
// MICROSOFT 365 ADDITIONAL ICONS - Power Platform, Collaboration & Security
// ============================================================================

// Microsoft 365 Logo
export const M365Icon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="m365-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#EB3C00"/>
        <stop offset="50%" stopColor="#D83B01"/>
        <stop offset="100%" stopColor="#B83400"/>
      </linearGradient>
    </defs>
    <rect fill="url(#m365-grad)" width="256" height="256" rx="24"/>
    <path d="M48 80v96h24V104l28 48h8l28-48v72h24V80h-28l-28 52-28-52H48z" fill="#fff"/>
  </svg>
)

// Power BI - Business Intelligence
export const PowerBIIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="powerbi-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F2C811"/>
        <stop offset="100%" stopColor="#E8A500"/>
      </linearGradient>
    </defs>
    <rect fill="url(#powerbi-grad)" width="256" height="256" rx="24"/>
    <rect x="56" y="120" width="40" height="72" rx="4" fill="#fff"/>
    <rect x="108" y="88" width="40" height="104" rx="4" fill="#fff"/>
    <rect x="160" y="56" width="40" height="136" rx="4" fill="#fff"/>
  </svg>
)

// Power Apps - Low-code app development
export const PowerAppsIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="powerapps-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8C3D91"/>
        <stop offset="100%" stopColor="#6B2C6E"/>
      </linearGradient>
    </defs>
    <rect fill="url(#powerapps-grad)" width="256" height="256" rx="24"/>
    <path d="M128 48l72 120H56l72-120z" fill="#fff"/>
    <circle cx="128" cy="176" r="24" fill="#fff"/>
  </svg>
)

// Power Automate - Workflow automation
export const PowerAutomateIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="powerautomate-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0066FF"/>
        <stop offset="100%" stopColor="#0052CC"/>
      </linearGradient>
    </defs>
    <rect fill="url(#powerautomate-grad)" width="256" height="256" rx="24"/>
    <path d="M56 128h56l-20-40h88l-64 80h56l-20 40H64l64-80H56z" fill="#fff"/>
  </svg>
)

// Power Virtual Agents - Chatbots
export const PowerVirtualAgentsIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="pva-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0B556A"/>
        <stop offset="100%" stopColor="#094554"/>
      </linearGradient>
    </defs>
    <rect fill="url(#pva-grad)" width="256" height="256" rx="24"/>
    <path d="M64 64h128v96c0 17.6-14.4 32-32 32H96c-17.6 0-32-14.4-32-32V64z" fill="#fff"/>
    <circle cx="104" cy="120" r="12" fill="#0B556A"/>
    <circle cx="152" cy="120" r="12" fill="#0B556A"/>
    <path d="M104 152c0 0 12 16 24 16s24-16 24-16" stroke="#0B556A" strokeWidth="8" fill="none" strokeLinecap="round"/>
    <path d="M96 192v24M160 192v24" stroke="#fff" strokeWidth="12" strokeLinecap="round"/>
  </svg>
)

// Microsoft Planner - Task management
export const PlannerIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="planner-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#31752F"/>
        <stop offset="100%" stopColor="#185C16"/>
      </linearGradient>
    </defs>
    <rect fill="url(#planner-grad)" width="256" height="256" rx="24"/>
    <rect x="48" y="56" width="56" height="144" rx="8" fill="#fff"/>
    <rect x="120" y="80" width="56" height="120" rx="8" fill="#fff" opacity="0.8"/>
    <rect x="192" y="104" width="16" height="96" rx="4" fill="#fff" opacity="0.6"/>
    <circle cx="76" cy="88" r="12" fill="#31752F"/>
    <rect x="60" y="112" width="32" height="6" rx="3" fill="#31752F"/>
    <rect x="60" y="128" width="24" height="6" rx="3" fill="#31752F"/>
  </svg>
)

// Microsoft To Do - Personal task management
export const ToDoIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="todo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#5C6BC0"/>
        <stop offset="100%" stopColor="#3949AB"/>
      </linearGradient>
    </defs>
    <rect fill="url(#todo-grad)" width="256" height="256" rx="24"/>
    <circle cx="128" cy="128" r="64" fill="none" stroke="#fff" strokeWidth="16"/>
    <path d="M96 128l20 20 44-44" stroke="#fff" strokeWidth="16" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

// Microsoft Forms - Surveys and quizzes
export const FormsIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="forms-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#077568"/>
        <stop offset="100%" stopColor="#036052"/>
      </linearGradient>
    </defs>
    <rect fill="url(#forms-grad)" width="256" height="256" rx="24"/>
    <rect x="56" y="56" width="144" height="144" rx="12" fill="#fff"/>
    <rect x="80" y="88" width="16" height="16" rx="2" fill="#077568"/>
    <rect x="108" y="92" width="64" height="8" rx="4" fill="#077568"/>
    <rect x="80" y="120" width="16" height="16" rx="2" fill="#077568"/>
    <rect x="108" y="124" width="64" height="8" rx="4" fill="#077568"/>
    <rect x="80" y="152" width="16" height="16" rx="2" fill="#077568"/>
    <rect x="108" y="156" width="64" height="8" rx="4" fill="#077568"/>
  </svg>
)

// Microsoft Stream - Video platform
export const StreamIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="stream-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#BC1948"/>
        <stop offset="100%" stopColor="#9A1339"/>
      </linearGradient>
    </defs>
    <rect fill="url(#stream-grad)" width="256" height="256" rx="24"/>
    <rect x="48" y="72" width="160" height="112" rx="12" fill="#fff"/>
    <path d="M112 104v48l40-24-40-24z" fill="#BC1948"/>
  </svg>
)

// Microsoft Whiteboard - Digital canvas
export const WhiteboardIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="whiteboard-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#55A4E4"/>
        <stop offset="100%" stopColor="#2E8BC9"/>
      </linearGradient>
    </defs>
    <rect fill="url(#whiteboard-grad)" width="256" height="256" rx="24"/>
    <rect x="48" y="56" width="160" height="144" rx="8" fill="#fff"/>
    <circle cx="96" cy="112" r="20" fill="#FFC107" opacity="0.8"/>
    <rect x="136" y="96" width="48" height="32" rx="4" fill="#4CAF50" opacity="0.8"/>
    <path d="M72 160l32-24 24 16 40-32 24 24" stroke="#2196F3" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

// Microsoft Lists - List management
export const ListsIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="lists-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0078D4"/>
        <stop offset="100%" stopColor="#005A9E"/>
      </linearGradient>
    </defs>
    <rect fill="url(#lists-grad)" width="256" height="256" rx="24"/>
    <rect x="56" y="56" width="144" height="36" rx="6" fill="#fff"/>
    <rect x="56" y="108" width="144" height="36" rx="6" fill="#fff" opacity="0.8"/>
    <rect x="56" y="160" width="144" height="36" rx="6" fill="#fff" opacity="0.6"/>
    <rect x="72" y="68" width="12" height="12" rx="2" fill="#0078D4"/>
    <rect x="72" y="120" width="12" height="12" rx="2" fill="#0078D4"/>
    <rect x="72" y="172" width="12" height="12" rx="2" fill="#0078D4"/>
  </svg>
)

// Microsoft Loop - Collaborative components
export const LoopIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="loop-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#464EB8"/>
        <stop offset="100%" stopColor="#343C9A"/>
      </linearGradient>
    </defs>
    <rect fill="url(#loop-grad)" width="256" height="256" rx="24"/>
    <path d="M128 56c-39.8 0-72 32.2-72 72s32.2 72 72 72 72-32.2 72-72" stroke="#fff" strokeWidth="20" fill="none" strokeLinecap="round"/>
    <path d="M200 128l-16-20 16-20" stroke="#fff" strokeWidth="12" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

// Microsoft Bookings - Appointment scheduling
export const BookingsIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="bookings-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00A4EF"/>
        <stop offset="100%" stopColor="#0078D4"/>
      </linearGradient>
    </defs>
    <rect fill="url(#bookings-grad)" width="256" height="256" rx="24"/>
    <rect x="56" y="72" width="144" height="128" rx="12" fill="#fff"/>
    <rect x="56" y="56" width="144" height="32" rx="12" fill="#fff"/>
    <rect x="80" y="48" width="16" height="24" rx="4" fill="#00A4EF"/>
    <rect x="160" y="48" width="16" height="24" rx="4" fill="#00A4EF"/>
    <rect x="80" y="112" width="24" height="24" rx="4" fill="#00A4EF"/>
    <rect x="116" y="112" width="24" height="24" rx="4" fill="#00A4EF"/>
    <rect x="152" y="112" width="24" height="24" rx="4" fill="#00A4EF" opacity="0.5"/>
    <rect x="80" y="152" width="24" height="24" rx="4" fill="#00A4EF" opacity="0.5"/>
  </svg>
)

// Viva Engage (formerly Yammer) - Enterprise social
export const VivaEngageIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="viva-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#106EBE"/>
        <stop offset="100%" stopColor="#0B5394"/>
      </linearGradient>
    </defs>
    <rect fill="url(#viva-grad)" width="256" height="256" rx="24"/>
    <circle cx="128" cy="100" r="36" fill="#fff"/>
    <path d="M72 192c0-31 25-56 56-56s56 25 56 56" fill="#fff"/>
    <circle cx="64" cy="120" r="20" fill="#fff" opacity="0.6"/>
    <circle cx="192" cy="120" r="20" fill="#fff" opacity="0.6"/>
  </svg>
)

// Microsoft Defender - Security
export const DefenderIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="defender-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0078D4"/>
        <stop offset="100%" stopColor="#005A9E"/>
      </linearGradient>
    </defs>
    <rect fill="url(#defender-grad)" width="256" height="256" rx="24"/>
    <path d="M128 48L56 80v64c0 48 72 80 72 80s72-32 72-80V80l-72-32z" fill="#fff"/>
    <path d="M112 128l16 16 32-32" stroke="#0078D4" strokeWidth="16" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

// Microsoft Intune - Device management
export const IntuneIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="intune-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0078D4"/>
        <stop offset="100%" stopColor="#004C87"/>
      </linearGradient>
    </defs>
    <rect fill="url(#intune-grad)" width="256" height="256" rx="24"/>
    <rect x="88" y="48" width="80" height="128" rx="12" fill="#fff"/>
    <rect x="96" y="56" width="64" height="96" rx="4" fill="#0078D4"/>
    <circle cx="128" cy="160" r="8" fill="#0078D4"/>
    <rect x="56" y="184" width="144" height="24" rx="6" fill="#fff"/>
  </svg>
)

// Dynamics 365 - Business applications
export const Dynamics365Icon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="dynamics-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#002050"/>
        <stop offset="100%" stopColor="#001030"/>
      </linearGradient>
    </defs>
    <rect fill="url(#dynamics-grad)" width="256" height="256" rx="24"/>
    <path d="M48 128l80-80v64h80v32h-80v64l-80-80z" fill="#fff"/>
  </svg>
)

// Microsoft Exchange - Email server
export const ExchangeIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="exchange-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#28A8EA"/>
        <stop offset="100%" stopColor="#0078D4"/>
      </linearGradient>
    </defs>
    <rect fill="url(#exchange-grad)" width="256" height="256" rx="24"/>
    <path d="M48 80h160v96H48V80z" fill="#fff"/>
    <path d="M48 80l80 48 80-48" stroke="#28A8EA" strokeWidth="8" fill="none"/>
    <path d="M48 176l64-40M208 176l-64-40" stroke="#28A8EA" strokeWidth="4" fill="none"/>
  </svg>
)

// Copilot - AI assistant
export const CopilotIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="copilot-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#9B4DFF"/>
        <stop offset="50%" stopColor="#0078D4"/>
        <stop offset="100%" stopColor="#00B7C3"/>
      </linearGradient>
    </defs>
    <rect fill="url(#copilot-grad)" width="256" height="256" rx="24"/>
    <circle cx="128" cy="128" r="56" fill="#fff"/>
    <circle cx="128" cy="128" r="28" fill="url(#copilot-grad)"/>
    <path d="M128 48v24M128 184v24M48 128h24M184 128h24" stroke="#fff" strokeWidth="12" strokeLinecap="round"/>
  </svg>
)

