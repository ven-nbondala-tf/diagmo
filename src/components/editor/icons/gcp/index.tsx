import React from 'react'
/**
 * Google Cloud Platform Icons
 * Source: https://cloud.google.com/icons
 */

interface IconProps {
  size?: number
  className?: string
}

export const GcpComputeIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#4285F4" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z"/>
    <g fill="#fff">
      <rect x="6" y="6" width="12" height="12" rx="1"/>
    </g>
    <g fill="#4285F4">
      <rect x="7.5" y="7.5" width="4" height="4" rx=".5"/>
      <rect x="7.5" y="12.5" width="4" height="4" rx=".5"/>
      <rect x="12.5" y="7.5" width="4" height="9" rx=".5"/>
    </g>
    <g fill="#fff">
      <rect x="4" y="9" width="2" height="1.5"/>
      <rect x="4" y="13.5" width="2" height="1.5"/>
      <rect x="18" y="9" width="2" height="1.5"/>
      <rect x="18" y="13.5" width="2" height="1.5"/>
      <rect x="9" y="4" width="1.5" height="2"/>
      <rect x="13.5" y="4" width="1.5" height="2"/>
      <rect x="9" y="18" width="1.5" height="2"/>
      <rect x="13.5" y="18" width="1.5" height="2"/>
    </g>
  </svg>
)

export const GcpStorageIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#4285F4" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z"/>
    <g fill="#fff">
      <path d="M5 7c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2V7z"/>
    </g>
    <g fill="#4285F4">
      <rect x="6.5" y="7" width="11" height="3"/>
      <rect x="6.5" y="11" width="11" height="3"/>
      <rect x="6.5" y="15" width="11" height="3"/>
    </g>
    <g fill="#fff">
      <circle cx="8" cy="8.5" r=".8"/>
      <circle cx="8" cy="12.5" r=".8"/>
      <circle cx="8" cy="16.5" r=".8"/>
    </g>
  </svg>
)

export const GcpFunctionsIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 231" className={className}>
    <defs>
      <path d="M252.925854,103.237077 L200.327344,11.759667 C196.302579,4.62225703 188.80054,0.148424726 180.607902,0 L75.3908814,0 C67.1970912,0.14438548 59.6931984,4.61932363 55.6714398,11.759667 L3.05292985,102.997083 C-1.01764328,110.080373 -1.01764328,118.793146 3.05292985,125.876436 L55.6514404,217.87383 C59.6319755,225.112707 67.1159052,229.735134 75.370882,230.053486 L180.587903,230.053486 C188.842442,229.770144 196.339809,225.166896 200.327344,217.933829 L252.925854,126.456419 C257.024715,119.259311 257.024715,110.434185 252.925854,103.237077 Z" id="gcp-func-path"/>
    </defs>
    <path d="M252.925854,103.237077 L200.327344,11.759667 C196.302579,4.62225703 188.80054,0.148424726 180.607902,0 L75.3908814,0 C67.1970912,0.14438548 59.6931984,4.61932363 55.6714398,11.759667 L3.05292985,102.997083 C-1.01764328,110.080373 -1.01764328,118.793146 3.05292985,125.876436 L55.6514404,217.87383 C59.6319755,225.112707 67.1159052,229.735134 75.370882,230.053486 L180.587903,230.053486 C188.842442,229.770144 196.339809,225.166896 200.327344,217.933829 L252.925854,126.456419 C257.024715,119.259311 257.024715,110.434185 252.925854,103.237077 Z" fill="#4285F4"/>
    <polygon fill="#FFFFFF" points="88.8287399 165.478649 99.3678929 154.939496 83.5691247 139.140728 83.5691247 89.9712953 99.3678929 74.1725271 88.8287399 63.6333741 67.730511 84.731603 67.730511 144.38042"/>
    <circle fill="#FFFFFF" cx="105.1455" cy="114.556012" r="7.47104423"/>
    <circle fill="#FFFFFF" cx="127.498865" cy="114.556012" r="7.47104423"/>
    <circle fill="#FFFFFF" cx="149.852229" cy="114.556012" r="7.47104423"/>
    <polygon fill="#FFFFFF" points="166.069376 63.6333741 155.530223 74.1725271 171.328991 89.9712953 171.328991 139.140728 155.530223 154.939496 166.069376 165.478649 187.167605 144.38042 187.167605 84.731603"/>
  </svg>
)

export const GcpBigQueryIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#4285F4" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z"/>
    <g fill="#fff">
      <rect x="4" y="8" width="4" height="10" rx=".5"/>
      <rect x="10" y="5" width="4" height="13" rx=".5"/>
      <rect x="16" y="11" width="4" height="7" rx=".5"/>
    </g>
    <g stroke="#fff" strokeWidth="2" fill="none">
      <circle cx="15" cy="15" r="3"/>
      <path d="M17.5 17.5l2 2" strokeLinecap="round"/>
    </g>
  </svg>
)

export const GcpPubSubIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#4285F4" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z"/>
    <g fill="#fff">
      <circle cx="12" cy="5" r="2.5"/>
      <circle cx="5" cy="17" r="2.5"/>
      <circle cx="19" cy="17" r="2.5"/>
      <circle cx="12" cy="12" r="2"/>
    </g>
    <g stroke="#fff" strokeWidth="1.5" fill="none">
      <path d="M12 7.5v2.5M7 15.5l3-2M17 15.5l-3-2"/>
    </g>
  </svg>
)

export const GcpGkeIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#4285F4" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z"/>
    <path fill="#fff" d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"/>
    <circle fill="#4285F4" cx="12" cy="12" r="2.5"/>
    <g stroke="#4285F4" strokeWidth="1.2">
      <path d="M12 4.5v5M12 14.5v5M5 8l5 2.5M14 13.5l5 2.5M5 16l5-2.5M14 10.5l5-2.5"/>
    </g>
  </svg>
)

export const GcpCloudRunIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#4285F4" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z"/>
    <g fill="#fff">
      <path d="M8 6h3v12H8zM13 6h3v12h-3z"/>
    </g>
    <path fill="#4285F4" d="M9.5 8h1v8h-1zM14.5 8h1v8h-1z"/>
    <g fill="#fff">
      <polygon points="6,12 3,9 3,15"/>
      <polygon points="18,12 21,9 21,15"/>
    </g>
  </svg>
)

export const GcpFirestoreIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#FFCA28" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z"/>
    <g fill="#fff">
      <path d="M7 4l5 3v10l-5 3V4z"/>
      <path d="M17 4l-5 3v10l5 3V4z" opacity=".7"/>
    </g>
    <g stroke="#FFCA28" strokeWidth=".8">
      <path d="M7 8h10M7 12h10M7 16h10"/>
    </g>
  </svg>
)

export const GcpCloudSqlIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#4285F4" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z"/>
    <g fill="#fff">
      <ellipse cx="12" cy="6" rx="7" ry="2.5"/>
      <path d="M5 6v12c0 1.38 3.13 2.5 7 2.5s7-1.12 7-2.5V6c0 1.38-3.13 2.5-7 2.5S5 7.38 5 6z"/>
    </g>
    <g stroke="#4285F4" strokeWidth=".8" fill="none">
      <ellipse cx="12" cy="10" rx="7" ry="2.5"/>
      <ellipse cx="12" cy="14" rx="7" ry="2.5"/>
      <ellipse cx="12" cy="18" rx="7" ry="2.5"/>
    </g>
  </svg>
)

// ========== ADDITIONAL AWS ICONS ==========

export const AwsCognitoIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-cognito-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#BD0816"/>
        <stop offset="100%" stopColor="#FF5252"/>
      </linearGradient>
    </defs>
    <rect fill="url(#aws-cognito-grad)" width="256" height="256"/>
    <circle cx="128" cy="88" r="40" fill="#FFFFFF"/>
    <path d="M64,208 C64,168 91,152 128,152 C165,152 192,168 192,208" fill="#FFFFFF"/>
    <path d="M176,96 L200,96 M200,96 L200,120 M200,96 L180,116" stroke="#FFFFFF" strokeWidth="8" fill="none"/>
  </svg>
)

export const AwsStepFunctionsIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-sf-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#BD0816"/>
        <stop offset="100%" stopColor="#FF5252"/>
      </linearGradient>
    </defs>
    <rect fill="url(#aws-sf-grad)" width="256" height="256"/>
    <rect x="56" y="48" width="56" height="40" rx="4" fill="#FFFFFF"/>
    <rect x="144" y="48" width="56" height="40" rx="4" fill="#FFFFFF"/>
    <rect x="100" y="168" width="56" height="40" rx="4" fill="#FFFFFF"/>
    <path d="M84,88 L84,128 L128,148 M172,88 L172,128 L128,148 L128,168" stroke="#FFFFFF" strokeWidth="8" fill="none"/>
  </svg>
)

export const AwsKinesisIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-kinesis-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#4D27A8"/>
        <stop offset="100%" stopColor="#A166FF"/>
      </linearGradient>
    </defs>
    <rect fill="url(#aws-kinesis-grad)" width="256" height="256"/>
    <path d="M48,80 L208,80 M48,128 L208,128 M48,176 L208,176" stroke="#FFFFFF" strokeWidth="12"/>
    <path d="M168,56 L208,80 L168,104 M168,104 L208,128 L168,152 M168,152 L208,176 L168,200" stroke="#FFFFFF" strokeWidth="8" fill="none"/>
  </svg>
)

export const AwsRedshiftIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-redshift-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#4D27A8"/>
        <stop offset="100%" stopColor="#A166FF"/>
      </linearGradient>
    </defs>
    <rect fill="url(#aws-redshift-grad)" width="256" height="256"/>
    <path d="M128,48 L208,96 L208,160 L128,208 L48,160 L48,96 Z" fill="#FFFFFF"/>
    <path d="M128,48 L128,208 M48,96 L208,96 M48,160 L208,160 M88,72 L88,184 M168,72 L168,184" stroke="url(#aws-redshift-grad)" strokeWidth="4"/>
  </svg>
)

export const AwsElastiCacheIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-elasticache-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#2E27AD"/>
        <stop offset="100%" stopColor="#527FFF"/>
      </linearGradient>
    </defs>
    <rect fill="url(#aws-elasticache-grad)" width="256" height="256"/>
    <circle cx="128" cy="128" r="64" fill="none" stroke="#FFFFFF" strokeWidth="12"/>
    <circle cx="128" cy="128" r="32" fill="#FFFFFF"/>
    <path d="M128,32 L128,64 M128,192 L128,224 M32,128 L64,128 M192,128 L224,128" stroke="#FFFFFF" strokeWidth="12"/>
  </svg>
)

export const AwsCloudWatchIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-cw-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#BD0816"/>
        <stop offset="100%" stopColor="#FF5252"/>
      </linearGradient>
    </defs>
    <rect fill="url(#aws-cw-grad)" width="256" height="256"/>
    <circle cx="128" cy="128" r="72" fill="none" stroke="#FFFFFF" strokeWidth="12"/>
    <path d="M128,72 L128,128 L168,128" stroke="#FFFFFF" strokeWidth="12" strokeLinecap="round" fill="none"/>
    <circle cx="128" cy="128" r="8" fill="#FFFFFF"/>
  </svg>
)

export const AwsSecretsManagerIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-sm-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#BD0816"/>
        <stop offset="100%" stopColor="#FF5252"/>
      </linearGradient>
    </defs>
    <rect fill="url(#aws-sm-grad)" width="256" height="256"/>
    <rect x="72" y="112" width="112" height="96" rx="8" fill="#FFFFFF"/>
    <circle cx="128" cy="80" r="40" fill="none" stroke="#FFFFFF" strokeWidth="12"/>
    <circle cx="128" cy="152" r="16" fill="url(#aws-sm-grad)"/>
    <path d="M128,168 L128,192" stroke="url(#aws-sm-grad)" strokeWidth="8"/>
  </svg>
)

export const AwsEventBridgeIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-eb-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#BD0816"/>
        <stop offset="100%" stopColor="#FF5252"/>
      </linearGradient>
    </defs>
    <rect fill="url(#aws-eb-grad)" width="256" height="256"/>
    <rect x="40" y="56" width="64" height="48" rx="4" fill="#FFFFFF"/>
    <rect x="152" y="56" width="64" height="48" rx="4" fill="#FFFFFF"/>
    <rect x="40" y="152" width="64" height="48" rx="4" fill="#FFFFFF"/>
    <rect x="152" y="152" width="64" height="48" rx="4" fill="#FFFFFF"/>
    <circle cx="128" cy="128" r="24" fill="#FFFFFF"/>
    <path d="M104,104 L88,88 M152,104 L168,88 M104,152 L88,168 M152,152 L168,168" stroke="#FFFFFF" strokeWidth="8"/>
  </svg>
)

export const AwsAmplifyIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-amplify-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#C8511B"/>
        <stop offset="100%" stopColor="#FF9900"/>
      </linearGradient>
    </defs>
    <rect fill="url(#aws-amplify-grad)" width="256" height="256"/>
    <path d="M128,48 L208,192 L48,192 Z" fill="none" stroke="#FFFFFF" strokeWidth="12"/>
    <path d="M88,144 L168,144" stroke="#FFFFFF" strokeWidth="12"/>
    <path d="M104,96 L152,96" stroke="#FFFFFF" strokeWidth="8"/>
  </svg>
)

export const AwsAppSyncIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-appsync-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#BD0816"/>
        <stop offset="100%" stopColor="#FF5252"/>
      </linearGradient>
    </defs>
    <rect fill="url(#aws-appsync-grad)" width="256" height="256"/>
    <circle cx="128" cy="128" r="40" fill="#FFFFFF"/>
    <circle cx="64" cy="72" r="24" fill="#FFFFFF"/>
    <circle cx="192" cy="72" r="24" fill="#FFFFFF"/>
    <circle cx="64" cy="184" r="24" fill="#FFFFFF"/>
    <circle cx="192" cy="184" r="24" fill="#FFFFFF"/>
    <path d="M88,88 L104,112 M168,88 L152,112 M88,168 L104,144 M168,168 L152,144" stroke="#FFFFFF" strokeWidth="8"/>
  </svg>
)

// ============================================================================
// ADDITIONAL AWS ICONS - Expanded coverage for enterprise cloud architecture
// ============================================================================

// ===== AWS COMPUTE =====

export const AwsElasticBeanstalkIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-eb-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#C8511B" />
        <stop offset="100%" stopColor="#FF9900" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-eb-grad)" width="256" height="256" />
    <path d="M128,48 L128,80 M128,176 L128,208 M80,128 L48,128 M208,128 L176,128" stroke="#FFFFFF" strokeWidth="12" strokeLinecap="round"/>
    <circle cx="128" cy="128" r="48" fill="none" stroke="#FFFFFF" strokeWidth="12"/>
    <circle cx="128" cy="128" r="16" fill="#FFFFFF"/>
  </svg>
)

export const AwsLightsailIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-lightsail-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#C8511B" />
        <stop offset="100%" stopColor="#FF9900" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-lightsail-grad)" width="256" height="256" />
    <circle cx="128" cy="128" r="64" fill="none" stroke="#FFFFFF" strokeWidth="12"/>
    <path d="M128,64 L128,192 M64,128 L192,128" stroke="#FFFFFF" strokeWidth="8"/>
    <circle cx="128" cy="128" r="24" fill="#FFFFFF"/>
  </svg>
)

export const AwsOutpostsIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-outposts-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#C8511B" />
        <stop offset="100%" stopColor="#FF9900" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-outposts-grad)" width="256" height="256" />
    <rect x="56" y="56" width="144" height="144" rx="8" fill="none" stroke="#FFFFFF" strokeWidth="12"/>
    <rect x="88" y="88" width="80" height="80" rx="4" fill="none" stroke="#FFFFFF" strokeWidth="8"/>
    <rect x="112" y="112" width="32" height="32" fill="#FFFFFF"/>
  </svg>
)

export const AwsWavelengthIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-wavelength-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#C8511B" />
        <stop offset="100%" stopColor="#FF9900" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-wavelength-grad)" width="256" height="256" />
    <path d="M48,128 Q80,64 112,128 T176,128 T240,128" fill="none" stroke="#FFFFFF" strokeWidth="12"/>
    <path d="M16,128 Q48,192 80,128 T144,128 T208,128" fill="none" stroke="#FFFFFF" strokeWidth="8" opacity="0.6"/>
  </svg>
)

export const AwsLocalZonesIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-localzones-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#C8511B" />
        <stop offset="100%" stopColor="#FF9900" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-localzones-grad)" width="256" height="256" />
    <rect x="48" y="80" width="64" height="96" rx="4" fill="none" stroke="#FFFFFF" strokeWidth="8"/>
    <rect x="144" y="80" width="64" height="96" rx="4" fill="none" stroke="#FFFFFF" strokeWidth="8"/>
    <path d="M112,128 L144,128" stroke="#FFFFFF" strokeWidth="8" strokeDasharray="8,8"/>
    <circle cx="80" cy="104" r="8" fill="#FFFFFF"/>
    <circle cx="176" cy="104" r="8" fill="#FFFFFF"/>
  </svg>
)

export const AwsBatchIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-batch-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#C8511B" />
        <stop offset="100%" stopColor="#FF9900" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-batch-grad)" width="256" height="256" />
    <rect x="48" y="48" width="56" height="56" rx="4" fill="#FFFFFF"/>
    <rect x="152" y="48" width="56" height="56" rx="4" fill="#FFFFFF"/>
    <rect x="48" y="152" width="56" height="56" rx="4" fill="#FFFFFF"/>
    <rect x="152" y="152" width="56" height="56" rx="4" fill="#FFFFFF"/>
    <path d="M104,76 L152,76 M104,180 L152,180 M76,104 L76,152 M180,104 L180,152" stroke="#FFFFFF" strokeWidth="6"/>
  </svg>
)

// ===== AWS CONTAINERS =====

export const AwsFargateIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-fargate-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#C8511B" />
        <stop offset="100%" stopColor="#FF9900" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-fargate-grad)" width="256" height="256" />
    <path d="M128,48 L200,88 L200,168 L128,208 L56,168 L56,88 Z" fill="none" stroke="#FFFFFF" strokeWidth="12"/>
    <path d="M128,88 L168,108 L168,148 L128,168 L88,148 L88,108 Z" fill="#FFFFFF"/>
  </svg>
)

