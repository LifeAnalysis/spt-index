'use client';

import { useRouter } from 'next/navigation';

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      {/* Sticky Header */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="flex items-center text-gray-600 hover:text-[#49997E] transition-colors group"
              >
                <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span>
                <span className="text-sm font-medium">Dashboard</span>
              </button>
              <div className="h-4 w-px bg-gray-300"></div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-[#49997E] via-[#5eb896] to-[#49997E] bg-clip-text text-transparent">
                SPT Index
              </h1>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            A Novel Scoring System for
            <span className="block mt-2 bg-gradient-to-r from-[#49997E] via-blue-600 to-purple-600 bg-clip-text text-transparent">
              DeFi Protocol Performance
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed mb-10">
            The SPT Index is the <strong>first multi-dimensional scoring system</strong> that measures what protocols actually do: 
            trading activity, capital efficiency, borrow demand, and revenue generation. 
            <span className="font-semibold text-gray-900"> Think credit ratings for DeFi, </span>
            powered by real-time on-chain data and statistical normalization.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <div className="bg-white px-5 py-2.5 rounded-full border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <span className="font-semibold text-gray-700">📊 Multi-Metric</span>
            </div>
            <div className="bg-white px-5 py-2.5 rounded-full border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <span className="font-semibold text-gray-700">⚡ Statistical</span>
            </div>
            <div className="bg-white px-5 py-2.5 rounded-full border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <span className="font-semibold text-gray-700">🎯 On-Chain</span>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                The Problem: One-Dimensional Thinking
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Traditional DeFi metrics focus on <strong>single dimensions</strong> like TVL for lending or volume for DEXs, 
                which miss the bigger picture. SPT introduces <strong>multi-metric scoring</strong>.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 mb-10">
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-8 border-2 border-red-200 transform hover:scale-[1.02] transition-transform">
                <h3 className="text-2xl font-bold text-red-900 mb-6 flex items-center gap-3">
                  <span className="text-3xl">❌</span>
                  Traditional Approach
                </h3>
                <ul className="space-y-3 text-base text-gray-800">
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 mt-1">•</span>
                    <span><strong>Single Metric Focus:</strong> TVL or volume alone</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 mt-1">•</span>
                    <span><strong>Easy to Game:</strong> Incentives inflate numbers</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 mt-1">•</span>
                    <span><strong>No Efficiency Signal:</strong> Misses capital productivity</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 mt-1">•</span>
                    <span><strong>Surface-Level Only:</strong> Can't see real performance</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 border-2 border-green-200 transform hover:scale-[1.02] transition-transform">
                <h3 className="text-2xl font-bold text-green-900 mb-6 flex items-center gap-3">
                  <span className="text-3xl">✅</span>
                  SPT Multi-Metric System
                </h3>
                <ul className="space-y-3 text-base text-gray-800">
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 mt-1">•</span>
                    <span><strong>Activity Metrics:</strong> Trading volume & borrow demand</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 mt-1">•</span>
                    <span><strong>Efficiency Ratios:</strong> Output per capital input</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 mt-1">•</span>
                    <span><strong>Revenue Generation:</strong> Fee capture & sustainability</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 mt-1">•</span>
                    <span><strong>Asset Quality:</strong> Blue-chip vs long-tail focus</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Two Examples */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <p className="text-sm text-blue-900 leading-relaxed">
                  <strong className="text-base">🔄 DEX Example:</strong> Protocol A: $10B TVL, $2B volume (0.2x efficiency). 
                  Protocol B: $3B TVL, $2.5B volume (0.83x). 
                  <span className="block mt-2 text-green-700 font-semibold text-base">→ SPT ranks B higher because capital efficiency wins.</span>
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <p className="text-sm text-purple-900 leading-relaxed">
                  <strong className="text-base">💰 Lending Example:</strong> Protocol X: $5B supply, $500M borrowed (10% util). 
                  Protocol Y: $2B supply, $1.2B borrowed (60% util). 
                  <span className="block mt-2 text-green-700 font-semibold text-base">→ SPT ranks Y higher because real demand matters.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Methodology Section */}
      <section className="container mx-auto px-4 sm:px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Scoring Methodology
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Category-specific weights that capture what drives value in each protocol type. 
              DEXs are scored on <strong>trading efficiency</strong>, lending protocols on <strong>capital utilization</strong>.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {/* DEX Scoring */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-blue-200 hover:shadow-2xl transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="text-4xl">🔄</div>
                <h3 className="text-2xl font-bold text-gray-900">DEX Protocols</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-blue-50/50 rounded-lg px-4 py-3 border border-blue-100">
                  <span className="text-base font-semibold text-gray-800">📊 Trading Volume</span>
                  <span className="text-2xl font-bold text-blue-600">40%</span>
                </div>
                <div className="flex justify-between items-center bg-purple-50/50 rounded-lg px-4 py-3 border border-purple-100">
                  <span className="text-base font-semibold text-gray-800">⚡ Capital Efficiency</span>
                  <span className="text-2xl font-bold text-purple-600">30%</span>
                </div>
                <div className="flex justify-between items-center bg-green-50/50 rounded-lg px-4 py-3 border border-green-100">
                  <span className="text-base font-semibold text-gray-800">💰 Fee Revenue</span>
                  <span className="text-2xl font-bold text-green-600">20%</span>
                </div>
                <div className="flex justify-between items-center bg-amber-50/50 rounded-lg px-4 py-3 border border-amber-100">
                  <span className="text-base font-semibold text-gray-800">📈 Fee Growth</span>
                  <span className="text-2xl font-bold text-amber-600">10%</span>
                </div>
              </div>
            </div>

            {/* Lending Scoring */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-green-200 hover:shadow-2xl transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="text-4xl">💰</div>
                <h3 className="text-2xl font-bold text-gray-900">Lending Protocols</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-blue-50/50 rounded-lg px-4 py-3 border border-blue-100">
                  <span className="text-base font-semibold text-gray-800">📊 Borrow Volume</span>
                  <span className="text-2xl font-bold text-blue-600">40%</span>
                </div>
                <div className="flex justify-between items-center bg-purple-50/50 rounded-lg px-4 py-3 border border-purple-100">
                  <span className="text-base font-semibold text-gray-800">🏦 Vanilla Assets</span>
                  <span className="text-2xl font-bold text-purple-600">25%</span>
                </div>
                <div className="flex justify-between items-center bg-amber-50/50 rounded-lg px-4 py-3 border border-amber-100">
                  <span className="text-base font-semibold text-gray-800">⚡ Utilization Rate</span>
                  <span className="text-2xl font-bold text-amber-600">20%</span>
                </div>
                <div className="flex justify-between items-center bg-green-50/50 rounded-lg px-4 py-3 border border-green-100">
                  <span className="text-base font-semibold text-gray-800">💰 Fee Revenue</span>
                  <span className="text-2xl font-bold text-green-600">15%</span>
                </div>
              </div>
            </div>

            {/* CDP Scoring */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-purple-200 hover:shadow-2xl transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="text-4xl">🏦</div>
                <h3 className="text-2xl font-bold text-gray-900">CDP Protocols</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-blue-50/50 rounded-lg px-4 py-3 border border-blue-100">
                  <span className="text-base font-semibold text-gray-800">🪙 Minted Stablecoin</span>
                  <span className="text-2xl font-bold text-blue-600">40%</span>
                </div>
                <div className="flex justify-between items-center bg-purple-50/50 rounded-lg px-4 py-3 border border-purple-100">
                  <span className="text-base font-semibold text-gray-800">💎 Blue-chip Collateral</span>
                  <span className="text-2xl font-bold text-purple-600">30%</span>
                </div>
                <div className="flex justify-between items-center bg-amber-50/50 rounded-lg px-4 py-3 border border-amber-100">
                  <span className="text-base font-semibold text-gray-800">⚡ Utilization Rate</span>
                  <span className="text-2xl font-bold text-amber-600">20%</span>
                </div>
                <div className="flex justify-between items-center bg-green-50/50 rounded-lg px-4 py-3 border border-green-100">
                  <span className="text-base font-semibold text-gray-800">💰 Stability Fees</span>
                  <span className="text-2xl font-bold text-green-600">10%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Statistical Note */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8 border border-gray-200 shadow-sm">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">How We Calculate Scores</h3>
            <p className="text-base text-gray-700 mb-6 leading-relaxed">
              We normalize all metrics using <strong>Z-score transformation</strong> (comparing each protocol to its peers over 90 days), 
              then map to a 0-1 scale with <strong>sigmoid smoothing</strong> to dampen outliers. 
              This ensures fair comparison regardless of protocol size.
            </p>
            <div className="flex flex-wrap gap-4">
              <code className="bg-white px-4 py-3 rounded-lg border border-gray-300 font-mono text-sm">z = (x - μ) / σ</code>
              <code className="bg-white px-4 py-3 rounded-lg border border-gray-300 font-mono text-sm">S(z) = 1 / (1 + e⁻ᶻ)</code>
              <code className="bg-white px-4 py-3 rounded-lg border border-gray-300 font-mono text-sm">SPT = Σ(wᵢ × Sᵢ)</code>
            </div>
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="bg-gradient-to-r from-[#49997E] to-blue-600 py-20">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Experience Multi-Dimensional Protocol Scoring
          </h2>
          <p className="text-lg sm:text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            See how protocols really perform when you measure activity, efficiency, and revenue together. 
            Real-time scores updated every 24 hours.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-white text-[#49997E] px-10 py-5 rounded-xl text-lg font-bold hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
          >
            View Live Dashboard →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm mb-2">
            SPT Index • Powered by <a href="https://defillama.com" target="_blank" rel="noopener noreferrer" className="text-[#49997E] hover:underline">DefiLlama</a>
          </p>
          <p className="text-xs">
            All metrics derived from verifiable on-chain data
          </p>
        </div>
      </footer>
    </div>
  );
}
