// Navigation Component - EVLYFE
const Navigation = {
  cities: [
    'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune',
    'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Noida', 'Gurgaon'
  ],

  getSelectedCity() {
    return localStorage.getItem('evlyfe_city') || '';
  },

  setSelectedCity(city) {
    localStorage.setItem('evlyfe_city', city);
    const el = document.getElementById('selectedCity');
    if (el) el.textContent = city || '';
    if (typeof window.onCityChange === 'function') window.onCityChange(city);
  },

  getHeader() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const selectedCity = this.getSelectedCity();

    return `
      <div class="desktop-header">
        <div class="header-top-bar">
          <div class="container d-flex justify-content-between align-items-center">
            <div class="social-icons">
              <a href="#" title="Facebook"><i class="bi bi-facebook"></i></a>
              <a href="#" title="Instagram"><i class="bi bi-instagram"></i></a>
              <a href="#" title="YouTube"><i class="bi bi-youtube"></i></a>
              <a href="#" title="Twitter"><i class="bi bi-twitter-x"></i></a>
              <a href="#" title="LinkedIn"><i class="bi bi-linkedin"></i></a>
            </div>
            <div class="header-top-nav d-none d-md-flex">
              <a href="index.html">Home</a>
              <a href="companies.html">Companies</a>
              <a href="electric-vehicles.html">Electric Vehicles</a>
              <a href="electric-scooters.html">Electric Scooters</a>
              <a href="electric-bikes.html">Electric Bikes</a>
              <a href="electric-cars.html">Electric Cars</a>
              <a href="compare.html">Compare</a>
              <a href="dealer-showrooms.html">Dealers</a>
              <a href="blog.html">Blog</a>
              <a href="contact.html">Contact</a>
            </div>
          </div>
        </div>
        <div class="header-main">
          <div class="container d-flex align-items-center justify-content-between gap-3">
            <a href="index.html" class="d-flex align-items-center gap-2 text-decoration-none flex-shrink-0">
              <img src="images/logo.png" alt="EVLYFE" style="height:48px;width:auto;">
              <div class="d-none d-sm-block">
                <div style="font-size:18px;font-weight:700;background:linear-gradient(135deg,#1976D2,#26A69A);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1.2;">EVLYFE</div>
                <div style="font-size:8px;color:#888;letter-spacing:1.5px;text-transform:uppercase;">POWERED FOR TOMORROW</div>
              </div>
            </a>

            <div class="city-selector d-none d-lg-flex" id="citySelector">
              <i class="bi bi-geo-alt"></i>
              <span id="selectedCity" class="city-display">${selectedCity || '<span class="city-detecting"><i class="bi bi-crosshair"></i> Detecting...</span>'}</span>
            </div>

            <div class="search-container d-none d-md-block" style="flex:1;max-width:420px;">
              <input type="text" id="headerSearch" placeholder="Search electric vehicles, brands..." autocomplete="off" onkeyup="handleSearchKeyup(event)">
              <button class="search-btn" onclick="handleHeaderSearch()"><i class="bi bi-search"></i></button>
              <div class="search-suggestions" id="searchSuggestions"></div>
            </div>

            <div class="d-flex align-items-center gap-2 header-actions flex-shrink-0">
              <a href="compare.html" class="btn-compare d-none d-md-flex">
                <i class="bi bi-arrow-left-right"></i> Compare
                <span class="compare-badge" id="compareCount">0</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <nav class="mobile-header">
        <button class="hamburger" onclick="toggleMobileSidebar()"><i class="bi bi-list"></i></button>
        <a href="index.html"><img src="images/logo.png" alt="EVLYFE" style="height:34px;"></a>
        <div class="mobile-actions">
          <button onclick="toggleMobileSearch()" class="d-md-none"><i class="bi bi-search"></i></button>
          <a href="compare.html" style="color:var(--text-dark);position:relative;">
            <i class="bi bi-arrow-left-right"></i>
            <span class="compare-badge" style="position:absolute;top:-6px;right:-8px;font-size:9px;" id="mobileCompareCount">0</span>
          </a>
        </div>
      </nav>

      <div class="mobile-search-bar d-md-none" id="mobileSearchBar" style="display:none;">
        <div class="search-container">
          <input type="text" id="mobileHeaderSearch" placeholder="Search electric vehicles..." autocomplete="off" onkeyup="handleSearchKeyup(event)">
          <button class="search-btn" onclick="handleHeaderSearch()"><i class="bi bi-search"></i></button>
        </div>
      </div>

      <div class="mobile-sidebar-overlay" id="sidebarOverlay" onclick="closeMobileSidebar()"></div>
      <div class="mobile-sidebar" id="mobileSidebar">
        <div class="sidebar-header">
          <h3><i class="bi bi-list"></i> Menu</h3>
          <button class="close-btn" onclick="closeMobileSidebar()">&times;</button>
        </div>
        <div class="sidebar-nav">
          <a href="index.html"><i class="bi bi-house"></i> Home</a>
          <a href="companies.html"><i class="bi bi-grid"></i> EV Companies</a>
          <a href="electric-vehicles.html"><i class="bi bi-ev-front"></i> All Electric Vehicles</a>
          <a href="electric-scooters.html"><i class="bi bi-bicycle"></i> Electric Scooters</a>
          <a href="electric-bikes.html"><i class="bi bi-bicycle"></i> Electric Bikes</a>
          <a href="electric-cars.html"><i class="bi bi-car-front"></i> Electric Cars</a>
          <a href="compare.html"><i class="bi bi-arrow-left-right"></i> Compare EVs</a>
          <a href="dealer-showrooms.html"><i class="bi bi-shop"></i> Dealer Showrooms</a>
          <a href="blog.html"><i class="bi bi-newspaper"></i> Blog & News</a>
          <a href="contact.html"><i class="bi bi-envelope"></i> Contact Us</a>
        </div>
        <div class="sidebar-contact">
          <p style="font-weight:600;margin-bottom:8px;"><i class="bi bi-telephone"></i> Contact Us</p>
          <a href="tel:+916370773029">+91 6370773029</a>
          <a href="mailto:evlyfe@gmail.com">evlyfe@gmail.com</a>
        </div>
      </div>

      <!-- Location Permission Popup -->
      <div class="location-popup-overlay" id="locationPopupOverlay"></div>
      <div class="location-popup" id="locationPopup">
        <button class="location-popup-close" onclick="LocationDetector.dismiss()">&times;</button>
        <div class="location-popup-icon">
          <i class="bi bi-geo-alt-fill"></i>
        </div>
        <h3>Enable Auto Location Detection</h3>
        <p>Allow access to your current location to automatically detect your city and show nearby EVs, dealers, and charging stations.</p>
        <div class="location-popup-actions">
          <button class="location-popup-btn location-popup-btn-allow" onclick="LocationDetector.allow()">
            <i class="bi bi-geo-alt"></i> Allow Location Access
          </button>
          <button class="location-popup-btn location-popup-btn-skip" onclick="LocationDetector.dismiss()">
            Skip for now
          </button>
        </div>
        <div class="location-popup-loading" id="locationPopupLoading" style="display:none;">
          <div class="location-spinner"></div>
          <span>Detecting your location...</span>
        </div>
      </div>

      <!-- Location Toast -->
      <div class="location-toast" id="locationToast"></div>

      <!-- Ad - Below Header -->
      <div class="ad-container text-center">
        <ins class="adsbygoogle"
             style="display:block"
             data-ad-client="ca-pub-6950966761441733"
             data-ad-slot="2800185001"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
      </div>
    `;
  },

  getFooter() {
    return `
      <!-- Ad - Above Footer -->
      <div class="ad-container text-center">
        <ins class="adsbygoogle"
             style="display:block"
             data-ad-client="ca-pub-6950966761441733"
             data-ad-slot="2800185001"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
      </div>

      <footer class="footer">
        <div class="container">
          <div class="row">
            <div class="col-12 col-md-6 col-lg-3 footer-col">
              <div class="footer-logo">
                <img src="images/logo.png" alt="EVLYFE" style="height:55px;">
              </div>
              <p class="footer-tagline">POWERED FOR TOMORROW</p>
              <p style="font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;">
                Your trusted platform for discovering and comparing electric vehicles in India. Find the perfect EV for your needs.
              </p>
              <div class="footer-social">
                <a href="#" title="Facebook"><i class="bi bi-facebook"></i></a>
                <a href="#" title="Instagram"><i class="bi bi-instagram"></i></a>
                <a href="#" title="YouTube"><i class="bi bi-youtube"></i></a>
                <a href="#" title="Twitter"><i class="bi bi-twitter-x"></i></a>
                <a href="#" title="LinkedIn"><i class="bi bi-linkedin"></i></a>
              </div>
            </div>
            <div class="col-6 col-md-6 col-lg-3 footer-col">
              <h4>Quick Links</h4>
              <div class="footer-links">
                <a href="index.html">Home</a>
                <a href="companies.html">EV Companies</a>
                <a href="electric-vehicles.html">Electric Vehicles</a>
                <a href="electric-scooters.html">Electric Scooters</a>
                <a href="electric-bikes.html">Electric Bikes</a>
                <a href="electric-cars.html">Electric Cars</a>
                <a href="compare.html">Compare EVs</a>
              </div>
            </div>
            <div class="col-6 col-md-6 col-lg-3 footer-col">
              <h4>Explore</h4>
              <div class="footer-links">
                <a href="dealer-showrooms.html">Dealer Showrooms</a>
                <a href="blog.html">EV News & Blog</a>
                <a href="careers.html">Careers</a>
                <a href="electric-vehicles.html?type=2">Electric Scooters</a>
                <a href="electric-vehicles.html?type=1">Electric Bikes</a>
                <a href="electric-vehicles.html?type=10">Electric Cars</a>
              </div>
            </div>
            <div class="col-12 col-md-6 col-lg-3 footer-col">
              <h4>Contact Us</h4>
              <div class="footer-contact">
                <p><i class="bi bi-telephone"></i> +91 6370773029</p>
                <p><i class="bi bi-envelope"></i> evlyfe@gmail.com</p>
                <p><i class="bi bi-globe"></i> www.evlyfe.com</p>
              </div>
              <div style="margin-top:15px;">
                <p style="font-size:13px;color:rgba(255,255,255,0.7);margin-bottom:8px;">Download Our App</p>
                <div style="display:flex;gap:8px;">
                  <a href="#" style="display:inline-block;padding:6px 12px;background:rgba(255,255,255,0.1);border-radius:6px;font-size:11px;color:white;"><i class="bi bi-google-play"></i> Google Play</a>
                  <a href="#" style="display:inline-block;padding:6px 12px;background:rgba(255,255,255,0.1);border-radius:6px;font-size:11px;color:white;"><i class="bi bi-apple"></i> App Store</a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <div class="container">
            &copy; 2026 EVLYFE. All Rights Reserved. |
            <a href="privacy.html">Privacy Policy</a> |
            <a href="terms.html">Terms & Conditions</a> |
            <a href="careers.html">Careers</a> |
            <a href="mailto:evlyfe@gmail.com">Contact</a>
          </div>
        </div>
      </footer>
    `;
  },

  getBackToTop() {
    return `<button class="back-to-top" id="backToTop" onclick="scrollToTop()"><i class="bi bi-arrow-up"></i></button>`;
  },

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.updateCompareCount();
      const city = this.getSelectedCity();
      const el = document.getElementById('selectedCity');
      if (el && city) el.textContent = city;

      window.addEventListener('scroll', () => {
        const btn = document.getElementById('backToTop');
        if (btn) btn.classList.toggle('visible', window.scrollY > 300);
      });

      // Initialize AdSense ads
      if (typeof adsbygoogle !== 'undefined') {
        (adsbygoogle = window.adsbygoogle || []).push({});
      }
    });
  },

  updateCompareCount() {
    const compareList = JSON.parse(localStorage.getItem('evlyfe_compare') || '[]');
    const count = compareList.length;
    const el = document.getElementById('compareCount');
    const mobileEl = document.getElementById('mobileCompareCount');
    if (el) el.textContent = count;
    if (mobileEl) mobileEl.textContent = count;
  }
};

