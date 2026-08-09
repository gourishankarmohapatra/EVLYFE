const fs = require('fs');
const path = require('path');

const dataDir = path.join(process.cwd(), 'lib', 'data');

let vehicles = [];
let brands = [];
let dealers = [];
let blogs = [];
let comparisons = [];
let faqs = [];
let upcoming = [];
let chargingStations = {};
let companies = [];

function loadData() {
  try {
    const vehiclesData = JSON.parse(fs.readFileSync(path.join(dataDir, 'vehicles.json'), 'utf8'));
    vehicles = vehiclesData.docs || [];

    const brandsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'brands.json'), 'utf8'));
    brands = brandsData.brands || [];

    const dealersData = JSON.parse(fs.readFileSync(path.join(dataDir, 'dealers.json'), 'utf8'));
    dealers = dealersData.dealers || [];

    const blogsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'blogs.json'), 'utf8'));
    blogs = blogsData.blogs || [];

    const comparisonsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'comparisons.json'), 'utf8'));
    comparisons = comparisonsData.comparisons || [];

    const faqsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'faqs.json'), 'utf8'));
    faqs = faqsData.faqs || [];

    const upcomingData = JSON.parse(fs.readFileSync(path.join(dataDir, 'upcoming.json'), 'utf8'));
    upcoming = upcomingData.upcoming || [];

    chargingStations = JSON.parse(fs.readFileSync(path.join(dataDir, 'charging-stations.json'), 'utf8'));

    const companiesData = JSON.parse(fs.readFileSync(path.join(dataDir, 'companies.json'), 'utf8'));
    companies = companiesData.companies || [];

    return true;
  } catch (err) {
    console.error('Error loading data:', err.message);
    return false;
  }
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
    const s = filters.search.toLowerCase();
    result = result.filter(
      (v) =>
        v.title.toLowerCase().includes(s) ||
        v.company.toLowerCase().includes(s) ||
        v.subtitle.toLowerCase().includes(s)
    );
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
    const s = filters.search.toLowerCase();
    result = result.filter(
      (c) =>
        c.title.toLowerCase().includes(s) ||
        c.city.toLowerCase().includes(s) ||
        c.state.toLowerCase().includes(s) ||
        c.field.toLowerCase().includes(s) ||
        c.description.toLowerCase().includes(s)
    );
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
  const s = query.toLowerCase();
  return vehicles.filter(
    (v) =>
      v.title.toLowerCase().includes(s) ||
      v.company.toLowerCase().includes(s) ||
      v.vehicle_type_name.toLowerCase().includes(s)
  );
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
  const s = query.toLowerCase();
  return companies.filter(
    (c) =>
      c.title.toLowerCase().includes(s) ||
      c.city.toLowerCase().includes(s) ||
      c.state.toLowerCase().includes(s) ||
      c.description.toLowerCase().includes(s)
  );
}

function getCompaniesByVehicleType(type) {
  return companies.filter((c) => c.vehicle_type === type);
}

// Initialize data on module load
loadData();

module.exports = {
  vehicles,
  brands,
  dealers,
  blogs,
  comparisons,
  faqs,
  upcoming,
  chargingStations,
  companies,
  loadData,
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
