import React, { useState } from "react";
import { ShieldCheck, Eye, EyeOff, KeyRound, Trash2 } from "lucide-react";

export default function SecuritySection({ isDark = false }) {
  const [privacyMode, setPrivacyMode] = useState(false);

  const securityPillars = [
    {
      title: "Read-Only Connections",
      desc: "We can only view your balances and transactions. We cannot initiate transfers or move a single rupee.",
      icon: ShieldCheck,
    },
    {
      title: "Bank-Grade Encryption",
      desc: "All communications are protected by standard AES-256 and TLS encryption, keeping your data confidential.",
      icon: KeyRound,
    },
    {
      title: "One-Tap Privacy Mode",
      desc: "Quickly blur sensitive numbers with a single tap whenever you are using your phone in public or at the office.",
      icon: EyeOff,
    },
    {
      title: "100% You Own Your Data",
      desc: "Your data is never sold to advertisers. You can export everything or permanently wipe your account anytime.",
      icon: Trash2,
    },
  ];

  return (
    <section
      id="security"
      className={`relative z-10 w-full py-20 md:py-28 border-t scroll-mt-12 transition-colors duration-300 ${
        isDark
          ? "bg-[#09090B] border-[rgba(243,240,232,0.08)] text-[#F3F0E8]"
          : "bg-[#EBE9E5] border-[rgba(21,21,20,0.08)] text-[#151514]"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-xl">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider mb-4 shadow-sm border ${
                isDark
                  ? "border-[rgba(243,240,232,0.12)] bg-[#131316] text-[#F3F0E8]"
                  : "border-[rgba(21,21,20,0.12)] bg-[#FFFFFF] text-[#151514]"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Privacy & Trust</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal tracking-tight leading-[1.15] mb-4">
              Your money is yours. <br />
              <span className="italic">Your data stays private.</span>
            </h2>
          </div>
          <p
            className={`text-base max-w-md font-sans leading-relaxed ${isDark ? "text-[#8F8B82]" : "text-[#6A6862]"}`}
          >
            We built FinTech on the belief that a financial tool should work for
            you, not profit off your personal information.
          </p>
        </div>

        {/* Interactive Privacy Demonstration */}
        <div
          className={`rounded-2xl border p-6 md:p-8 mb-10 shadow-sm transition-all ${
            isDark
              ? "bg-[#131316] border-[rgba(243,240,232,0.08)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
              : "bg-[#FFFFFF] border-[rgba(21,21,20,0.08)]"
          }`}
        >
          <div
            className={`flex flex-wrap items-center justify-between gap-4 pb-6 border-b ${
              isDark
                ? "border-[rgba(243,240,232,0.08)]"
                : "border-[rgba(21,21,20,0.08)]"
            }`}
          >
            <div>
              <span
                className={`text-xs font-mono uppercase tracking-wider block mb-1 ${isDark ? "text-[#8F8B82]" : "text-[#6A6862]"}`}
              >
                Interactive Preview
              </span>
              <h3 className="text-lg font-serif">Public Privacy Mode</h3>
            </div>
            <button
              onClick={() => setPrivacyMode(!privacyMode)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-mono transition-all ${
                isDark
                  ? "border-[rgba(243,240,232,0.16)] bg-[#1B1B20] text-[#F3F0E8] hover:bg-[#F3F0E8] hover:text-[#09090B]"
                  : "border-[rgba(21,21,20,0.14)] bg-[#F6F5F2] text-[#151514] hover:bg-[#151514] hover:text-[#FFFFFF]"
              }`}
            >
              {privacyMode ? (
                <Eye className="w-3.5 h-3.5" />
              ) : (
                <EyeOff className="w-3.5 h-3.5" />
              )}
              <span>{privacyMode ? "Reveal Balances" : "Blur Balances"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
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
              <span
                className={`text-2xl font-serif transition-all duration-300 ${
                  privacyMode ? "filter blur-md select-none" : ""
                }`}
              >
                ₹12,48,310
              </span>
            </div>
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
                Emergency Vault
              </span>
              <span
                className={`text-2xl font-serif transition-all duration-300 ${
                  privacyMode ? "filter blur-md select-none" : ""
                }`}
              >
                ₹6,00,000
              </span>
            </div>
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
                Safe to Spend
              </span>
              <span
                className={`text-2xl font-serif transition-all duration-300 ${
                  isDark ? "text-[#5EDAA4]" : "text-[#2D7A58]"
                } ${privacyMode ? "filter blur-md select-none" : ""}`}
              >
                ₹24,500
              </span>
            </div>
          </div>
        </div>

        {/* 4 Security Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {securityPillars.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className={`p-6 rounded-2xl border shadow-sm transition-all ${
                  isDark
                    ? "bg-[#131316] border-[rgba(243,240,232,0.08)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                    : "bg-[#FFFFFF] border-[rgba(21,21,20,0.08)]"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${
                    isDark
                      ? "bg-[#1B1B20] border-[rgba(243,240,232,0.08)] text-[#F3F0E8]"
                      : "bg-[#F6F5F2] border-[rgba(21,21,20,0.08)] text-[#151514]"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-base font-serif mb-2">{p.title}</h4>
                <p
                  className={`text-xs leading-relaxed font-sans ${isDark ? "text-[#8F8B82]" : "text-[#6A6862]"}`}
                >
                  {p.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
