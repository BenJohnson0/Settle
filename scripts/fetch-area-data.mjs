/**
 * fetch-area-data.mjs
 *
 * Queries OpenStreetMap (Overpass API) to get real shop, amenity, recreation,
 * and healthcare counts for each Irish area, then patches src/data/areas.ts
 * in-place with the live figures.
 *
 * Usage:
 *   node scripts/fetch-area-data.mjs
 *
 * Requires Node.js 18+ (uses built-in fetch).
 * Rate-limited: one area every ~2 seconds to respect Overpass fair-use policy.
 * A full run over ~57 areas takes ~2 minutes.
 *
 * Fields updated per area:
 *   shops[]                      — brand-matched from OSM brand/name tags
 *   recreation.parks             — leisure=park count
 *   recreation.pubs              — amenity=pub|bar count
 *   recreation.gyms              — leisure=fitness_centre|sports_centre count
 *   recreation.clothesShops      — shop=clothes count
 *   recreation.sportsFacilities  — leisure=pitch|stadium|swimming_pool|ice_rink count
 *   amenities.schools            — amenity=school count
 *   amenities.libraries          — amenity=library count
 *   amenities.cinemas            — amenity=cinema count
 *   healthcare.hospitals         — amenity=hospital count
 *   healthcare.gps               — amenity=doctors count
 *   healthcare.dentists          — amenity=dentist count
 *
 * Preserved (require manual verification — OSM tags are inconsistent):
 *   recreation.beaches, recreation.hasHiking, recreation.hasCycling
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const AREAS_FILE = join(__dirname, '../src/data/areas.ts');

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const RADIUS = 3000; // metres — approximate walkable catchment

// Brand name → ShopType key mapping for OSM "brand" and "name" tags
const SHOP_BRANDS = {
  'Aldi': 'aldi',
  'Lidl': 'lidl',
  'Tesco': 'tesco',
  'Dunnes Stores': 'dunnes',
  'SuperValu': 'supervalu',
  'Marks & Spencer': 'marks-spencer',
  'Centra': 'centra',
  'Londis': 'londis',
  'Mr. Price': 'mr-price',
  'Dealz': 'dealz',
};

const DELAY_MS = 5000; // 5 s between requests to avoid 429s on Overpass free tier

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function overpassQuery(query) {
  const res = await fetch(OVERPASS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(query)}`,
  });
  if (!res.ok) throw new Error(`Overpass HTTP ${res.status}`);
  return res.json();
}

async function fetchAreaData(area) {
  const { lat, lng } = area;
  const r = RADIUS;

  const query = `
[out:json][timeout:30];
(
  // Supermarkets & convenience by brand
  node["shop"~"supermarket|convenience|department_store"](around:${r},${lat},${lng});
  way["shop"~"supermarket|convenience|department_store"](around:${r},${lat},${lng});
  // Pubs & bars
  node["amenity"~"pub|bar"](around:${r},${lat},${lng});
  way["amenity"~"pub|bar"](around:${r},${lat},${lng});
  // Gyms & fitness
  node["leisure"~"fitness_centre|sports_centre"](around:${r},${lat},${lng});
  way["leisure"~"fitness_centre|sports_centre"](around:${r},${lat},${lng});
  // Clothes shops
  node["shop"="clothes"](around:${r},${lat},${lng});
  way["shop"="clothes"](around:${r},${lat},${lng});
  // Cinemas
  node["amenity"="cinema"](around:${r},${lat},${lng});
  way["amenity"="cinema"](around:${r},${lat},${lng});
  // Sport facilities (pitches, pools, stadiums)
  node["leisure"~"pitch|stadium|swimming_pool|ice_rink"](around:${r},${lat},${lng});
  way["leisure"~"pitch|stadium|swimming_pool|ice_rink"](around:${r},${lat},${lng});
  // Parks
  node["leisure"="park"](around:${r},${lat},${lng});
  way["leisure"="park"](around:${r},${lat},${lng});
  relation["leisure"="park"](around:${r},${lat},${lng});
  // Hospitals
  node["amenity"="hospital"](around:${r},${lat},${lng});
  way["amenity"="hospital"](around:${r},${lat},${lng});
  // GPs / doctors
  node["amenity"="doctors"](around:${r},${lat},${lng});
  way["amenity"="doctors"](around:${r},${lat},${lng});
  // Dentists
  node["amenity"="dentist"](around:${r},${lat},${lng});
  way["amenity"="dentist"](around:${r},${lat},${lng});
  // Schools
  node["amenity"="school"](around:${r},${lat},${lng});
  way["amenity"="school"](around:${r},${lat},${lng});
  // Libraries
  node["amenity"="library"](around:${r},${lat},${lng});
  way["amenity"="library"](around:${r},${lat},${lng});
);
out tags;
  `.trim();

  const data = await overpassQuery(query);
  const elements = data.elements || [];

  const shops = new Set();
  let pubs = 0, gyms = 0, clothesShops = 0, sportsFacilities = 0;
  let parks = 0, cinemas = 0, hospitals = 0, gps = 0, dentists = 0;
  let schools = 0, libraries = 0;

  const counted = new Set();

  for (const el of elements) {
    if (counted.has(el.id)) continue;
    counted.add(el.id);
    const tags = el.tags || {};

    // Shops by brand/name
    const brand = tags.brand || tags.name || '';
    for (const [brandName, shopKey] of Object.entries(SHOP_BRANDS)) {
      if (brand.toLowerCase().includes(brandName.toLowerCase())) {
        shops.add(shopKey);
      }
    }

    const amenity = tags.amenity || '';
    const leisure = tags.leisure || '';
    const shop = tags.shop || '';

    if (amenity === 'pub' || amenity === 'bar') pubs++;
    if (leisure === 'fitness_centre' || leisure === 'sports_centre') gyms++;
    if (shop === 'clothes') clothesShops++;
    if (amenity === 'cinema') cinemas++;
    if (['pitch', 'stadium', 'swimming_pool', 'ice_rink'].includes(leisure)) sportsFacilities++;
    if (leisure === 'park') parks++;
    if (amenity === 'hospital') hospitals++;
    if (amenity === 'doctors') gps++;
    if (amenity === 'dentist') dentists++;
    if (amenity === 'school') schools++;
    if (amenity === 'library') libraries++;
  }

  return {
    shops: [...shops],
    recreation: { pubs, gyms, clothesShops, sportsFacilities, parks },
    amenities: { schools, libraries, cinemas },
    healthcare: { hospitals, gps, dentists },
  };
}

// Extract area stubs (id, lat, lng) from areas.ts
function parseAreaStubs(src) {
  const stubs = [];
  const lines = src.split('\n');
  let currentId = null, currentLat = null, currentLng = null;

  for (const line of lines) {
    const idMatch = line.match(/id:\s*'([^']+)'/);
    if (idMatch) currentId = idMatch[1];

    const latMatch = line.match(/lat:\s*([\d.]+)/);
    if (latMatch) currentLat = parseFloat(latMatch[1]);

    const lngMatch = line.match(/lng:\s*(-?[\d.]+)/);
    if (lngMatch) currentLng = parseFloat(lngMatch[1]);

    if (currentId && currentLat !== null && currentLng !== null) {
      stubs.push({ id: currentId, lat: currentLat, lng: currentLng });
      currentId = null; currentLat = null; currentLng = null;
    }
  }
  return stubs;
}

/**
 * Patch a single area in the TypeScript source string with OSM data.
 * Preserves beaches, hasHiking, hasCycling from the existing data.
 */
