// src/features/ai/components/AiInsightsHub.jsx
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  fetchAiInsights,
  fetchCashflowForecast,
  fetchBudgetRecommendations,
  dismissInsight,
  askCopilotMessage,
} from '../aiSlice'
import {
  Sparkles,
  Zap,
  TriangleAlert,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  ArrowRight,
  X,
  Target,
} from '../../../components/ui/Icons'
import CashflowTrajectoryChart from './CashflowTrajectoryChart'
import { formatINR } from '../../../lib/format'

export default function AiInsightsHub({ currencyCode = 'INR' }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const {
    insights,
    insightsStatus,
    forecast,
    forecastStatus,
    recommendations,
    recommendationsStatus,
    dismissedInsightIds,
    chatHistory,
    chatStatus,
  } = useSelector((state) => state.ai)

  const [activeTab, setActiveTab] = useState('insights') // 'insights' | 'trajectory' | 'recommendations' | 'copilot'
  const [chatInput, setChatInput] = useState('')

  useEffect(() => {
    dispatch(fetchAiInsights())
    dispatch(fetchCashflowForecast())
    dispatch(fetchBudgetRecommendations())
  }, [dispatch])

  const handleRefresh = () => {
    dispatch(fetchAiInsights())
    dispatch(fetchCashflowForecast())
    dispatch(fetchBudgetRecommendations())
  }

  const activeInsights = insights.filter(
    (item) => !dismissedInsightIds.includes(item.id)
  )

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          border: 'border-[#F07891]/40',
          bg: 'bg-[#F07891]/5',
          text: 'text-[#F07891]',
          badge: 'bg-[#F07891]/20 text-[#F07891]',
          icon: <TriangleAlert className="w-5 h-5 text-[#F07891]" />,
        }
      case 'WARNING':
        return {
          border: 'border-[#F59E0B]/40',
          bg: 'bg-[#F59E0B]/5',
          text: 'text-[#F59E0B]',
          badge: 'bg-[#F59E0B]/20 text-[#F59E0B]',
          icon: <TriangleAlert className="w-5 h-5 text-[#F59E0B]" />,
        }
      case 'POSITIVE':
        return {
          border: 'border-[#70D6A3]/40',
          bg: 'bg-[#70D6A3]/5',
          text: 'text-[#70D6A3]',
          badge: 'bg-[#70D6A3]/20 text-[#70D6A3]',
          icon: <ShieldCheck className="w-5 h-5 text-[#70D6A3]" />,
        }
      default:
        return {
          border: 'border-[#C3ABFA]/40',
          bg: 'bg-[#C3ABFA]/5',
          text: 'text-[#C3ABFA]',
          badge: 'bg-[#C3ABFA]/20 text-[#C3ABFA]',
          icon: <Sparkles className="w-5 h-5 text-[#C3ABFA]" />,
        }
    }
  }

  const isLoading =
    insightsStatus === 'loading' ||
    forecastStatus === 'loading' ||
    recommendationsStatus === 'loading'

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#121214]/90 backdrop-blur-xl p-6 shadow-2xl relative overflow-hidden mb-8">
      {/* Decorative ambient backdrop */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#C3ABFA]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#C3ABFA]/20 to-[#70D6A3]/20 border border-white/10 flex items-center justify-center shadow-inner">
            <Sparkles className="w-5 h-5 text-[#C3ABFA]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-white tracking-wide">
                AI Financial Intelligence Hub
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#C3ABFA]/15 text-[#C3ABFA] border border-[#C3ABFA]/30 uppercase font-semibold">
                Phase 4
              </span>
            </div>
            <p className="text-xs text-[#737373] mt-0.5">
              Autonomous burn rate analysis, spending anomaly alarms & 50/30/20 recommendations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab selectors */}
          <div className="flex items-center p-1 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs">
            <button
              onClick={() => setActiveTab('insights')}
              className={`px-3 py-1.5 rounded-lg transition-all font-medium ${
                activeTab === 'insights'
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-[#A3A3A3] hover:text-white'
              }`}
            >
              Signals ({activeInsights.length})
            </button>
            <button
              onClick={() => setActiveTab('trajectory')}
              className={`px-3 py-1.5 rounded-lg transition-all font-medium ${
                activeTab === 'trajectory'
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-[#A3A3A3] hover:text-white'
              }`}
            >
              Cashflow Trajectory
            </button>
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`px-3 py-1.5 rounded-lg transition-all font-medium ${
                activeTab === 'recommendations'
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-[#A3A3A3] hover:text-white'
              }`}
            >
              Smart Budgets ({recommendations.length})
            </button>
            <button
              onClick={() => setActiveTab('copilot')}
              className={`px-3 py-1.5 rounded-lg transition-all font-medium flex items-center gap-1.5 ${
                activeTab === 'copilot'
                  ? 'bg-[#C3ABFA]/20 text-[#D5C5FF] shadow-sm'
                  : 'text-[#A3A3A3] hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C3ABFA]" />
              <span>Ask Copilot</span>
            </button>
          </div>

          <button
            onClick={handleRefresh}
            title="Refresh Intelligence Signals"
            className="p-2 rounded-xl border border-white/[0.08] hover:bg-white/[0.05] text-[#A3A3A3] hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Tab Panels */}
      <div className="mt-6">
        {/* TAB 1: INSIGHTS & SIGNALS */}
        {activeTab === 'insights' && (
          <div>
            {activeInsights.length === 0 ? (
              <div className="p-8 text-center text-[#737373] border border-white/[0.05] rounded-xl bg-white/[0.01]">
                <ShieldCheck className="w-8 h-8 text-[#70D6A3] mx-auto mb-2 opacity-80" />
                <p className="text-sm font-medium text-[#FAFAFA]">
                  All Financial Signals Clear
                </p>
                <p className="text-xs text-[#737373] mt-1">
                  No spending anomalies or cash flow risks detected in your active accounts.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeInsights.map((item) => {
                  const style = getSeverityStyle(item.severity)
                  return (
                    <div
                      key={item.id}
                      className={`relative p-5 rounded-2xl border ${style.border} ${style.bg} transition-all hover:scale-[1.01]`}
                    >
                      <button
                        onClick={() => dispatch(dismissInsight(item.id))}
                        title="Dismiss signal"
                        className="absolute top-4 right-4 text-[#737373] hover:text-white transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      <div className="flex items-start gap-3.5">
                        <div className="mt-0.5">{style.icon}</div>
                        <div className="flex-1 pr-6">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-white">
                              {item.title}
                            </h4>
                            <span
                              className={`text-[9px] font-mono px-2 py-0.5 rounded uppercase font-bold ${style.badge}`}
                            >
                              {item.severity}
                            </span>
                          </div>

                          <p className="text-xs text-[#D4D4D8] mt-1.5 leading-relaxed">
                            {item.description}
                          </p>

                          {item.recommendation && (
                            <div className="mt-3 p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-xs text-[#A3A3A3]">
                              <span className="font-semibold text-white block mb-0.5">
                                Recommendation:
                              </span>
                              {item.recommendation}
                            </div>
                          )}

                          {item.actionLabel && (
                            <button
                              onClick={() => {
                                if (item.actionRoute) navigate(item.actionRoute)
                              }}
                              className="mt-3.5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#C3ABFA] hover:text-white transition-colors group"
                            >
                              <span>{item.actionLabel}</span>
                              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CASHFLOW TRAJECTORY */}
        {activeTab === 'trajectory' && (
          <div>
            <CashflowTrajectoryChart
              forecast={forecast}
              currencyCode={currencyCode}
            />
          </div>
        )}

        {/* TAB 3: SMART BUDGET RECOMMENDATIONS */}
        {activeTab === 'recommendations' && (
          <div>
            {recommendations.length === 0 ? (
              <div className="p-8 text-center text-[#737373] border border-white/[0.05] rounded-xl bg-white/[0.01]">
                <Target className="w-8 h-8 text-[#C3ABFA] mx-auto mb-2 opacity-80" />
                <p className="text-sm font-medium text-[#FAFAFA]">
                  No Optimization Targets
                </p>
                <p className="text-xs text-[#737373] mt-1">
                  Log more category expenditures this month to unlock tailored budget allocations.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendations.map((rec) => (
                  <div
                    key={rec.categoryId}
                    className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-white">
                          {rec.categoryName}
                        </span>
                        <span className="text-[10px] font-mono text-[#70D6A3] bg-[#70D6A3]/10 px-2 py-0.5 rounded-full border border-[#70D6A3]/30 font-bold">
                          Save ~{formatINR(rec.potentialMonthlySavings)}/mo
                        </span>
                      </div>

                      <div className="space-y-1.5 my-3 text-xs font-mono">
                        <div className="flex justify-between text-[#737373]">
                          <span>Current Run-Rate:</span>
                          <span className="text-white font-medium">
                            {formatINR(rec.currentSpend)}
                          </span>
                        </div>
                        <div className="flex justify-between text-[#737373]">
                          <span>Suggested Budget:</span>
                          <span className="text-[#C3ABFA] font-bold">
                            {formatINR(rec.recommendedBudget)}
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-[#A3A3A3] leading-relaxed">
                        {rec.reasoning}
                      </p>
                    </div>

                    <button
                      onClick={() => navigate('/dashboard')}
                      className="mt-4 w-full py-2 px-3 rounded-xl bg-white/[0.05] hover:bg-[#C3ABFA]/20 border border-white/[0.1] hover:border-[#C3ABFA]/40 text-xs font-medium text-white transition-all text-center flex items-center justify-center gap-1.5"
                    >
                      <span>Apply Target in Budget</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: FINANCIAL COPILOT */}
        {activeTab === 'copilot' && (
          <div className="space-y-4">
            {/* Quick Prompts */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono text-[#737373] uppercase">
                Try asking:
              </span>
              {[
                'Can I afford a ₹15,000 purchase?',
                'What bills are due this month?',
                'How is my emergency fund doing?',
                'Where can I save more money?',
              ].map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setChatInput(prompt)
                    dispatch(askCopilotMessage(prompt))
                  }}
                  className="px-2.5 py-1 rounded-full border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-xs text-[#D4D4D8] hover:text-white transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Chat Log */}
            <div className="min-h-[220px] max-h-[380px] overflow-y-auto space-y-3.5 p-4 rounded-2xl border border-white/[0.06] bg-white/[0.01]">
              {chatHistory.length === 0 ? (
                <div className="h-44 flex flex-col items-center justify-center text-center text-[#737373]">
                  <Sparkles className="w-7 h-7 text-[#C3ABFA] mb-2 opacity-60" />
                  <p className="text-sm font-medium text-[#FAFAFA]">
                    Ask MoneyOS Financial Copilot
                  </p>
                  <p className="text-xs text-[#737373] mt-1 max-w-sm">
                    Inquire about liquidity, affordability of planned purchases, upcoming obligations, or saving strategies.
                  </p>
                </div>
              ) : (
                chatHistory.map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    {/* User Question */}
                    <div className="flex justify-end">
                      <div className="px-3.5 py-2 rounded-2xl bg-[#C3ABFA]/20 border border-[#C3ABFA]/30 text-white text-xs max-w-md">
                        {item.question}
                      </div>
                    </div>
                    {/* Copilot Answer */}
                    <div className="flex justify-start">
                      <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-xs max-w-lg space-y-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#C3ABFA] font-semibold">
                          <Sparkles className="w-3 h-3" />
                          <span>MONEYOS COPILOT</span>
                        </div>
                        <p className="text-[#FAFAFA] leading-relaxed whitespace-pre-line">
                          {item.reply}
                        </p>
                        {item.suggestedFollowUps && item.suggestedFollowUps.length > 0 && (
                          <div className="pt-2 border-t border-white/[0.06] flex flex-wrap gap-1.5">
                            {item.suggestedFollowUps.map((fu, fIdx) => (
                              <button
                                key={fIdx}
                                type="button"
                                onClick={() => {
                                  setChatInput(fu)
                                  dispatch(askCopilotMessage(fu))
                                }}
                                className="text-[10px] text-[#A3A3A3] hover:text-[#C3ABFA] underline transition-colors"
                              >
                                &bull; {fu}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (!chatInput.trim()) return
                dispatch(askCopilotMessage(chatInput.trim()))
                setChatInput('')
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about affordability, upcoming bills, or savings…"
                className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.03] text-xs text-white placeholder-[#737373] focus:outline-none focus:border-[#C3ABFA]/50"
              />
              <button
                type="submit"
                disabled={chatStatus === 'loading' || !chatInput.trim()}
                className="px-4 py-2.5 rounded-xl bg-[#C3ABFA]/20 hover:bg-[#C3ABFA]/30 border border-[#C3ABFA]/40 text-xs font-semibold text-white transition-all disabled:opacity-40 flex items-center gap-1.5"
              >
                {chatStatus === 'loading' ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <span>Ask</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
