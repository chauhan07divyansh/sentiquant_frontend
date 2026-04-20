import type { Metadata } from 'next'
import { ContactForm } from '@/components/contact/ContactForm'
import { FAQAccordion } from '@/components/contact/FAQAccordion'

export const metadata: Metadata = {
  title: 'Contact — Sentiquant',
  description:
    "Have a question, spotted a bug, or want to collaborate? Send us a message and we'll respond within 24 hours.",
}

export default function ContactPage() {
  return (
    <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 overflow-hidden">

      {/* Base radial gradient + glow blobs — matches home/about/analysis */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at top, rgba(59,130,246,0.14), transparent 55%), radial-gradient(ellipse at bottom right, rgba(6,182,212,0.06), transparent 60%)',
        }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-blue opacity-[0.12] blur-[140px]" />
        <div className="absolute top-0 right-0 w-[300px] h-[200px] bg-brand-cyan opacity-[0.06] blur-[100px]" />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col gap-16">

        {/* ── Hero ── */}
        <div className="relative flex flex-col gap-5 max-w-2xl">
          <div className="absolute -top-20 -left-10 w-72 h-72 bg-gradient-to-br from-brand-blue/10 to-brand-cyan/10 blur-[80px] opacity-60 pointer-events-none" />

          {/* ANIMATION: hero-entry-N — staggered page-load entries */}
          <span className="hero-entry-1 text-xs font-semibold text-brand-cyan uppercase tracking-widest">
            Get in touch
          </span>

          <h1 className="hero-entry-2 font-display text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.05] text-surface-900 dark:text-white">
            Got a question?{' '}
            <span className="bg-gradient-to-r from-brand-blue to-brand-cyan bg-clip-text text-transparent">
              Let&apos;s talk.
            </span>
          </h1>

          <p className="hero-entry-3 text-base text-surface-600 dark:text-surface-400 leading-relaxed max-w-lg">
            Bug report, feedback, or curious how Sentiquant works — drop us a message.
            We typically respond within{' '}
            <span className="text-brand-cyan font-medium">24 hours</span>.
          </p>

          <div className="hero-entry-4 flex items-center gap-3 mt-2 text-xs text-surface-500">
            <span>Fast response</span>
            <span>•</span>
            <span>Built for Indian markets</span>
          </div>
        </div>

        {/* ── Main Grid ── */}
        {/* ANIMATION: hero-entry-5 — grid slides up after hero completes */}
        <div className="hero-entry-5 grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* Sidebar */}
          <div className="lg:col-span-2 flex flex-col gap-5">

            {/* Contact Info */}
            <div className="card p-5 rounded-xl flex flex-col gap-5 bg-white dark:bg-surface-900 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-[0_2px_10px_rgba(0,0,0,0.2)] transition-all duration-300">
              <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-widest">
                Other ways to reach us
              </h3>

              {[
                { label: 'Email', value: 'hello@sentiquant.com' },
                { label: 'Response time', value: 'Within 24 hours' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-brand-blue/10 border border-brand-blue/20 dark:border-brand-cyan/20 flex items-center justify-center text-brand-cyan text-sm">
                    @
                  </div>
                  <div>
                    <p className="text-[10px] text-surface-500 uppercase tracking-wider">
                      {item.label}
                    </p>
                    <p className="text-sm font-semibold text-surface-900 dark:text-white mt-0.5">
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Warning Card */}
            <div className="card p-5 rounded-xl flex flex-col gap-3 bg-amber-50 dark:bg-amber-400/5 border border-amber-200 dark:border-amber-400/20 shadow-sm dark:shadow-[0_2px_10px_rgba(0,0,0,0.2)]">
              <span className="text-sm font-semibold text-amber-600">
                Found a data issue?
              </span>
              <p className="text-xs text-amber-800 dark:text-amber-200/80 leading-relaxed">
                If you notice incorrect stock data or a broken analysis, please describe the
                stock symbol and the issue clearly. This helps us fix it fast.
              </p>
            </div>

          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <div className="card p-6 sm:p-8 rounded-2xl bg-white dark:bg-surface-900 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:shadow-md dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.35)] transition-all duration-300">
              <div className="flex flex-col gap-1.5 mb-7">
                <h2 className="font-display font-semibold text-lg text-surface-900 dark:text-white">
                  Send a message
                </h2>
                <p className="text-sm text-surface-500">
                  We read every message and reply within 24 hours.
                </p>
              </div>

              <ContactForm />
            </div>
          </div>

        </div>

        {/* ── FAQ ── */}
        {/* ANIMATION: hero-entry-6 — FAQ section enters last */}
        <div className="hero-entry-6 flex flex-col gap-10 pt-16 border-t border-gray-200 dark:border-white/10">
          <div className="flex items-center gap-4">
            <h2 className="font-display font-semibold text-2xl text-surface-900 dark:text-white">
              Frequently asked
            </h2>
            <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
          </div>

          <div className="max-w-3xl">
            <FAQAccordion />
          </div>
        </div>

      </div>
    </div>
  )
}
