import { SlidersHorizontal, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { Filters, ShopType, TransportType, RecreationType, FilterWeights } from '../../types';
import { PRESETS } from '../../data/presets';
import { formatPrice } from '../../utils/colors';

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
  onClose?: () => void;
}

const SHOPS: { id: ShopType; label: string }[] = [
  { id: 'aldi', label: 'Aldi' },
  { id: 'lidl', label: 'Lidl' },
  { id: 'tesco', label: 'Tesco' },
  { id: 'dunnes', label: 'Dunnes' },
  { id: 'supervalu', label: 'SuperValu' },
  { id: 'centra', label: 'Centra' },
  { id: 'londis', label: 'Londis' },
  { id: 'marks-spencer', label: 'M&S Food' },
  { id: 'mr-price', label: 'Mr. Price' },
  { id: 'dealz', label: 'Dealz' },
];

const TRANSPORT: { id: TransportType; label: string }[] = [
  { id: 'luas', label: 'Luas' },
  { id: 'dart', label: 'DART' },
  { id: 'train', label: 'Train / Irish Rail' },
  { id: 'dublin-bus', label: 'Dublin Bus' },
  { id: 'bus-eireann', label: 'Bus Éireann' },
];

const RECREATION: { id: RecreationType; label: string }[] = [
  { id: 'park', label: 'Parks' },
  { id: 'beach', label: 'Beach' },
  { id: 'hiking', label: 'Hiking' },
  { id: 'cycling', label: 'Cycling' },
  { id: 'pubs', label: 'Pubs' },
  { id: 'gym', label: 'Gyms' },
  { id: 'clothes-shops', label: 'Clothes Shops' },
  { id: 'cinema', label: 'Cinema' },
  { id: 'sports', label: 'Sports Facilities' },
];

const WEIGHT_LABELS: Record<keyof FilterWeights, string> = {
  shops: 'Shops & Supermarkets',
  transport: 'Transport Links',
  affordability: 'Affordability',
  recreation: 'Recreation & Social',
  amenities: 'Schools, Libraries & Cinemas',
  healthcare: 'Healthcare',
  grants: 'Government Grants',
  costOfLiving: 'Cost of Living',
  airQuality: 'Air Quality',
};

function WeightSlider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const pct = (value / 10) * 100;
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <label className="text-sm text-slate-700 font-medium">{label}</label>
        <span className="text-xs font-bold text-slate-500">
          {value === 0 ? 'Off' : value <= 3 ? 'Low' : value <= 6 ? 'Medium' : value <= 8 ? 'High' : 'Max'}
        </span>
      </div>
      <input
        type="range" min={0} max={10} step={1} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-2 appearance-none rounded-full cursor-pointer"
        style={{ background: `linear-gradient(to right, #16a34a 0%, #16a34a ${pct}%, #e2e8f0 ${pct}%, #e2e8f0 100%)` }}
      />
    </div>
  );
}

