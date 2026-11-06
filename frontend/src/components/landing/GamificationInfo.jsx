import React from 'react'
import { Coins, Trophy, Flame, Target, Star, ArrowRight } from 'lucide-react'

const EARN_WAYS = [
  {
    icon: Coins,
    title: 'Record Transactions',
    desc: 'Earn 5 coins every time you log an income, expense, or transfer.',
    accent: '#FFD700',
  },
  {
    icon: Flame,
    title: 'Build Streaks',
    desc: 'Stay consistent — log activity daily to build streaks and unlock bonus rewards.',
    accent: '#FF6B35',
  },
  {
    icon: Trophy,
    title: 'Unlock Achievements',
    desc: 'Hit milestones like "First Step", "Budget Master", or "Goal Crusher" for coin bonuses.',
    accent: '#C3ABFA',
  },
  {
    icon: Target,
    title: 'Contribute to Goals',
    desc: 'Save towards financial goals and earn achievements as you progress.',
    accent: '#5EDAA4',
  },
]

export default function GamificationInfo({ isDark = false }) {
  return (
    <section
      id="gamification"
      className={`relative z-10 w-full py-20 md:py-28 scroll-mt-12 transition-colors duration-300 ${
        isDark ? 'bg-[#09090B] text-[#F3F0E8]' : 'bg-[#EBE9E5] text-[#151514]'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="max-w-2xl mb-16">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider mb-4 shadow-sm border ${
              isDark
                ? 'border-[rgba(243,240,232,0.12)] bg-[#131316] text-[#F3F0E8]'
                : 'border-[rgba(21,21,20,0.12)] bg-[#FFFFFF] text-[#151514]'
            }`}
          >
            <Star className="w-3 h-3" />
            <span>Gamification</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal tracking-tight leading-[1.15] mb-4">
            Your money habits,{' '}
            <span className="italic">rewarded.</span>
          </h2>
          <p
            className={`text-base leading-relaxed ${
              isDark ? 'text-[#8F8B82]' : 'text-[#6A6862]'
            }`}
          >
            Money OS turns smart financial habits into a rewarding journey. Earn
            coins, build streaks, and unlock achievements as you take control of
            your finances.
          </p>
        </div>

        {/* How to Earn Coins — Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 mb-12">
          {EARN_WAYS.map((item, idx) => {
            const Icon = item.icon
            return (
              <div
                key={idx}
                className={`rounded-2xl border p-6 md:p-7 flex gap-5 items-start transition-all ${
                  isDark
                    ? 'bg-[#131316] border-[rgba(243,240,232,0.08)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]'
                    : 'bg-[#FFFFFF] border-[rgba(21,21,20,0.08)] hover:shadow-md'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl border flex-shrink-0 flex items-center justify-center ${
                    isDark
                      ? 'bg-[#1B1B20] border-[rgba(243,240,232,0.08)]'
                      : 'bg-[#F6F5F2] border-[rgba(21,21,20,0.08)]'
                  }`}
                >
                  <Icon
                    className="w-5 h-5"
                    style={{ color: item.accent }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold mb-1 leading-snug">
                    {item.title}
                  </h3>
                  <p
                    className={`text-sm leading-relaxed ${
                      isDark ? 'text-[#8F8B82]' : 'text-[#6A6862]'
                    }`}
                  >
                    {item.desc}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom summary callout */}
        <div
          className={`rounded-2xl border p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-5 ${
            isDark
              ? 'bg-[#131316] border-[rgba(243,240,232,0.08)]'
              : 'bg-[#FFFFFF] border-[rgba(21,21,20,0.08)]'
          }`}
        >
          <div className="flex items-center gap-3 flex-shrink-0">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                isDark ? 'bg-[#FFD700]/10' : 'bg-[#FFD700]/15'
              }`}
            >
              <Coins className="w-6 h-6 text-[#FFD700]" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-base font-semibold mb-1">
              How it works
            </h4>
            <p
              className={`text-sm leading-relaxed ${
                isDark ? 'text-[#8F8B82]' : 'text-[#6A6862]'
              }`}
            >
              Sign up and start recording your transactions. Every action earns
              you coins automatically — no extra steps. Track your progress,
              streaks, and achievement badges from your personal{' '}
              <strong className={isDark ? 'text-[#F3F0E8]' : 'text-[#151514]'}>
                Overview dashboard
              </strong>
              . The more consistent you are, the more you earn.
            </p>
          </div>
          <a
            href="/signup"
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-colors flex-shrink-0 ${
              isDark
                ? 'bg-[#F3F0E8] text-[#09090B] hover:bg-[#F3F0E8]/90'
                : 'bg-[#151514] text-[#F3F0E8] hover:bg-[#151514]/90'
            }`}
          >
            Get started
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  )
}
