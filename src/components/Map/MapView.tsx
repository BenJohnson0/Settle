import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { ScoredArea } from '../../types';
import { scoreColor, formatPrice } from '../../utils/colors';

interface Props {
  scoredAreas: ScoredArea[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function createScoreIcon(score: number, selected: boolean): L.DivIcon {
  const color = scoreColor(score);
  const size = selected ? 46 : 38;
  const border = selected ? '3px solid #1e293b' : '2px solid white';
  return L.divIcon({
    className: '',
    html: `<div style="background-color:${color};color:white;width:${size}px;height:${size}px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:${selected ? 14 : 12}px;border:${border};box-shadow:0 2px 8px rgba(0,0,0,0.35);cursor:pointer;font-family:system-ui,sans-serif;">${score}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 4)],
  });
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="mb-1">
      <div className="flex justify-between text-xs mb-0.5">
        <span className="text-slate-600">{label}</span>
        <span className="font-semibold" style={{ color }}>{value}</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function FlyTo({ scoredAreas, selectedId }: { scoredAreas: ScoredArea[]; selectedId: string | null }) {
  const map = useMap();
  useEffect(() => {
    if (!selectedId) return;
    const found = scoredAreas.find(s => s.area.id === selectedId);
    if (found) map.flyTo([found.area.lat, found.area.lng], Math.max(map.getZoom(), 10), { duration: 0.8 });
  }, [selectedId, scoredAreas, map]);
  return null;
}

export default function MapView({ scoredAreas, selectedId, onSelect }: Props) {
  const markerRefs = useRef<Record<string, L.Marker>>({});

  useEffect(() => {
    if (selectedId && markerRefs.current[selectedId]) {
      markerRefs.current[selectedId].openPopup();
    }
  }, [selectedId]);

  return (
    <MapContainer
      center={[53.2, -8.0]} zoom={7}
      style={{ height: '100%', width: '100%' }}
      minZoom={6} maxZoom={14}
      maxBounds={[[50.8, -11.2], [55.6, -5.3]]}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      <FlyTo scoredAreas={scoredAreas} selectedId={selectedId} />
      {scoredAreas.map(({ area, totalScore, breakdown }) => (
        <Marker
          key={area.id}
          position={[area.lat, area.lng]}
          icon={createScoreIcon(totalScore, area.id === selectedId)}
          ref={ref => { if (ref) markerRefs.current[area.id] = ref; }}
          eventHandlers={{ click: () => onSelect(area.id) }}
        >
          <Popup maxWidth={260}>
            <div className="font-sans w-60">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-tight">{area.name}</h3>
                  <p className="text-xs text-slate-500">Co. {area.county}</p>
                </div>
                <div className="ml-2 flex-shrink-0 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: scoreColor(totalScore), width: 40, height: 40 }}>
                  {totalScore}
                </div>
              </div>

              <div className="mb-3 flex gap-3 text-sm text-slate-700">
                <span><span className="font-semibold">Buy:</span> {formatPrice(area.avgHousePrice)}</span>
                <span><span className="font-semibold">Rent:</span> €{area.avgMonthlyRent.toLocaleString()}/mo</span>
              </div>

              <div className="mb-3">
                <ScoreBar label="Shops" value={breakdown.shops} color={scoreColor(breakdown.shops)} />
                <ScoreBar label="Transport" value={breakdown.transport} color={scoreColor(breakdown.transport)} />
                <ScoreBar label="Affordability" value={breakdown.affordability} color={scoreColor(breakdown.affordability)} />
                <ScoreBar label="Recreation & Social" value={breakdown.recreation} color={scoreColor(breakdown.recreation)} />
                <ScoreBar label="Amenities" value={breakdown.amenities} color={scoreColor(breakdown.amenities)} />
                <ScoreBar label="Healthcare" value={breakdown.healthcare} color={scoreColor(breakdown.healthcare)} />
                <ScoreBar label="Grants" value={breakdown.grants} color={scoreColor(breakdown.grants)} />
              </div>

              <div className="text-xs text-slate-600 space-y-1">
                {area.transport.types.length > 0 && (
                  <p><span className="font-medium">Transport:</span>{' '}
                    {area.transport.types.map(t => ({ luas: 'Luas', dart: 'DART', train: 'Train', 'dublin-bus': 'Dublin Bus', 'bus-eireann': 'Bus Éireann' }[t])).join(', ')}
                  </p>
                )}
                <p><span className="font-medium">Healthcare:</span> {area.healthcare.hospitals} hospital{area.healthcare.hospitals !== 1 ? 's' : ''}, {area.healthcare.gps} GPs, {area.healthcare.dentists} dentists</p>
                <p><span className="font-medium">Social:</span> {area.recreation.pubs} pubs, {area.recreation.gyms} gyms, {area.recreation.sportsFacilities} sports facilities</p>
              </div>

              <p className="mt-2 text-xs text-slate-500 italic leading-relaxed">{area.description}</p>
              <p className="mt-1 text-xs text-slate-400">Data is approximate — verify before deciding.</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
