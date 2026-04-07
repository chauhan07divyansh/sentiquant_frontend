'use client'

// PERF: lazy-loaded via next/dynamic in stocks/[symbol]/page.tsx.
//       This component is only fetched when the user clicks the Compare tab,
//       keeping the initial JS bundle smaller for swing/position tab users.

import { SystemBadge } from '@/components/ui/Badge'
import { AnalysisView } from './AnalysisView'
import type { CompareResponse } from '@/types/stock.types'

interface CompareViewProps {
  data: CompareResponse
}

export default function CompareView({ data }: CompareViewProps) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
      {(['swing_analysis', 'position_analysis'] as const).map((key) => {
        const analysis = data[key]
        return (
          <div key={key} className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <SystemBadge type={analysis.system_type} />
              <span className="text-xs text-surface-500">{analysis.time_horizon}</span>
            </div>
            <AnalysisView analysis={analysis} />
          </div>
        )
      })}
    </div>
  )
}
