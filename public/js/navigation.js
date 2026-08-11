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
          <div class="container">
            <div class="social-icons">
              <a href="#" title="Facebook"><i class="bi bi-facebook"></i></a>
              <a href="#" title="Instagram"><i class="bi bi-instagram"></i></a>
              <a href="#" title="YouTube"><i class="bi bi-youtube"></i></a>
              <a href="#" title="Twitter"><i class="bi bi-twitter-x"></i></a>
              <a href="#" title="LinkedIn"><i class="bi bi-linkedin"></i></a>
            </div>
            <div class="header-top-nav">
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
          <div class="container">
            <a href="index.html" class="logo">
              <img src="images/logo.png" alt="EVLYFE">
              <div class="logo-text">
                <span class="logo-title">EVLYFE</span>
                <p>POWERED FOR TOMORROW</p>
              </div>
            </a>

            <div class="header-city-selector" id="citySelector">
              <i class="bi bi-geo-alt"></i>
              <span id="selectedCity">${selectedCity || '<i class="bi bi-crosshair"></i> Detecting...'}</span>
            </div>

            <div class="search-container">
              <input type="text" id="headerSearch" placeholder="Search electric vehicles, brands..." autocomplete="off" onkeyup="handleSearchKeyup(event)">
              <button class="search-btn" onclick="handleHeaderSearch()" aria-label="Search"><i class="bi bi-search"></i></button>
              <div class="search-suggestions" id="searchSuggestions"></div>
            </div>

            <div class="header-actions">
              <a href="compare.html" class="btn-compare">
                <i class="bi bi-arrow-left-right"></i> Compare
                <span class="compare-badge" id="compareCount">0</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <nav class="mobile-header">
        <button class="hamburger" onclick="toggleMobileSidebar()" aria-label="Open menu"><i class="bi bi-list"></i></button>
        <a href="index.html"><img src="images/logo.png" alt="EVLYFE"></a>
        <div class="mobile-actions">
          <button onclick="toggleMobileSearch()" aria-label="Search"><i class="bi bi-search"></i></button>
          <a href="compare.html" style="position:relative;color:var(--text-primary);">
            <i class="bi bi-arrow-left-right"></i>
            <span class="compare-badge" style="position:absolute;top:-6px;right:-8px;font-size:9px;" id="mobileCompareCount">0</span>
          </a>
        </div>
      </nav>

      <div class="mobile-search-bar" id="mobileSearchBar" style="display:none;padding:var(--space-3) var(--space-4);background:var(--bg-primary);border-bottom:1px solid var(--border-default);">
        <div class="search-container" style="max-width:100%;">
          <input type="text" id="mobileHeaderSearch" placeholder="Search electric vehicles..." autocomplete="off" onkeyup="handleSearchKeyup(event)">
          <button class="search-btn" onclick="handleHeaderSearch()"><i class="bi bi-search"></i></button>
        </div>
      </div>

      <div class="mobile-sidebar-overlay" id="sidebarOverlay" onclick="closeMobileSidebar()"></div>
      <div class="mobile-sidebar" id="mobileSidebar">
        <div class="sidebar-header">
          <h3><i class="bi bi-list"></i> Menu</h3>
          <button class="close-btn" onclick="closeMobileSidebar()" aria-label="Close menu">&times;</button>
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
      <div class="ad-container text-center">
        <ins class="adsbygoogle"
             style="display:block"
             data-ad-client="ca-pub-6950966761441733"
             data-ad-slot="8409936033"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
      </div>

      <footer class="footer">
        <div class="container">
          <div class="footer-grid">
            <div>
              <div class="footer-logo">
                <img src="images/logo.png" alt="EVLYFE">
              </div>
              <p class="footer-tagline">POWERED FOR TOMORROW</p>
              <p class="footer-description">
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
            <div>
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
            <div>
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
            <div>
              <h4>Contact Us</h4>
              <div class="footer-contact">
                <p><i class="bi bi-telephone"></i> +91 6370773029</p>
                <p><i class="bi bi-envelope"></i> evlyfe@gmail.com</p>
                <p><i class="bi bi-globe"></i> www.evlyfe.com</p>
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
    return `        <button class="back-to-top" id="backToTop" onclick="scrollToTop()" aria-label="Back to top"><i class="bi bi-arrow-up"></i></button>`;
  },

  init() {
    // Initialize adsbygoogle array early (before AdSense script loads)
    window.adsbygoogle = window.adsbygoogle || [];

    document.addEventListener('DOMContentLoaded', () => {
      this.updateCompareCount();
      const city = this.getSelectedCity();
      const el = document.getElementById('selectedCity');
      if (el && city) el.textContent = city;

      window.addEventListener('scroll', () => {
        const btn = document.getElementById('backToTop');
        if (btn) btn.classList.toggle('visible', window.scrollY > 300);

        const header = document.querySelector('.header-main');
        if (header) header.classList.toggle('scrolled', window.scrollY > 10);
      });

      // Scroll-triggered reveal animations
      const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
      if (revealElements.length > 0 && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              observer.unobserve(entry.target);
            }
          });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        revealElements.forEach(el => observer.observe(el));
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

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
}

function handleSearchKeyup(e) {
  if (e.key === 'Enter') handleHeaderSearch();

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
    <a href="vehicle.html?slug=${escapeHtml(v.slug)}" class="search-suggestion-item">
      <img src="${escapeHtml(v.image)}" alt="${escapeHtml(v.title)}">
      <div>
        <div class="suggestion-title">${escapeHtml(v.title)}</div>
        <div class="suggestion-sub">${escapeHtml(v.company)} | ${escapeHtml(v.price_display)}</div>
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
      const response = await fetch('/api/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng })
      });
      if (!response.ok) throw new Error('Geocoding failed');
      const data = await response.json();
      return data.city || null;
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
