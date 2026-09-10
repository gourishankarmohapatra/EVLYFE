import vehiclesRaw from './vehicles.json';
import brandsRaw from './brands.json';
import dealersRaw from './dealers.json';
import blogsRaw from './blogs.json';
import comparisonsRaw from './comparisons.json';
import faqsRaw from './faqs.json';
import upcomingRaw from './upcoming.json';
import chargingStationsRaw from './charging-stations.json';
import companiesRaw from './companies.json';

const vehicles = vehiclesRaw.docs || [];
const brands = brandsRaw.brands || [];
const dealers = dealersRaw.dealers || [];
const blogs = blogsRaw.blogs || [];
const comparisons = comparisonsRaw.comparisons || [];
const faqs = faqsRaw.faqs || [];
const upcoming = upcomingRaw.upcoming || [];
const chargingStations = chargingStationsRaw;
const companies = companiesRaw.companies || [];

// ── Fuzzy Search Utility ──

const BRAND_ALIASES = {
  'nexon': 'nexon', 'nexn': 'nexon', 'nexo': 'nexon', 'nexan': 'nexon',
  'ola': 'ola', 'olaa': 'ola', 'ollaa': 'ola',
  'ather': 'ather', 'atheer': 'ather', 'athr': 'ather',
  'tata': 'tata', 'tta': 'tata', 'tatt': 'tata',
  'mahindra': 'mahindra', 'mahind': 'mahindra',
  'tvs': 'tvs', 'bajaj': 'bajaj', 'bajjaj': 'bajaj',
  'hero': 'hero', 'heero': 'hero',
  'bgauss': 'bgauss', 'bgaus': 'bgauss', 'bguss': 'bgauss',
  'ampere': 'ampere', 'ampr': 'ampere', 'ampeer': 'ampere',
  'revolt': 'revolt', 'revoltt': 'revolt',
  'omega': 'omega', 'pureev': 'pureev', 'pure ev': 'pureev',
  'tork': 'tork', 'torq': 'tork',
  'ultraviolette': 'ultraviolette', 'ultra violet': 'ultraviolette',
  'river': 'river', 'rivr': 'river',
  'mg': 'mg', 'mgmotor': 'mg',
  'hyundai': 'hyundai', 'hyundei': 'hyundai', 'hyundia': 'hyundai',
  'kia': 'kia', 'kiia': 'kia',
  'toyota': 'toyota', 'toyta': 'toyota',
  'mercedes': 'mercedes', 'mercedez': 'mercedes',
  'bmw': 'bmw', 'bmww': 'bmw',
  'byd': 'byd', 'bydd': 'byd',
  'citroen': 'citroen', 'citroën': 'citroen',
  'volkswagen': 'volkswagen', 'volkswagon': 'volkswagen',
  'honda': 'honda', 'hondaa': 'honda',
  'ola electric': 'ola', 'tata motors': 'tata', 'ather energy': 'ather',
  'mg motor': 'mg', 'tvs motor': 'tvs',
};

function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = b.charAt(i - 1) === a.charAt(j - 1) ? 0 : 1;
      matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
    }
  }
  return matrix[b.length][a.length];
}

function fuzzyNormalize(str) {
  return str.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
}

function resolveAlias(query) {
  const normalized = fuzzyNormalize(query);
  if (BRAND_ALIASES[normalized]) return BRAND_ALIASES[normalized];
  for (const [alias, canonical] of Object.entries(BRAND_ALIASES)) {
    if (normalized.includes(alias) || alias.includes(normalized)) return canonical;
  }
  return null;
}

function fuzzyWordScore(query, word) {
  const q = fuzzyNormalize(query);
  const w = fuzzyNormalize(word);
  if (w === q) return 1.0;
  if (w.startsWith(q)) return 0.95;
  if (w.includes(q)) return 0.85;
  const alias = resolveAlias(q);
  if (alias && w.includes(alias)) return 0.9;
  if (alias && fuzzyNormalize(w).startsWith(alias)) return 0.88;
  const maxLen = Math.max(q.length, w.length);
  if (maxLen === 0) return 1.0;
  const dist = levenshtein(q, w);
  const threshold = Math.max(1, Math.floor(maxLen * 0.4));
  if (dist <= threshold) return 0.7 - (dist / maxLen) * 0.5;
  const qWords = q.split(/\s+/);
  const wWords = w.split(/\s+/);
  let bestWordMatch = 0;
  for (const qw of qWords) {
    for (const ww of wWords) {
      const ws = fuzzyWordScore(qw, ww);
      if (ws > bestWordMatch) bestWordMatch = ws;
    }
  }
  if (bestWordMatch > 0.5) return bestWordMatch * 0.8;
  return 0;
}

