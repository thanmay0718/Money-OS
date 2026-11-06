import React from "react";
import { Wallet, Bell, TrendingUp, CheckCircle2 } from "lucide-react";
import { formatINR } from "../../lib/format";

export default function FeaturesBento({ isDark = false }) {
  return (
    <section
      id="features"
      className={`relative z-10 w-full py-20 md:py-28 scroll-mt-12 transition-colors duration-300 ${
        isDark ? "bg-[#09090B] text-[#F3F0E8]" : "bg-[#EBE9E5] text-[#151514]"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        {/* Calm Editorial Header */}
        <div className="max-w-2xl mb-16">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider mb-4 shadow-sm border ${
              isDark
                ? "border-[rgba(243,240,232,0.12)] bg-[#131316] text-[#F3F0E8]"
                : "border-[rgba(21,21,20,0.12)] bg-[#FFFFFF] text-[#151514]"
            }`}
          >
            <span>Core Pillars</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal tracking-tight leading-[1.15] mb-4">
            Everything made simple. <br />
            <span className="italic">No financial jargon.</span>
          </h2>
          <p
            className={`text-base leading-relaxed ${isDark ? "text-[#8F8B82]" : "text-[#6A6862]"}`}
          >
            Most finance apps overwhelm you with dozens of complicated graphs.
            FinTech focuses on the three things that actually give you peace of
            mind.
          </p>
        </div>

        {/* 3 Clear, Understandable Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Card 1: One Calm Number (Net Worth) */}
          <div
            className={`rounded-2xl border p-7 md:p-8 flex flex-col justify-between shadow-sm transition-all ${
              isDark
                ? "bg-[#131316] border-[rgba(243,240,232,0.08)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                : "bg-[#FFFFFF] border-[rgba(21,21,20,0.08)] hover:shadow-md"
            }`}
          >
            <div>
              <div
                className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-6 ${
                  isDark
                    ? "bg-[#1B1B20] border-[rgba(243,240,232,0.08)]"
                    : "bg-[#F6F5F2] border-[rgba(21,21,20,0.08)]"
                }`}
              >
                <TrendingUp
                  className={`w-5 h-5 ${isDark ? "text-[#5EDAA4]" : "text-[#2D7A58]"}`}
                />
              </div>
              <span
                className={`text-xs font-mono uppercase tracking-wider block mb-2 ${isDark ? "text-[#8F8B82]" : "text-[#6A6862]"}`}
              >
                01 // Total Net Worth
              </span>
              <h3 className="text-2xl font-serif mb-3 leading-snug">
                One number for everything you own.
              </h3>
              <p
                className={`text-sm leading-relaxed mb-6 ${isDark ? "text-[#8F8B82]" : "text-[#6A6862]"}`}
              >
                No more opening 5 different banking and investment apps. See
                your total wealth updated in real time.
              </p>

              {/* Clear visual sample */}
              <div
                className={`p-4 rounded-xl border ${
                  isDark
                    ? "bg-[#09090B] border-[rgba(243,240,232,0.06)]"
                    : "bg-[#F6F5F2] border-[rgba(21,21,20,0.06)]"
                }`}
              >
                <span
                  className={`text-xs font-mono block mb-1 ${isDark ? "text-[#8F8B82]" : "text-[#6A6862]"}`}
                >
                  Total Net Worth
                </span>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-2xl sm:text-3xl font-serif tabular-nums font-normal">
                    {formatINR(1248310)}
                  </span>
                  <span
                    className={`text-xs font-mono font-medium ${isDark ? "text-[#5EDAA4]" : "text-[#2D7A58]"}`}
                  >
                    +18.4% this year
                  </span>
                </div>
                <div
                  className={`space-y-1.5 text-xs font-mono pt-2 border-t ${
                    isDark
                      ? "border-[rgba(243,240,232,0.08)] text-[#8F8B82]"
                      : "border-[rgba(21,21,20,0.08)] text-[#6A6862]"
                  }`}
                >
                  <div className="flex justify-between">
                    <span>Bank Accounts</span>
                    <span
                      className={
                        isDark
                          ? "text-[#F3F0E8] font-medium"
                          : "text-[#151514] font-medium"
                      }
                    >
                      {formatINR(580000)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Investments</span>
                    <span
                      className={
                        isDark
                          ? "text-[#F3F0E8] font-medium"
                          : "text-[#151514] font-medium"
                      }
                    >
                      {formatINR(668310)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Smart Pockets (Safe to Spend) */}
          <div
            className={`rounded-2xl border p-7 md:p-8 flex flex-col justify-between shadow-sm transition-all ${
              isDark
                ? "bg-[#131316] border-[rgba(243,240,232,0.08)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                : "bg-[#FFFFFF] border-[rgba(21,21,20,0.08)] hover:shadow-md"
            }`}
          >
            <div>
              <div
                className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-6 ${
                  isDark
                    ? "bg-[#1B1B20] border-[rgba(243,240,232,0.08)] text-[#F3F0E8]"
                    : "bg-[#F6F5F2] border-[rgba(21,21,20,0.08)] text-[#151514]"
                }`}
              >
                <Wallet className="w-5 h-5" />
              </div>
              <span
                className={`text-xs font-mono uppercase tracking-wider block mb-2 ${isDark ? "text-[#8F8B82]" : "text-[#6A6862]"}`}
              >
                02 // Smart Pockets
              </span>
              <h3 className="text-2xl font-serif mb-3 leading-snug">
                Know what's safe to spend today.
              </h3>
              <p
                className={`text-sm leading-relaxed mb-6 ${isDark ? "text-[#8F8B82]" : "text-[#6A6862]"}`}
              >
                Money OS reserves your bills and rent first, so you can spend
                your leftover cash with absolute zero guilt.
              </p>

              {/* Clear visual sample */}
              <div className="space-y-2">
                <div
                  className={`p-3 rounded-xl border flex items-center justify-between ${
                    isDark
                      ? "bg-[#09090B] border-[rgba(243,240,232,0.06)]"
                      : "bg-[#F6F5F2] border-[rgba(21,21,20,0.06)]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-2 h-2 rounded-full ${isDark ? "bg-[#5EDAA4]" : "bg-[#2D7A58]"}`}
                    />
                    <span className="text-xs font-medium">
                      Safe to Spend (Fun)
                    </span>
                  </div>
                  <span
                    className={`text-xs font-mono font-bold ${isDark ? "text-[#5EDAA4]" : "text-[#2D7A58]"}`}
                  >
                    {formatINR(24500)}
                  </span>
                </div>
                <div
                  className={`p-3 rounded-xl border flex items-center justify-between ${
                    isDark
                      ? "bg-[#09090B] border-[rgba(243,240,232,0.06)]"
                      : "bg-[#F6F5F2] border-[rgba(21,21,20,0.06)]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#8F8B82]" />
                    <span className="text-xs font-medium">
                      Bills & Rent (Locked)
                    </span>
                  </div>
                  <span
                    className={`text-xs font-mono ${isDark ? "text-[#8F8B82]" : "text-[#6A6862]"}`}
                  >
                    {formatINR(45000)}
                  </span>
                </div>
                <div
                  className={`p-3 rounded-xl border flex items-center justify-between ${
                    isDark
                      ? "bg-[#09090B] border-[rgba(243,240,232,0.06)]"
                      : "bg-[#F6F5F2] border-[rgba(21,21,20,0.06)]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-2 h-2 rounded-full ${isDark ? "bg-[#F3F0E8]" : "bg-[#151514]"}`}
                    />
                    <span className="text-xs font-medium">Emergency Vault</span>
                  </div>
                  <span className="text-xs font-mono font-medium">
                    {formatINR(600000)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: No Surprise Bills */}
          <div
            className={`rounded-2xl border p-7 md:p-8 flex flex-col justify-between shadow-sm transition-all ${
              isDark
                ? "bg-[#131316] border-[rgba(243,240,232,0.08)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                : "bg-[#FFFFFF] border-[rgba(21,21,20,0.08)] hover:shadow-md"
            }`}
          >
            <div>
              <div
                className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-6 ${
                  isDark
                    ? "bg-[#1B1B20] border-[rgba(243,240,232,0.08)] text-[#F3F0E8]"
                    : "bg-[#F6F5F2] border-[rgba(21,21,20,0.08)] text-[#151514]"
                }`}
              >
                <Bell className="w-5 h-5" />
              </div>
              <span
                className={`text-xs font-mono uppercase tracking-wider block mb-2 ${isDark ? "text-[#8F8B82]" : "text-[#6A6862]"}`}
              >
                03 // Bill Protection
              </span>
              <h3 className="text-2xl font-serif mb-3 leading-snug">
                Zero surprise subscriptions.
              </h3>
              <p
                className={`text-sm leading-relaxed mb-6 ${isDark ? "text-[#8F8B82]" : "text-[#6A6862]"}`}
              >
                Get notified before automated renewals hit your card. Cancel
                unused apps before they quietly drain your savings.
              </p>

              {/* Clear visual sample */}
              <div className="space-y-2">
                <div
                  className={`p-3 rounded-xl border flex items-center justify-between ${
                    isDark
                      ? "bg-[#09090B] border-[rgba(243,240,232,0.06)]"
                      : "bg-[#F6F5F2] border-[rgba(21,21,20,0.06)]"
                  }`}
                >
                  <div>
                    <span className="block text-xs font-medium">
                      Electricity Utility
                    </span>
                    <span
                      className={`text-[11px] font-mono ${isDark ? "text-[#F0B45A]" : "text-[#C87D2F]"}`}
                    >
                      Due in 3 days
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold">
                    {formatINR(2450)}
                  </span>
                </div>
                <div
                  className={`p-3 rounded-xl border flex items-center justify-between ${
                    isDark
                      ? "bg-[#09090B] border-[rgba(243,240,232,0.06)]"
                      : "bg-[#F6F5F2] border-[rgba(21,21,20,0.06)]"
                  }`}
                >
                  <div>
                    <span className="block text-xs font-medium">
                      Cloud Subscription
                    </span>
                    <span
                      className={`text-[11px] font-mono ${isDark ? "text-[#8F8B82]" : "text-[#6A6862]"}`}
                    >
                      Due on 12th
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold">
                    {formatINR(1250)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Calm Quote Callout */}
        <div
          className={`mt-12 p-8 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm ${
            isDark
              ? "bg-[#131316] border-[rgba(243,240,232,0.08)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
              : "bg-[#FFFFFF] border-[rgba(21,21,20,0.08)]"
          }`}
        >
          <div>
            <span
              className={`text-xs font-mono uppercase tracking-wider block mb-2 ${isDark ? "text-[#8F8B82]" : "text-[#6A6862]"}`}
            >
              ✦ The Money OS Promise
            </span>
            <blockquote className="text-lg sm:text-xl font-serif italic max-w-2xl leading-relaxed">
              “When your money is neatly organized into pockets, financial
              anxiety simply disappears.”
            </blockquote>
          </div>
          <div
            className={`flex items-center gap-2 text-xs font-mono px-3.5 py-2 rounded-full border shrink-0 ${
              isDark
                ? "text-[#5EDAA4] bg-[#5EDAA4]/10 border-[#5EDAA4]/20"
                : "text-[#2D7A58] bg-[#2D7A58]/10 border-[#2D7A58]/20"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>100% Verified Ledgers</span>
          </div>
        </div>
      </div>
    </section>
  );
}
