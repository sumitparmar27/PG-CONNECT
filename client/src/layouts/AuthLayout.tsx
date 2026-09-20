import type { ReactNode } from 'react'
import { CheckIcon } from '../components/icons'

const FEATURES = [
  'Verified PGs near your college or office',
  'Transparent pricing, zero brokerage',
  'Book a visit in under two minutes',
]

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <div className="flex min-h-full flex-1">
      <aside className="relative flex flex-1 flex-col justify-center overflow-hidden bg-[linear-gradient(155deg,color-mix(in_srgb,var(--accent)_92%,black_8%)_0%,var(--accent)_55%,color-mix(in_srgb,var(--accent)_75%,#031a26_55%)_100%)] p-16 text-[#fdf2ec] max-[900px]:hidden">
        <div className="pointer-events-none absolute top-[-120px] right-[-100px] h-[340px] w-[340px] rounded-full bg-white opacity-15 blur-[60px]" />
        <div className="pointer-events-none absolute bottom-[-80px] left-[-60px] h-[260px] w-[260px] rounded-full bg-[#031a26] opacity-35 blur-[60px]" />
        <div className="relative z-1 max-w-[380px]">
          <img src="/logo-full.png" alt="PgConnect" className="block h-12 w-auto" />
          <h2 className="mt-7 mb-3 font-heading text-[34px] font-medium tracking-[-0.8px] text-white">Your next stay, sorted.</h2>
          <p className="text-base leading-[1.6] text-[rgba(253,242,236,0.85)]">
            Discover verified paying-guest accommodations, compare amenities and book with
            confidence — all in one place.
          </p>
          <ul className="mt-8 flex list-none flex-col gap-3.5 p-0">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-2.5 text-[15px] text-[rgba(253,242,236,0.92)]">
                <CheckIcon className="h-[18px] w-[18px] shrink-0 rounded-full bg-[rgba(255,255,255,0.16)] p-[3px]" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </aside>
      <main className="flex flex-1 items-center justify-center px-6 py-8">
        <div className="w-full max-w-[380px] text-left">
          <img
            src="/logo.png"
            alt="PgConnect"
            className="mb-7 hidden h-8 w-auto text-text-h max-[900px]:inline-flex"
          />
          <h1 className="mb-1.5 text-left text-[30px] max-[1024px]:text-[26px]">{title}</h1>
          <p className="mb-8 text-[15px] text-text">{subtitle}</p>
          {children}
        </div>
      </main>
    </div>
  )
}