function fuzzyMatchScore(query, target) {
  if (!query || !target) return 0;
  const q = fuzzyNormalize(query);
  const t = fuzzyNormalize(target);
  if (t === q) return 1.0;
  if (t.startsWith(q)) return 0.95;
  if (t.includes(q)) return 0.85;
  const alias = resolveAlias(q);
  if (alias) {
    if (t.includes(alias)) return 0.9;
    if (t.startsWith(alias)) return 0.88;
  }
  const tWords = t.split(/\s+/);
  let best = 0;
  for (const word of tWords) {
    const s = fuzzyWordScore(q, word);
    if (s > best) best = s;
  }
  if (best > 0.5) return best * 0.8;
  const maxLen = Math.max(q.length, t.length);
  if (maxLen === 0) return 1.0;
  const dist = levenshtein(q, t);
  const threshold = Math.max(2, Math.floor(maxLen * 0.35));
  if (dist <= threshold) return 0.6 - (dist / maxLen) * 0.4;
  return 0;
}

function fuzzyFilter(query, items, fields, minScore = 0.4) {
  if (!query || !items || !items.length) return [];
  const scored = [];
  for (const item of items) {
    let bestScore = 0;
    for (const field of fields) {
      const val = item[field];
      if (!val) continue;
      const s = fuzzyMatchScore(query, String(val));
      if (s > bestScore) bestScore = s;
    }
    if (bestScore >= minScore) scored.push({ item, score: bestScore });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.map(s => s.item);
}

function paginate(result, page = 1, limit = 10) {
  const totalDocs = result.length;
  const totalPages = Math.ceil(totalDocs / limit);
  const start = (page - 1) * limit;
  const docs = result.slice(start, start + limit);
  return {
    docs,
    totalDocs,
    page,
    totalPages,
    limit,
    hasPrevPage: page > 1,
    hasNextPage: page < totalPages,
    prevPage: page > 1 ? page - 1 : null,
    nextPage: page < totalPages ? page + 1 : null,
  };
}

function getVehicles(filters = {}) {
  let result = [...vehicles];

  if (filters.vehicle_type) {
    const types = filters.vehicle_type.split(',').map(Number);
    result = result.filter((v) => types.includes(v.vehicle_type));
  }
  if (filters.vehicle_type_string) {
    const types = filters.vehicle_type_string.split(',');
    result = result.filter((v) => types.includes(v.vehicle_type_name));
  }
  if (filters.brand) {
    const brandList = filters.brand.split(',');
    result = result.filter((v) => brandList.includes(v.companySlug));
  }
  if (filters.min_price) result = result.filter((v) => v.total_price >= Number(filters.min_price));
  if (filters.max_price) result = result.filter((v) => v.total_price <= Number(filters.max_price));
  if (filters.min_range) result = result.filter((v) => v.true_range >= Number(filters.min_range));
  if (filters.search) {
    result = fuzzyFilter(filters.search, result, ['title', 'company', 'subtitle']);
  }

  switch (filters.sort) {
    case 'price_low': result.sort((a, b) => a.total_price - b.total_price); break;
    case 'price_high': result.sort((a, b) => b.total_price - a.total_price); break;
    case 'range': result.sort((a, b) => b.true_range - a.true_range); break;
    case 'speed': result.sort((a, b) => b.top_speed - a.top_speed); break;
    case 'rating': result.sort((a, b) => b.rating - a.rating); break;
    default: result.sort((a, b) => b.review_count - a.review_count);
  }

  return paginate(result, Number(filters.page) || 1, Number(filters.limit) || 10);
}

function getVehicleBySlug(slug) {
  return vehicles.find((v) => v.slug === slug) || null;
}

function getBrands() {
  return brands;
}

function getBrandBySlug(slug) {
  return brands.find((b) => b.slug === slug) || null;
}

function getDealers(state, city) {
  let result = [...dealers];
  if (state) result = result.filter((d) => d.state === state);
  if (city) result = result.filter((d) => d.city === city);
  return result;
}

function getStates() {
  return [...new Set(dealers.map((d) => d.state))];
}

function getCitiesByState(state) {
  if (!state) return [...new Set(dealers.map((d) => d.city))];
  return [...new Set(dealers.filter((d) => d.state === state).map((d) => d.city))];
}

function getBlogs() {
  return blogs;
}

function getBlogBySlug(slug) {
  return blogs.find((b) => b.slug === slug) || null;
}

function getComparisons() {
  return comparisons;
}

function getComparisonByIds(ids) {
  return ids.map((id) => vehicles.find((v) => v._id === id)).filter(Boolean);
}

function getFAQs() {
  return faqs;
}

function getUpcomingVehicles() {
  return upcoming;
}

function getChargingStations(state, city) {
  let result = chargingStations.charging_stations || [];
  if (state) result = result.filter((s) => s.state === state);
  if (city) result = result.filter((s) => s.city === city);
  return result;
}

function getChargingStates() {
  return chargingStations.states || [];
}

function getChargingCitiesByState(state) {
  if (!state) return [];
  return chargingStations.cities_by_state[state] || [];
}

function getCompanies(filters = {}) {
  let result = [...companies];

  if (filters.vehicle_type) {
    const types = filters.vehicle_type.split(',').map(Number);
    result = result.filter((c) => types.includes(c.vehicle_type));
  }
  if (filters.state) result = result.filter((c) => c.state === filters.state);
  if (filters.search) {
    result = fuzzyFilter(filters.search, result, ['title', 'city', 'state', 'field', 'description']);
  }

  switch (filters.sort) {
    case 'name': result.sort((a, b) => a.title.localeCompare(b.title)); break;
    case 'products': result.sort((a, b) => b.productCount - a.productCount); break;
    case 'views': result.sort((a, b) => b.views - a.views); break;
    default: result.sort((a, b) => b.views - a.views);
  }

  return paginate(result, Number(filters.page) || 1, Number(filters.limit) || 12);
}

function getCompanyBySlug(slug) {
  return companies.find((c) => c.slug === slug) || null;
}

function getCompanyStates() {
  return [...new Set(companies.map((c) => c.state))].sort();
}

function getCompanyVehicleTypes() {
  const types = {};
  companies.forEach((c) => {
    const name = c.vehicle_type_name;
    types[name] = (types[name] || 0) + 1;
  });
  return types;
}

function getVehiclesByCompanySlug(companySlug) {
  const company = getCompanyBySlug(companySlug);
  if (!company) return [];
  return vehicles.filter((v) => v.companySlug === company.vehicle_prefix.toLowerCase());
}

function searchVehicles(query) {
  return fuzzyFilter(query, vehicles, ['title', 'company', 'vehicle_type_name']);
}

function getVehicleTypes() {
  const types = {};
  vehicles.forEach((v) => {
    const name = v.vehicle_type_name;
    types[name] = (types[name] || 0) + 1;
  });
  return types;
}

function getPopularVehicles(limit = 10) {
  return [...vehicles].sort((a, b) => b.review_count - a.review_count).slice(0, limit);
}

function getLatestVehicles(limit = 6) {
  return [...vehicles].sort((a, b) => new Date(b.launch_date) - new Date(a.launch_date)).slice(0, limit);
}

function getSpotlightVehicles(typeName, limit = 10) {
  return vehicles
    .filter((v) => v.vehicle_type_name === typeName)
    .sort((a, b) => b.review_count - a.review_count)
    .slice(0, limit);
}

function getVehiclesByBudget(min, max) {
  return vehicles.filter((v) => {
    if (min && v.total_price < min) return false;
    if (max && v.total_price > max) return false;
    return true;
  });
}

function getBudgetRanges() {
  return [
    { label: 'Under ₹1 Lakh', min: 0, max: 100000, slug: 'under-1-lakh' },
    { label: '₹1 - 3 Lakh', min: 100000, max: 300000, slug: '1-3-lakh' },
    { label: '₹3 - 5 Lakh', min: 300000, max: 500000, slug: '3-5-lakh' },
    { label: '₹5 - 10 Lakh', min: 500000, max: 1000000, slug: '5-10-lakh' },
    { label: '₹10 - 20 Lakh', min: 1000000, max: 2000000, slug: '10-20-lakh' },
    { label: 'Above ₹20 Lakh', min: 2000000, max: Infinity, slug: 'above-20-lakh' },
  ];
}

function searchCompanies(query) {
  return fuzzyFilter(query, companies, ['title', 'city', 'state', 'description']);
}

function getCompaniesByVehicleType(type) {
  return companies.filter((c) => c.vehicle_type === type);
}

export {
  vehicles,
  brands,
  dealers,
  blogs,
  comparisons,
  faqs,
  upcoming,
  chargingStations,
  companies,
  getVehicles,
  getVehicleBySlug,
  getBrands,
  getBrandBySlug,
  getDealers,
  getStates,
  getCitiesByState,
  getBlogs,
  getBlogBySlug,
  getComparisons,
  getComparisonByIds,
  getFAQs,
  getUpcomingVehicles,
  getChargingStations,
  getChargingStates,
  getChargingCitiesByState,
  getCompanies,
  getCompanyBySlug,
  getCompanyStates,
  getCompanyVehicleTypes,
  getVehiclesByCompanySlug,
  searchVehicles,
  getVehicleTypes,
  getPopularVehicles,
  getLatestVehicles,
  getSpotlightVehicles,
  getVehiclesByBudget,
  getBudgetRanges,
  searchCompanies,
  getCompaniesByVehicleType,
  paginate,
};
