import React from 'react'
/**
 * Azure Cloud Icons
 * Source: https://learn.microsoft.com/en-us/azure/architecture/icons/
 */

interface IconProps {
  size?: number
  className?: string
}

export const AzureVmIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-vm-grad-a" x1="8.88" y1="12.21" x2="8.88" y2=".21" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0078d4"/>
        <stop offset=".82" stopColor="#5ea0ef"/>
      </linearGradient>
      <linearGradient id="azure-vm-grad-b" x1="8.88" y1="16.84" x2="8.88" y2="12.21" gradientUnits="userSpaceOnUse">
        <stop offset=".15" stopColor="#ccc"/>
        <stop offset="1" stopColor="#707070"/>
      </linearGradient>
    </defs>
    <rect x="-.12" y=".21" width="18" height="12" rx=".6" fill="url(#azure-vm-grad-a)"/>
    <path fill="#50e6ff" d="M11.88 4.46v3.49l-3 1.76v-3.5l3-1.75z"/>
    <path fill="#c3f1ff" d="M11.88 4.46l-3 1.76-3-1.76 3-1.75 3 1.75z"/>
    <path fill="#9cebff" d="M8.88 6.22v3.49l-3-1.76V4.46l3 1.76z"/>
    <path fill="#c3f1ff" d="M5.88 7.95l3-1.74v3.5l-3-1.76z"/>
    <path fill="#9cebff" d="M11.88 7.95l-3-1.74v3.5l3-1.76z"/>
    <path d="M12.49 15.84c-1.78-.28-1.85-1.56-1.85-3.63H7.11c0 2.07-.06 3.35-1.84 3.63a1 1 0 00-.89 1h9a1 1 0 00-.89-1z" fill="url(#azure-vm-grad-b)"/>
  </svg>
)

export const AzureStorageIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-storage-grad" x1="9" y1="15.83" x2="9" y2="5.79" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#b3b3b3"/>
        <stop offset=".26" stopColor="#c1c1c1"/>
        <stop offset="1" stopColor="#e6e6e6"/>
      </linearGradient>
    </defs>
    <path d="M.5 5.79h17v9.48a.57.57 0 01-.57.57H1.07a.57.57 0 01-.57-.57V5.79z" fill="url(#azure-storage-grad)"/>
    <path d="M1.07 2.17h15.86a.57.57 0 01.57.57v3.05H.5V2.73a.57.57 0 01.57-.56z" fill="#37c2b1"/>
    <path d="M2.81 6.89h12.37a.27.27 0 01.26.27v1.4a.27.27 0 01-.26.27H2.81a.27.27 0 01-.26-.27v-1.4a.27.27 0 01.26-.27z" fill="#fff"/>
    <path d="M2.82 9.68h12.37a.27.27 0 01.26.27v1.41a.27.27 0 01-.26.27H2.82a.27.27 0 01-.26-.27V10a.27.27 0 01.26-.32z" fill="#37c2b1"/>
    <path d="M2.82 12.5h12.37a.27.27 0 01.26.27v1.41a.27.27 0 01-.26.27H2.82a.27.27 0 01-.26-.27v-1.41a.27.27 0 01.26-.27z" fill="#258277"/>
  </svg>
)

export const AzureFunctionsIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-func-grad" x1="-175.993" y1="-343.723" x2="-175.993" y2="-359.232" gradientTransform="matrix(1.156 0 0 1.029 212.573 370.548)" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#fea11b"/>
        <stop offset=".284" stopColor="#fea51a"/>
        <stop offset=".547" stopColor="#feb018"/>
        <stop offset=".8" stopColor="#ffc314"/>
        <stop offset="1" stopColor="#ffd70f"/>
      </linearGradient>
    </defs>
    <path d="M5.54 13.105l-.586.588a.267.267 0 01-.377 0L.223 9.353a.533.533 0 010-.755l.588-.59 4.732 4.718a.267.267 0 010 .378z" fill="#50e6ff"/>
    <path d="M4.863 4.305l.59.588a.267.267 0 010 .378L.806 9.932l-.59-.589a.533.533 0 01-.001-.754l4.273-4.285a.267.267 0 01.376 0z" fill="#1490df"/>
    <path d="M17.19 8.012l.588.59a.533.533 0 01-.001.754l-4.354 4.34a.267.267 0 01-.377 0l-.586-.587a.267.267 0 010-.377l4.732-4.718z" fill="#50e6ff"/>
    <path d="M17.782 9.34l-.59.589-4.648-4.662a.267.267 0 010-.377l.59-.588a.267.267 0 01.378 0l4.273 4.286a.533.533 0 010 .753z" fill="#1490df"/>
    <path d="M8.459 9.9H4.87a.193.193 0 01-.2-.181.166.166 0 01.018-.075L8.991 1.13a.206.206 0 01.186-.106h4.245a.193.193 0 01.2.181.165.165 0 01-.035.1L8.534 7.966h4.928a.193.193 0 01.2.181.176.176 0 01-.052.122l-8.189 8.519c-.077.046-.624.5-.356-.189z" fill="url(#azure-func-grad)"/>
  </svg>
)

