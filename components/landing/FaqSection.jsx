import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function FaqSection({ isDark = false }) {
  const [openIndex, setOpenIndex] = useState(0)

  const faqs = [
    {
      q: 'Can Money OS touch or withdraw my money?',
      a: 'Never. Money OS connects to your accounts through certified read-only permissions. We have zero ability to execute transfers, bill payments, or withdrawals. Our system only reads numbers to organize them for you.',
    },
    {
      q: 'Is my personal financial data safe?',
      a: 'Yes. All data is encrypted using standard AES-256 protocols at rest and TLS in transit. Your login session is protected with secure, HttpOnly credentials. We do not sell your personal data or display third-party advertisements.',
    },
    {
      q: 'Which banks and accounts can I link?',
      a: 'Money OS supports all major Indian banks, credit cards, fixed deposits, and mutual fund providers. You can also manually add cash accounts or custom pockets anytime. /* TODO: Confirm full list of regional aggregator integrations */',
    },
    {
      q: 'Is Money OS free to use?',
      a: 'Yes. Core net worth tracking, smart pockets, and bill reminders are completely free. Advanced multi-member household budgets and predictive AI advice will be available in an optional premium plan. /* TODO: Finalize pricing tiers */',
    },
    {
      q: 'Can I delete my account and data?',
      a: 'Yes, instantly. At any point, you can go to Settings and delete your account with one click. When you do, all your linked balances, transactions, and profile data are permanently scrubbed from our database.',
    },
  ]

  return (
    <section
      id="faq"
      className={`relative z-10 w-full py-20 md:py-28 border-t scroll-mt-12 transition-colors duration-300 ${
        isDark
          ? 'bg-[#09090B] border-[rgba(243,240,232,0.08)] text-[#F3F0E8]'
          : 'bg-[#EBE9E5] border-[rgba(21,21,20,0.08)] text-[#151514]'
      }`}
    >
      <div className="max-w-3xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider mb-4 shadow-sm border ${
              isDark
                ? 'border-[rgba(243,240,232,0.12)] bg-[#131316] text-[#F3F0E8]'
                : 'border-[rgba(21,21,20,0.12)] bg-[#FFFFFF] text-[#151514]'
            }`}
          >
            <span>Questions & Answers</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx
            return (
              <div
                key={faq.q}
                className={`rounded-2xl border overflow-hidden transition-colors shadow-sm ${
                  isDark
                    ? 'bg-[#131316] border-[rgba(243,240,232,0.08)]'
                    : 'bg-[#FFFFFF] border-[rgba(21,21,20,0.08)]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  className={`w-full text-left p-6 flex items-center justify-between gap-4 text-base md:text-lg font-serif focus:outline-none ${
                    isDark ? 'focus-visible:ring-1 focus-visible:ring-[#F3F0E8]' : 'focus-visible:ring-1 focus-visible:ring-[#151514]'
                  }`}
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform duration-300 shrink-0 ${
                      isOpen ? 'rotate-180' : ''
                    } ${isDark ? 'text-[#F3F0E8]' : 'text-[#151514]'}`}
                  />
                </button>
                {isOpen && (
                  <div
                    className={`px-6 pb-6 pt-1 text-sm font-sans leading-relaxed border-t ${
                      isDark
                        ? 'text-[#8F8B82] border-[rgba(243,240,232,0.06)]'
                        : 'text-[#6A6862] border-[rgba(21,21,20,0.06)]'
                    }`}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
