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
            A Novel Scoring System for
            <span className="block mt-2 bg-gradient-to-r from-[#49997E] via-blue-600 to-purple-600 bg-clip-text text-transparent">
              DeFi Protocol Performance
            </span>
          </h1>
          <p className="text-body-lg text-gray-600 leading-relaxed mb-8">
            The SPT Index is the <strong>first multi-dimensional scoring system</strong> that measures what protocols actually do—
            trading activity, capital efficiency, borrow demand, and revenue generation. 
            <span className="font-semibold text-gray-900"> Think credit ratings for DeFi, </span>
            powered by real-time on-chain data and statistical normalization.
          </p>
          <div className="flex flex-wrap gap-3 justify-center text-label">
            <div className="bg-white px-5 py-2 rounded-full border border-gray-200 shadow-sm">
              <span className="font-semibold text-gray-700">📊 Multi-Metric Scoring</span>
            </div>
            <div className="bg-white px-5 py-2 rounded-full border border-gray-200 shadow-sm">
              <span className="font-semibold text-gray-700">⚡ Statistical Normalization</span>
            </div>
            <div className="bg-white px-5 py-2 rounded-full border border-gray-200 shadow-sm">
              <span className="font-semibold text-gray-700">🎯 100% On-Chain Verified</span>
            </div>
          </div>
        </div>
      </section>

      {/* Why This Matters - Novel Methodology */}
      <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-h1 font-bold text-gray-900 mb-6 text-center">
              The Problem: One-Dimensional Thinking
            </h2>
            <p className="text-body-lg text-gray-600 text-center mb-8 max-w-3xl mx-auto">
              Traditional DeFi metrics focus on <strong>single dimensions</strong>—TVL for lending, volume for DEXs—
              which miss the bigger picture. SPT introduces <strong>multi-metric scoring</strong> that captures operational health across protocols.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border-2 border-red-200">
                <h3 className="text-h3 font-bold text-red-900 mb-4">❌ Traditional Approach</h3>
                <ul className="space-y-2 text-body-sm text-gray-800">
                  <li>• <strong>Single Metric Focus:</strong> TVL or volume alone</li>
                  <li>• <strong>Easy to Game:</strong> Incentives inflate numbers</li>
                  <li>• <strong>No Efficiency Signal:</strong> Misses capital productivity</li>
                  <li>• <strong>Surface-Level Only:</strong> Can't see real performance</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200">
                <h3 className="text-h3 font-bold text-green-900 mb-4">✅ SPT Multi-Metric System</h3>
                <ul className="space-y-2 text-body-sm text-gray-800">
                  <li>• <strong>Activity Metrics:</strong> Trading volume & borrow demand</li>
                  <li>• <strong>Efficiency Ratios:</strong> Output per capital input</li>
                  <li>• <strong>Revenue Generation:</strong> Fee capture & sustainability</li>
                  <li>• <strong>Asset Quality:</strong> Blue-chip vs long-tail focus</li>
                </ul>
              </div>
            </div>

            {/* Two Examples: DEX and Lending */}
            <div className="mt-6 grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                <p className="text-body-sm text-blue-900">
                  <strong>🔄 DEX Example:</strong> Protocol A: $10B TVL, $2B volume (0.2x efficiency). 
                  Protocol B: $3B TVL, $2.5B volume (0.83x). 
                  <span className="text-green-700 font-semibold"> SPT ranks B higher</span>—capital efficiency wins.
                </p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                <p className="text-body-sm text-purple-900">
                  <strong>💰 Lending Example:</strong> Protocol X: $5B supply, $500M borrowed (10% util). 
                  Protocol Y: $2B supply, $1.2B borrowed (60% util). 
                  <span className="text-green-700 font-semibold"> SPT ranks Y higher</span>—real demand matters.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Simplified */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-h1 font-bold text-gray-900 mb-4 text-center">
            Our Scoring Methodology
          </h2>
          <p className="text-body-lg text-gray-600 text-center mb-8 max-w-3xl mx-auto">
            Category-specific weights that capture what drives value in each protocol type. 
            DEXs are scored on <strong>trading efficiency</strong>, lending protocols on <strong>capital utilization</strong>.
          </p>

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
            <h2 className="text-h1 font-bold text-gray-900 mb-4 text-center">
              Why Multi-Dimensional Scoring Matters
            </h2>
            <p className="text-body-lg text-gray-600 text-center mb-8 max-w-3xl mx-auto">
              Single metrics tell one story. SPT combines activity, efficiency, and revenue to give you the <strong>complete picture</strong> 
              of protocol performance—like a credit rating, but for DeFi.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <div className="text-4xl mb-3">🎯</div>
                <h3 className="text-h3 font-bold text-gray-900 mb-3">See Full Performance</h3>
                <p className="text-body text-gray-600">
                  Not just TVL or volume—get a composite score that captures activity, efficiency, revenue, and sustainability all at once.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <div className="text-4xl mb-3">⚡</div>
                <h3 className="text-h3 font-bold text-gray-900 mb-3">Compare Apples to Apples</h3>
                <p className="text-body text-gray-600">
                  Statistical normalization ensures fair comparison—small high-performers can outrank large low-performers.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <div className="text-4xl mb-3">🏆</div>
                <h3 className="text-h3 font-bold text-gray-900 mb-3">Spot Trends Early</h3>
                <p className="text-body text-gray-600">
                  Track 7/30/90-day changes to identify protocols gaining momentum or losing steam before the market notices.
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
            Experience Multi-Dimensional Protocol Scoring
          </h2>
          <p className="text-body-lg text-white/90 mb-8 max-w-2xl mx-auto">
            See how protocols really perform when you measure activity, efficiency, and revenue together. 
            Real-time scores updated every 5 minutes.
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