export const AzureSqlIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <radialGradient id="azure-sql-grad-b" cx="9.36" cy="10.57" r="7.07" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#f2f2f2"/>
        <stop offset=".58" stopColor="#eee"/>
        <stop offset="1" stopColor="#e6e6e6"/>
      </radialGradient>
      <linearGradient id="azure-sql-grad-a" x1="2.59" y1="10.16" x2="15.41" y2="10.16" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#005ba1"/>
        <stop offset=".07" stopColor="#0060a9"/>
        <stop offset=".36" stopColor="#0071c8"/>
        <stop offset=".52" stopColor="#0078d4"/>
        <stop offset=".64" stopColor="#0074cd"/>
        <stop offset=".82" stopColor="#006abb"/>
        <stop offset="1" stopColor="#005ba1"/>
      </linearGradient>
    </defs>
    <path d="M9 5.14c-3.54 0-6.41-1-6.41-2.32v12.36c0 1.27 2.82 2.3 6.32 2.32H9c3.54 0 6.41-1 6.41-2.32V2.82c0 1.29-2.87 2.32-6.41 2.32z" fill="url(#azure-sql-grad-a)"/>
    <path d="M15.41 2.82c0 1.29-2.87 2.32-6.41 2.32s-6.41-1-6.41-2.32S5.46.5 9 .5s6.41 1 6.41 2.32" fill="#e8e8e8"/>
    <path d="M13.92 2.63c0 .82-2.21 1.48-4.92 1.48s-4.92-.66-4.92-1.48S6.29 1.16 9 1.16s4.92.66 4.92 1.47" fill="#50e6ff"/>
    <path d="M9 3a11.55 11.55 0 00-3.89.57A11.42 11.42 0 009 4.11a11.15 11.15 0 003.89-.58A11.84 11.84 0 009 3z" fill="#198ab3"/>
    <path d="M12.9 11.4V8H12v4.13h2.46v-.73zM5.76 9.73a1.83 1.83 0 01-.51-.31.44.44 0 01-.12-.32.34.34 0 01.15-.3.68.68 0 01.42-.12 1.62 1.62 0 011 .29v-.86a2.58 2.58 0 00-1-.16 1.64 1.64 0 00-1.09.34 1.08 1.08 0 00-.42.89c0 .51.32.91 1 1.21a2.88 2.88 0 01.62.36.42.42 0 01.15.32.38.38 0 01-.16.31.81.81 0 01-.45.11 1.66 1.66 0 01-1.09-.42V12a2.17 2.17 0 001.07.24 1.88 1.88 0 001.18-.33 1.08 1.08 0 00.33-.91 1.05 1.05 0 00-.25-.7 2.42 2.42 0 00-.83-.57zM11 11.32a2.34 2.34 0 00.33-1.26A2.32 2.32 0 0011 9a1.81 1.81 0 00-.7-.75 2 2 0 00-1-.26 2.11 2.11 0 00-1.08.27 1.86 1.86 0 00-.73.74 2.46 2.46 0 00-.26 1.14 2.26 2.26 0 00.24 1 1.76 1.76 0 00.69.74 2.06 2.06 0 001 .3l.86 1h1.21L10 12.08a1.79 1.79 0 001-.76zm-1-.25a.94.94 0 01-.76.35.92.92 0 01-.76-.36 1.52 1.52 0 01-.29-1 1.53 1.53 0 01.29-1 1 1 0 01.78-.37.87.87 0 01.75.37 1.62 1.62 0 01.27 1 1.46 1.46 0 01-.28 1.01z" fill="url(#azure-sql-grad-b)"/>
  </svg>
)

