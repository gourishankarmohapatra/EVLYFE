// Mock API Layer - EVLYFE
const API = {
  vehicles: [],
  brands: [],
  dealers: [],
  blogs: [],
  comparisons: [],
  faqs: [],
  upcoming: [],
  chargingStations: [],
  companies: [],

  async loadData() {
    try {
      const [vehiclesRes, brandsRes, dealersRes, blogsRes, comparisonsRes, faqsRes, upcomingRes, chargingRes, companiesRes] = await Promise.all([
        fetch('data/vehicles.json'),
        fetch('data/brands.json'),
        fetch('data/dealers.json'),
        fetch('data/blogs.json'),
        fetch('data/comparisons.json'),
        fetch('data/faqs.json'),
        fetch('data/upcoming.json'),
        fetch('data/charging-stations.json'),
        fetch('data/companies.json')
      ]);

      const vehiclesData = await vehiclesRes.json();
      this.vehicles = vehiclesData.docs;
      this.brands = (await brandsRes.json()).brands;
      this.dealers = (await dealersRes.json()).dealers;
      this.blogs = (await blogsRes.json()).blogs;
      this.comparisons = (await comparisonsRes.json()).comparisons;
      this.faqs = (await faqsRes.json()).faqs;
      this.upcoming = (await upcomingRes.json()).upcoming;
      this.chargingStations = (await chargingRes.json());
      this.companies = (await companiesRes.json()).companies;

      return true;
    } catch (err) {
      console.error('Error loading data:', err);
      return false;
    }
  },

  getVehicles(filters = {}) {
    let result = [...this.vehicles];

    if (filters.vehicle_type) {
      const types = filters.vehicle_type.split(',').map(Number);
      result = result.filter(v => types.includes(v.vehicle_type));
    }

    if (filters.vehicle_type_string) {
      const types = filters.vehicle_type_string.split(',');
      result = result.filter(v => types.includes(v.vehicle_type_name));
    }

    if (filters.brand) {
      const brands = filters.brand.split(',');
      result = result.filter(v => brands.includes(v.companySlug));
    }

    if (filters.min_price) {
      result = result.filter(v => v.total_price >= Number(filters.min_price));
    }

    if (filters.max_price) {
      result = result.filter(v => v.total_price <= Number(filters.max_price));
    }

    if (filters.min_range) {
      result = result.filter(v => v.true_range >= Number(filters.min_range));
    }

    if (filters.search) {
      const s = filters.search.toLowerCase();
      result = result.filter(v =>
        v.title.toLowerCase().includes(s) ||
        v.company.toLowerCase().includes(s) ||
        v.subtitle.toLowerCase().includes(s)
      );
    }

    // Sorting
    switch (filters.sort) {
      case 'price_low':
        result.sort((a, b) => a.total_price - b.total_price);
        break;
      case 'price_high':
        result.sort((a, b) => b.total_price - a.total_price);
        break;
      case 'range':
        result.sort((a, b) => b.true_range - a.true_range);
        break;
      case 'speed':
        result.sort((a, b) => b.top_speed - a.top_speed);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      default:
        result.sort((a, b) => b.review_count - a.review_count);
    }

    const totalDocs = result.length;
    const page = filters.page || 1;
    const limit = filters.limit || 10;
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
      nextPage: page < totalPages ? page + 1 : null
    };
  },

  getVehicleBySlug(slug) {
    return this.vehicles.find(v => v.slug === slug);
  },

  getVehiclesByType(type) {
    return this.vehicles.filter(v => v.vehicle_type === type);
  },

  getBrands() {
    return this.brands;
  },

  getBrandBySlug(slug) {
    return this.brands.find(b => b.slug === slug);
  },

  getDealers(state, city) {
    let result = [...this.dealers];
    if (state) result = result.filter(d => d.state === state);
    if (city) result = result.filter(d => d.city === city);
    return result;
  },

  getStates() {
    return [...new Set(this.dealers.map(d => d.state))];
  },

  getCitiesByState(state) {
    if (!state) return [...new Set(this.dealers.map(d => d.city))];
    return [...new Set(this.dealers.filter(d => d.state === state).map(d => d.city))];
  },

  getBlogs() {
    return this.blogs;
  },

  getBlogBySlug(slug) {
    return this.blogs.find(b => b.slug === slug);
  },

  getComparisons() {
    return this.comparisons;
  },

  getComparisonByIds(ids) {
    return ids.map(id => this.vehicles.find(v => v._id === id)).filter(Boolean);
  },

  getFAQs() {
    return this.faqs;
  },

  getPopularVehicles(limit = 10) {
    return [...this.vehicles]
      .sort((a, b) => b.review_count - a.review_count)
      .slice(0, limit);
  },

  getLatestVehicles(limit = 6) {
    return [...this.vehicles]
      .sort((a, b) => new Date(b.launch_date) - new Date(a.launch_date))
      .slice(0, limit);
  },

  getVehicleTypes() {
    const types = {};
    this.vehicles.forEach(v => {
      const name = v.vehicle_type_name;
      types[name] = (types[name] || 0) + 1;
    });
    return types;
  },

  // NEW: Upcoming vehicles
  getUpcomingVehicles() {
    return this.upcoming || [];
  },

  // NEW: Vehicles by budget range
  getVehiclesByBudget(min, max) {
    return this.vehicles.filter(v => {
      if (min && v.total_price < min) return false;
      if (max && v.total_price > max) return false;
      return true;
    });
  },

  // NEW: Get top vehicles for spotlight (by type, sorted by popularity)
  getSpotlightVehicles(typeName, limit = 10) {
    return this.vehicles
      .filter(v => v.vehicle_type_name === typeName)
      .sort((a, b) => b.review_count - a.review_count)
      .slice(0, limit);
  },

  // NEW: Budget ranges
  getBudgetRanges() {
    return [
      { label: 'Under ₹1 Lakh', min: 0, max: 100000, slug: 'under-1-lakh' },
      { label: '₹1 - 3 Lakh', min: 100000, max: 300000, slug: '1-3-lakh' },
      { label: '₹3 - 5 Lakh', min: 300000, max: 500000, slug: '3-5-lakh' },
      { label: '₹5 - 10 Lakh', min: 500000, max: 1000000, slug: '5-10-lakh' },
      { label: '₹10 - 20 Lakh', min: 1000000, max: 2000000, slug: '10-20-lakh' },
      { label: 'Above ₹20 Lakh', min: 2000000, max: Infinity, slug: 'above-20-lakh' }
    ];
  },

  // NEW: Charging stations
  getChargingStations(state, city) {
    let result = this.chargingStations.charging_stations || [];
    if (state) result = result.filter(s => s.state === state);
    if (city) result = result.filter(s => s.city === city);
    return result;
  },

  getChargingStates() {
    return this.chargingStations.states || [];
  },

  getChargingCitiesByState(state) {
    if (!state) return [];
    return this.chargingStations.cities_by_state[state] || [];
  },

  // NEW: Search vehicles
  searchVehicles(query) {
    const s = query.toLowerCase();
    return this.vehicles.filter(v =>
      v.title.toLowerCase().includes(s) ||
      v.company.toLowerCase().includes(s) ||
      v.vehicle_type_name.toLowerCase().includes(s)
    );
  },

  // NEW: Get recently viewed from localStorage
  getRecentlyViewed() {
    try {
      return JSON.parse(localStorage.getItem('evlyfe_recently_viewed') || '[]');
    } catch { return []; }
  },

  addToRecentlyViewed(slug) {
    let recent = this.getRecentlyViewed();
    recent = recent.filter(r => r.slug !== slug);
    const vehicle = this.getVehicleBySlug(slug);
    if (vehicle) {
      recent.unshift({ slug: vehicle.slug, title: vehicle.title, image: vehicle.image, price: vehicle.price_display });
      if (recent.length > 6) recent = recent.slice(0, 6);
      localStorage.setItem('evlyfe_recently_viewed', JSON.stringify(recent));
    }
  },

  // NEW: Alert me for upcoming
  saveAlert(email, vehicleTitle) {
    try {
      let alerts = JSON.parse(localStorage.getItem('evlyfe_alerts') || '[]');
      alerts.push({ email, vehicle: vehicleTitle, date: new Date().toISOString() });
      localStorage.setItem('evlyfe_alerts', JSON.stringify(alerts));
      return true;
    } catch { return false; }
  },

  // ========== COMPANIES METHODS ==========

  getCompanies(filters = {}) {
    let result = [...this.companies];

    if (filters.vehicle_type) {
      const types = filters.vehicle_type.split(',').map(Number);
      result = result.filter(c => types.includes(c.vehicle_type));
    }

    if (filters.state) {
      result = result.filter(c => c.state === filters.state);
    }

    if (filters.search) {
      const s = filters.search.toLowerCase();
      result = result.filter(c =>
        c.title.toLowerCase().includes(s) ||
        c.city.toLowerCase().includes(s) ||
        c.state.toLowerCase().includes(s) ||
        c.field.toLowerCase().includes(s) ||
        c.description.toLowerCase().includes(s)
      );
    }

    switch (filters.sort) {
      case 'name':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'products':
        result.sort((a, b) => b.productCount - a.productCount);
        break;
      case 'views':
        result.sort((a, b) => b.views - a.views);
        break;
      default:
        result.sort((a, b) => b.views - a.views);
    }

    const totalDocs = result.length;
    const page = filters.page || 1;
    const limit = filters.limit || 12;
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
      nextPage: page < totalPages ? page + 1 : null
    };
  },

  getCompanyBySlug(slug) {
    return this.companies.find(c => c.slug === slug);
  },

  getCompaniesByVehicleType(type) {
    return this.companies.filter(c => c.vehicle_type === type);
  },

  getCompanyStates() {
    return [...new Set(this.companies.map(c => c.state))].sort();
  },

  searchCompanies(query) {
    const s = query.toLowerCase();
    return this.companies.filter(c =>
      c.title.toLowerCase().includes(s) ||
      c.city.toLowerCase().includes(s) ||
      c.state.toLowerCase().includes(s) ||
      c.description.toLowerCase().includes(s)
    );
  },

  getCompanyVehicleTypes() {
    const types = {};
    this.companies.forEach(c => {
      const name = c.vehicle_type_name;
      types[name] = (types[name] || 0) + 1;
    });
    return types;
  },

  getVehiclesByCompanySlug(companySlug) {
    const company = this.getCompanyBySlug(companySlug);
    if (!company) return [];
    return this.vehicles.filter(v => v.companySlug === company.vehicle_prefix.toLowerCase());
  }
};
