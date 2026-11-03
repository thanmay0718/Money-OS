import React from 'react'
import { Link2, LayoutDashboard, Compass } from 'lucide-react'

export default function HowItWorks({ isDark = false }) {
  const steps = [
    {
      num: '01',
      title: 'Connect your accounts',
      tagline: 'Simple 60-second setup',
      desc: 'Link your primary bank and investment accounts securely. We use official read-only tokens so we can never touch or move your money.',
      icon: Link2,
    },
    {
      num: '02',
      title: 'Automatic organization',
      tagline: 'Smart pockets for every rupee',
      desc: 'Money OS automatically divides your money into clear buckets: Fixed Bills, Long-Term Savings, and Safe-to-Spend cash.',
      icon: LayoutDashboard,
    },
    {
      num: '03',
      title: 'Complete daily peace',
      tagline: 'Check once a week and move on',
      desc: 'Open the app, see your safe-to-spend allowance, and make confident financial decisions without obsessing over spreadsheets.',
      icon: Compass,
    },
  ]

  return (
    <section
      id="how-it-works"
      className={`relative z-10 w-full py-20 md:py-28 border-t scroll-mt-12 transition-colors duration-300 ${
        isDark
          ? 'bg-[#09090B] border-[rgba(243,240,232,0.08)] text-[#F3F0E8]'
          : 'bg-[#EBE9E5] border-[rgba(21,21,20,0.08)] text-[#151514]'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        <div className="max-w-2xl mb-16">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider mb-4 shadow-sm border ${
              isDark
                ? 'border-[rgba(243,240,232,0.12)] bg-[#131316] text-[#F3F0E8]'
                : 'border-[rgba(21,21,20,0.12)] bg-[#FFFFFF] text-[#151514]'
            }`}
          >
            <span>How It Works</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal tracking-tight leading-[1.15] mb-4">
            Three simple steps to <br />
            <span className="italic">financial calm.</span>
          </h2>
          <p className={`text-base leading-relaxed ${isDark ? 'text-[#8F8B82]' : 'text-[#6A6862]'}`}>
            No complicated accounting degrees required. Here is how Money OS works for you from day one.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((s) => {
            const Icon = s.icon
            return (
              <div
                key={s.num}
                className={`rounded-2xl border p-8 flex flex-col justify-between shadow-sm transition-all group ${
                  isDark
                    ? 'bg-[#131316] border-[rgba(243,240,232,0.08)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]'
                    : 'bg-[#FFFFFF] border-[rgba(21,21,20,0.08)] hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-3xl font-serif font-normal">
                      {s.num}
                    </span>
                    <div
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
                        isDark
                          ? 'bg-[#1B1B20] border-[rgba(243,240,232,0.08)] text-[#F3F0E8]'
                          : 'bg-[#F6F5F2] border-[rgba(21,21,20,0.08)] text-[#151514]'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <span className={`text-xs font-mono uppercase tracking-wider block mb-1.5 ${isDark ? 'text-[#8F8B82]' : 'text-[#6A6862]'}`}>
                    {s.tagline}
                  </span>
                  <h3 className="text-xl font-serif mb-3">
                    {s.title}
                  </h3>
                  <p className={`text-sm leading-relaxed font-sans ${isDark ? 'text-[#8F8B82]' : 'text-[#6A6862]'}`}>
                    {s.desc}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