export const AzureCosmosIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <radialGradient id="azure-cosmos-grad" cx="-105.006" cy="-10.409" r="5.954" gradientTransform="matrix(1.036 0 0 1.027 117.739 19.644)" gradientUnits="userSpaceOnUse">
        <stop offset=".183" stopColor="#5ea0ef"/>
        <stop offset="1" stopColor="#0078d4"/>
      </radialGradient>
    </defs>
    <path d="M2.954 5.266a.175.175 0 01-.176-.176A2.012 2.012 0 00.769 3.081a.176.176 0 01-.176-.175.176.176 0 01.176-.176A2.012 2.012 0 002.778.72a.175.175 0 01.176-.176.175.175 0 01.176.176 2.012 2.012 0 002.009 2.009.175.175 0 01.176.176.175.175 0 01-.176.176A2.011 2.011 0 003.13 5.09a.177.177 0 01-.176.176zM15.611 17.456a.141.141 0 01-.141-.141 1.609 1.609 0 00-1.607-1.607.141.141 0 01-.141-.14.141.141 0 01.141-.141 1.608 1.608 0 001.607-1.607.141.141 0 01.141-.141.141.141 0 01.141.141 1.608 1.608 0 001.607 1.607.141.141 0 110 .282 1.609 1.609 0 00-1.607 1.607.141.141 0 01-.141.14z" fill="#50e6ff"/>
    <path d="M14.969 7.53a6.137 6.137 0 11-7.395-4.543 6.137 6.137 0 017.395 4.543z" fill="url(#azure-cosmos-grad)"/>
    <path d="M5.709 13.115a1.638 1.638 0 10.005-3.275 1.307 1.307 0 00.007-.14A1.651 1.651 0 004.06 8.064H2.832a6.251 6.251 0 001.595 5.051zM15.045 7.815c0-.015 0-.03-.007-.044a5.978 5.978 0 00-1.406-2.88 1.825 1.825 0 00-.289-.09 1.806 1.806 0 00-2.3 1.663 2 2 0 00-.2-.013 1.737 1.737 0 00-.581 3.374 1.451 1.451 0 00.541.1h2.03a13.453 13.453 0 002.212-2.11z" fill="#f2f2f2"/>
    <path d="M17.191 3.832c-.629-1.047-2.1-1.455-4.155-1.149a14.606 14.606 0 00-2.082.452 6.456 6.456 0 011.528.767c.241-.053.483-.116.715-.151a7.49 7.49 0 011.103-.089 2.188 2.188 0 011.959.725c.383.638.06 1.729-.886 3a16.723 16.723 0 01-4.749 4.051A16.758 16.758 0 014.8 13.7c-1.564.234-2.682 0-3.065-.636s-.06-1.73.886-2.995c.117-.157.146-.234.279-.392a6.252 6.252 0 01.026-1.63 11.552 11.552 0 00-1.17 1.372C.517 11.076.181 12.566.809 13.613a3.165 3.165 0 002.9 1.249 8.434 8.434 0 001.251-.1 17.855 17.855 0 006.219-2.4A17.808 17.808 0 0016.24 8.03c1.243-1.661 1.579-3.15.951-4.198z" fill="#50e6ff"/>
  </svg>
)

