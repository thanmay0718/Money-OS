import React from "react";
import MoneyOSLogo from "../ui/MoneyOSLogo";

export default function LandingFooter({ isDark = false }) {
  return (
    <footer
      className={`relative z-10 w-full border-t py-16 transition-colors duration-300 ${
        isDark
          ? "bg-[#09090B] border-[rgba(243,240,232,0.08)] text-[#F3F0E8]"
          : "bg-[#EBE9E5] border-[rgba(21,21,20,0.08)] text-[#151514]"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-2">
              <MoneyOSLogo size={28} />
              <span className="font-serif text-2xl font-normal tracking-tight block">
                FinTech
              </span>
            </div>
            <p
              className={`text-xs max-w-sm leading-relaxed ${isDark ? "text-[#8F8B82]" : "text-[#6A6862]"}`}
            >
              The calm, clear operating system for your money. Unified net
              worth, smart pocket allocations, and predictable cash flow.
            </p>
          </div>

          <div>
            <span className="text-xs font-mono uppercase tracking-wider block mb-4">
              Product
            </span>
            <ul
              className={`space-y-2.5 text-xs ${isDark ? "text-[#8F8B82]" : "text-[#6A6862]"}`}
            >
              <li>
                <a
                  href="#features"
                  className={
                    isDark ? "hover:text-[#F3F0E8]" : "hover:text-[#151514]"
                  }
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className={
                    isDark ? "hover:text-[#F3F0E8]" : "hover:text-[#151514]"
                  }
                >
                  How it works
                </a>
              </li>
              <li>
                <a
                  href="#security"
                  className={
                    isDark ? "hover:text-[#F3F0E8]" : "hover:text-[#151514]"
                  }
                >
                  Security
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  className={
                    isDark ? "hover:text-[#F3F0E8]" : "hover:text-[#151514]"
                  }
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <span className="text-xs font-mono uppercase tracking-wider block mb-4">
              Company
            </span>
            <ul
              className={`space-y-2.5 text-xs ${isDark ? "text-[#8F8B82]" : "text-[#6A6862]"}`}
            >
              <li>
                <a
                  href="#"
                  className={
                    isDark ? "hover:text-[#F3F0E8]" : "hover:text-[#151514]"
                  }
                >
                  Manifesto
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={
                    isDark ? "hover:text-[#F3F0E8]" : "hover:text-[#151514]"
                  }
                >
                  Privacy First
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={
                    isDark ? "hover:text-[#F3F0E8]" : "hover:text-[#151514]"
                  }
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <span className="text-xs font-mono uppercase tracking-wider block mb-4">
              Legal
            </span>
            <ul
              className={`space-y-2.5 text-xs ${isDark ? "text-[#8F8B82]" : "text-[#6A6862]"}`}
            >
              <li>
                <a
                  href="#"
                  className={
                    isDark ? "hover:text-[#F3F0E8]" : "hover:text-[#151514]"
                  }
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={
                    isDark ? "hover:text-[#F3F0E8]" : "hover:text-[#151514]"
                  }
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div
          className={`pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono ${
            isDark
              ? "border-[rgba(243,240,232,0.08)] text-[#8F8B82]"
              : "border-[rgba(21,21,20,0.08)] text-[#6A6862]"
          }`}
        >
          <span>
            © {new Date().getFullYear()} FinTech. All rights reserved.
          </span>
          <span>Engineered for everyday clarity.</span>
        </div>
      </div>
    </footer>
  );
}