export const AwsEcrIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-ecr-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#C8511B" />
        <stop offset="100%" stopColor="#FF9900" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-ecr-grad)" width="256" height="256" />
    <rect x="56" y="56" width="144" height="144" rx="8" fill="none" stroke="#FFFFFF" strokeWidth="12"/>
    <path d="M88,128 L168,128 M128,88 L128,168" stroke="#FFFFFF" strokeWidth="8"/>
    <circle cx="128" cy="128" r="24" fill="none" stroke="#FFFFFF" strokeWidth="8"/>
  </svg>
)

export const AwsAppRunnerIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-apprunner-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#C8511B" />
        <stop offset="100%" stopColor="#FF9900" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-apprunner-grad)" width="256" height="256" />
    <path d="M64,128 L128,64 L192,128 L128,192 Z" fill="none" stroke="#FFFFFF" strokeWidth="12"/>
    <path d="M128,96 L160,128 L128,160 L96,128 Z" fill="#FFFFFF"/>
    <path d="M128,48 L128,64 M128,192 L128,208 M48,128 L64,128 M192,128 L208,128" stroke="#FFFFFF" strokeWidth="8"/>
  </svg>
)

// ===== AWS STORAGE =====

export const AwsEbsIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-ebs-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#1B660F" />
        <stop offset="100%" stopColor="#6CAE3E" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-ebs-grad)" width="256" height="256" />
    <rect x="64" y="48" width="128" height="160" rx="8" fill="none" stroke="#FFFFFF" strokeWidth="12"/>
    <path d="M88,80 L168,80 M88,112 L168,112 M88,144 L168,144 M88,176 L128,176" stroke="#FFFFFF" strokeWidth="8"/>
  </svg>
)

export const AwsEfsIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-efs-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#1B660F" />
        <stop offset="100%" stopColor="#6CAE3E" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-efs-grad)" width="256" height="256" />
    <path d="M48,80 L208,80 L208,176 L48,176 Z" fill="none" stroke="#FFFFFF" strokeWidth="12"/>
    <path d="M48,112 L208,112 M48,144 L208,144" stroke="#FFFFFF" strokeWidth="8"/>
    <rect x="72" y="88" width="24" height="16" fill="#FFFFFF"/>
    <rect x="72" y="120" width="24" height="16" fill="#FFFFFF"/>
    <rect x="72" y="152" width="24" height="16" fill="#FFFFFF"/>
  </svg>
)

export const AwsFsxIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-fsx-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#1B660F" />
        <stop offset="100%" stopColor="#6CAE3E" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-fsx-grad)" width="256" height="256" />
    <rect x="48" y="64" width="160" height="128" rx="8" fill="none" stroke="#FFFFFF" strokeWidth="12"/>
    <path d="M80,96 L176,96 M80,128 L176,128 M80,160 L144,160" stroke="#FFFFFF" strokeWidth="8"/>
    <text x="172" y="172" fill="#FFFFFF" fontSize="48" fontWeight="bold">x</text>
  </svg>
)

export const AwsStorageGatewayIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-sgw-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#1B660F" />
        <stop offset="100%" stopColor="#6CAE3E" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-sgw-grad)" width="256" height="256" />
    <rect x="48" y="88" width="64" height="80" rx="4" fill="none" stroke="#FFFFFF" strokeWidth="8"/>
    <rect x="144" y="88" width="64" height="80" rx="4" fill="none" stroke="#FFFFFF" strokeWidth="8"/>
    <path d="M112,128 L144,128" stroke="#FFFFFF" strokeWidth="8" markerEnd="url(#arrow)"/>
    <path d="M116,120 L136,128 L116,136" fill="none" stroke="#FFFFFF" strokeWidth="4"/>
    <ellipse cx="80" cy="64" rx="24" ry="12" fill="none" stroke="#FFFFFF" strokeWidth="6"/>
    <ellipse cx="176" cy="64" rx="24" ry="12" fill="none" stroke="#FFFFFF" strokeWidth="6"/>
    <path d="M80,64 L80,88 M176,64 L176,88" stroke="#FFFFFF" strokeWidth="6"/>
  </svg>
)

export const AwsBackupIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-backup-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#1B660F" />
        <stop offset="100%" stopColor="#6CAE3E" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-backup-grad)" width="256" height="256" />
    <circle cx="128" cy="128" r="64" fill="none" stroke="#FFFFFF" strokeWidth="12"/>
    <path d="M128,80 L128,128 L160,128" stroke="#FFFFFF" strokeWidth="10" strokeLinecap="round"/>
    <path d="M176,64 L200,88" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round"/>
    <path d="M200,64 L200,88 L176,88" fill="none" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round"/>
  </svg>
)

export const AwsSnowFamilyIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-snow-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#1B660F" />
        <stop offset="100%" stopColor="#6CAE3E" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-snow-grad)" width="256" height="256" />
    <path d="M128,48 L128,208 M48,128 L208,128 M72,72 L184,184 M184,72 L72,184" stroke="#FFFFFF" strokeWidth="10"/>
    <circle cx="128" cy="128" r="20" fill="#FFFFFF"/>
    <circle cx="128" cy="68" r="12" fill="#FFFFFF"/>
    <circle cx="128" cy="188" r="12" fill="#FFFFFF"/>
    <circle cx="68" cy="128" r="12" fill="#FFFFFF"/>
    <circle cx="188" cy="128" r="12" fill="#FFFFFF"/>
  </svg>
)

// ===== AWS DATABASE =====

export const AwsNeptuneIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-neptune-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#2E27AD" />
        <stop offset="100%" stopColor="#527FFF" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-neptune-grad)" width="256" height="256" />
    <circle cx="128" cy="80" r="24" fill="#FFFFFF"/>
    <circle cx="72" cy="176" r="24" fill="#FFFFFF"/>
    <circle cx="184" cy="176" r="24" fill="#FFFFFF"/>
    <path d="M128,104 L72,152 M128,104 L184,152 M72,176 L184,176" stroke="#FFFFFF" strokeWidth="8"/>
  </svg>
)

export const AwsDocumentDbIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-docdb-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#2E27AD" />
        <stop offset="100%" stopColor="#527FFF" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-docdb-grad)" width="256" height="256" />
    <path d="M64,64 L176,64 L192,80 L192,208 L64,208 Z" fill="none" stroke="#FFFFFF" strokeWidth="12"/>
    <path d="M176,64 L176,80 L192,80" fill="none" stroke="#FFFFFF" strokeWidth="8"/>
    <path d="M88,104 L168,104 M88,136 L168,136 M88,168 L136,168" stroke="#FFFFFF" strokeWidth="8"/>
  </svg>
)

export const AwsQldbIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-qldb-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#2E27AD" />
        <stop offset="100%" stopColor="#527FFF" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-qldb-grad)" width="256" height="256" />
    <rect x="48" y="64" width="56" height="40" rx="4" fill="#FFFFFF"/>
    <rect x="152" y="64" width="56" height="40" rx="4" fill="#FFFFFF"/>
    <rect x="48" y="152" width="56" height="40" rx="4" fill="#FFFFFF"/>
    <rect x="152" y="152" width="56" height="40" rx="4" fill="#FFFFFF"/>
    <path d="M104,84 L152,84 M104,172 L152,172 M76,104 L76,152 M180,104 L180,152" stroke="#FFFFFF" strokeWidth="8"/>
  </svg>
)

export const AwsTimestreamIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-timestream-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#2E27AD" />
        <stop offset="100%" stopColor="#527FFF" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-timestream-grad)" width="256" height="256" />
    <circle cx="128" cy="128" r="72" fill="none" stroke="#FFFFFF" strokeWidth="12"/>
    <path d="M128,72 L128,128 L168,128" stroke="#FFFFFF" strokeWidth="10" strokeLinecap="round"/>
    <circle cx="128" cy="128" r="8" fill="#FFFFFF"/>
  </svg>
)

export const AwsMemoryDbIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-memorydb-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#2E27AD" />
        <stop offset="100%" stopColor="#527FFF" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-memorydb-grad)" width="256" height="256" />
    <ellipse cx="128" cy="80" rx="72" ry="24" fill="none" stroke="#FFFFFF" strokeWidth="10"/>
    <path d="M56,80 L56,176 C56,189 88,200 128,200 C168,200 200,189 200,176 L200,80" fill="none" stroke="#FFFFFF" strokeWidth="10"/>
    <ellipse cx="128" cy="176" rx="72" ry="24" fill="none" stroke="#FFFFFF" strokeWidth="10"/>
    <path d="M56,128 C56,141 88,152 128,152 C168,152 200,141 200,128" fill="none" stroke="#FFFFFF" strokeWidth="8"/>
  </svg>
)

export const AwsKeyspacesIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-keyspaces-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#2E27AD" />
        <stop offset="100%" stopColor="#527FFF" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-keyspaces-grad)" width="256" height="256" />
    <path d="M128,48 L56,88 L56,168 L128,208 L200,168 L200,88 Z" fill="none" stroke="#FFFFFF" strokeWidth="12"/>
    <path d="M128,48 L128,128 L56,88 M128,128 L200,88 M128,128 L128,208" stroke="#FFFFFF" strokeWidth="8"/>
  </svg>
)

// ===== AWS NETWORKING =====

export const AwsDirectConnectIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-directconnect-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#4D27A8" />
        <stop offset="100%" stopColor="#A166FF" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-directconnect-grad)" width="256" height="256" />
    <rect x="48" y="96" width="64" height="64" rx="8" fill="none" stroke="#FFFFFF" strokeWidth="10"/>
    <rect x="144" y="96" width="64" height="64" rx="8" fill="none" stroke="#FFFFFF" strokeWidth="10"/>
    <path d="M112,128 L144,128" stroke="#FFFFFF" strokeWidth="12"/>
    <circle cx="80" cy="128" r="12" fill="#FFFFFF"/>
    <circle cx="176" cy="128" r="12" fill="#FFFFFF"/>
  </svg>
)

export const AwsGlobalAcceleratorIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-globalaccel-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#4D27A8" />
        <stop offset="100%" stopColor="#A166FF" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-globalaccel-grad)" width="256" height="256" />
    <circle cx="128" cy="128" r="72" fill="none" stroke="#FFFFFF" strokeWidth="10"/>
    <circle cx="128" cy="128" r="40" fill="none" stroke="#FFFFFF" strokeWidth="8"/>
    <path d="M128,56 L128,88 M128,168 L128,200 M56,128 L88,128 M168,128 L200,128" stroke="#FFFFFF" strokeWidth="8"/>
    <circle cx="128" cy="128" r="12" fill="#FFFFFF"/>
  </svg>
)

export const AwsTransitGatewayIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-transitgw-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#4D27A8" />
        <stop offset="100%" stopColor="#A166FF" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-transitgw-grad)" width="256" height="256" />
    <circle cx="128" cy="128" r="32" fill="#FFFFFF"/>
    <circle cx="64" cy="64" r="24" fill="none" stroke="#FFFFFF" strokeWidth="8"/>
    <circle cx="192" cy="64" r="24" fill="none" stroke="#FFFFFF" strokeWidth="8"/>
    <circle cx="64" cy="192" r="24" fill="none" stroke="#FFFFFF" strokeWidth="8"/>
    <circle cx="192" cy="192" r="24" fill="none" stroke="#FFFFFF" strokeWidth="8"/>
    <path d="M88,88 L108,108 M168,88 L148,108 M88,168 L108,148 M168,168 L148,148" stroke="#FFFFFF" strokeWidth="6"/>
  </svg>
)

export const AwsPrivateLinkIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-privatelink-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#4D27A8" />
        <stop offset="100%" stopColor="#A166FF" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-privatelink-grad)" width="256" height="256" />
    <rect x="48" y="88" width="64" height="80" rx="8" fill="none" stroke="#FFFFFF" strokeWidth="10"/>
    <rect x="144" y="88" width="64" height="80" rx="8" fill="none" stroke="#FFFFFF" strokeWidth="10"/>
    <path d="M112,128 L144,128" stroke="#FFFFFF" strokeWidth="10"/>
    <path d="M128,104 L128,152" stroke="#FFFFFF" strokeWidth="6"/>
    <circle cx="128" cy="128" r="8" fill="#FFFFFF"/>
  </svg>
)

export const AwsElbIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-elb-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#4D27A8" />
        <stop offset="100%" stopColor="#A166FF" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-elb-grad)" width="256" height="256" />
    <circle cx="80" cy="128" r="32" fill="#FFFFFF"/>
    <circle cx="176" cy="72" r="24" fill="none" stroke="#FFFFFF" strokeWidth="8"/>
    <circle cx="176" cy="128" r="24" fill="none" stroke="#FFFFFF" strokeWidth="8"/>
    <circle cx="176" cy="184" r="24" fill="none" stroke="#FFFFFF" strokeWidth="8"/>
    <path d="M112,116 L152,80 M112,128 L152,128 M112,140 L152,176" stroke="#FFFFFF" strokeWidth="6"/>
  </svg>
)

// ===== AWS SECURITY =====

export const AwsWafIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-waf-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#BD0816" />
        <stop offset="100%" stopColor="#FF5252" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-waf-grad)" width="256" height="256" />
    <path d="M128,48 L56,80 L56,136 C56,176 88,208 128,216 C168,208 200,176 200,136 L200,80 Z" fill="none" stroke="#FFFFFF" strokeWidth="12"/>
    <path d="M96,128 L120,152 L168,104" stroke="#FFFFFF" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
)

export const AwsShieldIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-shield-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#BD0816" />
        <stop offset="100%" stopColor="#FF5252" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-shield-grad)" width="256" height="256" />
    <path d="M128,40 L48,72 L48,128 C48,176 84,216 128,224 C172,216 208,176 208,128 L208,72 Z" fill="none" stroke="#FFFFFF" strokeWidth="12"/>
    <path d="M128,80 L88,96 L88,128 C88,152 104,172 128,176 C152,172 168,152 168,128 L168,96 Z" fill="#FFFFFF"/>
  </svg>
)

export const AwsGuardDutyIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-guardduty-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#BD0816" />
        <stop offset="100%" stopColor="#FF5252" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-guardduty-grad)" width="256" height="256" />
    <circle cx="128" cy="104" r="40" fill="none" stroke="#FFFFFF" strokeWidth="12"/>
    <circle cx="128" cy="104" r="16" fill="#FFFFFF"/>
    <path d="M64,200 L128,152 L192,200" stroke="#FFFFFF" strokeWidth="12" fill="none"/>
    <path d="M88,176 L128,144 L168,176" stroke="#FFFFFF" strokeWidth="8" fill="none"/>
  </svg>
)

export const AwsInspectorIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-inspector-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#BD0816" />
        <stop offset="100%" stopColor="#FF5252" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-inspector-grad)" width="256" height="256" />
    <circle cx="112" cy="112" r="48" fill="none" stroke="#FFFFFF" strokeWidth="12"/>
    <path d="M148,148 L192,192" stroke="#FFFFFF" strokeWidth="16" strokeLinecap="round"/>
    <circle cx="112" cy="112" r="20" fill="#FFFFFF"/>
  </svg>
)

export const AwsMacieIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-macie-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#BD0816" />
        <stop offset="100%" stopColor="#FF5252" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-macie-grad)" width="256" height="256" />
    <rect x="48" y="64" width="160" height="128" rx="8" fill="none" stroke="#FFFFFF" strokeWidth="12"/>
    <path d="M80,104 L176,104 M80,136 L176,136 M80,168 L128,168" stroke="#FFFFFF" strokeWidth="8"/>
    <circle cx="176" cy="88" r="16" fill="#FFFFFF"/>
    <path d="M168,80 L184,96" stroke="url(#aws-macie-grad)" strokeWidth="4"/>
  </svg>
)

export const AwsSecurityHubIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-sechub-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#BD0816" />
        <stop offset="100%" stopColor="#FF5252" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-sechub-grad)" width="256" height="256" />
    <path d="M128,48 L56,80 L56,136 C56,176 88,208 128,216 C168,208 200,176 200,136 L200,80 Z" fill="none" stroke="#FFFFFF" strokeWidth="12"/>
    <circle cx="128" cy="128" r="24" fill="#FFFFFF"/>
    <path d="M128,88 L128,104 M128,152 L128,168 M88,128 L104,128 M152,128 L168,128" stroke="#FFFFFF" strokeWidth="8"/>
  </svg>
)

export const AwsKmsIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-kms-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#BD0816" />
        <stop offset="100%" stopColor="#FF5252" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-kms-grad)" width="256" height="256" />
    <circle cx="104" cy="104" r="40" fill="none" stroke="#FFFFFF" strokeWidth="12"/>
    <path d="M136,136 L176,176 L176,208 L144,208 L144,176 L160,176" stroke="#FFFFFF" strokeWidth="12" fill="none"/>
    <circle cx="104" cy="104" r="16" fill="#FFFFFF"/>
  </svg>
)

// ===== AWS ANALYTICS =====

export const AwsAthenaIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-athena-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#4D27A8" />
        <stop offset="100%" stopColor="#A166FF" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-athena-grad)" width="256" height="256" />
    <circle cx="128" cy="104" r="48" fill="none" stroke="#FFFFFF" strokeWidth="12"/>
    <path d="M160,136 L200,176" stroke="#FFFFFF" strokeWidth="16" strokeLinecap="round"/>
    <path d="M96,104 L128,72 L160,104 L128,136 Z" fill="#FFFFFF"/>
  </svg>
)

export const AwsEmrIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-emr-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#4D27A8" />
        <stop offset="100%" stopColor="#A166FF" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-emr-grad)" width="256" height="256" />
    <circle cx="128" cy="128" r="64" fill="none" stroke="#FFFFFF" strokeWidth="12"/>
    <circle cx="128" cy="88" r="16" fill="#FFFFFF"/>
    <circle cx="88" cy="152" r="16" fill="#FFFFFF"/>
    <circle cx="168" cy="152" r="16" fill="#FFFFFF"/>
    <path d="M128,104 L88,136 M128,104 L168,136 M88,152 L168,152" stroke="#FFFFFF" strokeWidth="6"/>
  </svg>
)