export const AzureAppServiceIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-appservice-grad-b" x1="4.4" y1="11.48" x2="4.37" y2="7.53" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#ccc"/>
        <stop offset="1" stopColor="#fcfcfc"/>
      </linearGradient>
      <linearGradient id="azure-appservice-grad-c" x1="10.13" y1="15.45" x2="10.13" y2="11.9" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#ccc"/>
        <stop offset="1" stopColor="#fcfcfc"/>
      </linearGradient>
      <linearGradient id="azure-appservice-grad-d" x1="14.18" y1="11.15" x2="14.18" y2="7.38" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#ccc"/>
        <stop offset="1" stopColor="#fcfcfc"/>
      </linearGradient>
      <radialGradient id="azure-appservice-grad-a" cx="13428.81" cy="3518.86" r="56.67" gradientTransform="matrix(.15 0 0 .15 -2005.33 -518.83)" gradientUnits="userSpaceOnUse">
        <stop offset=".18" stopColor="#5ea0ef"/>
        <stop offset="1" stopColor="#0078d4"/>
      </radialGradient>
    </defs>
    <path d="M14.21 15.72A8.5 8.5 0 013.79 2.28l.09-.06a8.5 8.5 0 0110.33 13.5" fill="url(#azure-appservice-grad-a)"/>
    <circle cx="4.38" cy="8.68" r="2.73" fill="url(#azure-appservice-grad-b)"/>
    <circle cx="10.13" cy="13.67" r="1.78" fill="url(#azure-appservice-grad-c)"/>
    <circle cx="14.18" cy="9.27" r="1.89" fill="url(#azure-appservice-grad-d)"/>
  </svg>
)

export const AzureAksIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-aks-grad" x1="2.94" y1="3.74" x2="8.67" y2="3.74" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#b77af4"/>
        <stop offset="1" stopColor="#773adc"/>
      </linearGradient>
    </defs>
    <path fill="url(#azure-aks-grad)" d="M5.8 1.22l-2.86.53v3.9l2.86.61 2.87-1.15V2.2L5.8 1.22z"/>
    <path d="M2.94 1.75v3.9l2.89.61v-5zm1.22 3.6l-.81-.16v-3l.81-.13zm1.26.23l-.93-.15V2l.93-.16z" fill="#341a6e"/>
    <path fill="#b77af4" d="M11.99 1.27l-2.86.53v3.9l2.86.61 2.86-1.16v-2.9l-2.86-.98z"/>
    <path d="M9.13 1.8v3.9l2.87.61v-5zm1.21 3.6l-.81-.16v-3l.81-.13zm1.26.23l-.93-.15V2.05l.93-.17z" fill="#341a6e"/>
    <path fill="#b77af4" d="M2.87 6.6l-2.86.53v3.9l2.86.61 2.87-1.15V7.58L2.87 6.6z"/>
    <path d="M0 7.13V11l2.89.61v-5zm1.21 3.61l-.81-.17v-3l.81-.14zm1.27.26l-.93-.15V7.38l.93-.16z" fill="#341a6e"/>
    <path fill="#b77af4" d="M9.04 6.56l-2.86.53v3.9l2.86.62 2.86-1.16V7.54l-2.86-.98z"/>
    <path d="M6.18 7.09V11l2.88.61v-5zm1.21 3.61l-.81-.17v-3l.81-.14zm1.26.22l-.93-.15V7.34l.93-.16z" fill="#341a6e"/>
    <path fill="#b77af4" d="M15.21 6.61l-2.86.53v3.9l2.86.61 2.87-1.15V7.59l-2.87-.98z"/>
    <path d="M12.35 7.14V11l2.89.61v-5zm1.22 3.61l-.81-.17v-3l.81-.14zm1.26.22l-.93-.15V7.39l.93-.16z" fill="#341a6e"/>
    <path fill="#b77af4" d="M5.73 12.04l-2.86.52v3.9l2.86.62 2.87-1.16v-2.9l-2.87-.98z"/>
    <path d="M2.87 12.56v3.9l2.89.62V12zm1.22 3.61L3.28 16v-3l.81-.14zm1.26.23l-.93-.15v-3.44l.93-.16z" fill="#341a6e"/>
    <path fill="#b77af4" d="M11.91 12.08l-2.86.53v3.9l2.86.61 2.87-1.15v-2.91l-2.87-.98z"/>
    <path d="M9.05 12.61v3.9l2.89.61v-5zm1.22 3.61l-.81-.17v-3l.81-.14zm1.26.22l-.93-.15v-3.43l.93-.16z" fill="#341a6e"/>
  </svg>
)

