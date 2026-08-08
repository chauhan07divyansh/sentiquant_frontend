import { cn } from '@/lib/utils/cn'

interface AIDisclosureNoteProps {
  variant?: 'full' | 'compact' | 'inline'
  className?: string
}

const FULL_CONTENT = (
  <>
    <span className="font-semibold text-amber-400">Important:</span> All outputs are AI-generated technical
    observations based on publicly available price and news data. This is{' '}
    <span className="font-semibold text-amber-300">not a research report</span> under SEBI Research Analyst
    Regulations 2014, and does{' '}
    <span className="font-semibold text-amber-300">not constitute investment advice</span> under SEBI
    Investment Adviser Regulations 2013. SentiQuant is not a SEBI-registered entity. Technical readings
    describe market conditions, not recommendations to buy, sell or hold any security. Please conduct your
    own research and consult a SEBI-registered advisor before making any investment decisions.
  </>
)

const COMPACT_CONTENT = (
  <>
    All outputs are AI-generated technical observations. Not a research report under SEBI RA Regulations
    2014. Not investment advice. Always do your own research.
  </>
)

const INLINE_CONTENT = <>Not investment advice. Always do your own research.</>

export function AIDisclosureNote({ variant = 'full', className = '' }: AIDisclosureNoteProps) {
  if (variant === 'inline') {
    return (
      <p className={cn('text-[11px] text-[#5e616e] leading-snug', className)}>
        {INLINE_CONTENT}
      </p>
    )
  }

  if (variant === 'compact') {
    return (
      <p className={cn('text-xs text-[#5e616e] leading-relaxed text-center', className)}>
        {COMPACT_CONTENT}
      </p>
    )
  }

  // 'full' variant — amber callout box
  return (
    <div className={cn('rounded-xl border border-amber-500/20 bg-amber-500/5 p-4', className)}>
      <p className="text-xs text-surface-400 leading-relaxed">{FULL_CONTENT}</p>
    </div>
  )
}