function ToggleGroup<T extends string>({
  options, selected, onChange,
}: { options: { id: T; label: string }[]; selected: T[]; onChange: (v: T[]) => void }) {
  const toggle = (id: T) =>
    onChange(selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id]);
  return (
    <div className="flex flex-wrap gap-1.5 mt-1">
      {options.map(({ id, label }) => {
        const active = selected.includes(id);
        return (
          <button
            key={id} onClick={() => toggle(id)}
            className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors ${
              active ? 'bg-green-600 border-green-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-green-400'
            }`}
          >{label}</button>
        );
      })}
    </div>
  );
}

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100 pb-3 mb-3 last:border-0 last:pb-0 last:mb-0">
      <button onClick={() => setOpen(o => !o)} className="flex items-center justify-between w-full text-left mb-2">
        <span className="text-sm font-semibold text-slate-800">{title}</span>
        {open ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

export default function FilterPanel({ filters, onChange, onClose }: Props) {
  const setWeight = (key: keyof FilterWeights, value: number) =>
    onChange({ ...filters, weights: { ...filters.weights, [key]: value } });

  const applyPreset = (key: string) => {
    const preset = PRESETS.find(p => p.key === key);
    if (preset) onChange({ ...preset.filters });
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-green-600" />
          <span className="font-bold text-slate-900 text-sm">Filters</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => applyPreset('balanced')}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition-colors"
          >
            <RotateCcw size={12} /> Reset
          </button>
          {onClose && (
            <button onClick={onClose} className="ml-2 text-xs text-slate-400 hover:text-slate-700 font-medium">Done</button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        {/* Presets */}
        <Section title="Quick Presets">
          <div className="grid grid-cols-2 gap-1.5">
            {PRESETS.map(p => (
              <button
                key={p.key} onClick={() => applyPreset(p.key)}
                className="text-left text-xs px-2.5 py-2 rounded-lg border border-slate-200 hover:border-green-400 hover:bg-green-50 transition-colors"
              >
                <span className="mr-1">{p.emoji}</span>{p.label}
              </button>
            ))}
          </div>
        </Section>

        {/* Budget */}
        <Section title="Budget">
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-slate-600">Max purchase price</span>
              <span className="text-sm font-bold text-green-700">{formatPrice(filters.maxBudget)}</span>
            </div>
            <input
              type="range" min={100000} max={900000} step={10000} value={filters.maxBudget}
              onChange={e => onChange({ ...filters, maxBudget: Number(e.target.value) })}
              className="w-full h-2 appearance-none rounded-full cursor-pointer"
              style={{
                background: `linear-gradient(to right, #16a34a 0%, #16a34a ${((filters.maxBudget - 100000) / 800000) * 100}%, #e2e8f0 ${((filters.maxBudget - 100000) / 800000) * 100}%, #e2e8f0 100%)`,
              }}
            />
            <div className="flex justify-between text-xs text-slate-400 mt-0.5"><span>€100k</span><span>€900k</span></div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-slate-600">Max monthly rent</span>
              <span className="text-sm font-bold text-green-700">€{filters.maxMonthlyRent.toLocaleString()}</span>
            </div>
            <input
              type="range" min={500} max={4000} step={50} value={filters.maxMonthlyRent}
              onChange={e => onChange({ ...filters, maxMonthlyRent: Number(e.target.value) })}
              className="w-full h-2 appearance-none rounded-full cursor-pointer"
              style={{
                background: `linear-gradient(to right, #16a34a 0%, #16a34a ${((filters.maxMonthlyRent - 500) / 3500) * 100}%, #e2e8f0 ${((filters.maxMonthlyRent - 500) / 3500) * 100}%, #e2e8f0 100%)`,
              }}
            />
            <div className="flex justify-between text-xs text-slate-400 mt-0.5"><span>€500</span><span>€4,000</span></div>
          </div>
        </Section>

        {/* Importance weights */}
        <Section title="What matters most">
          {(Object.keys(WEIGHT_LABELS) as (keyof FilterWeights)[]).map(key => (
            <WeightSlider key={key} label={WEIGHT_LABELS[key]} value={filters.weights[key]} onChange={v => setWeight(key, v)} />
          ))}
        </Section>

        {/* Shops */}
        <Section title="Must-have shops" defaultOpen={false}>
          <p className="text-xs text-slate-400 mb-1">Areas missing these shops score lower.</p>
          <ToggleGroup options={SHOPS} selected={filters.desiredShops} onChange={v => onChange({ ...filters, desiredShops: v })} />
        </Section>

        {/* Transport */}
        <Section title="Must-have transport" defaultOpen={false}>
          <p className="text-xs text-slate-400 mb-1">Areas missing these links score lower.</p>
          <ToggleGroup options={TRANSPORT} selected={filters.desiredTransport} onChange={v => onChange({ ...filters, desiredTransport: v })} />
        </Section>

        {/* Recreation & Social */}
        <Section title="Recreation & social" defaultOpen={false}>
          <p className="text-xs text-slate-400 mb-1">Areas missing these score lower.</p>
          <ToggleGroup options={RECREATION} selected={filters.desiredRecreation} onChange={v => onChange({ ...filters, desiredRecreation: v })} />
        </Section>

        {/* Grants info */}
        <Section title="About grants" defaultOpen={false}>
          <div className="space-y-1.5 text-xs text-slate-600">
            <p><span className="font-semibold text-slate-800">Help to Buy:</span> Up to €30k tax refund for new builds under €500k (first-time buyers).</p>
            <p><span className="font-semibold text-slate-800">First Home Scheme:</span> Government takes up to 30% equity in new builds.</p>
            <p><span className="font-semibold text-slate-800">Local Authority Loan:</span> Below-market mortgage for those turned down by banks.</p>
            <p><span className="font-semibold text-slate-800">Vacant Property Grant:</span> Up to €70k for renovating derelict or vacant homes.</p>
            <p><span className="font-semibold text-slate-800">SEAI Grants:</span> Energy upgrade grants available nationwide.</p>
          </div>
        </Section>

        <div className="pt-2 text-xs text-slate-400 italic">
          Data is approximate. Run the OSM refresh script for verified counts. Always verify before making property decisions.
        </div>
      </div>
    </div>
  );
}
