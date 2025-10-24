'use client';

import { useRouter } from 'next/navigation';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function AboutPage() {
  const router = useRouter();

  // Example data for visualizations
  const metricWeightsData = [
    { category: 'DEX', activity: 40, efficiency: 30, revenue: 20, growth: 10 },
    { category: 'Lending', borrow: 40, vanilla: 25, utilization: 20, revenue: 15 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="flex items-center text-gray-600 hover:text-[#49997E] transition-colors"
              >
                <span className="mr-2">←</span>
                <span className="text-label font-medium">Dashboard</span>
              </button>
              <div className="h-4 w-px bg-gray-300"></div>
              <h1 className="text-h3 font-bold bg-gradient-to-r from-[#49997E] via-[#5eb896] to-[#49997E] bg-clip-text text-transparent">
                SPT Index
              </h1>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-display font-bold text-gray-900 mb-6">
            Stop Guessing.
            <span className="block mt-2 bg-gradient-to-r from-[#49997E] via-blue-600 to-purple-600 bg-clip-text text-transparent">
              Start Measuring What Matters.
            </span>
          </h1>
          <p className="text-body-lg text-gray-600 leading-relaxed mb-8">
            The SPT Index cuts through DeFi marketing hype to show you which protocols are <strong>actually generating value</strong> — 
            not just accumulating capital. Real-time scores based on activity, efficiency, and revenue.
          </p>
          <div className="flex flex-wrap gap-3 justify-center text-label">
            <div className="bg-white px-5 py-2 rounded-full border border-gray-200 shadow-sm">
              <span className="font-semibold text-gray-700">✅ 100% On-Chain Data</span>
            </div>
            <div className="bg-white px-5 py-2 rounded-full border border-gray-200 shadow-sm">
              <span className="font-semibold text-gray-700">⚡ Real-Time Updates</span>
            </div>
            <div className="bg-white px-5 py-2 rounded-full border border-gray-200 shadow-sm">
              <span className="font-semibold text-gray-700">🎯 Zero Marketing BS</span>
            </div>
          </div>
        </div>
      </section>

      {/* Why This Matters - Compact Version */}
      <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-h1 font-bold text-gray-900 mb-6 text-center">
              Why TVL is Broken (And What We Measure Instead)
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border-2 border-red-200">
                <h3 className="text-h3 font-bold text-red-900 mb-4">❌ TVL Misleads You</h3>
                <ul className="space-y-2 text-body-sm text-gray-800">
                  <li>• <strong>Idle Capital:</strong> High TVL ≠ High Activity</li>
                  <li>• <strong>Easy to Game:</strong> Incentives inflate numbers</li>
                  <li>• <strong>Hidden Leverage:</strong> Can't see the risk</li>
                  <li>• <strong>No Revenue Signal:</strong> Doesn't show profitability</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200">
                <h3 className="text-h3 font-bold text-green-900 mb-4">✅ SPT Shows Real Health</h3>
                <ul className="space-y-2 text-body-sm text-gray-800">
                  <li>• <strong>Actual Usage:</strong> Volume & borrow demand</li>
                  <li>• <strong>Capital Efficiency:</strong> Activity per $ locked</li>
                  <li>• <strong>Fee Revenue:</strong> Real value creation</li>
                  <li>• <strong>Blue-Chip Focus:</strong> USDC, ETH, wBTC demand</li>
                </ul>
              </div>
            </div>

            {/* Quick Example */}
            <div className="mt-6 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <p className="text-body text-blue-900">
                <strong>💡 Real Example:</strong> Protocol A has $10B TVL but only $2B daily volume (0.2x efficiency). 
                Protocol B has $3B TVL but $2.5B volume (0.83x efficiency). 
                <span className="text-green-700 font-semibold"> SPT ranks B higher</span> because every dollar works 4x harder.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Simplified */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-h1 font-bold text-gray-900 mb-8 text-center">
            What We Actually Measure
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* DEX Scoring */}
            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">🔄</div>
                <h3 className="text-h2 font-bold text-gray-900">DEX Protocols</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-body font-semibold text-gray-800">📊 Trading Volume</span>
                  <span className="text-h4 font-bold text-blue-600">40%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-body font-semibold text-gray-800">⚡ Capital Efficiency</span>
                  <span className="text-h4 font-bold text-purple-600">30%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-body font-semibold text-gray-800">💰 Fee Revenue</span>
                  <span className="text-h4 font-bold text-green-600">20%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-body font-semibold text-gray-800">📈 Fee Growth</span>
                  <span className="text-h4 font-bold text-amber-600">10%</span>
                </div>
              </div>
            </div>

            {/* Lending Scoring */}
            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">💰</div>
                <h3 className="text-h2 font-bold text-gray-900">Lending Protocols</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-body font-semibold text-gray-800">📊 Borrow Volume</span>
                  <span className="text-h4 font-bold text-blue-600">40%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-body font-semibold text-gray-800">🏦 Vanilla Assets</span>
                  <span className="text-h4 font-bold text-purple-600">25%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-body font-semibold text-gray-800">⚡ Utilization Rate</span>
                  <span className="text-h4 font-bold text-amber-600">20%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-body font-semibold text-gray-800">💰 Fee Revenue</span>
                  <span className="text-h4 font-bold text-green-600">15%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Statistical Note */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
            <h3 className="text-h3 font-bold text-gray-900 mb-3">How We Calculate Scores</h3>
            <p className="text-body text-gray-700 mb-3">
              We normalize all metrics using <strong>Z-score transformation</strong> (comparing each protocol to its peers over 90 days), 
              then map to a 0-1 scale with <strong>sigmoid smoothing</strong> to dampen outliers. 
              This ensures fair comparison regardless of protocol size.
            </p>
            <div className="flex flex-wrap gap-4 text-caption">
              <code className="bg-white px-3 py-2 rounded border border-gray-300">z = (x - μ) / σ</code>
              <code className="bg-white px-3 py-2 rounded border border-gray-300">S(z) = 1 / (1 + e⁻ᶻ)</code>
              <code className="bg-white px-3 py-2 rounded border border-gray-300">SPT = Σ(wᵢ × Sᵢ)</code>
            </div>
          </div>
        </div>
      </section>

      {/* What You Get - Benefits */}
      <section className="bg-gradient-to-br from-green-50 to-blue-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-h1 font-bold text-gray-900 mb-8 text-center">
              What You Get With SPT
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <div className="text-4xl mb-3">🎯</div>
                <h3 className="text-h3 font-bold text-gray-900 mb-3">Cut Through Hype</h3>
                <p className="text-body text-gray-600">
                  No more guessing which protocols are real. See actual usage, efficiency, and revenue in one glance.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <div className="text-4xl mb-3">⚡</div>
                <h3 className="text-h3 font-bold text-gray-900 mb-3">Spot Efficiency</h3>
                <p className="text-body text-gray-600">
                  Identify protocols that do more with less. High capital efficiency means better risk-adjusted returns.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <div className="text-4xl mb-3">🏆</div>
                <h3 className="text-h3 font-bold text-gray-900 mb-3">Make Better Calls</h3>
                <p className="text-body text-gray-600">
                  Allocate capital, choose integrations, or analyze risk based on fundamentals—not marketing budgets.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-h1 font-bold text-gray-900 mb-6 text-center">
            100% Transparent & Verifiable
          </h2>

          <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-h3 font-bold text-gray-900 mb-4">📡 Data Sources</h3>
                <ul className="space-y-2 text-body text-gray-700">
                  <li>✓ <strong>DefiLlama API:</strong> Industry-standard aggregator</li>
                  <li>✓ <strong>On-Chain Only:</strong> Every metric traceable to blockchain</li>
                  <li>✓ <strong>5min Refresh:</strong> Real-time, always fresh</li>
                </ul>
              </div>

              <div>
                <h3 className="text-h3 font-bold text-gray-900 mb-4">🔒 Methodology</h3>
                <ul className="space-y-2 text-body text-gray-700">
                  <li>✓ <strong>Open Formula:</strong> All calculations public</li>
                  <li>✓ <strong>No Manipulation:</strong> Pure data, zero editorializing</li>
                  <li>✓ <strong>Cohort-Based:</strong> Fair apples-to-apples comparison</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-[#49997E] to-blue-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-h1 font-bold text-white mb-4">
            Ready to See Real Protocol Performance?
          </h2>
          <p className="text-body-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Stop relying on TVL and marketing. Start using data that actually matters.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-white text-[#49997E] px-8 py-4 rounded-xl text-h4 font-bold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            View Live Dashboard →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-caption">
            SPT Index • Powered by <a href="https://defillama.com" target="_blank" rel="noopener noreferrer" className="text-[#49997E] hover:underline">DefiLlama</a>
          </p>
          <p className="text-micro mt-2">
            All metrics derived from verifiable on-chain data
          </p>
        </div>
      </footer>
    </div>
  );
}