export const AwsGlueIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-glue-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#4D27A8" />
        <stop offset="100%" stopColor="#A166FF" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-glue-grad)" width="256" height="256" />
    <ellipse cx="80" cy="80" rx="32" ry="24" fill="none" stroke="#FFFFFF" strokeWidth="10"/>
    <ellipse cx="176" cy="80" rx="32" ry="24" fill="none" stroke="#FFFFFF" strokeWidth="10"/>
    <ellipse cx="128" cy="176" rx="48" ry="32" fill="none" stroke="#FFFFFF" strokeWidth="10"/>
    <path d="M80,104 L112,144 M176,104 L144,144" stroke="#FFFFFF" strokeWidth="8"/>
  </svg>
)

export const AwsLakeFormationIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-lakeformation-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#4D27A8" />
        <stop offset="100%" stopColor="#A166FF" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-lakeformation-grad)" width="256" height="256" />
    <ellipse cx="128" cy="176" rx="80" ry="32" fill="none" stroke="#FFFFFF" strokeWidth="12"/>
    <path d="M48,176 L48,128 C48,96 84,72 128,72 C172,72 208,96 208,128 L208,176" fill="none" stroke="#FFFFFF" strokeWidth="12"/>
    <path d="M80,136 Q128,104 176,136" fill="none" stroke="#FFFFFF" strokeWidth="8"/>
  </svg>
)

export const AwsQuickSightIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-quicksight-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#4D27A8" />
        <stop offset="100%" stopColor="#A166FF" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-quicksight-grad)" width="256" height="256" />
    <rect x="48" y="88" width="40" height="112" fill="#FFFFFF"/>
    <rect x="108" y="56" width="40" height="144" fill="#FFFFFF"/>
    <rect x="168" y="120" width="40" height="80" fill="#FFFFFF"/>
  </svg>
)

export const AwsDataPipelineIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-datapipeline-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#4D27A8" />
        <stop offset="100%" stopColor="#A166FF" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-datapipeline-grad)" width="256" height="256" />
    <circle cx="64" cy="128" r="24" fill="#FFFFFF"/>
    <circle cx="128" cy="128" r="24" fill="none" stroke="#FFFFFF" strokeWidth="10"/>
    <circle cx="192" cy="128" r="24" fill="#FFFFFF"/>
    <path d="M88,128 L104,128 M152,128 L168,128" stroke="#FFFFFF" strokeWidth="10"/>
    <path d="M112,104 L144,128 L112,152" fill="none" stroke="#FFFFFF" strokeWidth="6"/>
  </svg>
)

export const AwsMskIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-msk-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#4D27A8" />
        <stop offset="100%" stopColor="#A166FF" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-msk-grad)" width="256" height="256" />
    <rect x="48" y="80" width="48" height="96" rx="4" fill="#FFFFFF"/>
    <rect x="104" y="80" width="48" height="96" rx="4" fill="none" stroke="#FFFFFF" strokeWidth="8"/>
    <rect x="160" y="80" width="48" height="96" rx="4" fill="#FFFFFF"/>
    <path d="M72,56 L72,80 M128,56 L128,80 M184,56 L184,80" stroke="#FFFFFF" strokeWidth="8"/>
  </svg>
)

export const AwsOpenSearchIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-opensearch-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#4D27A8" />
        <stop offset="100%" stopColor="#A166FF" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-opensearch-grad)" width="256" height="256" />
    <circle cx="112" cy="112" r="56" fill="none" stroke="#FFFFFF" strokeWidth="12"/>
    <path d="M152,152 L200,200" stroke="#FFFFFF" strokeWidth="16" strokeLinecap="round"/>
    <path d="M80,112 L144,112 M112,80 L112,144" stroke="#FFFFFF" strokeWidth="8"/>
  </svg>
)

// ===== AWS ML/AI =====

export const AwsSageMakerIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-sagemaker-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#055F4E" />
        <stop offset="100%" stopColor="#1A9476" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-sagemaker-grad)" width="256" height="256" />
    <circle cx="128" cy="80" r="32" fill="#FFFFFF"/>
    <rect x="64" y="144" width="128" height="64" rx="8" fill="none" stroke="#FFFFFF" strokeWidth="10"/>
    <path d="M128,112 L128,144" stroke="#FFFFFF" strokeWidth="10"/>
    <path d="M96,168 L128,192 L160,168" stroke="#FFFFFF" strokeWidth="8" fill="none"/>
  </svg>
)

export const AwsRekognitionIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-rekognition-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#055F4E" />
        <stop offset="100%" stopColor="#1A9476" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-rekognition-grad)" width="256" height="256" />
    <circle cx="128" cy="112" r="48" fill="none" stroke="#FFFFFF" strokeWidth="12"/>
    <circle cx="112" cy="104" r="8" fill="#FFFFFF"/>
    <circle cx="144" cy="104" r="8" fill="#FFFFFF"/>
    <path d="M104,128 Q128,144 152,128" fill="none" stroke="#FFFFFF" strokeWidth="6"/>
    <path d="M80,176 L176,176" stroke="#FFFFFF" strokeWidth="8"/>
    <path d="M96,192 L160,192" stroke="#FFFFFF" strokeWidth="8"/>
  </svg>
)

export const AwsComprehendIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-comprehend-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#055F4E" />
        <stop offset="100%" stopColor="#1A9476" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-comprehend-grad)" width="256" height="256" />
    <rect x="48" y="56" width="160" height="144" rx="8" fill="none" stroke="#FFFFFF" strokeWidth="12"/>
    <path d="M80,96 L176,96 M80,128 L176,128 M80,160 L144,160" stroke="#FFFFFF" strokeWidth="8"/>
    <circle cx="176" cy="168" r="24" fill="#FFFFFF"/>
  </svg>
)

export const AwsLexIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-lex-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#055F4E" />
        <stop offset="100%" stopColor="#1A9476" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-lex-grad)" width="256" height="256" />
    <path d="M48,56 L208,56 L208,168 L136,168 L104,200 L104,168 L48,168 Z" fill="none" stroke="#FFFFFF" strokeWidth="12"/>
    <circle cx="96" cy="112" r="12" fill="#FFFFFF"/>
    <circle cx="160" cy="112" r="12" fill="#FFFFFF"/>
    <path d="M104,136 Q128,152 152,136" fill="none" stroke="#FFFFFF" strokeWidth="8"/>
  </svg>
)

export const AwsPollyIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-polly-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#055F4E" />
        <stop offset="100%" stopColor="#1A9476" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-polly-grad)" width="256" height="256" />
    <rect x="96" y="48" width="64" height="104" rx="32" fill="none" stroke="#FFFFFF" strokeWidth="12"/>
    <path d="M72,128 C72,168 96,192 128,192 C160,192 184,168 184,128" fill="none" stroke="#FFFFFF" strokeWidth="10"/>
    <path d="M128,192 L128,216" stroke="#FFFFFF" strokeWidth="10"/>
    <path d="M96,216 L160,216" stroke="#FFFFFF" strokeWidth="10"/>
  </svg>
)

export const AwsTranscribeIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-transcribe-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#055F4E" />
        <stop offset="100%" stopColor="#1A9476" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-transcribe-grad)" width="256" height="256" />
    <rect x="48" y="80" width="72" height="96" rx="8" fill="none" stroke="#FFFFFF" strokeWidth="10"/>
    <path d="M136,112 L208,112 M136,144 L192,144" stroke="#FFFFFF" strokeWidth="8"/>
    <path d="M72,104 L72,152" stroke="#FFFFFF" strokeWidth="8"/>
    <path d="M88,112 L88,144" stroke="#FFFFFF" strokeWidth="6"/>
    <path d="M96,120 L96,136" stroke="#FFFFFF" strokeWidth="4"/>
  </svg>
)

export const AwsTranslateIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-translate-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#055F4E" />
        <stop offset="100%" stopColor="#1A9476" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-translate-grad)" width="256" height="256" />
    <text x="48" y="136" fill="#FFFFFF" fontSize="72" fontWeight="bold">A</text>
    <text x="144" y="176" fill="#FFFFFF" fontSize="56" fontWeight="bold" opacity="0.8">A</text>
    <path d="M120,120 L144,144" stroke="#FFFFFF" strokeWidth="8"/>
  </svg>
)

export const AwsTextractIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-textract-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#055F4E" />
        <stop offset="100%" stopColor="#1A9476" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-textract-grad)" width="256" height="256" />
    <rect x="56" y="48" width="144" height="160" rx="8" fill="none" stroke="#FFFFFF" strokeWidth="12"/>
    <path d="M88,96 L168,96 M88,128 L168,128 M88,160 L136,160" stroke="#FFFFFF" strokeWidth="8"/>
    <rect x="144" y="144" width="40" height="40" rx="4" fill="#FFFFFF"/>
  </svg>
)

export const AwsBedrockIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-bedrock-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#055F4E" />
        <stop offset="100%" stopColor="#1A9476" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-bedrock-grad)" width="256" height="256" />
    <path d="M128,48 L56,88 L56,168 L128,208 L200,168 L200,88 Z" fill="none" stroke="#FFFFFF" strokeWidth="12"/>
    <path d="M128,48 L128,208 M56,88 L200,168 M200,88 L56,168" stroke="#FFFFFF" strokeWidth="6"/>
    <circle cx="128" cy="128" r="24" fill="#FFFFFF"/>
  </svg>
)

// ===== AWS INTEGRATION =====

export const AwsMqIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-mq-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#B0084D" />
        <stop offset="100%" stopColor="#FF4F8B" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-mq-grad)" width="256" height="256" />
    <rect x="48" y="72" width="160" height="112" rx="8" fill="none" stroke="#FFFFFF" strokeWidth="12"/>
    <circle cx="88" cy="128" r="20" fill="#FFFFFF"/>
    <circle cx="168" cy="128" r="20" fill="none" stroke="#FFFFFF" strokeWidth="8"/>
    <path d="M108,128 L148,128" stroke="#FFFFFF" strokeWidth="8"/>
    <path d="M132,116 L148,128 L132,140" fill="none" stroke="#FFFFFF" strokeWidth="6"/>
  </svg>
)

export const AwsAppMeshIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-appmesh-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#B0084D" />
        <stop offset="100%" stopColor="#FF4F8B" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-appmesh-grad)" width="256" height="256" />
    <circle cx="128" cy="64" r="24" fill="#FFFFFF"/>
    <circle cx="64" cy="160" r="24" fill="#FFFFFF"/>
    <circle cx="192" cy="160" r="24" fill="#FFFFFF"/>
    <circle cx="128" cy="128" r="20" fill="none" stroke="#FFFFFF" strokeWidth="8"/>
    <path d="M128,88 L128,108 M92,148 L108,138 M164,148 L148,138" stroke="#FFFFFF" strokeWidth="6"/>
    <path d="M64,136 L64,112 C64,88 92,72 128,72 M192,136 L192,112 C192,88 164,72 128,72" fill="none" stroke="#FFFFFF" strokeWidth="6"/>
  </svg>
)

// ===== AWS DEVELOPER =====

export const AwsCodeCommitIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-codecommit-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#2E27AD" />
        <stop offset="100%" stopColor="#527FFF" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-codecommit-grad)" width="256" height="256" />
    <circle cx="80" cy="80" r="24" fill="#FFFFFF"/>
    <circle cx="176" cy="80" r="24" fill="none" stroke="#FFFFFF" strokeWidth="10"/>
    <circle cx="128" cy="176" r="24" fill="#FFFFFF"/>
    <path d="M80,104 L80,152 Q80,176 104,176 M176,104 L176,152 Q176,176 152,176" stroke="#FFFFFF" strokeWidth="8"/>
  </svg>
)

export const AwsCodeBuildIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-codebuild-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#2E27AD" />
        <stop offset="100%" stopColor="#527FFF" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-codebuild-grad)" width="256" height="256" />
    <rect x="56" y="56" width="144" height="144" rx="8" fill="none" stroke="#FFFFFF" strokeWidth="12"/>
    <path d="M88,128 L112,152 L168,96" stroke="#FFFFFF" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
)

export const AwsCodeDeployIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-codedeploy-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#2E27AD" />
        <stop offset="100%" stopColor="#527FFF" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-codedeploy-grad)" width="256" height="256" />
    <circle cx="128" cy="80" r="32" fill="#FFFFFF"/>
    <rect x="64" y="144" width="128" height="64" rx="8" fill="none" stroke="#FFFFFF" strokeWidth="10"/>
    <path d="M128,112 L128,144" stroke="#FFFFFF" strokeWidth="10"/>
    <path d="M112,128 L128,144 L144,128" fill="none" stroke="#FFFFFF" strokeWidth="8"/>
  </svg>
)

export const AwsCodePipelineIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-codepipeline-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#2E27AD" />
        <stop offset="100%" stopColor="#527FFF" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-codepipeline-grad)" width="256" height="256" />
    <rect x="48" y="48" width="48" height="48" rx="4" fill="#FFFFFF"/>
    <rect x="104" y="104" width="48" height="48" rx="4" fill="none" stroke="#FFFFFF" strokeWidth="8"/>
    <rect x="160" y="160" width="48" height="48" rx="4" fill="#FFFFFF"/>
    <path d="M96,72 L104,128 M152,128 L160,184" stroke="#FFFFFF" strokeWidth="8"/>
  </svg>
)

export const AwsCloud9Icon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-cloud9-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#2E27AD" />
        <stop offset="100%" stopColor="#527FFF" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-cloud9-grad)" width="256" height="256" />
    <path d="M64,96 C48,96 40,112 40,128 C40,144 48,160 64,160 C64,176 80,192 104,192 L152,192 C176,192 192,176 192,160 C208,160 216,144 216,128 C216,112 208,96 192,96 C192,72 168,56 128,56 C88,56 64,72 64,96 Z" fill="none" stroke="#FFFFFF" strokeWidth="12"/>
    <text x="100" y="148" fill="#FFFFFF" fontSize="56" fontWeight="bold">9</text>
  </svg>
)

export const AwsXRayIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-xray-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#2E27AD" />
        <stop offset="100%" stopColor="#527FFF" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-xray-grad)" width="256" height="256" />
    <circle cx="128" cy="128" r="64" fill="none" stroke="#FFFFFF" strokeWidth="12"/>
    <path d="M64,64 L192,192 M192,64 L64,192" stroke="#FFFFFF" strokeWidth="10"/>
    <circle cx="128" cy="128" r="20" fill="#FFFFFF"/>
  </svg>
)

export const AwsCloudShellIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-cloudshell-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#2E27AD" />
        <stop offset="100%" stopColor="#527FFF" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-cloudshell-grad)" width="256" height="256" />
    <rect x="40" y="56" width="176" height="144" rx="8" fill="none" stroke="#FFFFFF" strokeWidth="12"/>
    <path d="M72,120 L104,152 L72,184" stroke="#FFFFFF" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <path d="M128,176 L184,176" stroke="#FFFFFF" strokeWidth="10" strokeLinecap="round"/>
  </svg>
)

// ===== AWS MANAGEMENT =====

export const AwsCloudTrailIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-cloudtrail-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#B0084D" />
        <stop offset="100%" stopColor="#FF4F8B" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-cloudtrail-grad)" width="256" height="256" />
    <path d="M48,176 L88,112 L128,152 L168,80 L208,128" stroke="#FFFFFF" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <circle cx="48" cy="176" r="12" fill="#FFFFFF"/>
    <circle cx="88" cy="112" r="12" fill="#FFFFFF"/>
    <circle cx="128" cy="152" r="12" fill="#FFFFFF"/>
    <circle cx="168" cy="80" r="12" fill="#FFFFFF"/>
    <circle cx="208" cy="128" r="12" fill="#FFFFFF"/>
  </svg>
)

export const AwsConfigIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-config-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#B0084D" />
        <stop offset="100%" stopColor="#FF4F8B" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-config-grad)" width="256" height="256" />
    <circle cx="128" cy="128" r="56" fill="none" stroke="#FFFFFF" strokeWidth="12"/>
    <circle cx="128" cy="128" r="24" fill="#FFFFFF"/>
    <path d="M128,48 L128,72 M128,184 L128,208 M48,128 L72,128 M184,128 L208,128" stroke="#FFFFFF" strokeWidth="10"/>
  </svg>
)

export const AwsSystemsManagerIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-ssm-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#B0084D" />
        <stop offset="100%" stopColor="#FF4F8B" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-ssm-grad)" width="256" height="256" />
    <rect x="48" y="48" width="72" height="72" rx="8" fill="none" stroke="#FFFFFF" strokeWidth="10"/>
    <rect x="136" y="48" width="72" height="72" rx="8" fill="#FFFFFF"/>
    <rect x="48" y="136" width="72" height="72" rx="8" fill="#FFFFFF"/>
    <rect x="136" y="136" width="72" height="72" rx="8" fill="none" stroke="#FFFFFF" strokeWidth="10"/>
  </svg>
)

export const AwsCloudFormationIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-cfn-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#B0084D" />
        <stop offset="100%" stopColor="#FF4F8B" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-cfn-grad)" width="256" height="256" />
    <rect x="80" y="48" width="96" height="160" rx="8" fill="none" stroke="#FFFFFF" strokeWidth="12"/>
    <path d="M104,88 L152,88 M104,120 L152,120 M104,152 L136,152" stroke="#FFFFFF" strokeWidth="8"/>
    <path d="M128,176 L144,192 L112,192 Z" fill="#FFFFFF"/>
  </svg>
)

export const AwsServiceCatalogIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-svccat-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#B0084D" />
        <stop offset="100%" stopColor="#FF4F8B" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-svccat-grad)" width="256" height="256" />
    <rect x="48" y="48" width="64" height="64" rx="8" fill="#FFFFFF"/>
    <rect x="144" y="48" width="64" height="64" rx="8" fill="none" stroke="#FFFFFF" strokeWidth="10"/>
    <rect x="48" y="144" width="64" height="64" rx="8" fill="none" stroke="#FFFFFF" strokeWidth="10"/>
    <rect x="144" y="144" width="64" height="64" rx="8" fill="#FFFFFF"/>
  </svg>
)

export const AwsTrustedAdvisorIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-ta-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#B0084D" />
        <stop offset="100%" stopColor="#FF4F8B" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-ta-grad)" width="256" height="256" />
    <circle cx="128" cy="128" r="72" fill="none" stroke="#FFFFFF" strokeWidth="12"/>
    <path d="M96,128 L120,152 L168,104" stroke="#FFFFFF" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
)

export const AwsOrganizationsIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-orgs-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#B0084D" />
        <stop offset="100%" stopColor="#FF4F8B" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-orgs-grad)" width="256" height="256" />
    <rect x="96" y="40" width="64" height="48" rx="4" fill="#FFFFFF"/>
    <rect x="40" y="168" width="56" height="48" rx="4" fill="#FFFFFF"/>
    <rect x="100" y="168" width="56" height="48" rx="4" fill="#FFFFFF"/>
    <rect x="160" y="168" width="56" height="48" rx="4" fill="#FFFFFF"/>
    <path d="M128,88 L128,128 M68,128 L188,128 M68,128 L68,168 M128,128 L128,168 M188,128 L188,168" stroke="#FFFFFF" strokeWidth="8"/>
  </svg>
)

export const AwsControlTowerIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" className={className}>
    <defs>
      <linearGradient id="aws-controltower-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#B0084D" />
        <stop offset="100%" stopColor="#FF4F8B" />
      </linearGradient>
    </defs>
    <rect fill="url(#aws-controltower-grad)" width="256" height="256" />
    <path d="M128,40 L48,88 L48,168 L128,216 L208,168 L208,88 Z" fill="none" stroke="#FFFFFF" strokeWidth="12"/>
    <rect x="104" y="96" width="48" height="64" rx="4" fill="#FFFFFF"/>
    <path d="M128,40 L128,96 M128,160 L128,216" stroke="#FFFFFF" strokeWidth="8"/>
  </svg>
)

// ========== ADDITIONAL AZURE ICONS ==========

export const AzureEventHubIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <path d="M10.83 8.42a.26.26 0 01-.24.27H8.5a.26.26 0 01-.27-.24V6.89a.26.26 0 01.24-.27h2.09a.26.26 0 01.27.24v1.56zM14.54 10a.26.26 0 01-.24.27h-2.09a.26.26 0 01-.27-.24V8.48a.26.26 0 01.24-.27h2.09a.26.26 0 01.27.24V10zM10.83 11.6a.26.26 0 01-.24.27H8.5a.26.26 0 01-.27-.24v-1.56a.26.26 0 01.24-.27h2.09a.26.26 0 01.27.24v1.56z" fill="#76bc2d"/>
    <path d="M7.12 6.84a.25.25 0 01-.23.26H4.74a.26.26 0 01-.27-.23V5.25A.26.26 0 014.71 5H6.8c.22 0 .32.11.32.27z" fill="#86d633"/>
    <path d="M7.12 10a.25.25 0 01-.23.27H4.74a.26.26 0 01-.27-.27V8.42a.26.26 0 01.24-.26H6.8c.22 0 .32.11.32.26zM7.12 13.19a.25.25 0 01-.23.27H4.74a.26.26 0 01-.27-.24V11.6a.25.25 0 01.24-.26H6.8c.22 0 .32.1.32.26z" fill="#76bc2d"/>
    <g fill="#999"><path d="M1.07 1.51h1.29v3.6a.29.29 0 01-.29.29H.79a.29.29 0 01-.29-.29v-3a.57.57 0 01.57-.6z"/><path d="M1.07 1.51h1.29v3.6a.29.29 0 01-.29.29H.79a.29.29 0 01-.29-.29v-3a.57.57 0 01.57-.6z" opacity=".5"/></g>
    <g fill="#999"><path d="M15.64 1.51h1.29a.57.57 0 01.57.57v3a.29.29 0 01-.29.29h-1.29a.29.29 0 01-.29-.29V1.51h.01z"/><path d="M15.64 1.51h1.29a.57.57 0 01.57.57v3a.29.29 0 01-.29.29h-1.29a.29.29 0 01-.29-.29V1.51h.01z" opacity=".5"/></g>
    <path d="M17.5 2.08v1.25H.5V2.08a.57.57 0 01.57-.57h15.87a.57.57 0 01.56.57z" fill="#949494"/>
    <g fill="#999"><path d="M.79 12.76h1.29a.29.29 0 01.29.29v3.6h-1.3a.57.57 0 01-.57-.57V13a.29.29 0 01.29-.24z"/><path d="M.79 12.76h1.29a.29.29 0 01.29.29v3.6h-1.3a.57.57 0 01-.57-.57V13a.29.29 0 01.29-.24z" opacity=".5"/></g>
    <g fill="#999"><path d="M15.92 12.76h1.29a.29.29 0 01.29.29v3a.57.57 0 01-.57.57h-1.29V13a.29.29 0 01.28-.24z"/><path d="M15.92 12.76h1.29a.29.29 0 01.29.29v3a.57.57 0 01-.57.57h-1.29V13a.29.29 0 01.28-.24z" opacity=".5"/></g>
    <path d="M.5 16.08v-1.25h17v1.25a.57.57 0 01-.57.57H1.07a.57.57 0 01-.57-.57z" fill="#949494"/>
  </svg>
)

export const AzureServiceBusIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-sb-a" x1="9" y1="14.071" x2="9" y2="1.313" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0078d4"/>
        <stop offset=".156" stopColor="#1380da"/>
        <stop offset=".528" stopColor="#3c91e5"/>
        <stop offset=".822" stopColor="#559cec"/>
        <stop offset="1" stopColor="#5ea0ef"/>
      </linearGradient>
    </defs>
    <path d="M18 10.075a4.044 4.044 0 00-3.51-3.887 5.1 5.1 0 00-5.25-4.875 5.229 5.229 0 00-5 3.408A4.825 4.825 0 000 9.364a4.9 4.9 0 005.068 4.707c.151 0 .3-.007.447-.019h8.207a.819.819 0 00.217-.033A4.093 4.093 0 0018 10.075z" fill="url(#azure-sb-a)"/>
    <path d="M12.067 11.806h-6.36a.276.276 0 00-.282.27v1.732a.276.276 0 00.281.27h6.361a.276.276 0 00.281-.27v-1.732a.277.277 0 00-.281-.27z" fill="#32bedd"/>
    <path d="M12.067 14.415h-6.36a.276.276 0 00-.282.27v1.731a.276.276 0 00.281.271h6.361a.276.276 0 00.281-.271v-1.731a.277.277 0 00-.281-.27z" fill="#198ab3"/>
    <path d="M11.27 12.231h.373a.072.072 0 01.072.072v.356a.069.069 0 01-.069.069h-.379a.069.069 0 01-.069-.069V12.3a.072.072 0 01.072-.069zM11.268 13.087h.376a.072.072 0 01.072.072v.353a.072.072 0 01-.072.072h-.374a.072.072 0 01-.072-.072v-.356a.069.069 0 01.07-.069zM11.289 14.827h.376a.072.072 0 01.072.072v.356a.069.069 0 01-.069.069h-.376a.072.072 0 01-.072-.072V14.9a.069.069 0 01.069-.073zM11.289 15.683h.376a.072.072 0 01.072.072v.356a.069.069 0 01-.069.069h-.379a.069.069 0 01-.069-.069v-.359a.069.069 0 01.069-.069z" fill="#b4ec36"/>
    <path d="M12.007 8.993h-6.36a.276.276 0 00-.282.271V11a.277.277 0 00.281.271h6.361a.277.277 0 00.281-.271V9.264a.277.277 0 00-.281-.271z" fill="#50e6ff"/>
    <path d="M11.208 9.419h.376a.072.072 0 01.072.072v.356a.069.069 0 01-.069.069h-.377a.072.072 0 01-.072-.072v-.356a.069.069 0 01.07-.069zM11.208 10.275h.376a.072.072 0 01.072.072v.353a.069.069 0 01-.069.069h-.379a.069.069 0 01-.069-.069v-.359a.069.069 0 01.069-.066zM11.635 7.4l-2.43 2.43a.29.29 0 01-.41 0L6.365 7.4a.13.13 0 01.092-.221h1.494a.129.129 0 00.129-.129V4.014a.1.1 0 01.1-.1h1.636a.1.1 0 01.1.1v3.037a.129.129 0 00.129.129h1.494a.13.13 0 01.096.22z" fill="#fff"/>
  </svg>
)

export const AzureLogicAppsIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-la-a" x1="5.05" y1="10.55" x2="5.05" y2="13.48" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#76bc2d"/>
        <stop offset="1" stopColor="#5e9624"/>
      </linearGradient>
      <linearGradient id="azure-la-b" x1="12.84" y1="10.57" x2="12.84" y2="13.5" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#76bc2d"/>
        <stop offset="1" stopColor="#5e9624"/>
      </linearGradient>
    </defs>
    <path d="M3.19 15.6a2.49 2.49 0 01-1.53-.38 1.7 1.7 0 01-.45-1.36v-3.53c0-.58-.23-.89-.71-.89v-.88c.48 0 .71-.31.71-.92V4.17a1.79 1.79 0 01.45-1.39 2.29 2.29 0 011.53-.38v.89c-.51 0-.79.27-.79.85v3.4c0 .78-.23 1.26-.74 1.46a1.42 1.42 0 01.74 1.46v3.37a1.25 1.25 0 00.17.68.74.74 0 00.58.2v.89zM14.81 2.4a2.49 2.49 0 011.53.38 1.7 1.7 0 01.45 1.36v3.53c0 .58.23.89.71.89v.88c-.48 0-.71.31-.71.92v3.43a1.8 1.8 0 01-.45 1.4 2.28 2.28 0 01-1.53.41v-.89c.51 0 .79-.27.79-.85v-3.4c0-.78.23-1.26.74-1.46a1.42 1.42 0 01-.74-1.46V4.17a1.25 1.25 0 00-.17-.68.74.74 0 00-.58-.2z" fill="#949494"/>
    <path d="M9.41 8.35V7.08h-.9v1.27a.18.18 0 01-.18.18H5a.36.36 0 00-.36.36v1.65h.9v-.91a.18.18 0 01.17-.18h6.54a.18.18 0 01.18.18v.93h.89V8.89a.36.36 0 00-.35-.36H9.59a.18.18 0 01-.18-.18z" fill="#005ba1"/>
    <path d="M10.61 3.21H7.25a.38.38 0 00-.38.37v3.36a.37.37 0 00.38.37h3.36a.37.37 0 00.39-.37V3.58a.38.38 0 00-.39-.37zm-.32 3.17a.25.25 0 01-.25.24H7.81a.25.25 0 01-.25-.24V4.15a.25.25 0 01.25-.25H10a.25.25 0 01.25.25z" fill="#0078d4"/>
    <rect x="3.58" y="10.55" width="2.94" height="2.94" rx=".27" fill="url(#azure-la-a)"/>
    <rect x="11.38" y="10.57" width="2.94" height="2.94" rx=".27" fill="url(#azure-la-b)"/>
  </svg>
)

export const AzureDatabricksIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <g fill="none">
      <path fill="#DC2126" d="M.06 13.933v3.823l11.448 5.984 11.448-5.984v-3.823l-4.03-2.075 4.03-2.111V5.959l-.037-.012L11.508.06.097 5.935l-.037.024v3.788l4.03 2.11-4.03 2.076"/>
      <path fill="#F0542D" d="M18.939 11.858l-7.431 3.872-7.419-3.872L.06 13.933l11.448 5.983 11.46-5.983z"/>
      <path fill="#F0542D" d="M11.508.06l11.46 5.899-11.46 5.983L.06 5.96z"/>
    </g>
  </svg>
)

export const AzureActiveDirectoryIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-ad-a" x1="13.25" y1="13.02" x2="8.62" y2="4.25" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#1988d9"/>
        <stop offset=".9" stopColor="#54aef0"/>
      </linearGradient>
      <linearGradient id="azure-ad-b" x1="11.26" y1="10.47" x2="14.46" y2="15.99" gradientUnits="userSpaceOnUse">
        <stop offset=".1" stopColor="#54aef0"/>
        <stop offset=".29" stopColor="#4fabee"/>
        <stop offset=".51" stopColor="#41a2e9"/>
        <stop offset=".74" stopColor="#2a93e0"/>
        <stop offset=".88" stopColor="#1988d9"/>
      </linearGradient>
    </defs>
    <path fill="#50e6ff" d="M1.01 10.19l7.92 5.14 8.06-5.16L18 11.35l-9.07 5.84L0 11.35l1.01-1.16z"/>
    <path fill="#fff" d="M1.61 9.53L8.93.81l7.47 8.73-7.47 4.72-7.32-4.73z"/>
    <path fill="#50e6ff" d="M8.93.81v13.45L1.61 9.53 8.93.81z"/>
    <path fill="url(#azure-ad-a)" d="M8.93.81v13.45l7.47-4.72L8.93.81z"/>
    <path fill="#53b1e0" d="M8.93 7.76l7.47 1.78-7.47 4.72v-6.5z"/>
    <path fill="#9cebff" d="M8.93 14.26L1.61 9.53l7.32-1.77v6.5z"/>
    <path fill="url(#azure-ad-b)" d="M8.93 17.19L18 11.35l-1.01-1.18-8.06 5.16v1.86z"/>
  </svg>
)

export const AzureContainerRegistryIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-cr-a" x1="8.637" y1="-1.991" x2="8.637" y2="16.739" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#5ea0ef"/>
        <stop offset="1" stopColor="#0078d4"/>
      </linearGradient>
      <linearGradient id="azure-cr-b" x1="12.96" y1="8.561" x2="12.96" y2="6.141" gradientTransform="matrix(1 0 0 -1 0 20)" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#333132"/>
        <stop offset="1" stopColor="#5b5a5c"/>
      </linearGradient>
    </defs>
    <path d="M7.43 8.178l2.589-1.573 7.255 2.731A3.664 3.664 0 0016.23 7.49l-.01-.05A4.194 4.194 0 0014 6.32a4.91 4.91 0 00-5.1-4.7 5.071 5.071 0 00-4.84 3.29A4.621 4.621 0 000 9.39a4.73 4.73 0 004.89 4.54h2.54z" fill="url(#azure-cr-a)"/>
    <path fill="#767676" d="M10.07 7.159l.01 4.28 7.91 1.68v-2.98l-7.92-2.98z"/>
    <path fill="#999" d="M10.07 7.159l-2.14 1.3v3.98l2.15-1"/>
    <path fill="#a3a3a3" d="M13.68 11.499l.72.2v-2.33l-.72-.25v2.38zM12.96 8.889l-.72-.26v2.49l.72.2v-2.43zM15.12 11.889l.7.19.02-2.22-.72-.24v2.27zM10.81 10.749l.72.18v-2.53l-.72-.24v2.59zM17.27 10.349l-.72-.25v2.17l.72.2v-2.12z"/>
    <path d="M8.66 11.369l-.36.21v-2.83l.36-.19zm.71-3.22l-.37.24v2.75l.37-.2z" fill="#b3b3b3"/>
    <path fill="url(#azure-cr-b)" d="M17.99 13.119l-2.16.74-7.9-1.42 2.15-1 7.91 1.68z"/>
    <path fill="#767676" d="M17.99 16.169l-7.95 1.51.04-5.59 7.91 1.47v2.61z"/>
    <path fill="#a3a3a3" d="M10.81 16.759v-3.55l.72.09v3.34l-.72.12zM12.96 16.399l-.72.13v-3.14l.72.11v2.9zM13.68 16.289v-2.72l.72.09v2.5l-.72.13zM15.83 15.909l-.71.13v-2.29l.71.11v2.05zM17.29 15.679l-.74.13v-1.88l.69.09.05 1.66z"/>
    <path d="M7.93 16.4v-3.26l2.16-1v5.6z" fill="#999"/>
    <path d="M8.61 16.389l-.32-.16v-2.76l.32-.15zm.77-3.45l-.38.19v3.48l.37.19v-3.86z" fill="#b3b3b3"/>
  </svg>
)

export const AzureRedisCacheIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-redis-a" x1="9" y1="15.5" x2="9" y2="2.5" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#a51c30"/>
        <stop offset="1" stopColor="#c5273d"/>
      </linearGradient>
    </defs>
    <ellipse cx="9" cy="5" rx="6" ry="2.2" fill="#fff"/>
    <path d="M3 5v8c0 1.21 2.69 2.2 6 2.2s6-.99 6-2.2V5c0 1.21-2.69 2.2-6 2.2S3 6.21 3 5z" fill="#fff"/>
    <ellipse cx="9" cy="9" rx="6" ry="2.2" fill="none" stroke="url(#azure-redis-a)" strokeWidth=".5"/>
    <ellipse cx="9" cy="13" rx="6" ry="2.2" fill="none" stroke="url(#azure-redis-a)" strokeWidth=".5"/>
    <rect x="1" y="1" width="16" height="16" rx="1.5" fill="none" stroke="url(#azure-redis-a)" strokeWidth="0"/>
    <path d="M0 0h18v18H0z" fill="url(#azure-redis-a)" opacity="0"/>
    <rect width="18" height="18" rx="2" fill="url(#azure-redis-a)"/>
    <ellipse cx="9" cy="5.5" rx="5" ry="1.8" fill="#fff"/>
    <path d="M4 5.5v7c0 1 2.24 1.8 5 1.8s5-.8 5-1.8v-7c0 1-2.24 1.8-5 1.8s-5-.8-5-1.8z" fill="#fff"/>
    <ellipse cx="9" cy="9" rx="5" ry="1.8" fill="none" stroke="#a51c30" strokeWidth=".4"/>
    <ellipse cx="9" cy="12.5" rx="5" ry="1.8" fill="none" stroke="#a51c30" strokeWidth=".4"/>
  </svg>
)