export const AzureCdnIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-cdn-grad" x1="10.79" y1="2.17" x2="10.79" y2="16.56" gradientUnits="userSpaceOnUse">
        <stop offset=".18" stopColor="#5ea0ef"/>
        <stop offset="1" stopColor="#0078d4"/>
      </linearGradient>
    </defs>
    <rect x="3.7" y="5.49" width="1.18" height="5.26" rx=".52" transform="rotate(-90 4.29 8.12)" fill="#b3b3b3"/>
    <rect x="2.04" y="7.88" width="1.18" height="5.26" rx=".52" transform="rotate(-90 2.63 10.51)" fill="#a3a3a3"/>
    <rect x="3.7" y="10.26" width="1.18" height="5.26" rx=".52" transform="rotate(-90 4.295 12.895)" fill="#7a7a7a"/>
    <path d="M18 11a3.28 3.28 0 00-2.81-3.18 4.13 4.13 0 00-4.21-4 4.23 4.23 0 00-4 2.8 3.89 3.89 0 00-3.38 3.8 4 4 0 004.06 3.86h7.11A3.32 3.32 0 0018 11z" fill="url(#azure-cdn-grad)"/>
  </svg>
)

export const AzureVnetIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-vnet-grad-a" x1="9.88" y1="8.59" x2="11.52" y2="10.23" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#86d633"/>
        <stop offset="1" stopColor="#5e9624"/>
      </linearGradient>
      <linearGradient id="azure-vnet-grad-b" x1="6.18" y1="8.59" x2="7.81" y2="10.23" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#86d633"/>
        <stop offset="1" stopColor="#5e9624"/>
      </linearGradient>
      <linearGradient id="azure-vnet-grad-c" x1="2.48" y1="8.59" x2="4.11" y2="10.23" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#86d633"/>
        <stop offset="1" stopColor="#5e9624"/>
      </linearGradient>
    </defs>
    <circle cx="12.74" cy="8.99" r="1.16" fill="url(#azure-vnet-grad-a)"/>
    <circle cx="9.04" cy="9" r="1.16" fill="url(#azure-vnet-grad-b)"/>
    <circle cx="5.34" cy="9" r="1.16" fill="url(#azure-vnet-grad-c)"/>
    <path d="M6.182 13.638l-.664.665a.3.3 0 01-.424 0L.18 9.404a.6.6 0 01-.001-.848l.663-.666 5.34 5.324a.3.3 0 010 .425z" fill="#50e6ff"/>
    <path d="M5.418 3.708l.666.664a.3.3 0 010 .424L.838 10.057l-.666-.663a.6.6 0 01-.001-.849L4.994 3.71a.3.3 0 01.424 0z" fill="#1490df"/>
    <path d="M17.157 7.88l.663.666a.6.6 0 010 .848l-4.915 4.9a.3.3 0 01-.424 0l-.664-.666a.3.3 0 010-.424l5.34-5.324z" fill="#50e6ff"/>
    <path d="M17.818 9.387l-.665.664-5.247-5.261a.3.3 0 010-.425l.674-.67a.3.3 0 01.424 0l4.823 4.836a.6.6 0 01-.002.849z" fill="#1490df"/>
  </svg>
)

