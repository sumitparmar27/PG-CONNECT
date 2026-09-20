import type { SVGProps } from 'react'

function base(props: SVGProps<SVGSVGElement>) {
  return {
    xmlns: 'http://www.w3.org/2000/svg',
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    ...props,
  }
}

export function MailIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m3.5 6.5 8 6.2 8.5-6.2" />
    </svg>
  )
}

export function LockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
      <path d="M7.5 10.5V7.5a4.5 4.5 0 0 1 9 0v3" />
    </svg>
  )
}

export function UserIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c1.4-3.6 4.4-5.5 7.5-5.5s6.1 1.9 7.5 5.5" />
    </svg>
  )
}

export function EyeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

export function EyeOffIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M3.5 3.5l17 17" />
      <path d="M10.6 5.7A9.9 9.9 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a15.6 15.6 0 0 1-3.4 4.2M7 6.9C4.3 8.6 2.5 12 2.5 12s3.5 6.5 9.5 6.5c1.3 0 2.5-.3 3.6-.8" />
      <path d="M9.9 10a3 3 0 0 0 4.1 4.1" />
    </svg>
  )
}

export function AlertIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v6" />
      <circle cx="12" cy="16.5" r="0.25" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function SpinnerIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)} className="animate-auth-spin">
      <path d="M12 3a9 9 0 1 0 9 9" />
    </svg>
  )
}

export function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M5 12.5 9.5 17 19 6.5" />
    </svg>
  )
}

export function PinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M12 21s-6.5-5.7-6.5-11a6.5 6.5 0 0 1 13 0c0 5.3-6.5 11-6.5 11Z" />
      <circle cx="12" cy="10" r="2.3" />
    </svg>
  )
}

export function BedIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M3 18v-6.5A2.5 2.5 0 0 1 5.5 9H18a3 3 0 0 1 3 3v6" />
      <path d="M3 15h18" />
      <path d="M3 18v2M21 18v2" />
      <path d="M6.5 9V6.5A1.5 1.5 0 0 1 8 5h3a1.5 1.5 0 0 1 1.5 1.5V9" />
    </svg>
  )
}

export function BathIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M4 12h16v2.5A4.5 4.5 0 0 1 15.5 19h-7A4.5 4.5 0 0 1 4 14.5V12Z" />
      <path d="M6 12V6a2 2 0 0 1 3.5-1.3" />
      <path d="M7 19v2M17 19v2" />
    </svg>
  )
}

export function CarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M4 16v-3.5L6 8h12l2 4.5V16" />
      <path d="M4 16h16v2.5a1 1 0 0 1-1 1h-1.5a1 1 0 0 1-1-1V17h-9v1.5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V16Z" />
      <circle cx="7.5" cy="16" r="1" fill="currentColor" stroke="none" />
      <circle cx="16.5" cy="16" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function DoorIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <rect x="6" y="3" width="12" height="18" rx="1" />
      <path d="M14.5 12h.01" />
    </svg>
  )
}

export function PlusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function EditIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z" />
      <path d="M13.5 6.5l3 3" />
    </svg>
  )
}

export function TrashIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M4.5 7h15" />
      <path d="M9 7V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v2" />
      <path d="M6.5 7 7.3 19a2 2 0 0 0 2 1.9h5.4a2 2 0 0 0 2-1.9L17.5 7" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  )
}

export function ChevronLeftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M15 5.5 8.5 12l6.5 6.5" />
    </svg>
  )
}

export function ChevronRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M9 5.5 15.5 12 9 18.5" />
    </svg>
  )
}

export function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.3-4.3" />
    </svg>
  )
}

export function ImagePlaceholderIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="m5 17 4.5-4.5 3 3 3.5-3.5L20 16" />
    </svg>
  )
}

export function LogoutIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M14 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2" />
      <path d="M9 12h11.5M17 8.5l3.5 3.5-3.5 3.5" />
    </svg>
  )
}

export function DashboardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.5" />
      <rect x="13" y="3.5" width="7.5" height="7.5" rx="1.5" />
      <rect x="3.5" y="13" width="7.5" height="7.5" rx="1.5" />
      <rect x="13" y="13" width="7.5" height="7.5" rx="1.5" />
    </svg>
  )
}

export function UsersIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c1.2-3.3 3.7-5 6-5s4.8 1.7 6 5" />
      <path d="M15.5 6a2.75 2.75 0 0 1 0 5.4" />
      <path d="M17.5 14.5c2 .4 3.4 1.9 4.3 4.5" />
    </svg>
  )
}

export function BuildingIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <rect x="5" y="3" width="14" height="18" rx="1.5" />
      <path d="M9 7.5h1.5M13.5 7.5H15M9 11.5h1.5M13.5 11.5H15M9 15.5h1.5M13.5 15.5H15" />
      <path d="M10.5 21v-3h3v3" />
    </svg>
  )
}

export function CalendarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 9.5h17" />
      <path d="M8 3v3.5M16 3v3.5" />
    </svg>
  )
}

export function ChartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M4.5 20V10" />
      <path d="M12 20V4" />
      <path d="M19.5 20v-7" />
      <path d="M3.5 20.5h17" />
    </svg>
  )
}

export function GearIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v2.2M12 18.8V21M21 12h-2.2M5.2 12H3M18 6l-1.6 1.6M7.6 16.4 6 18M18 18l-1.6-1.6M7.6 7.6 6 6" />
    </svg>
  )
}

export function BanIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m6.5 6.5 11 11" />
    </svg>
  )
}

export function XCircleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m9 9 6 6M15 9l-6 6" />
    </svg>
  )
}
