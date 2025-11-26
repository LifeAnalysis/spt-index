'use client';

import { useRouter } from 'next/navigation';
import InfoTooltip from '../components/InfoTooltip';

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <nav className="sticky top-0 z-50 border-b border-gray-200/50 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Left: Back + Brand */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100/50 hover:bg-gray-200/50 text-gray-500 hover:text-gray-900 transition-colors"
              >
                ←
              </button>
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#49997E] to-[#2c7a60] flex items-center justify-center shadow-lg shadow-[#49997E]/20 hover:scale-105 transition-transform">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <div className="hidden sm:flex flex-col">
                  <h1 className="text-lg font-bold text-gray-900 leading-none tracking-tight">
                    SPT Index
                  </h1>
                  <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mt-0.5">
                    Protocol Analytics
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 sm:py-24 text-center">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-4xl sm:text-6xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
            DeFi Performance,<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#49997E] to-blue-600">
              Standardized.
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            The first multi-dimensional scoring system that measures what actually matters: 
            <strong> efficiency, revenue, and real demand.</strong>
          </p>
        </div>
      </section>

      {/* The Problem & Solution */}
      <section className="container mx-auto px-4 pb-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          {/* The Problem */}
          <div className="bg-white/60 backdrop-blur-lg rounded-3xl p-8 border border-rose-100 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">❌</span>
              <h2 className="text-2xl font-bold text-gray-900">The TVL Trap</h2>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">
              TVL is a vanity metric. It measures how much money is parked, not how hard it's working. 
              A "zombie" protocol can have billions in TVL but zero user activity or revenue.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"/> Easy to game with incentives
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"/> Ignores capital efficiency
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"/> Blind to revenue generation
              </li>
            </ul>
          </div>

          {/* The SPT Solution */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 border border-[#49997E]/20 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">✅</span>
              <h2 className="text-2xl font-bold text-gray-900">The SPT Standard</h2>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">
              We evaluate protocols like a credit rating agency evaluates businesses. 
              We combine activity, efficiency, and financial health into a single, comparable score.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <span className="w-1.5 h-1.5 rounded-full bg-[#49997E]"/> <strong>Multi-Metric:</strong> Volume + Fees + Growth
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <span className="w-1.5 h-1.5 rounded-full bg-[#49997E]"/> <strong>Normalized:</strong> Fair comparison across sizes
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <span className="w-1.5 h-1.5 rounded-full bg-[#49997E]"/> <strong>Cohort-Based:</strong> Apples-to-apples ranking
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Methodology Cards */}
      <section className="container mx-auto px-4 pb-24">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Scoring Weights by Category</h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* DEX */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-blue-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
              <div className="text-3xl mb-4">🔄</div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">DEX</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Volume</span><span className="font-bold text-blue-600">40%</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Efficiency</span><span className="font-bold text-blue-600">30%</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Revenue</span><span className="font-bold text-blue-600">20%</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Growth</span><span className="font-bold text-blue-600">10%</span></div>
              </div>
            </div>

            {/* Lending */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-green-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
              <div className="text-3xl mb-4">💰</div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Lending</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Borrow Vol</span><span className="font-bold text-green-600">40%</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Assets</span><span className="font-bold text-green-600">25%</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Utilization</span><span className="font-bold text-green-600">20%</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Revenue</span><span className="font-bold text-green-600">15%</span></div>
              </div>
            </div>

            {/* Liquid Staking */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-amber-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
              <div className="text-3xl mb-4">💎</div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Liquid Staking</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">TVL</span><span className="font-bold text-amber-600">50%</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Revenue</span><span className="font-bold text-amber-600">25%</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Activity</span><span className="font-bold text-amber-600">15%</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Growth</span><span className="font-bold text-amber-600">10%</span></div>
              </div>
            </div>

            {/* CDP */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-purple-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
              <div className="text-3xl mb-4">🏦</div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">CDP</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Minted</span><span className="font-bold text-purple-600">40%</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Collateral</span><span className="font-bold text-purple-600">30%</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Utilization</span><span className="font-bold text-purple-600">20%</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Fees</span><span className="font-bold text-purple-600">10%</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Math */}
      <section className="container mx-auto px-4 pb-24">
        <div className="max-w-3xl mx-auto bg-white/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-4">How Calculations Work</h3>
          <p className="text-gray-600 mb-6">
            We normalize every metric using <strong>Z-score transformation</strong> over a 90-day window. 
            This converts raw numbers into "standard deviations from the mean", allowing us to compare 
            small efficient protocols directly against large ones.
          </p>
          <div className="flex justify-center gap-4 font-mono text-xs sm:text-sm text-gray-500">
             <span className="bg-white px-3 py-1 rounded border border-gray-200">z = (x - μ) / σ</span>
             <span className="bg-white px-3 py-1 rounded border border-gray-200">Score = Σ(wᵢ × zᵢ)</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/50 backdrop-blur-md">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-sm text-gray-500">
            © 2025 SPT Index • Powered by <a href="https://defillama.com" className="text-[#49997E] hover:underline">DefiLlama</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