function patchAreaInSource(src, areaId, osmData) {
  const lines = src.split('\n');
  let inTargetArea = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Entering the target area block
    if (!inTargetArea) {
      if (line.includes(`id: '${areaId}'`)) {
        inTargetArea = true;
      }
      continue;
    }

    // End of area block: a line that is exactly "  }," or "  }" (2-space indent, closing brace)
    if (/^  \},?\s*$/.test(line)) {
      inTargetArea = false;
      continue;
    }

    const indent = (line.match(/^(\s+)/) || ['', '    '])[1];

    // Patch shops line
    if (/^\s+shops:/.test(line)) {
      const shopsArr = osmData.shops.map(s => `'${s}'`).join(', ');
      lines[i] = `${indent}shops: [${shopsArr}],`;
    }

    // Patch recreation line — preserve beaches/hasHiking/hasCycling
    else if (/^\s+recreation:/.test(line)) {
      const rec = osmData.recreation;
      const beachMatch = line.match(/beaches:\s*(\d+)/);
      const hikingMatch = line.match(/hasHiking:\s*(true|false)/);
      const cyclingMatch = line.match(/hasCycling:\s*(true|false)/);
      const beaches = beachMatch ? parseInt(beachMatch[1]) : 0;
      const hasHiking = hikingMatch ? hikingMatch[1] === 'true' : false;
      const hasCycling = cyclingMatch ? cyclingMatch[1] === 'true' : false;
      lines[i] = `${indent}recreation: { parks: ${rec.parks}, beaches: ${beaches}, hasHiking: ${hasHiking}, hasCycling: ${hasCycling}, pubs: ${rec.pubs}, gyms: ${rec.gyms}, clothesShops: ${rec.clothesShops}, sportsFacilities: ${rec.sportsFacilities} },`;
    }

    // Patch amenities line
    else if (/^\s+amenities:/.test(line)) {
      const am = osmData.amenities;
      lines[i] = `${indent}amenities: { schools: ${am.schools}, libraries: ${am.libraries}, cinemas: ${am.cinemas} },`;
    }

    // Patch healthcare line
    else if (/^\s+healthcare:/.test(line)) {
      const hc = osmData.healthcare;
      lines[i] = `${indent}healthcare: { hospitals: ${hc.hospitals}, gps: ${hc.gps}, dentists: ${hc.dentists} },`;
    }
  }

  return lines.join('\n');
}

