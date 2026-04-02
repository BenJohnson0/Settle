import { useState, useMemo, useCallback } from 'react';
import { SlidersHorizontal, List, Map, X, Info } from 'lucide-react';
import MapView from './components/Map/MapView';
import FilterPanel from './components/Filters/FilterPanel';
import AreaList from './components/Results/AreaList';
import { IRISH_AREAS } from './data/areas';
import { PRESETS } from './data/presets';
import { scoreAllAreas } from './utils/scoring';
import type { Filters } from './types';

const DEFAULT_FILTERS: Filters = PRESETS[0].filters;

type MobileTab = 'map' | 'list';

export default function App() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<MobileTab>('map');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  const scoredAreas = useMemo(() => scoreAllAreas(IRISH_AREAS, filters), [filters]);

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
    setMobileTab('map');
  }, []);

  const topArea = scoredAreas[0];

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50">
      {/* ── HEADER ─────────────────────────────────────────────── */}
      <header className="flex-shrink-0 bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-green-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-sm leading-none">Settle</h1>
            <p className="text-xs text-slate-400 leading-none mt-0.5">Find your place in Ireland</p>
          </div>
        </div>

        {/* Top match chip */}
        {topArea && (
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1">
            <span>Top match:</span>
            <span className="font-semibold text-green-700">{topArea.area.name}</span>
            <span className="font-bold text-green-600">{topArea.totalScore}/100</span>
          </div>
        )}

        <button
          onClick={() => setInfoOpen(o => !o)}
          className="text-slate-400 hover:text-slate-700 transition-colors"
        >
          <Info size={18} />
        </button>
      </header>

      {/* ── INFO BANNER ─────────────────────────────────────────── */}
      {infoOpen && (
        <div className="flex-shrink-0 bg-green-50 border-b border-green-100 px-4 py-3 text-xs text-green-800 relative">
          <button
            onClick={() => setInfoOpen(false)}
            className="absolute top-2 right-3 text-green-500 hover:text-green-700"
          >
            <X size={14} />
          </button>
          <p className="font-semibold mb-1">How Settle works</p>
          <p>
            Set your importance weights and preferences. Each area gets a <strong>0–100 suitability score</strong> based
            on your criteria — shops, transport, house prices, grants, recreation, and amenities.
            Click any marker or list item to see a full breakdown.
          </p>
          <p className="mt-1 text-green-600 italic">Data is approximate and for guidance only. Republic of Ireland only.</p>
        </div>
      )}

      {/* ── MAIN LAYOUT ─────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* ── DESKTOP SIDEBAR ──────────────────────────────────── */}
        <aside className="hidden lg:flex flex-col w-80 flex-shrink-0 border-r border-slate-200 overflow-hidden">
          <FilterPanel filters={filters} onChange={setFilters} />
        </aside>

        {/* ── MAP AREA ────────────────────────────────────────── */}
        <div className={`flex-1 relative ${mobileTab === 'list' ? 'hidden lg:flex' : 'flex'} flex-col`}>
          <div className="flex-1 relative">
            <MapView
              scoredAreas={scoredAreas}
              selectedId={selectedId}
              onSelect={handleSelect}
            />
          </div>

          {/* Desktop: collapsible results strip at bottom */}
          <div className="hidden lg:block">
            {listOpen ? (
              <div className="h-56 border-t border-slate-200 bg-white shadow-lg">
                <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100">
                  <span className="text-xs font-semibold text-slate-700">All Areas</span>
                  <button onClick={() => setListOpen(false)} className="text-slate-400 hover:text-slate-700">
                    <X size={14} />
                  </button>
                </div>
                <div className="h-44 overflow-y-auto">
                  <AreaList scoredAreas={scoredAreas} selectedId={selectedId} onSelect={handleSelect} />
                </div>
              </div>
            ) : (
              <button
                onClick={() => setListOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-2 bg-white border-t border-slate-200 text-xs text-slate-600 hover:bg-slate-50 transition-colors font-medium"
              >
                <List size={13} />
                Show all {scoredAreas.length} areas ranked
              </button>
            )}
          </div>
        </div>

        {/* ── MOBILE LIST TAB ─────────────────────────────────── */}
        {mobileTab === 'list' && (
          <div className="flex-1 flex flex-col lg:hidden overflow-hidden">
            <AreaList scoredAreas={scoredAreas} selectedId={selectedId} onSelect={handleSelect} />
          </div>
        )}

        {/* ── MOBILE FILTER DRAWER ─────────────────────────────── */}
        {filtersOpen && (
          <>
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/40 z-30 lg:hidden"
              onClick={() => setFiltersOpen(false)}
            />
            {/* Drawer */}
            <div className="absolute bottom-0 left-0 right-0 z-40 lg:hidden bg-white rounded-t-2xl shadow-2xl max-h-[85vh] flex flex-col">
              <div className="flex-shrink-0 flex justify-center pt-2 pb-1">
                <div className="w-10 h-1 bg-slate-200 rounded-full" />
              </div>
              <FilterPanel
                filters={filters}
                onChange={setFilters}
                onClose={() => setFiltersOpen(false)}
              />
            </div>
          </>
        )}

        {/* ── TABLET FILTER DRAWER ─────────────────────────────── */}
        {filtersOpen && (
          <>
            <div
              className="absolute inset-0 bg-black/30 z-30 hidden sm:block lg:hidden"
              onClick={() => setFiltersOpen(false)}
            />
            <div className="absolute top-0 left-0 bottom-0 z-40 hidden sm:flex lg:hidden w-80 bg-white shadow-2xl flex-col">
              <FilterPanel
                filters={filters}
                onChange={setFilters}
                onClose={() => setFiltersOpen(false)}
              />
            </div>
          </>
        )}
      </div>

      {/* ── MOBILE BOTTOM BAR ───────────────────────────────────── */}
      <nav className="lg:hidden flex-shrink-0 bg-white border-t border-slate-200 flex items-center justify-around px-2 py-1.5 z-20 safe-area-bottom">
        <button
          onClick={() => { setMobileTab('map'); setFiltersOpen(false); }}
          className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-lg transition-colors ${
            mobileTab === 'map' && !filtersOpen ? 'text-green-600' : 'text-slate-500'
          }`}
        >
          <Map size={20} />
          <span className="text-xs font-medium">Map</span>
        </button>

        <button
          onClick={() => { setFiltersOpen(o => !o); setMobileTab('map'); }}
          className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-lg transition-colors ${
            filtersOpen ? 'text-green-600' : 'text-slate-500'
          }`}
        >
          <SlidersHorizontal size={20} />
          <span className="text-xs font-medium">Filters</span>
        </button>

        <button
          onClick={() => { setMobileTab('list'); setFiltersOpen(false); }}
          className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-lg transition-colors ${
            mobileTab === 'list' && !filtersOpen ? 'text-green-600' : 'text-slate-500'
          }`}
        >
          <List size={20} />
          <span className="text-xs font-medium">Rankings</span>
        </button>
      </nav>
    </div>
  );
}