export const AzureAppGatewayIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-ag-b" x1="9" y1="19.25" x2="9" y2="-.46" gradientTransform="rotate(45 9.003 8.999)" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#5e9624"/>
        <stop offset=".55" stopColor="#6dad2a"/>
        <stop offset="1" stopColor="#76bc2d"/>
      </linearGradient>
      <linearGradient id="azure-ag-a" x1="7.54" y1="6.44" x2="7.53" y2="5.18" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#ccc"/>
        <stop offset=".12" stopColor="#d7d7d7"/>
        <stop offset=".42" stopColor="#ebebeb"/>
        <stop offset=".72" stopColor="#f8f8f8"/>
        <stop offset="1" stopColor="#fcfcfc"/>
      </linearGradient>
      <linearGradient id="azure-ag-c" x1="9.36" y1="7.69" x2="9.36" y2="6.57" xlinkHref="#azure-ag-a"/>
    </defs>
    <rect x="2.82" y="2.82" width="12.35" height="12.35" rx=".57" transform="rotate(-45 8.999 9.003)" fill="url(#azure-ag-b)"/>
    <g fill="#fff">
      <path d="M10.89 10.51h2.84a.11.11 0 00.1-.11V7.57a.1.1 0 00-.18-.07l-.78.78v.05a.1.1 0 01-.14 0L9.26 4.91a.1.1 0 00-.14 0l-.88.88a.11.11 0 000 .15l3.41 3.41a.11.11 0 010 .15l-.05.05-.78.78a.11.11 0 00.07.18z"/>
      <path d="M6.92 10.51H4.08A.11.11 0 014 10.4V7.57a.1.1 0 01.17-.07l.79.78v.05a.1.1 0 00.14 0l3.45-3.42a.1.1 0 01.14 0l.88.88a.11.11 0 010 .15L6.16 9.35a.11.11 0 000 .15v.05l.78.78a.11.11 0 01-.02.18z"/>
      <path d="M6.82 13.07l2 2a.1.1 0 00.14 0l2-2a.1.1 0 00-.07-.17H9.72a.11.11 0 01-.1-.1V8a.1.1 0 00-.1-.11H8.28a.11.11 0 00-.11.11v4.8a.1.1 0 01-.1.1H6.89a.1.1 0 00-.07.17z"/>
    </g>
    <path d="M10.65 7.78A2.71 2.71 0 017.33 3.5a2.71 2.71 0 013.29 4.3" fill="#0078d4"/>
    <circle cx="7.53" cy="5.55" r=".87" fill="url(#azure-ag-a)"/>
    <g fill="#f2f2f2">
      <path d="M6.67 7l.19.3.14.2a5.94 5.94 0 01.34-1.1.85.85 0 01-.45-.23 6.71 6.71 0 00-.22.83zM7.24 4.73A4 4 0 017 3.8a2.48 2.48 0 00-.34.46 3.51 3.51 0 00.2.74 1 1 0 01.38-.27zM8.17 6.14a.87.87 0 01-.48.26 4.62 4.62 0 00.46.41 4.14 4.14 0 00.65.39v-.07a.53.53 0 01.2-.4 3.6 3.6 0 01-.83-.59zM10.79 7.2a4.14 4.14 0 01-.87-.1.55.55 0 01-.16.39 3.84 3.84 0 001.08.08 2.93 2.93 0 00.37-.42z" opacity=".55"/>
    </g>
    <circle cx="9.36" cy="7.13" r=".56" fill="url(#azure-ag-c)"/>
    <circle cx="10.64" cy="5.74" r=".6" fill="#f2f2f2"/>
    <g fill="#f2f2f2">
      <path d="M9.21 4.42A4.29 4.29 0 0111.09 4a2.24 2.24 0 00-.47-.45 4.5 4.5 0 00-1.49.35c-.1 0-.19.11-.29.16a5.85 5.85 0 01-.63-.93l-.34.13a5.35 5.35 0 00.65 1 3.92 3.92 0 00-.67.55.87.87 0 01.43.35 3.29 3.29 0 01.61-.48 9.16 9.16 0 001.17 1 .57.57 0 01.2-.32 8.44 8.44 0 01-1.05-.94zM11.55 6.09h-.18l-.1-.06a.61.61 0 01-.2.3l.12.07.11.06.28.14a3.58 3.58 0 00.09-.35z" opacity=".55"/>
    </g>
    <circle cx="7.53" cy="5.55" r=".87" fill="#f2f2f2"/>
    <circle cx="9.36" cy="7.13" r=".56" fill="#f2f2f2"/>
  </svg>
)

export const AzureFrontDoorIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-fd-a" x1="9" y1="13.83" x2="9" y2="1.07" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0078d4"/>
        <stop offset=".82" stopColor="#5ea0ef"/>
      </linearGradient>
    </defs>
    <path d="M18 9.83A4 4 0 0014.49 6a5.1 5.1 0 00-5.25-4.93 5.23 5.23 0 00-5 3.41A4.83 4.83 0 000 9.12a4.9 4.9 0 005.07 4.71h8.65a.78.78 0 00.22 0 4.09 4.09 0 004.06-4z" fill="url(#azure-fd-a)"/>
    <path d="M6.63 6.82h5.06v7H6.63z" fill="#f2f2f2"/>
    <path d="M12.61 6.37l-3.49-2a.25.25 0 00-.31.15v12.16a.25.25 0 00.24.25h.08l3.49-2.06a.25.25 0 00.17-.23v-8a.26.26 0 00-.18-.27z" fill="#50e6ff"/>
  </svg>
)

export const AzureMonitorIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <radialGradient id="azure-mon-a" cx="5.72" cy="7.45" r="8.42" gradientTransform="matrix(1.01 0 0 1.01 3.23 1.51)" gradientUnits="userSpaceOnUse">
        <stop offset=".18" stopColor="#5ea0ef"/>
        <stop offset=".56" stopColor="#5c9fee"/>
        <stop offset=".69" stopColor="#559ced"/>
        <stop offset=".78" stopColor="#4a97e9"/>
        <stop offset=".86" stopColor="#3990e4"/>
        <stop offset=".93" stopColor="#2387de"/>
        <stop offset=".99" stopColor="#087bd6"/>
        <stop offset="1" stopColor="#0078d4"/>
      </radialGradient>
      <radialGradient id="azure-mon-b" cx="28.18" cy="202.29" r="2.7" gradientTransform="matrix(.95 0 0 .95 -17.77 -185.01)" gradientUnits="userSpaceOnUse">
        <stop offset=".19" stopColor="#8c8e90"/>
        <stop offset=".35" stopColor="#848688"/>
        <stop offset=".6" stopColor="#6e7071"/>
        <stop offset=".91" stopColor="#4a4b4c"/>
        <stop offset="1" stopColor="#3e3f3f"/>
      </radialGradient>
    </defs>
    <ellipse cx="9" cy="9" rx="8.5" ry="8.47" fill="url(#azure-mon-a)"/>
    <ellipse cx="9" cy="9" rx="7.4" ry="7.37" fill="#fff"/>
    <path d="M2.72 9.44a6.24 6.24 0 001.82 4l2-2a3.53 3.53 0 01-1-2z" fill="#9cebff"/>
    <path d="M13.13 4.27a6.25 6.25 0 00-3.69-1.53v2.79a3.41 3.41 0 011.71.7zM4.87 4.27l2 2a3.41 3.41 0 011.71-.7V2.74a6.25 6.25 0 00-3.71 1.53zM11.78 6.85a3.6 3.6 0 01.71 1.71h2.79a6.16 6.16 0 00-1.53-3.67z" fill="#32bedd"/>
    <path d="M6.22 6.85l-2-2a6.16 6.16 0 00-1.5 3.71h2.79a3.6 3.6 0 01.71-1.71z" fill="#50e6ff"/>
    <path d="M14.14 7a.45.45 0 00-.57-.25L9.45 8.41l.32.81 4.12-1.63a.44.44 0 00.25-.59z" fill="#f04049"/>
    <circle cx="9" cy="9" fill="url(#azure-mon-b)" r="1.2"/>
  </svg>
)

// ========== NEW AZURE ICONS - Analytics Category ==========

export const AzureSynapseIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-synapse-a" x1="9" y1="17" x2="9" y2="1" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0078d4"/>
        <stop offset="1" stopColor="#5ea0ef"/>
      </linearGradient>
    </defs>
    <circle cx="9" cy="9" r="8" fill="url(#azure-synapse-a)"/>
    <path d="M5 6h8v2H5zM5 10h8v2H5z" fill="#fff"/>
    <circle cx="9" cy="7" r="1.5" fill="#50e6ff"/>
    <circle cx="9" cy="11" r="1.5" fill="#50e6ff"/>
    <path d="M9 4v2M9 12v2" stroke="#fff" strokeWidth="1"/>
  </svg>
)

export const AzureDataFactoryIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-df-a" x1="9" y1="17.5" x2="9" y2=".5" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0078d4"/>
        <stop offset="1" stopColor="#83b9f9"/>
      </linearGradient>
    </defs>
    <rect x=".5" y=".5" width="17" height="17" rx="1" fill="url(#azure-df-a)"/>
    <rect x="2" y="4" width="5" height="4" rx=".5" fill="#fff"/>
    <rect x="11" y="4" width="5" height="4" rx=".5" fill="#fff"/>
    <rect x="6.5" y="10" width="5" height="4" rx=".5" fill="#fff"/>
    <path d="M4.5 8v2h4M13.5 8v2h-4" stroke="#fff" strokeWidth="1" fill="none"/>
  </svg>
)

export const AzureStreamAnalyticsIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-sa-a" x1="9" y1="17" x2="9" y2="1" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0078d4"/>
        <stop offset="1" stopColor="#5ea0ef"/>
      </linearGradient>
    </defs>
    <circle cx="9" cy="9" r="8" fill="url(#azure-sa-a)"/>
    <path d="M3 9h12" stroke="#fff" strokeWidth="2"/>
    <path d="M5 6l2 3-2 3M9 5l2 4-2 4M13 4l2 5-2 5" stroke="#fff" strokeWidth="1.5" fill="none"/>
  </svg>
)

export const AzureHDInsightIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-hdi-a" x1="9" y1="17" x2="9" y2="1" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0078d4"/>
        <stop offset="1" stopColor="#5ea0ef"/>
      </linearGradient>
    </defs>
    <rect x="1" y="1" width="16" height="16" rx="2" fill="url(#azure-hdi-a)"/>
    <circle cx="5" cy="5" r="2" fill="#fff"/>
    <circle cx="13" cy="5" r="2" fill="#fff"/>
    <circle cx="5" cy="13" r="2" fill="#fff"/>
    <circle cx="13" cy="13" r="2" fill="#fff"/>
    <circle cx="9" cy="9" r="2.5" fill="#50e6ff"/>
    <path d="M7 5h2M11 5h-2M7 13h2M11 13h-2M5 7v2M5 11v-2M13 7v2M13 11v-2" stroke="#fff" strokeWidth=".8"/>
  </svg>
)

export const AzureDataLakeIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-dlk-a" x1="9" y1="17" x2="9" y2="1" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0078d4"/>
        <stop offset="1" stopColor="#83b9f9"/>
      </linearGradient>
    </defs>
    <path d="M1 10c0-3 3.5-6 8-6s8 3 8 6c0 2-2 4-8 6-6-2-8-4-8-6z" fill="url(#azure-dlk-a)"/>
    <ellipse cx="9" cy="8" rx="6" ry="3" fill="#fff" opacity=".3"/>
    <path d="M3 9c0-2 2.7-4 6-4s6 2 6 4" stroke="#fff" strokeWidth="1" fill="none"/>
    <circle cx="9" cy="11" r="2" fill="#50e6ff"/>
  </svg>
)

export const AzureAnalysisServicesIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-as-a" x1="9" y1="17" x2="9" y2="1" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0078d4"/>
        <stop offset="1" stopColor="#5ea0ef"/>
      </linearGradient>
    </defs>
    <rect x="1" y="1" width="16" height="16" rx="1" fill="url(#azure-as-a)"/>
    <rect x="3" y="10" width="3" height="5" fill="#fff"/>
    <rect x="7.5" y="7" width="3" height="8" fill="#fff"/>
    <rect x="12" y="4" width="3" height="11" fill="#fff"/>
  </svg>
)

export const AzureLogAnalyticsIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-la-grad" x1="9" y1="17" x2="9" y2="1" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0078d4"/>
        <stop offset="1" stopColor="#5ea0ef"/>
      </linearGradient>
    </defs>
    <rect x="1" y="1" width="16" height="16" rx="2" fill="url(#azure-la-grad)"/>
    <circle cx="8" cy="8" r="4" fill="none" stroke="#fff" strokeWidth="1.5"/>
    <path d="M11 11l3 3" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
    <path d="M6 8h4M8 6v4" stroke="#fff" strokeWidth="1"/>
  </svg>
)

export const AzurePurviewIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-pv-a" x1="9" y1="17" x2="9" y2="1" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#773adc"/>
        <stop offset="1" stopColor="#b77af4"/>
      </linearGradient>
    </defs>
    <circle cx="9" cy="9" r="8" fill="url(#azure-pv-a)"/>
    <circle cx="9" cy="9" r="4" fill="none" stroke="#fff" strokeWidth="1.5"/>
    <circle cx="9" cy="9" r="1.5" fill="#fff"/>
    <path d="M9 3v2M9 13v2M3 9h2M13 9h2" stroke="#fff" strokeWidth="1.5"/>
  </svg>
)

// ========== NEW AZURE ICONS - Compute Category ==========

export const AzureVMScaleSetsIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-vmss-a" x1="9" y1="15" x2="9" y2="1" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0078d4"/>
        <stop offset="1" stopColor="#5ea0ef"/>
      </linearGradient>
    </defs>
    <rect x="1" y="1" width="10" height="8" rx=".5" fill="url(#azure-vmss-a)"/>
    <rect x="4" y="4" width="10" height="8" rx=".5" fill="url(#azure-vmss-a)"/>
    <rect x="7" y="7" width="10" height="8" rx=".5" fill="url(#azure-vmss-a)"/>
    <path fill="#50e6ff" d="M9.5 9v2.5l-1.5 1 1.5 1 1.5-1-1.5-1z"/>
    <path d="M10 15.5c-1.2-.2-1.3-1.1-1.3-2.5h3.6c0 1.4 0 2.3-1.2 2.5a.7.7 0 01-.55.7h5.6a.7.7 0 01-.55-.7z" fill="#ccc"/>
  </svg>
)

export const AzureBatchIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-batch-a" x1="9" y1="17" x2="9" y2="1" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0078d4"/>
        <stop offset="1" stopColor="#5ea0ef"/>
      </linearGradient>
    </defs>
    <rect x="1" y="1" width="16" height="16" rx="1" fill="url(#azure-batch-a)"/>
    <rect x="2.5" y="2.5" width="4" height="4" rx=".5" fill="#fff"/>
    <rect x="7" y="2.5" width="4" height="4" rx=".5" fill="#fff"/>
    <rect x="11.5" y="2.5" width="4" height="4" rx=".5" fill="#fff"/>
    <rect x="2.5" y="7" width="4" height="4" rx=".5" fill="#fff"/>
    <rect x="7" y="7" width="4" height="4" rx=".5" fill="#fff"/>
    <rect x="11.5" y="7" width="4" height="4" rx=".5" fill="#fff"/>
    <rect x="2.5" y="11.5" width="4" height="4" rx=".5" fill="#fff"/>
    <rect x="7" y="11.5" width="4" height="4" rx=".5" fill="#fff"/>
    <rect x="11.5" y="11.5" width="4" height="4" rx=".5" fill="#fff"/>
  </svg>
)

export const AzureCloudServicesIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-cs-a" x1="9" y1="15" x2="9" y2="3" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0078d4"/>
        <stop offset="1" stopColor="#5ea0ef"/>
      </linearGradient>
    </defs>
    <path d="M15 11a3 3 0 00-2.5-2.9 3.7 3.7 0 00-3.8-3.5 3.8 3.8 0 00-3.6 2.5A3.5 3.5 0 002 10.5 3.5 3.5 0 005.6 14h6.5A3 3 0 0015 11z" fill="url(#azure-cs-a)"/>
    <circle cx="9" cy="10" r="2" fill="#fff"/>
    <path d="M7.5 10h3M9 8.5v3" stroke="#0078d4" strokeWidth=".8"/>
  </svg>
)

export const AzureServiceFabricIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-sf-a" x1="9" y1="17" x2="9" y2="1" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0078d4"/>
        <stop offset="1" stopColor="#5ea0ef"/>
      </linearGradient>
    </defs>
    <path d="M9 1l8 4.5v9L9 19l-8-4.5v-9L9 1z" fill="url(#azure-sf-a)"/>
    <circle cx="9" cy="6" r="1.5" fill="#fff"/>
    <circle cx="5" cy="12" r="1.5" fill="#fff"/>
    <circle cx="13" cy="12" r="1.5" fill="#fff"/>
    <path d="M9 7.5v2l-2.5 1.5M9 9.5l2.5 1.5" stroke="#fff" strokeWidth="1"/>
  </svg>
)

// ========== NEW AZURE ICONS - Container Category ==========

export const AzureContainerInstancesIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-ci-a" x1="9" y1="17" x2="9" y2="1" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0078d4"/>
        <stop offset="1" stopColor="#5ea0ef"/>
      </linearGradient>
    </defs>
    <rect x="1" y="1" width="16" height="16" rx="2" fill="url(#azure-ci-a)"/>
    <rect x="3" y="5" width="5" height="4" rx=".5" fill="#fff"/>
    <rect x="10" y="5" width="5" height="4" rx=".5" fill="#fff"/>
    <rect x="3" y="11" width="5" height="4" rx=".5" fill="#fff"/>
    <rect x="10" y="11" width="5" height="4" rx=".5" fill="#fff"/>
    <path d="M5.5 3v2M12.5 3v2" stroke="#fff" strokeWidth="1"/>
  </svg>
)

export const AzureContainerAppsIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-ca-a" x1="9" y1="17" x2="9" y2="1" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#773adc"/>
        <stop offset="1" stopColor="#b77af4"/>
      </linearGradient>
    </defs>
    <rect x="1" y="1" width="16" height="16" rx="2" fill="url(#azure-ca-a)"/>
    <rect x="3" y="4" width="12" height="10" rx="1" fill="#fff"/>
    <rect x="5" y="6" width="3" height="3" rx=".3" fill="#773adc"/>
    <rect x="10" y="6" width="3" height="3" rx=".3" fill="#773adc"/>
    <rect x="7.5" y="11" width="3" height="1.5" rx=".3" fill="#773adc"/>
  </svg>
)

// ========== NEW AZURE ICONS - Database Category ==========

