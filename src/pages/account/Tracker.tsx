import { SavedPicks } from '@/components/SavedPicks';

const Tracker = () => {
  return (
    <div className="p-6" style={{ background: 'rgba(17.76, 18.55, 28.04, 0.50)', minHeight: '100vh' }}>
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold" style={{ color: '#0EADAB' }}>Tracker</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Stats Card - Win Rate */}
          <div className="bg-[#1B1C25] p-4 rounded-xl border border-[rgba(14,173,171,0.2)]">
            <h3 className="text-white text-lg mb-2">Win Rate</h3>
            <div className="flex items-end gap-2">
              <span className="text-white text-4xl font-medium">45%</span>
              <span className="text-green-500 text-sm mb-1">↑ 5%</span>
            </div>
            <p className="text-white/50 text-xs mt-1">Last 30 days</p>
          </div>

          {/* Stats Card - ROI */}
          <div className="bg-[#1B1C25] p-4 rounded-xl border border-[rgba(14,173,171,0.2)]">
            <h3 className="text-white text-lg mb-2">ROI</h3>
            <div className="flex items-end gap-2">
              <span className="text-white text-4xl font-medium">+12.3%</span>
              <span className="text-green-500 text-sm mb-1">↑ 2.1%</span>
            </div>
            <p className="text-white/50 text-xs mt-1">Last 30 days</p>
          </div>

          {/* Stats Card - Profit */}
          <div className="bg-[#1B1C25] p-4 rounded-xl border border-[rgba(14,173,171,0.2)]">
            <h3 className="text-white text-lg mb-2">Profit</h3>
            <div className="flex items-end gap-2">
              <span className="text-white text-4xl font-medium">$245</span>
              <span className="text-green-500 text-sm mb-1">↑ $45</span>
            </div>
            <p className="text-white/50 text-xs mt-1">Last 30 days</p>
          </div>
        </div>

        {/* Saved Picks */}
        <SavedPicks />
      </div>
    </div>
  )
}

export default Tracker