async function main() {
  console.log('Settle OSM Data Fetcher');
  console.log('=======================');
  console.log(`Querying Overpass API for each area (radius: ${RADIUS}m)...\n`);

  let src = readFileSync(AREAS_FILE, 'utf-8');
  const stubs = parseAreaStubs(src);

  if (stubs.length === 0) {
    console.error('Could not parse area stubs from areas.ts. Check the file format.');
    process.exit(1);
  }

  console.log(`Found ${stubs.length} areas to update.\n`);

  // Load previously-fetched results so we can skip areas we already have
  const resultsPath = join(__dirname, 'osm-results.json');
  let results = {};
  try {
    results = JSON.parse(readFileSync(resultsPath, 'utf-8'));
    const already = Object.keys(results).length;
    if (already > 0) console.log(`Resuming: ${already} areas already fetched, skipping those.\n`);
  } catch { /* no prior results */ }

  // Re-apply any already-fetched results to keep areas.ts in sync
  if (Object.keys(results).length > 0) {
    for (const [id, data] of Object.entries(results)) {
      src = patchAreaInSource(src, id, data);
    }
  }

  let success = 0, failed = 0, skipped = 0;

  for (const stub of stubs) {
    // Skip if we already have data for this area
    if (results[stub.id]) {
      process.stdout.write(`  Skipping ${stub.id.padEnd(25)}(already fetched)\n`);
      skipped++;
      continue;
    }

    process.stdout.write(`  Fetching ${stub.id.padEnd(25)}`);
    try {
      const data = await fetchAreaData(stub);
      results[stub.id] = data;
      process.stdout.write(
        `✓  shops:${String(data.shops.length).padStart(2)}  pubs:${String(data.recreation.pubs).padStart(3)}  gyms:${String(data.recreation.gyms).padStart(2)}  hospitals:${data.healthcare.hospitals}\n`
      );
      // Patch this area into the source immediately
      src = patchAreaInSource(src, stub.id, data);
      success++;
    } catch (err) {
      process.stdout.write(`✗  ${err.message}\n`);
      failed++;
    }
    await sleep(DELAY_MS);
  }

  // Update the DATA NOTICE timestamp
  const now = new Date().toISOString().slice(0, 10);
  src = src.replace(
    /\/\/ Shops \/ amenities \/ recreation: estimated counts.*$/m,
    `// Shops / amenities / recreation: last refreshed from OpenStreetMap Overpass API on ${now}.`
  );

  // Write patched areas.ts
  writeFileSync(AREAS_FILE, src);
  console.log(`\n✓ areas.ts updated with live OSM data.`);

  // Also dump the raw JSON for reference
  const outPath = join(__dirname, 'osm-results.json');
  writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`✓ Raw results saved to: ${outPath}`);

  console.log(`\nDone: ${success} succeeded, ${skipped} skipped (already had data), ${failed} failed.`);

  if (failed > 0) {
    console.log('\nAreas that failed will retain their previous values.');
    console.log('Re-run the script to retry failed areas.');
  }

  console.log('\nNote: beaches, hiking, and cycling require manual verification —');
  console.log('OSM tagging is inconsistent for these across Irish areas.');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