export const AzureKeyVaultIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <radialGradient id="azure-keyvault-grad-a" cx="9" cy="9" r="8.5" gradientUnits="userSpaceOnUse">
        <stop offset=".18" stopColor="#5ea0ef"/>
        <stop offset=".56" stopColor="#5c9fee"/>
        <stop offset=".69" stopColor="#559ced"/>
        <stop offset=".78" stopColor="#4a97e9"/>
        <stop offset=".86" stopColor="#3990e4"/>
        <stop offset=".93" stopColor="#2387de"/>
        <stop offset=".99" stopColor="#087bd6"/>
        <stop offset="1" stopColor="#0078d4"/>
      </radialGradient>
      <radialGradient id="azure-keyvault-grad-b" cx="38.95" cy="182.07" r="9.88" gradientTransform="matrix(.94 0 0 .94 -28.71 -163.24)" gradientUnits="userSpaceOnUse">
        <stop offset=".27" stopColor="#ffd70f"/>
        <stop offset=".49" stopColor="#ffcb12"/>
        <stop offset=".88" stopColor="#feac19"/>
        <stop offset="1" stopColor="#fea11b"/>
      </radialGradient>
    </defs>
    <path d="M9 .5A8.5 8.5 0 1017.5 9 8.51 8.51 0 009 .5zm0 15.84A7.34 7.34 0 1116.34 9 7.34 7.34 0 019 16.34z" fill="url(#azure-keyvault-grad-a)"/>
    <circle cx="9" cy="9" r="7.34" fill="#fff"/>
    <path d="M13.44 7.33a1.84 1.84 0 000-2.59l-3.15-3.16a1.83 1.83 0 00-2.58 0L4.56 4.74a1.84 1.84 0 000 2.59L7.18 10a.51.51 0 01.15.36v4.88a.63.63 0 00.18.44l1.2 1.2a.41.41 0 00.58 0l1.16-1.16.68-.68a.25.25 0 000-.34l-.49-.49a.27.27 0 010-.37l.49-.49a.25.25 0 000-.34l-.49-.49a.27.27 0 010-.37l.49-.49a.25.25 0 000-.34l-.68-.69v-.25zM9 2.35a1 1 0 010 2.07 1 1 0 110-2.07z" fill="url(#azure-keyvault-grad-b)"/>
  </svg>
)

// ============================================================================
// Azure Microsoft Fabric Icons
// ============================================================================

export const AzureFabricIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-fabric-grad" x1="9" y1="1" x2="9" y2="17" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#50e6ff"/>
        <stop offset="1" stopColor="#0078d4"/>
      </linearGradient>
    </defs>
    <rect x="1" y="1" width="16" height="16" rx="2" fill="url(#azure-fabric-grad)"/>
    <path d="M5 5h3v3H5zM10 5h3v3h-3zM5 10h3v3H5zM10 10h3v3h-3z" fill="#fff" opacity=".9"/>
  </svg>
)

export const AzureFabricLakehouseIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-lakehouse-grad" x1="9" y1="2" x2="9" y2="16" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#50e6ff"/>
        <stop offset="1" stopColor="#0078d4"/>
      </linearGradient>
    </defs>
    <path d="M9 2L2 6v8l7 4 7-4V6L9 2z" fill="url(#azure-lakehouse-grad)"/>
    <path d="M9 6L5 8v4l4 2 4-2V8L9 6z" fill="#fff" opacity=".3"/>
    <path d="M9 8l-2 1v2l2 1 2-1V9L9 8z" fill="#fff"/>
  </svg>
)

export const AzureFabricWarehouseIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-warehouse-grad" x1="9" y1="1" x2="9" y2="17" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#773adc"/>
        <stop offset="1" stopColor="#552f99"/>
      </linearGradient>
    </defs>
    <rect x="2" y="3" width="14" height="12" rx="1" fill="url(#azure-warehouse-grad)"/>
    <rect x="4" y="5" width="10" height="2" rx=".5" fill="#fff" opacity=".9"/>
    <rect x="4" y="8" width="10" height="2" rx=".5" fill="#fff" opacity=".7"/>
    <rect x="4" y="11" width="10" height="2" rx=".5" fill="#fff" opacity=".5"/>
  </svg>
)

export const AzureFabricEventhouseIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-eventhouse-grad" x1="9" y1="1" x2="9" y2="17" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#ffd70f"/>
        <stop offset="1" stopColor="#fea11b"/>
      </linearGradient>
    </defs>
    <path d="M9 1L1 5v8l8 4 8-4V5L9 1z" fill="url(#azure-eventhouse-grad)"/>
    <path d="M9 5L4 7.5v5L9 15l5-2.5v-5L9 5z" fill="#fff" opacity=".3"/>
    <circle cx="9" cy="10" r="2" fill="#fff"/>
  </svg>
)

export const AzureOneLakeIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-onelake-grad" x1="9" y1="1" x2="9" y2="17" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#50e6ff"/>
        <stop offset="0.5" stopColor="#0078d4"/>
        <stop offset="1" stopColor="#005ba1"/>
      </linearGradient>
    </defs>
    <ellipse cx="9" cy="5" rx="7" ry="3" fill="url(#azure-onelake-grad)"/>
    <path d="M2 5v8c0 1.66 3.13 3 7 3s7-1.34 7-3V5c0 1.66-3.13 3-7 3S2 6.66 2 5z" fill="url(#azure-onelake-grad)"/>
    <ellipse cx="9" cy="5" rx="5" ry="2" fill="#fff" opacity=".3"/>
  </svg>
)