export const AzureMySQLIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-mysql-a" x1="9" y1="17" x2="9" y2="1" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0078d4"/>
        <stop offset="1" stopColor="#5ea0ef"/>
      </linearGradient>
    </defs>
    <ellipse cx="9" cy="4" rx="7" ry="2.5" fill="url(#azure-mysql-a)"/>
    <path d="M2 4v10c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V4" fill="url(#azure-mysql-a)"/>
    <ellipse cx="9" cy="4" rx="5" ry="1.5" fill="#fff" opacity=".3"/>
    <path d="M6 10l1.5 2 1-1.5 1 1.5 1.5-2" stroke="#fff" strokeWidth="1" fill="none"/>
  </svg>
)

export const AzurePostgreSQLIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-pg-a" x1="9" y1="17" x2="9" y2="1" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0078d4"/>
        <stop offset="1" stopColor="#5ea0ef"/>
      </linearGradient>
    </defs>
    <ellipse cx="9" cy="4" rx="7" ry="2.5" fill="url(#azure-pg-a)"/>
    <path d="M2 4v10c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V4" fill="url(#azure-pg-a)"/>
    <ellipse cx="9" cy="4" rx="5" ry="1.5" fill="#fff" opacity=".3"/>
    <circle cx="9" cy="11" r="2" fill="#fff"/>
    <path d="M8 9.5h2v1.5a1 1 0 01-2 0z" fill="#fff"/>
  </svg>
)

export const AzureMariaDBIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-mdb-a" x1="9" y1="17" x2="9" y2="1" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0078d4"/>
        <stop offset="1" stopColor="#5ea0ef"/>
      </linearGradient>
    </defs>
    <ellipse cx="9" cy="4" rx="7" ry="2.5" fill="url(#azure-mdb-a)"/>
    <path d="M2 4v10c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V4" fill="url(#azure-mdb-a)"/>
    <ellipse cx="9" cy="4" rx="5" ry="1.5" fill="#fff" opacity=".3"/>
    <path d="M6 10v3M9 9v4M12 10v3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

export const AzureSQLManagedInstanceIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-sqlmi-a" x1="9" y1="17" x2="9" y2="1" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0078d4"/>
        <stop offset="1" stopColor="#5ea0ef"/>
      </linearGradient>
    </defs>
    <ellipse cx="9" cy="4" rx="7" ry="2.5" fill="url(#azure-sqlmi-a)"/>
    <path d="M2 4v10c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V4" fill="url(#azure-sqlmi-a)"/>
    <ellipse cx="9" cy="8" rx="5" ry="1.5" fill="none" stroke="#fff" strokeWidth=".5"/>
    <ellipse cx="9" cy="12" rx="5" ry="1.5" fill="none" stroke="#fff" strokeWidth=".5"/>
    <rect x="6" y="9" width="6" height="2" fill="#fff"/>
  </svg>
)

export const AzureTableStorageIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-ts-a" x1="9" y1="17" x2="9" y2="1" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0078d4"/>
        <stop offset="1" stopColor="#5ea0ef"/>
      </linearGradient>
    </defs>
    <rect x="1" y="1" width="16" height="16" rx="1" fill="url(#azure-ts-a)"/>
    <rect x="2.5" y="3" width="13" height="3" rx=".5" fill="#fff"/>
    <rect x="2.5" y="7.5" width="6" height="3" rx=".5" fill="#fff"/>
    <rect x="9.5" y="7.5" width="6" height="3" rx=".5" fill="#fff"/>
    <rect x="2.5" y="12" width="6" height="3" rx=".5" fill="#fff"/>
    <rect x="9.5" y="12" width="6" height="3" rx=".5" fill="#fff"/>
  </svg>
)

// ========== NEW AZURE ICONS - Networking Category ==========

export const AzureLoadBalancerIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-lb-a" x1="9" y1="17" x2="9" y2="1" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#5e9624"/>
        <stop offset="1" stopColor="#86d633"/>
      </linearGradient>
    </defs>
    <rect x="3" y="2" width="12" height="5" rx="1" fill="url(#azure-lb-a)"/>
    <rect x="1" y="11" width="5" height="5" rx=".5" fill="url(#azure-lb-a)"/>
    <rect x="6.5" y="11" width="5" height="5" rx=".5" fill="url(#azure-lb-a)"/>
    <rect x="12" y="11" width="5" height="5" rx=".5" fill="url(#azure-lb-a)"/>
    <path d="M9 7v2M9 9l-5.5 2M9 9l5.5 2M9 9v2" stroke="#fff" strokeWidth="1"/>
  </svg>
)

export const AzureVPNGatewayIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-vpn-a" x1="9" y1="17" x2="9" y2="1" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#773adc"/>
        <stop offset="1" stopColor="#b77af4"/>
      </linearGradient>
    </defs>
    <path d="M9 1l7 4v8l-7 4-7-4V5l7-4z" fill="url(#azure-vpn-a)"/>
    <circle cx="9" cy="8" r="3" fill="#fff"/>
    <path d="M8 11h2v3H8z" fill="#fff"/>
    <circle cx="9" cy="8" r="1" fill="#773adc"/>
  </svg>
)

export const AzureExpressRouteIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-er-a" x1="9" y1="17" x2="9" y2="1" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0078d4"/>
        <stop offset="1" stopColor="#5ea0ef"/>
      </linearGradient>
    </defs>
    <rect x="1" y="1" width="16" height="16" rx="2" fill="url(#azure-er-a)"/>
    <path d="M3 9h4l2-3 2 6 2-3h2" stroke="#fff" strokeWidth="1.5" fill="none"/>
    <circle cx="3" cy="9" r="1.5" fill="#fff"/>
    <circle cx="15" cy="9" r="1.5" fill="#fff"/>
  </svg>
)

export const AzureTrafficManagerIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-tm-a" x1="9" y1="17" x2="9" y2="1" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0078d4"/>
        <stop offset="1" stopColor="#5ea0ef"/>
      </linearGradient>
    </defs>
    <circle cx="9" cy="9" r="8" fill="url(#azure-tm-a)"/>
    <circle cx="9" cy="9" r="4" fill="#fff"/>
    <circle cx="9" cy="9" r="2" fill="#0078d4"/>
    <path d="M9 1v4M9 13v4M1 9h4M13 9h4" stroke="#fff" strokeWidth="1.5"/>
  </svg>
)

export const AzureDNSIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-dns-a" x1="9" y1="17" x2="9" y2="1" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#5e9624"/>
        <stop offset="1" stopColor="#86d633"/>
      </linearGradient>
    </defs>
    <rect x="1" y="1" width="16" height="16" rx="2" fill="url(#azure-dns-a)"/>
    <text x="9" y="13" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">DNS</text>
  </svg>
)

export const AzurePrivateLinkIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-pl-a" x1="9" y1="17" x2="9" y2="1" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0078d4"/>
        <stop offset="1" stopColor="#5ea0ef"/>
      </linearGradient>
    </defs>
    <rect x="1" y="1" width="16" height="16" rx="2" fill="url(#azure-pl-a)"/>
    <path d="M5 9a2 2 0 014 0 2 2 0 014 0" stroke="#fff" strokeWidth="2" fill="none"/>
    <circle cx="5" cy="9" r="2" fill="#fff"/>
    <circle cx="13" cy="9" r="2" fill="#fff"/>
  </svg>
)

export const AzureBastionIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-bast-a" x1="9" y1="17" x2="9" y2="1" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0078d4"/>
        <stop offset="1" stopColor="#5ea0ef"/>
      </linearGradient>
    </defs>
    <rect x="1" y="1" width="16" height="16" rx="2" fill="url(#azure-bast-a)"/>
    <path d="M9 3l5 3v6l-5 3-5-3V6l5-3z" fill="#fff"/>
    <circle cx="9" cy="8" r="2" fill="#0078d4"/>
    <path d="M8 10h2v2H8z" fill="#0078d4"/>
  </svg>
)

export const AzureNATGatewayIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-nat-a" x1="9" y1="17" x2="9" y2="1" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#5e9624"/>
        <stop offset="1" stopColor="#86d633"/>
      </linearGradient>
    </defs>
    <rect x="1" y="1" width="16" height="16" rx="2" fill="url(#azure-nat-a)"/>
    <rect x="6" y="3" width="6" height="12" rx="1" fill="#fff"/>
    <path d="M3 6h3M3 9h3M3 12h3M12 6h3M12 9h3M12 12h3" stroke="#fff" strokeWidth="1"/>
    <path d="M9 6v6M7 9l2 2 2-2" stroke="#5e9624" strokeWidth="1" fill="none"/>
  </svg>
)

// ========== NEW AZURE ICONS - Security Category ==========

export const AzureSecurityCenterIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-sc-a" x1="9" y1="17" x2="9" y2="1" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0078d4"/>
        <stop offset="1" stopColor="#5ea0ef"/>
      </linearGradient>
    </defs>
    <path d="M9 1l7 2v6c0 4-3 7-7 8-4-1-7-4-7-8V3l7-2z" fill="url(#azure-sc-a)"/>
    <path d="M7 9l2 2 3-4" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round"/>
  </svg>
)

export const AzureSentinelIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-sent-a" x1="9" y1="17" x2="9" y2="1" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0078d4"/>
        <stop offset="1" stopColor="#50e6ff"/>
      </linearGradient>
    </defs>
    <circle cx="9" cy="9" r="8" fill="url(#azure-sent-a)"/>
    <circle cx="9" cy="9" r="5" fill="none" stroke="#fff" strokeWidth="1"/>
    <circle cx="9" cy="9" r="2" fill="#fff"/>
    <path d="M9 4v3M9 11v3M4 9h3M11 9h3" stroke="#fff" strokeWidth="1"/>
  </svg>
)

export const AzureDDoSProtectionIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-ddos-a" x1="9" y1="17" x2="9" y2="1" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0078d4"/>
        <stop offset="1" stopColor="#5ea0ef"/>
      </linearGradient>
    </defs>
    <path d="M9 1l7 2v6c0 4-3 7-7 8-4-1-7-4-7-8V3l7-2z" fill="url(#azure-ddos-a)"/>
    <path d="M6 9h6M9 6v6" stroke="#fff" strokeWidth="2"/>
  </svg>
)

export const AzureFirewallIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-fw-a" x1="9" y1="17" x2="9" y2="1" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#f78d1e"/>
        <stop offset="1" stopColor="#faa21d"/>
      </linearGradient>
    </defs>
    <rect x="1" y="1" width="16" height="16" rx="2" fill="url(#azure-fw-a)"/>
    <rect x="3" y="3" width="4" height="4" fill="#fff"/>
    <rect x="7" y="3" width="4" height="4" fill="#fff"/>
    <rect x="11" y="3" width="4" height="4" fill="#fff"/>
    <rect x="5" y="7" width="4" height="4" fill="#fff"/>
    <rect x="9" y="7" width="4" height="4" fill="#fff"/>
    <rect x="7" y="11" width="4" height="4" fill="#fff"/>
  </svg>
)

export const AzureDefenderIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-def-a" x1="9" y1="17" x2="9" y2="1" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0078d4"/>
        <stop offset="1" stopColor="#5ea0ef"/>
      </linearGradient>
    </defs>
    <path d="M9 1l7 2v6c0 4-3 7-7 8-4-1-7-4-7-8V3l7-2z" fill="url(#azure-def-a)"/>
    <path d="M9 5v8M5 9h8" stroke="#fff" strokeWidth="2"/>
  </svg>
)

// ========== NEW AZURE ICONS - AI + Machine Learning Category ==========

export const AzureCognitiveServicesIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-cog-a" x1="9" y1="17" x2="9" y2="1" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0078d4"/>
        <stop offset="1" stopColor="#5ea0ef"/>
      </linearGradient>
    </defs>
    <circle cx="9" cy="9" r="8" fill="url(#azure-cog-a)"/>
    <circle cx="9" cy="9" r="4" fill="#fff"/>
    <circle cx="7" cy="8" r="1" fill="#0078d4"/>
    <circle cx="11" cy="8" r="1" fill="#0078d4"/>
    <path d="M7 11c1 1 3 1 4 0" stroke="#0078d4" strokeWidth=".8" fill="none"/>
  </svg>
)

export const AzureMachineLearningIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-ml-a" x1="9" y1="17" x2="9" y2="1" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0078d4"/>
        <stop offset="1" stopColor="#5ea0ef"/>
      </linearGradient>
    </defs>
    <rect x="1" y="1" width="16" height="16" rx="2" fill="url(#azure-ml-a)"/>
    <circle cx="5" cy="5" r="1.5" fill="#fff"/>
    <circle cx="13" cy="5" r="1.5" fill="#fff"/>
    <circle cx="5" cy="13" r="1.5" fill="#fff"/>
    <circle cx="13" cy="13" r="1.5" fill="#fff"/>
    <circle cx="9" cy="9" r="2" fill="#fff"/>
    <path d="M6.5 6.5l1.5 1.5M11.5 6.5l-1.5 1.5M6.5 11.5l1.5-1.5M11.5 11.5l-1.5-1.5" stroke="#fff" strokeWidth="1"/>
  </svg>
)

export const AzureBotServiceIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-bot-a" x1="9" y1="17" x2="9" y2="1" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0078d4"/>
        <stop offset="1" stopColor="#5ea0ef"/>
      </linearGradient>
    </defs>
    <rect x="1" y="3" width="16" height="12" rx="2" fill="url(#azure-bot-a)"/>
    <circle cx="6" cy="8" r="2" fill="#fff"/>
    <circle cx="12" cy="8" r="2" fill="#fff"/>
    <path d="M5 12h8" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M4 3v-1h2v1M12 3v-1h2v1" stroke="url(#azure-bot-a)" strokeWidth="1"/>
  </svg>
)

export const AzureOpenAIIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-oai-a" x1="9" y1="17" x2="9" y2="1" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0078d4"/>
        <stop offset="1" stopColor="#5ea0ef"/>
      </linearGradient>
    </defs>
    <circle cx="9" cy="9" r="8" fill="url(#azure-oai-a)"/>
    <path d="M5 9a4 4 0 018 0 4 4 0 01-8 0" fill="none" stroke="#fff" strokeWidth="1.5"/>
    <circle cx="9" cy="5" r="1.5" fill="#fff"/>
    <circle cx="9" cy="13" r="1.5" fill="#fff"/>
    <path d="M9 6.5v5" stroke="#fff" strokeWidth="1"/>
  </svg>
)

// ========== NEW AZURE ICONS - Integration Category ==========

export const AzureAPIManagementIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-apim-a" x1="9" y1="17" x2="9" y2="1" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#773adc"/>
        <stop offset="1" stopColor="#b77af4"/>
      </linearGradient>
    </defs>
    <rect x="1" y="1" width="16" height="16" rx="2" fill="url(#azure-apim-a)"/>
    <rect x="3" y="5" width="5" height="3" rx=".5" fill="#fff"/>
    <rect x="3" y="10" width="5" height="3" rx=".5" fill="#fff"/>
    <rect x="10" y="7" width="5" height="4" rx=".5" fill="#fff"/>
    <path d="M8 6.5h2M8 11.5h2M10 9h-2" stroke="#fff" strokeWidth="1"/>
  </svg>
)

export const AzureEventGridIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-eg-a" x1="9" y1="17" x2="9" y2="1" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0078d4"/>
        <stop offset="1" stopColor="#5ea0ef"/>
      </linearGradient>
    </defs>
    <rect x="1" y="1" width="16" height="16" rx="2" fill="url(#azure-eg-a)"/>
    <rect x="3" y="3" width="4" height="4" rx=".5" fill="#fff"/>
    <rect x="11" y="3" width="4" height="4" rx=".5" fill="#fff"/>
    <rect x="3" y="11" width="4" height="4" rx=".5" fill="#fff"/>
    <rect x="11" y="11" width="4" height="4" rx=".5" fill="#fff"/>
    <circle cx="9" cy="9" r="2" fill="#fff"/>
    <path d="M7 5l-2 2M11 5l2 2M7 13l-2-2M11 13l2-2" stroke="#fff" strokeWidth=".8"/>
  </svg>
)

// ========== NEW AZURE ICONS - Storage Category ==========

export const AzureBlobStorageIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-blob-a" x1="9" y1="17" x2="9" y2="1" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0078d4"/>
        <stop offset="1" stopColor="#5ea0ef"/>
      </linearGradient>
    </defs>
    <rect x="1" y="1" width="16" height="16" rx="2" fill="url(#azure-blob-a)"/>
    <rect x="3" y="3" width="5" height="5" rx="2.5" fill="#fff"/>
    <rect x="10" y="3" width="5" height="5" rx="2.5" fill="#fff"/>
    <rect x="3" y="10" width="5" height="5" rx="2.5" fill="#fff"/>
    <rect x="10" y="10" width="5" height="5" rx="2.5" fill="#fff"/>
  </svg>
)

export const AzureFileStorageIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-file-a" x1="9" y1="17" x2="9" y2="1" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0078d4"/>
        <stop offset="1" stopColor="#5ea0ef"/>
      </linearGradient>
    </defs>
    <rect x="1" y="1" width="16" height="16" rx="2" fill="url(#azure-file-a)"/>
    <path d="M4 4h6l1 1h3v9H4V4z" fill="#fff"/>
    <rect x="5" y="7" width="8" height="1" fill="#0078d4"/>
    <rect x="5" y="9" width="6" height="1" fill="#0078d4"/>
    <rect x="5" y="11" width="7" height="1" fill="#0078d4"/>
  </svg>
)

export const AzureQueueStorageIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-queue-a" x1="9" y1="17" x2="9" y2="1" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0078d4"/>
        <stop offset="1" stopColor="#5ea0ef"/>
      </linearGradient>
    </defs>
    <rect x="1" y="1" width="16" height="16" rx="2" fill="url(#azure-queue-a)"/>
    <rect x="3" y="4" width="4" height="10" rx=".5" fill="#fff"/>
    <rect x="7" y="4" width="4" height="10" rx=".5" fill="#fff"/>
    <rect x="11" y="4" width="4" height="10" rx=".5" fill="#fff"/>
    <path d="M5 8h2M9 8h2M13 8h2" stroke="#0078d4" strokeWidth="1"/>
  </svg>
)

