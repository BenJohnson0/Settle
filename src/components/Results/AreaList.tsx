import { MapPin } from 'lucide-react';
import type { ScoredArea } from '../../types';
import { scoreColor, scoreLabel, formatPrice } from '../../utils/colors';

interface Props {
  scoredAreas: ScoredArea[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function MiniBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1 bg-slate-100 rounded-full overflow-hidden w-8">
      <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
    </div>
  );
}

const BAR_KEYS = ['shops', 'transport', 'affordability', 'recreation', 'amenities', 'healthcare', 'grants', 'costOfLiving', 'airQuality'] as const;

export default function AreaList({ scoredAreas, selectedId, onSelect }: Props) {
  return (
    <div className="h-full overflow-y-auto">
      <div className="px-3 py-2 border-b border-slate-100 sticky top-0 bg-white z-10">
        <p className="text-xs text-slate-500 font-medium">{scoredAreas.length} areas · ranked by suitability</p>
      </div>
      <div>
        {scoredAreas.map(({ area, totalScore, breakdown }, index) => {
          const color = scoreColor(totalScore);
          const selected = area.id === selectedId;
          return (
            <button
              key={area.id} onClick={() => onSelect(area.id)}
              className={`w-full text-left px-3 py-2.5 border-b border-slate-50 hover:bg-slate-50 transition-colors ${selected ? 'bg-green-50 border-l-2 border-l-green-500' : ''}`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 w-5 flex-shrink-0 text-right">{index + 1}</span>
                <div className="flex-shrink-0 rounded-full flex items-center justify-center text-white font-bold text-xs"
                  style={{ backgroundColor: color, width: 32, height: 32 }}>
                  {totalScore}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-slate-900 truncate">{area.name}</span>
                    <span className="text-xs font-medium ml-1 flex-shrink-0" style={{ color }}>{scoreLabel(totalScore)}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin size={10} className="text-slate-400 flex-shrink-0" />
                    <span className="text-xs text-slate-400 truncate">Co. {area.county}</span>
                    <span className="text-xs text-slate-300 mx-1">·</span>
                    <span className="text-xs text-slate-600 font-medium">{formatPrice(area.avgHousePrice)}</span>
                    <span className="text-xs text-slate-300 mx-0.5">·</span>
                    <span className="text-xs text-slate-500">€{area.avgMonthlyRent.toLocaleString()}/mo</span>
                  </div>
                  <div className="flex gap-1 mt-1.5">
                    {BAR_KEYS.map(key => (
                      <MiniBar key={key} value={breakdown[key]} color={scoreColor(breakdown[key])} />
                    ))}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