export const AzureFabricPipelineIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-pipeline-grad" x1="1" y1="9" x2="17" y2="9" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0078d4"/>
        <stop offset="1" stopColor="#50e6ff"/>
      </linearGradient>
    </defs>
    <rect x="1" y="6" width="5" height="6" rx="1" fill="#0078d4"/>
    <rect x="12" y="6" width="5" height="6" rx="1" fill="#50e6ff"/>
    <path d="M6 9h6" stroke="url(#azure-pipeline-grad)" strokeWidth="2" fill="none"/>
    <path d="M10 7l2 2-2 2" fill="none" stroke="#50e6ff" strokeWidth="1.5"/>
  </svg>
)

export const AzurePowerBIIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-pbi-grad" x1="9" y1="1" x2="9" y2="17" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#f2c811"/>
        <stop offset="1" stopColor="#e8a900"/>
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="14" height="14" rx="2" fill="url(#azure-pbi-grad)"/>
    <rect x="4" y="10" width="2.5" height="4" rx=".5" fill="#000" opacity=".3"/>
    <rect x="7.75" y="7" width="2.5" height="7" rx=".5" fill="#000" opacity=".5"/>
    <rect x="11.5" y="4" width="2.5" height="10" rx=".5" fill="#000" opacity=".7"/>
  </svg>
)

export const AzureFabricSparkIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-spark-grad" x1="9" y1="1" x2="9" y2="17" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#ff6b35"/>
        <stop offset="1" stopColor="#e84118"/>
      </linearGradient>
    </defs>
    <circle cx="9" cy="9" r="7" fill="url(#azure-spark-grad)"/>
    <path d="M9 4L7 9l2 5 2-5-2-5z" fill="#fff" opacity=".9"/>
    <path d="M4 9l5-2 5 2-5 2-5-2z" fill="#fff" opacity=".7"/>
  </svg>
)

export const AzureFabricDataflowIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-dataflow-grad" x1="1" y1="9" x2="17" y2="9" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0078d4"/>
        <stop offset="1" stopColor="#50e6ff"/>
      </linearGradient>
    </defs>
    <circle cx="3" cy="5" r="2" fill="#0078d4"/>
    <circle cx="3" cy="13" r="2" fill="#0078d4"/>
    <circle cx="9" cy="9" r="2.5" fill="#1490df"/>
    <circle cx="15" cy="9" r="2" fill="#50e6ff"/>
    <path d="M5 5h2M5 13h2M11.5 9h1.5" stroke="url(#azure-dataflow-grad)" strokeWidth="1.5" fill="none"/>
  </svg>
)

export const AzureEntraIdIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-entra-grad" x1="9" y1="1" x2="9" y2="17" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0078d4"/>
        <stop offset="1" stopColor="#005ba1"/>
      </linearGradient>
    </defs>
    <path d="M9 1L2 5v8l7 4 7-4V5L9 1z" fill="url(#azure-entra-grad)"/>
    <circle cx="9" cy="7" r="2.5" fill="#fff"/>
    <path d="M5 14c0-2.2 1.8-4 4-4s4 1.8 4 4" fill="#fff" opacity=".8"/>
  </svg>
)

export const AzureOpenAIIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" className={className}>
    <defs>
      <linearGradient id="azure-openai-grad" x1="9" y1="1" x2="9" y2="17" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#50e6ff"/>
        <stop offset="1" stopColor="#0078d4"/>
      </linearGradient>
    </defs>
    <circle cx="9" cy="9" r="8" fill="url(#azure-openai-grad)"/>
    <circle cx="9" cy="9" r="3" fill="#fff"/>
    <circle cx="9" cy="9" r="1.5" fill="#0078d4"/>
    <path d="M9 1v3M9 14v3M1 9h3M14 9h3M3 3l2 2M13 13l2 2M3 15l2-2M13 3l2 2" stroke="#fff" strokeWidth="1" opacity=".6"/>
  </svg>
)