export const AzureDataLakeStorageIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-dls-a" x1="9" y1="17" x2="9" y2="1" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0078d4"/>
        <stop offset="1" stopColor="#5ea0ef"/>
      </linearGradient>
    </defs>
    <ellipse cx="9" cy="9" rx="8" ry="5" fill="url(#azure-dls-a)"/>
    <ellipse cx="9" cy="7" rx="6" ry="3" fill="#fff" opacity=".3"/>
    <ellipse cx="9" cy="11" rx="6" ry="2" fill="#fff" opacity=".2"/>
    <circle cx="9" cy="9" r="2" fill="#fff"/>
  </svg>
)

export const AzureNetAppFilesIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-naf-a" x1="9" y1="17" x2="9" y2="1" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0078d4"/>
        <stop offset="1" stopColor="#5ea0ef"/>
      </linearGradient>
    </defs>
    <rect x="1" y="1" width="16" height="16" rx="2" fill="url(#azure-naf-a)"/>
    <rect x="3" y="3" width="12" height="4" rx=".5" fill="#fff"/>
    <rect x="3" y="8" width="12" height="3" rx=".5" fill="#fff"/>
    <rect x="3" y="12" width="12" height="3" rx=".5" fill="#fff"/>
    <circle cx="5" cy="5" r="1" fill="#0078d4"/>
    <circle cx="5" cy="9.5" r="1" fill="#0078d4"/>
    <circle cx="5" cy="13.5" r="1" fill="#0078d4"/>
  </svg>
)

// ========== NEW AZURE ICONS - Identity Category ==========

export const AzureB2CIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-b2c-a" x1="9" y1="17" x2="9" y2="1" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0078d4"/>
        <stop offset="1" stopColor="#5ea0ef"/>
      </linearGradient>
    </defs>
    <rect x="1" y="1" width="16" height="16" rx="2" fill="url(#azure-b2c-a)"/>
    <circle cx="6" cy="6" r="2" fill="#fff"/>
    <path d="M3 11c0-2 1.3-3 3-3s3 1 3 3" fill="#fff"/>
    <circle cx="12" cy="6" r="2" fill="#fff"/>
    <path d="M9 11c0-2 1.3-3 3-3s3 1 3 3" fill="#fff"/>
    <path d="M9 14h6" stroke="#fff" strokeWidth="1.5"/>
  </svg>
)

export const AzureManagedIdentitiesIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-mi-a" x1="9" y1="17" x2="9" y2="1" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0078d4"/>
        <stop offset="1" stopColor="#5ea0ef"/>
      </linearGradient>
    </defs>
    <rect x="1" y="1" width="16" height="16" rx="2" fill="url(#azure-mi-a)"/>
    <circle cx="9" cy="6" r="3" fill="#fff"/>
    <path d="M4 14c0-3 2.2-5 5-5s5 2 5 5" fill="#fff"/>
    <circle cx="14" cy="4" r="2" fill="#50e6ff"/>
    <path d="M12 8l2-2" stroke="#50e6ff" strokeWidth="1.5"/>
  </svg>
)

export const AzureEntraIDIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-eid-a" x1="9" y1="17" x2="9" y2="1" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0078d4"/>
        <stop offset="1" stopColor="#5ea0ef"/>
      </linearGradient>
    </defs>
    <path d="M9 1l8 4v8l-8 4-8-4V5l8-4z" fill="url(#azure-eid-a)"/>
    <circle cx="9" cy="7" r="2.5" fill="#fff"/>
    <path d="M5 13c0-2.5 1.8-4 4-4s4 1.5 4 4" fill="#fff"/>
  </svg>
)

// ========== NEW AZURE ICONS - DevOps Category ==========

export const AzureDevOpsIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-devops-a" x1="9" y1="17" x2="9" y2="1" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0078d4"/>
        <stop offset="1" stopColor="#5ea0ef"/>
      </linearGradient>
    </defs>
    <path d="M17 4v10l-4 3-8-2.8V16l-4-5 4-1V3l8 1 4 0z" fill="url(#azure-devops-a)"/>
    <path d="M1 10l4 1V6l-4 4z" fill="#fff"/>
    <path d="M13 14l-8-2.8V6.7L13 4v10z" fill="#fff"/>
  </svg>
)

export const AzureReposIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-repos-a" x1="9" y1="17" x2="9" y2="1" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0078d4"/>
        <stop offset="1" stopColor="#5ea0ef"/>
      </linearGradient>
    </defs>
    <rect x="1" y="1" width="16" height="16" rx="2" fill="url(#azure-repos-a)"/>
    <circle cx="6" cy="6" r="2" fill="#fff"/>
    <circle cx="12" cy="6" r="2" fill="#fff"/>
    <circle cx="9" cy="13" r="2" fill="#fff"/>
    <path d="M6 8v3l3 2M12 8v3l-3 2" stroke="#fff" strokeWidth="1.5" fill="none"/>
  </svg>
)

export const AzurePipelinesIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-pipe-a" x1="9" y1="17" x2="9" y2="1" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0078d4"/>
        <stop offset="1" stopColor="#5ea0ef"/>
      </linearGradient>
    </defs>
    <rect x="1" y="1" width="16" height="16" rx="2" fill="url(#azure-pipe-a)"/>
    <path d="M3 9h4l2-3 2 6 2-3h2" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <circle cx="3" cy="9" r="1.5" fill="#fff"/>
    <circle cx="15" cy="9" r="1.5" fill="#fff"/>
  </svg>
)

export const AzureBoardsIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-boards-a" x1="9" y1="17" x2="9" y2="1" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0078d4"/>
        <stop offset="1" stopColor="#5ea0ef"/>
      </linearGradient>
    </defs>
    <rect x="1" y="1" width="16" height="16" rx="2" fill="url(#azure-boards-a)"/>
    <rect x="3" y="3" width="4" height="12" rx=".5" fill="#fff"/>
    <rect x="7.5" y="3" width="4" height="8" rx=".5" fill="#fff"/>
    <rect x="12" y="3" width="3" height="5" rx=".5" fill="#fff"/>
  </svg>
)

export const AzureTestPlansIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-tp-a" x1="9" y1="17" x2="9" y2="1" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0078d4"/>
        <stop offset="1" stopColor="#5ea0ef"/>
      </linearGradient>
    </defs>
    <rect x="1" y="1" width="16" height="16" rx="2" fill="url(#azure-tp-a)"/>
    <rect x="3" y="3" width="12" height="12" rx="1" fill="#fff"/>
    <path d="M5 9l2 2 4-4" stroke="#0078d4" strokeWidth="2" fill="none" strokeLinecap="round"/>
  </svg>
)

export const AzureArtifactsIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-art-a" x1="9" y1="17" x2="9" y2="1" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0078d4"/>
        <stop offset="1" stopColor="#5ea0ef"/>
      </linearGradient>
    </defs>
    <rect x="1" y="1" width="16" height="16" rx="2" fill="url(#azure-art-a)"/>
    <path d="M9 3l6 3v6l-6 3-6-3V6l6-3z" fill="#fff"/>
    <path d="M9 9v6M3 6l6 3M15 6l-6 3" stroke="#0078d4" strokeWidth="1"/>
  </svg>
)

// ========== NEW AZURE ICONS - Web Category ==========

export const AzureStaticWebAppsIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-swa-a" x1="9" y1="17" x2="9" y2="1" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#773adc"/>
        <stop offset="1" stopColor="#b77af4"/>
      </linearGradient>
    </defs>
    <rect x="1" y="1" width="16" height="16" rx="2" fill="url(#azure-swa-a)"/>
    <rect x="3" y="4" width="12" height="10" rx="1" fill="#fff"/>
    <path d="M5 7h8M5 10h6M5 13h4" stroke="#773adc" strokeWidth="1"/>
  </svg>
)

export const AzureSignalRIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-sr-a" x1="9" y1="17" x2="9" y2="1" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0078d4"/>
        <stop offset="1" stopColor="#5ea0ef"/>
      </linearGradient>
    </defs>
    <rect x="1" y="1" width="16" height="16" rx="2" fill="url(#azure-sr-a)"/>
    <path d="M5 9a4 4 0 018 0" stroke="#fff" strokeWidth="1.5" fill="none"/>
    <path d="M7 9a2 2 0 014 0" stroke="#fff" strokeWidth="1.5" fill="none"/>
    <circle cx="9" cy="9" r="1" fill="#fff"/>
    <path d="M9 10v4" stroke="#fff" strokeWidth="1.5"/>
  </svg>
)

export const AzureNotificationHubsIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-nh-a" x1="9" y1="17" x2="9" y2="1" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0078d4"/>
        <stop offset="1" stopColor="#5ea0ef"/>
      </linearGradient>
    </defs>
    <rect x="1" y="1" width="16" height="16" rx="2" fill="url(#azure-nh-a)"/>
    <path d="M9 3c-3 0-5 2-5 5v4h10V8c0-3-2-5-5-5z" fill="#fff"/>
    <rect x="7" y="12" width="4" height="2" rx=".5" fill="#fff"/>
    <circle cx="9" cy="5" r="1" fill="#0078d4"/>
  </svg>
)

// ========== ADDITIONAL GCP ICONS ==========

export const GcpSpannerIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#4285F4" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z"/>
    <path fill="#fff" d="M12 4.5c-.828 0-1.5.672-1.5 1.5v3.75L7.05 12 10.5 14.25V18c0 .828.672 1.5 1.5 1.5s1.5-.672 1.5-1.5v-3.75L16.95 12 13.5 9.75V6c0-.828-.672-1.5-1.5-1.5z"/>
    <circle fill="#fff" cx="6" cy="12" r="2"/>
    <circle fill="#fff" cx="18" cy="12" r="2"/>
    <path fill="#fff" d="M8 12h1.5M14.5 12H16"/>
  </svg>
)

export const GcpDataflowIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#4285F4" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z"/>
    <g fill="#fff">
      <rect x="3" y="10" width="5" height="4" rx="1"/>
      <rect x="16" y="5" width="5" height="4" rx="1"/>
      <rect x="16" y="15" width="5" height="4" rx="1"/>
      <path d="M8 12h3l2-3h3M8 12h3l2 3h3" stroke="#fff" strokeWidth="1.5" fill="none"/>
    </g>
  </svg>
)

export const GcpCloudArmorIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#4285F4" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z"/>
    <path fill="#fff" d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z"/>
    <path stroke="#4285F4" strokeWidth="1.8" fill="none" d="M8.5 12l2 2 5-5"/>
  </svg>
)

export const GcpCloudBuildIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#4285F4" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z"/>
    <g fill="#fff">
      <rect x="4" y="4" width="6" height="6" rx="1"/>
      <rect x="14" y="4" width="6" height="6" rx="1"/>
      <rect x="4" y="14" width="6" height="6" rx="1"/>
      <rect x="14" y="14" width="6" height="6" rx="1"/>
    </g>
    <g stroke="#4285F4" strokeWidth="1.2">
      <path d="M10 7h4M7 10v4M17 10v4M10 17h4"/>
    </g>
  </svg>
)

export const GcpArtifactRegistryIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#4285F4" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z"/>
    <g fill="#fff">
      <path d="M6 4h12a1 1 0 011 1v14a1 1 0 01-1 1H6a1 1 0 01-1-1V5a1 1 0 011-1z"/>
    </g>
    <g fill="#4285F4">
      <rect x="7" y="6" width="10" height="2.5" rx=".5"/>
      <rect x="7" y="10" width="10" height="2.5" rx=".5"/>
      <rect x="7" y="14" width="10" height="2.5" rx=".5"/>
    </g>
  </svg>
)

export const GcpSecretManagerIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#4285F4" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z"/>
    <path fill="#fff" d="M12 4a3 3 0 00-3 3v2H7a1 1 0 00-1 1v8a1 1 0 001 1h10a1 1 0 001-1v-8a1 1 0 00-1-1h-2V7a3 3 0 00-3-3zm0 1.5a1.5 1.5 0 011.5 1.5v2h-3V7A1.5 1.5 0 0112 5.5z"/>
    <circle fill="#4285F4" cx="12" cy="14" r="1.5"/>
    <path stroke="#4285F4" strokeWidth="1.5" d="M12 15.5v2"/>
  </svg>
)

// ========== EXPANDED GCP ICONS ==========

// GCP Compute - App Engine
export const GcpAppEngineIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#4285F4" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z"/>
    <g fill="#fff">
      <path d="M12 4l7 4v8l-7 4-7-4V8l7-4z"/>
    </g>
    <g fill="#4285F4">
      <path d="M12 6.5l4.5 2.5v5L12 16.5 7.5 14V9L12 6.5z"/>
    </g>
    <circle fill="#fff" cx="12" cy="12" r="2.5"/>
  </svg>
)

// GCP Storage - Persistent Disk
export const GcpPersistentDiskIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#4285F4" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z"/>
    <g fill="#fff">
      <ellipse cx="12" cy="8" rx="7" ry="3"/>
      <path d="M5 8v8c0 1.66 3.13 3 7 3s7-1.34 7-3V8c0 1.66-3.13 3-7 3S5 9.66 5 8z"/>
    </g>
    <ellipse cx="12" cy="12" rx="7" ry="3" fill="none" stroke="#4285F4" strokeWidth=".6"/>
  </svg>
)

// GCP Storage - Filestore
export const GcpFilestoreIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#4285F4" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z"/>
    <g fill="#fff">
      <rect x="5" y="5" width="14" height="14" rx="1"/>
    </g>
    <g fill="#4285F4">
      <rect x="6.5" y="6.5" width="11" height="3" rx=".5"/>
      <rect x="6.5" y="10.5" width="11" height="3" rx=".5"/>
      <rect x="6.5" y="14.5" width="11" height="3" rx=".5"/>
    </g>
    <g fill="#fff">
      <rect x="14" y="7.5" width="2" height="1"/>
      <rect x="14" y="11.5" width="2" height="1"/>
      <rect x="14" y="15.5" width="2" height="1"/>
    </g>
  </svg>
)

// GCP Storage - Storage Transfer
export const GcpStorageTransferIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#4285F4" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z"/>
    <g fill="#fff">
      <rect x="4" y="8" width="6" height="8" rx="1"/>
      <rect x="14" y="8" width="6" height="8" rx="1"/>
      <path d="M10 10h1l2 2-2 2h-1v-1.5h-2v-1h2V10z"/>
      <path d="M14 14h-1l-2-2 2-2h1v1.5h2v1h-2V14z"/>
    </g>
  </svg>
)

// GCP Database - Bigtable
export const GcpBigtableIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#4285F4" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z"/>
    <g fill="#fff">
      <rect x="4" y="5" width="16" height="14" rx="1"/>
    </g>
    <g fill="#4285F4">
      <rect x="5" y="6" width="4.5" height="4" rx=".3"/>
      <rect x="10" y="6" width="4.5" height="4" rx=".3"/>
      <rect x="15" y="6" width="4" height="4" rx=".3"/>
      <rect x="5" y="10.5" width="4.5" height="4" rx=".3"/>
      <rect x="10" y="10.5" width="4.5" height="4" rx=".3"/>
      <rect x="15" y="10.5" width="4" height="4" rx=".3"/>
      <rect x="5" y="15" width="4.5" height="3" rx=".3"/>
      <rect x="10" y="15" width="4.5" height="3" rx=".3"/>
      <rect x="15" y="15" width="4" height="3" rx=".3"/>
    </g>
  </svg>
)

// GCP Database - Memorystore
export const GcpMemorystoreIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#EA4335" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z"/>
    <g fill="#fff">
      <rect x="5" y="6" width="14" height="12" rx="1.5"/>
    </g>
    <g fill="#EA4335">
      <rect x="6.5" y="8" width="11" height="2.5" rx=".5"/>
      <rect x="6.5" y="11.5" width="11" height="2.5" rx=".5"/>
    </g>
    <g fill="#fff">
      <circle cx="8" cy="9.25" r=".7"/>
      <circle cx="8" cy="12.75" r=".7"/>
    </g>
  </svg>
)

// GCP Database - AlloyDB
export const GcpAlloyDBIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#4285F4" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z"/>
    <g fill="#fff">
      <path d="M12 4l6 3v3l-6 3-6-3V7l6-3z"/>
      <path d="M6 11v3l6 3 6-3v-3l-6 3-6-3z"/>
      <path d="M6 15v3l6 3 6-3v-3l-6 3-6-3z"/>
    </g>
    <circle fill="#4285F4" cx="12" cy="8.5" r="1.5"/>
  </svg>
)

// GCP Networking - VPC
export const GcpVpcIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#4285F4" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z"/>
    <g fill="#fff">
      <rect x="4" y="4" width="16" height="16" rx="2" fill="none" stroke="#fff" strokeWidth="1.5"/>
      <rect x="6" y="6" width="5" height="5" rx="1"/>
      <rect x="13" y="6" width="5" height="5" rx="1"/>
      <rect x="6" y="13" width="5" height="5" rx="1"/>
      <rect x="13" y="13" width="5" height="5" rx="1"/>
    </g>
  </svg>
)

// GCP Networking - Load Balancing
export const GcpLoadBalancingIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#4285F4" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z"/>
    <g fill="#fff">
      <circle cx="12" cy="6" r="2.5"/>
      <circle cx="6" cy="17" r="2"/>
      <circle cx="12" cy="17" r="2"/>
      <circle cx="18" cy="17" r="2"/>
      <path d="M12 8.5v4M8 15l3-2.5M16 15l-3-2.5" stroke="#fff" strokeWidth="1.5" fill="none"/>
    </g>
  </svg>
)

// GCP Networking - Cloud CDN
export const GcpCloudCdnIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#4285F4" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z"/>
    <g fill="#fff">
      <circle cx="12" cy="12" r="6"/>
    </g>
    <g fill="#4285F4">
      <circle cx="12" cy="12" r="2"/>
    </g>
    <g stroke="#fff" strokeWidth="1.2" fill="none">
      <circle cx="12" cy="4" r="1.5"/>
      <circle cx="4" cy="12" r="1.5"/>
      <circle cx="20" cy="12" r="1.5"/>
      <circle cx="12" cy="20" r="1.5"/>
      <path d="M12 5.5v1M12 17.5v1M5.5 12h1M17.5 12h1"/>
    </g>
  </svg>
)