// Global functions
function toggleMobileSidebar() {
  document.getElementById('mobileSidebar').classList.add('open');
  document.getElementById('sidebarOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeMobileSidebar() {
  document.getElementById('mobileSidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function toggleMobileSearch() {
  const bar = document.getElementById('mobileSearchBar');
  if (bar) {
    bar.style.display = bar.style.display === 'none' ? 'block' : 'none';
    if (bar.style.display === 'block') {
      document.getElementById('mobileHeaderSearch').focus();
    }
  }
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleHeaderSearch() {
  const query = (document.getElementById('headerSearch') || document.getElementById('mobileHeaderSearch'))?.value?.trim();
  if (query) {
    window.location.href = `electric-vehicles.html?search=${encodeURIComponent(query)}`;
  }
}

function handleSearchKeyup(e) {
  if (e.key === 'Enter') handleHeaderSearch();

  // Show suggestions
  const query = e.target.value.trim();
  const suggestionsEl = document.getElementById('searchSuggestions');
  if (!suggestionsEl) return;

  if (query.length < 2) {
    suggestionsEl.style.display = 'none';
    return;
  }

  const results = API.searchVehicles(query).slice(0, 5);
  if (results.length === 0) {
    suggestionsEl.style.display = 'none';
    return;
  }

  suggestionsEl.innerHTML = results.map(v => `
    <a href="vehicle.html?slug=${v.slug}" class="search-suggestion-item">
      <img src="${v.image}" alt="${v.title}">
      <div>
        <div class="suggestion-title">${v.title}</div>
        <div class="suggestion-sub">${v.company} | ${v.price_display}</div>
      </div>
    </a>
  `).join('');
  suggestionsEl.style.display = 'block';
}

// ========== LOCATION DETECTOR ==========
const LocationDetector = {
  STORAGE_KEY: 'evlyfe_location_permission',
  DETECTED_CITY_KEY: 'evlyfe_detected_city',
  STATE_CITY_MAP: {
    'Maharashtra': 'Mumbai',
    'Karnataka': 'Bangalore',
    'Tamil Nadu': 'Chennai',
    'Telangana': 'Hyderabad',
    'West Bengal': 'Kolkata',
    'Gujarat': 'Ahmedabad',
    'Rajasthan': 'Jaipur',
    'Uttar Pradesh': 'Lucknow',
    'Delhi': 'Delhi',
    'Haryana': 'Gurgaon',
    'Noida': 'Noida',
    'Pune': 'Pune'
  },

  init() {
    const permission = localStorage.getItem(this.STORAGE_KEY);
    if (permission === 'allowed') {
      this.detect(false);
    } else if (!permission) {
      setTimeout(() => this.showPopup(), 1500);
    }
  },

  showPopup() {
    const overlay = document.getElementById('locationPopupOverlay');
    const popup = document.getElementById('locationPopup');
    if (overlay && popup) {
      overlay.classList.add('open');
      popup.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  },

  hidePopup() {
    const overlay = document.getElementById('locationPopupOverlay');
    const popup = document.getElementById('locationPopup');
    const loading = document.getElementById('locationPopupLoading');
    if (overlay) overlay.classList.remove('open');
    if (popup) popup.classList.remove('open');
    if (loading) loading.style.display = 'none';
    document.body.style.overflow = '';
  },

  dismiss() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.hidePopup();
  },

  allow() {
    localStorage.setItem(this.STORAGE_KEY, 'allowed');
    const loading = document.getElementById('locationPopupLoading');
    const actions = document.querySelector('.location-popup-actions');
    if (loading) loading.style.display = 'flex';
    if (actions) actions.style.display = 'none';
    this.detect(true);
  },

  detect(showBrowserPrompt) {
    if (!navigator.geolocation) {
      if (showBrowserPrompt) {
        this.showToast('Geolocation is not supported by your browser.', 'error');
        this.hidePopup();
      }
      return;
    }

    const options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 };

    navigator.geolocation.getCurrentPosition(
      (position) => this.onSuccess(position),
      (error) => this.onError(error, showBrowserPrompt),
      options
    );
  },

  async onSuccess(position) {
    const { latitude, longitude } = position.coords;
    try {
      const city = await this.reverseGeocode(latitude, longitude);
      if (city) {
        const matched = this.findMatchingCity(city);
        if (matched) {
          Navigation.setSelectedCity(matched);
          localStorage.setItem(this.DETECTED_CITY_KEY, matched);
          this.showToast(`Location detected: ${matched}`, 'success');
        } else {
          Navigation.setSelectedCity(city);
          localStorage.setItem(this.DETECTED_CITY_KEY, city);
          this.showToast(`Location detected: ${city}`, 'success');
        }
      } else {
        this.showToast('Could not detect city. Please try again later.', 'info');
      }
    } catch (e) {
      this.showToast('Location detection failed.', 'info');
    }
    this.hidePopup();
  },

  onError(error, showBrowserPrompt) {
    this.hidePopup();
    if (showBrowserPrompt) {
      if (error.code === error.PERMISSION_DENIED) {
        this.showToast('Location access denied.', 'info');
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        this.showToast('Location information unavailable.', 'info');
      } else if (error.code === error.TIMEOUT) {
        this.showToast('Location request timed out.', 'info');
      } else {
        this.showToast('Could not detect location.', 'info');
      }
    }
  },

  async reverseGeocode(lat, lng) {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`;
      const response = await fetch(url, {
        headers: { 'Accept-Language': 'en' }
      });
      if (!response.ok) throw new Error('Geocoding failed');
      const data = await response.json();
      return data.address?.city || data.address?.town || data.address?.village || data.address?.county || null;
    } catch (e) {
      return null;
    }
  },

  findMatchingCity(detectedCity) {
    const normalized = detectedCity.toLowerCase().trim();

    for (const city of Navigation.cities) {
      if (city.toLowerCase() === normalized) return city;
    }

    for (const city of Navigation.cities) {
      if (normalized.includes(city.toLowerCase()) || city.toLowerCase().includes(normalized)) return city;
    }

    return null;
  },

  showToast(message, type) {
    const toast = document.getElementById('locationToast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = 'location-toast location-toast-' + type;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 4000);
  }
};

Navigation.init();

document.addEventListener('DOMContentLoaded', () => {
  LocationDetector.init();
});