// GCP Networking - Cloud DNS
export const GcpCloudDnsIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#4285F4" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z"/>
    <g fill="#fff">
      <circle cx="12" cy="12" r="7" fill="none" stroke="#fff" strokeWidth="1.5"/>
      <ellipse cx="12" cy="12" rx="3" ry="7" fill="none" stroke="#fff" strokeWidth="1.2"/>
      <path d="M5 12h14M12 5v14" stroke="#fff" strokeWidth="1.2"/>
    </g>
    <circle fill="#fff" cx="12" cy="12" r="2"/>
  </svg>
)

// GCP Networking - Cloud NAT
export const GcpCloudNatIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#4285F4" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z"/>
    <g fill="#fff">
      <rect x="4" y="8" width="6" height="8" rx="1"/>
      <rect x="14" y="8" width="6" height="8" rx="1"/>
    </g>
    <g stroke="#fff" strokeWidth="1.5" fill="none">
      <path d="M10 12h4"/>
      <path d="M12 10l2 2-2 2"/>
    </g>
  </svg>
)

// GCP Networking - Cloud Interconnect
export const GcpCloudInterconnectIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#4285F4" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z"/>
    <g fill="#fff">
      <rect x="3" y="9" width="6" height="6" rx="1"/>
      <rect x="15" y="9" width="6" height="6" rx="1"/>
      <rect x="9" y="3" width="6" height="6" rx="1"/>
      <rect x="9" y="15" width="6" height="6" rx="1"/>
    </g>
    <g stroke="#fff" strokeWidth="1.2" fill="none">
      <path d="M9 6h1.5M13.5 6H15M9 18h1.5M13.5 18H15"/>
      <path d="M6 9V7.5M6 16.5V15M18 9V7.5M18 16.5V15"/>
    </g>
  </svg>
)

// GCP Networking - Network Connectivity
export const GcpNetworkConnectivityIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#4285F4" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z"/>
    <g fill="#fff">
      <circle cx="12" cy="12" r="3"/>
      <circle cx="6" cy="6" r="2"/>
      <circle cx="18" cy="6" r="2"/>
      <circle cx="6" cy="18" r="2"/>
      <circle cx="18" cy="18" r="2"/>
    </g>
    <g stroke="#fff" strokeWidth="1.2" fill="none">
      <path d="M9.5 9.5L7.5 7.5M14.5 9.5l2-2M9.5 14.5l-2 2M14.5 14.5l2 2"/>
    </g>
  </svg>
)

// GCP Security - IAM
export const GcpIamIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#EA4335" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z"/>
    <g fill="#fff">
      <circle cx="12" cy="8" r="3"/>
      <path d="M6 18c0-3.3 2.7-6 6-6s6 2.7 6 6"/>
    </g>
    <path fill="#EA4335" d="M16 14l3-1v5l-3-1z"/>
  </svg>
)

// GCP Security - Cloud KMS
export const GcpCloudKmsIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#EA4335" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z"/>
    <g fill="#fff">
      <circle cx="10" cy="10" r="4"/>
      <path d="M13 13l6 6M16 16l3 1M16 19l3-1"/>
    </g>
    <circle fill="#EA4335" cx="10" cy="10" r="1.5"/>
  </svg>
)

// GCP Security - Security Command Center
export const GcpSecurityCommandCenterIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#EA4335" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z"/>
    <g fill="#fff">
      <path d="M12 4l6 2.5v5c0 3.5-2.5 6.5-6 8-3.5-1.5-6-4.5-6-8v-5L12 4z"/>
    </g>
    <g fill="#EA4335">
      <path d="M12 6.5l4 1.7v3.5c0 2.3-1.6 4.3-4 5.3-2.4-1-4-3-4-5.3V8.2l4-1.7z"/>
    </g>
    <path d="M10 12l1.5 1.5 3-3" stroke="#fff" strokeWidth="1.5" fill="none"/>
  </svg>
)

// GCP Security - BeyondCorp
export const GcpBeyondCorpIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#EA4335" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z"/>
    <g fill="#fff">
      <circle cx="12" cy="12" r="6" fill="none" stroke="#fff" strokeWidth="1.5"/>
      <circle cx="12" cy="12" r="2.5"/>
      <path d="M12 5v2M12 17v2M5 12h2M17 12h2" stroke="#fff" strokeWidth="1.5"/>
    </g>
  </svg>
)

// GCP Security - Certificate Manager
export const GcpCertificateManagerIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#EA4335" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z"/>
    <g fill="#fff">
      <rect x="5" y="5" width="14" height="11" rx="1"/>
      <circle cx="12" cy="10" r="2.5"/>
      <path d="M10 16v3l2-1 2 1v-3"/>
    </g>
  </svg>
)

// GCP Analytics - Dataproc
export const GcpDataprocIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#4285F4" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z"/>
    <g fill="#fff">
      <circle cx="12" cy="7" r="3"/>
      <circle cx="7" cy="16" r="2.5"/>
      <circle cx="17" cy="16" r="2.5"/>
    </g>
    <g stroke="#fff" strokeWidth="1.2" fill="none">
      <path d="M10 9.5L8 13.5M14 9.5l2 4M9.5 16h5"/>
    </g>
  </svg>
)

// GCP Analytics - Data Fusion
export const GcpDataFusionIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#4285F4" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z"/>
    <g fill="#fff">
      <circle cx="6" cy="8" r="2.5"/>
      <circle cx="6" cy="16" r="2.5"/>
      <circle cx="18" cy="12" r="3"/>
    </g>
    <g stroke="#fff" strokeWidth="1.5" fill="none">
      <path d="M8.5 8h4l2 4M8.5 16h4l2-4"/>
    </g>
  </svg>
)

// GCP Analytics - Looker
export const GcpLookerIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#4285F4" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z"/>
    <g fill="#fff">
      <circle cx="10" cy="10" r="5" fill="none" stroke="#fff" strokeWidth="2"/>
      <path d="M14 14l5 5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
    </g>
    <g fill="#fff">
      <rect x="7" y="8" width="2" height="4"/>
      <rect x="10" y="7" width="2" height="5"/>
    </g>
  </svg>
)

// GCP Analytics - Dataform
export const GcpDataformIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#4285F4" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z"/>
    <g fill="#fff">
      <rect x="5" y="5" width="14" height="14" rx="1"/>
    </g>
    <g fill="#4285F4">
      <path d="M7 8h5v2H7zM7 11h7v2H7zM7 14h4v2H7z"/>
    </g>
    <path stroke="#4285F4" strokeWidth="1.5" d="M14 9l3 3-3 3" fill="none"/>
  </svg>
)

// GCP AI/ML - Vertex AI
export const GcpVertexAiIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#34A853" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z"/>
    <g fill="#fff">
      <path d="M12 4l8 6-8 6-8-6 8-6z"/>
      <path d="M4 10v5l8 5 8-5v-5l-8 5-8-5z" opacity=".7"/>
    </g>
    <circle fill="#34A853" cx="12" cy="10" r="2"/>
  </svg>
)

// GCP AI/ML - Vision AI
export const GcpVisionAiIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#34A853" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z"/>
    <g fill="#fff">
      <ellipse cx="12" cy="12" rx="8" ry="5"/>
      <circle cx="12" cy="12" r="2.5"/>
    </g>
    <circle fill="#34A853" cx="12" cy="12" r="1"/>
  </svg>
)

// GCP AI/ML - Natural Language
export const GcpNaturalLanguageIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#34A853" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z"/>
    <g fill="#fff">
      <path d="M4 6h16v2H4zM4 10h12v2H4zM4 14h14v2H4zM4 18h10v2H4z"/>
    </g>
    <circle fill="#fff" cx="17" cy="17" r="3"/>
    <path fill="#34A853" d="M16 17h2M17 16v2" strokeWidth="1"/>
  </svg>
)

// GCP AI/ML - Speech-to-Text
export const GcpSpeechToTextIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#34A853" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z"/>
    <g fill="#fff">
      <rect x="9" y="4" width="6" height="10" rx="3"/>
      <path d="M6 11v2c0 3.3 2.7 6 6 6s6-2.7 6-6v-2" fill="none" stroke="#fff" strokeWidth="1.5"/>
      <path d="M12 19v2"/>
    </g>
  </svg>
)

// GCP AI/ML - Translation
export const GcpTranslationIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#34A853" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z"/>
    <g fill="#fff">
      <path d="M4 6h8v2H4z"/>
      <path d="M7 6v2M10 6v8M6 10c2 4 4 5 6 5"/>
      <path d="M13 11l3 8M19 11l-3 8M14.5 16h3"/>
    </g>
  </svg>
)

// GCP AI/ML - Document AI
export const GcpDocumentAiIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#34A853" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z"/>
    <g fill="#fff">
      <path d="M6 4h8l4 4v12a1 1 0 01-1 1H6a1 1 0 01-1-1V5a1 1 0 011-1z"/>
      <path d="M14 4v4h4"/>
    </g>
    <g fill="#34A853">
      <rect x="7" y="10" width="8" height="1.5"/>
      <rect x="7" y="13" width="6" height="1.5"/>
      <rect x="7" y="16" width="7" height="1.5"/>
    </g>
  </svg>
)

// GCP AI/ML - Recommendations AI
export const GcpRecommendationsAiIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#34A853" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z"/>
    <g fill="#fff">
      <circle cx="8" cy="8" r="2.5"/>
      <circle cx="16" cy="8" r="2.5"/>
      <circle cx="8" cy="16" r="2.5"/>
      <circle cx="16" cy="16" r="2.5"/>
    </g>
    <g stroke="#fff" strokeWidth="1" fill="none">
      <path d="M10.5 8h3M8 10.5v3M10.5 16h3M16 10.5v3"/>
    </g>
    <circle fill="#fff" cx="12" cy="12" r="1.5"/>
  </svg>
)

// GCP AI/ML - AutoML
export const GcpAutoMlIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#34A853" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z"/>
    <g fill="#fff">
      <path d="M12 4v4M12 16v4M4 12h4M16 12h4"/>
      <circle cx="12" cy="12" r="3"/>
    </g>
    <g stroke="#fff" strokeWidth="1.2" fill="none">
      <path d="M7 7l2 2M15 7l-2 2M7 17l2-2M15 17l-2-2"/>
    </g>
  </svg>
)

// GCP Developer - Cloud Source Repositories
export const GcpCloudSourceReposIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#4285F4" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z"/>
    <g fill="#fff">
      <circle cx="8" cy="6" r="2"/>
      <circle cx="8" cy="18" r="2"/>
      <circle cx="16" cy="12" r="2"/>
      <path d="M8 8v8M10 6h4l2 6-2 6h-4" fill="none" stroke="#fff" strokeWidth="1.5"/>
    </g>
  </svg>
)

// GCP Developer - Cloud Deploy
export const GcpCloudDeployIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#4285F4" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z"/>
    <g fill="#fff">
      <rect x="4" y="8" width="5" height="8" rx="1"/>
      <rect x="10" y="8" width="5" height="8" rx="1"/>
      <rect x="16" y="8" width="5" height="8" rx="1"/>
    </g>
    <g stroke="#fff" strokeWidth="1.5" fill="none">
      <path d="M9 12h1M15 12h1"/>
    </g>
    <path fill="#4285F4" d="M12 5l2 2h-4l2-2z"/>
  </svg>
)

// GCP Developer - Cloud Workstations
export const GcpCloudWorkstationsIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#4285F4" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z"/>
    <g fill="#fff">
      <rect x="4" y="5" width="16" height="11" rx="1"/>
      <rect x="8" y="17" width="8" height="2" rx=".5"/>
    </g>
    <g fill="#4285F4">
      <rect x="5.5" y="6.5" width="13" height="8" rx=".5"/>
    </g>
    <g fill="#fff">
      <rect x="7" y="8" width="4" height="2"/>
      <rect x="7" y="11" width="6" height="1"/>
      <rect x="7" y="13" width="3" height="1"/>
    </g>
  </svg>
)

// GCP Management - Cloud Monitoring
export const GcpCloudMonitoringIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#4285F4" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z"/>
    <g fill="#fff">
      <rect x="4" y="6" width="16" height="12" rx="1"/>
    </g>
    <g stroke="#4285F4" strokeWidth="1.5" fill="none">
      <path d="M6 14l3-3 2 2 4-4 3 3"/>
    </g>
    <g fill="#4285F4">
      <circle cx="9" cy="11" r=".8"/>
      <circle cx="11" cy="13" r=".8"/>
      <circle cx="15" cy="9" r=".8"/>
    </g>
  </svg>
)

// GCP Management - Cloud Logging
export const GcpCloudLoggingIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#4285F4" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z"/>
    <g fill="#fff">
      <rect x="5" y="4" width="14" height="16" rx="1"/>
    </g>
    <g fill="#4285F4">
      <rect x="7" y="6" width="10" height="2"/>
      <rect x="7" y="9" width="8" height="2"/>
      <rect x="7" y="12" width="10" height="2"/>
      <rect x="7" y="15" width="6" height="2"/>
    </g>
  </svg>
)

// GCP Management - Cloud Trace
export const GcpCloudTraceIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#4285F4" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z"/>
    <g fill="#fff">
      <rect x="3" y="5" width="8" height="3" rx=".5"/>
      <rect x="5" y="9" width="12" height="3" rx=".5"/>
      <rect x="7" y="13" width="6" height="3" rx=".5"/>
      <rect x="9" y="17" width="10" height="3" rx=".5"/>
    </g>
  </svg>
)

// GCP Management - Error Reporting
export const GcpErrorReportingIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#EA4335" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z"/>
    <g fill="#fff">
      <path d="M12 4l9 15H3L12 4z"/>
    </g>
    <g fill="#EA4335">
      <rect x="11" y="9" width="2" height="5"/>
      <circle cx="12" cy="16" r="1"/>
    </g>
  </svg>
)

// GCP Management - Cloud Debugger
export const GcpCloudDebuggerIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#4285F4" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z"/>
    <g fill="#fff">
      <circle cx="12" cy="12" r="5"/>
      <path d="M7 5l2 2M17 5l-2 2M7 19l2-2M17 19l-2-2"/>
      <path d="M12 4v3M12 17v3M4 12h3M17 12h3"/>
    </g>
    <circle fill="#4285F4" cx="12" cy="12" r="2"/>
  </svg>
)

// GCP Management - Cloud Profiler
export const GcpCloudProfilerIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#4285F4" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z"/>
    <g fill="#fff">
      <rect x="4" y="14" width="3" height="6"/>
      <rect x="8" y="10" width="3" height="10"/>
      <rect x="12" y="6" width="3" height="14"/>
      <rect x="16" y="8" width="3" height="12"/>
    </g>
    <circle fill="#fff" cx="17" cy="5" r="2"/>
  </svg>
)

// GCP Integration - Cloud Tasks
export const GcpCloudTasksIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#4285F4" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z"/>
    <g fill="#fff">
      <rect x="5" y="5" width="14" height="14" rx="1"/>
    </g>
    <g stroke="#4285F4" strokeWidth="1.5" fill="none">
      <path d="M8 9l2 2 4-4"/>
      <path d="M8 14h8"/>
      <path d="M8 17h5"/>
    </g>
  </svg>
)

// GCP Integration - Cloud Scheduler
export const GcpCloudSchedulerIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#4285F4" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z"/>
    <g fill="#fff">
      <circle cx="12" cy="12" r="7" fill="none" stroke="#fff" strokeWidth="2"/>
      <path d="M12 7v5l3 3"/>
    </g>
    <g fill="#fff">
      <rect x="11" y="3" width="2" height="2"/>
      <rect x="11" y="19" width="2" height="2"/>
      <rect x="3" y="11" width="2" height="2"/>
      <rect x="19" y="11" width="2" height="2"/>
    </g>
  </svg>
)

// GCP Integration - Workflows
export const GcpWorkflowsIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#4285F4" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z"/>
    <g fill="#fff">
      <circle cx="6" cy="6" r="2.5"/>
      <circle cx="18" cy="6" r="2.5"/>
      <circle cx="12" cy="12" r="2.5"/>
      <circle cx="6" cy="18" r="2.5"/>
      <circle cx="18" cy="18" r="2.5"/>
    </g>
    <g stroke="#fff" strokeWidth="1.2" fill="none">
      <path d="M8.5 6h7M6 8.5v7M18 8.5v7M9.5 9.5l-1 6M14.5 9.5l1 6"/>
    </g>
  </svg>
)

// GCP Integration - Eventarc
export const GcpEventarcIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#4285F4" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z"/>
    <g fill="#fff">
      <path d="M12 4l3 5h-6l3-5z"/>
      <circle cx="6" cy="17" r="3"/>
      <circle cx="18" cy="17" r="3"/>
    </g>
    <g stroke="#fff" strokeWidth="1.5" fill="none">
      <path d="M10 9l-3 5M14 9l3 5M9 17h6"/>
    </g>
  </svg>
)

// GCP Integration - API Gateway
export const GcpApiGatewayIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#4285F4" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z"/>
    <g fill="#fff">
      <rect x="9" y="4" width="6" height="16" rx="1"/>
    </g>
    <g fill="#4285F4">
      <rect x="10" y="6" width="4" height="2"/>
      <rect x="10" y="10" width="4" height="2"/>
      <rect x="10" y="14" width="4" height="2"/>
    </g>
    <g stroke="#fff" strokeWidth="1.5" fill="none">
      <path d="M4 8h5M4 12h5M4 16h5M15 8h5M15 12h5M15 16h5"/>
    </g>
  </svg>
)

// GCP AI - Gemini
export const GcpGeminiIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      <linearGradient id="gcp-gemini-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4285F4"/>
        <stop offset="25%" stopColor="#34A853"/>
        <stop offset="50%" stopColor="#FBBC04"/>
        <stop offset="75%" stopColor="#EA4335"/>
        <stop offset="100%" stopColor="#4285F4"/>
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="11" fill="url(#gcp-gemini-grad)"/>
    <path d="M12 4c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 14c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z" fill="#fff" opacity=".3"/>
    <path d="M12 8l2 4 4 0-3 3 1 4-4-2-4 2 1-4-3-3 4 0z" fill="#fff"/>
  </svg>
)

// ========== GENERIC CLOUD/DEVOPS ICONS ==========


