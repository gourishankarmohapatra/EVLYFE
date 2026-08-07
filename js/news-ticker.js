// EVLYFE News Ticker - Auto-fetch Google News RSS
const NewsTicker = {
  items: [],
  currentIndex: 0,
  autoScrollInterval: null,
  isPaused: false,
  scrollSpeed: 3000,

  async fetchNews() {
    const rssUrl = 'https://news.google.com/rss/search?q=electric+vehicle+india&hl=en-IN&gl=IN&ceid=IN:en';
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(rssUrl)}`;

    try {
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error('Failed to fetch news');

      const text = await response.text();
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, 'text/xml');

      const items = xml.querySelectorAll('item');
      this.items = Array.from(items).slice(0, 20).map(item => ({
        title: item.querySelector('title')?.textContent || '',
        link: item.querySelector('link')?.textContent || '#',
        pubDate: item.querySelector('pubDate')?.textContent || '',
        source: item.querySelector('source')?.textContent || 'Google News',
        image: this.extractImage(item)
      }));

      return true;
    } catch (err) {
      console.warn('News fetch failed:', err);
      return false;
    }
  },

  extractImage(item) {
    const media = item.querySelector('media\\:content, content');
    if (media && media.getAttribute('url')) return media.getAttribute('url');

    const enc = item.querySelector('enclosure');
    if (enc && enc.getAttribute('url')) return enc.getAttribute('url');

    const title = item.querySelector('title')?.textContent || '';
    return this.getFallbackImage(title);
  },

  getFallbackImage(title) {
    const t = title.toLowerCase();

    if (t.includes('tata')) return 'images/vehicles/ev-vs-ice.jpg';
    if (t.includes('ola') || t.includes('ather')) return 'images/blog/top-scooters.jpg';
    if (t.includes('battery')) return 'images/blog/battery-warranty.jpg';
    if (t.includes('charging')) return 'images/blog/charging-network.jpg';
    if (t.includes('scooter')) return 'images/blog/top-scooters.jpg';
    if (t.includes('car') || t.includes('suv')) return 'images/blog/ev-vs-ice.jpg';
    if (t.includes('monsoon') || t.includes('rain')) return 'images/blog/monsoon-ev.jpg';
    if (t.includes('launch') || t.includes('upcoming')) return 'images/blog/tata-sierra.jpg';

    return 'images/blog/ev-default.jpg';
  },

  formatDate(dateStr) {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHrs = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHrs / 24);

      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHrs < 24) return `${diffHrs}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    } catch {
      return '';
    }
  },

  render() {
    const container = document.getElementById('newsTicker');
    if (!container || this.items.length === 0) {
      if (container) container.style.display = 'none';
      return;
    }

    container.innerHTML = `
      <div class="news-ticker-wrapper">
        <div class="news-ticker-header">
          <div class="news-ticker-badge">
            <i class="bi bi-lightning-charge-fill"></i>
            <span>Latest EV News</span>
          </div>
          <div class="news-ticker-controls">
            <button class="news-ticker-btn" id="newsPrev" aria-label="Previous">
              <i class="bi bi-chevron-left"></i>
            </button>
            <button class="news-ticker-btn" id="newsNext" aria-label="Next">
              <i class="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>
        <div class="news-ticker-track-wrapper">
          <div class="news-ticker-track" id="newsTrack">
            ${this.items.map((item, i) => `
              <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="news-ticker-card">
                ${item.image ? `<img src="${item.image}" class="news-ticker-card-image" alt="" loading="lazy" onerror="this.style.display='none'">` : ''}
                <div class="news-ticker-card-source">${item.source}</div>
                <h4 class="news-ticker-card-title">${item.title}</h4>
                <div class="news-ticker-card-time">
                  <i class="bi bi-clock"></i>
                  ${this.formatDate(item.pubDate)}
                </div>
              </a>
            `).join('')}
          </div>
        </div>
        <div class="news-ticker-progress">
          <div class="news-ticker-progress-bar" id="newsProgressBar"></div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.startAutoScroll();
  },

  bindEvents() {
    const prevBtn = document.getElementById('newsPrev');
    const nextBtn = document.getElementById('newsNext');
    const track = document.getElementById('newsTrack');

    if (prevBtn) prevBtn.addEventListener('click', () => this.prev());
    if (nextBtn) nextBtn.addEventListener('click', () => this.next());

    if (track) {
      track.addEventListener('mouseenter', () => this.pause());
      track.addEventListener('mouseleave', () => this.resume());
    }

    // Touch support
    let touchStartX = 0;
    if (track) {
      track.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        this.pause();
      }, { passive: true });

      track.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
          diff > 0 ? this.next() : this.prev();
        }
        this.resume();
      }, { passive: true });
    }
  },

  startAutoScroll() {
    this.stopAutoScroll();
    this.autoScrollInterval = setInterval(() => {
      if (!this.isPaused) {
        this.next();
      }
    }, this.scrollSpeed);
  },

  stopAutoScroll() {
    if (this.autoScrollInterval) {
      clearInterval(this.autoScrollInterval);
      this.autoScrollInterval = null;
    }
  },

  pause() {
    this.isPaused = true;
  },

  resume() {
    this.isPaused = false;
  },

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.items.length;
    this.scrollToIndex(this.currentIndex);
  },

  prev() {
    this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
    this.scrollToIndex(this.currentIndex);
  },

  scrollToIndex(index) {
    const track = document.getElementById('newsTrack');
    if (!track) return;

    const cards = track.querySelectorAll('.news-ticker-card');
    if (cards[index]) {
      cards[index].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }

    // Update progress bar
    const progress = document.getElementById('newsProgressBar');
    if (progress) {
      const percent = ((index + 1) / this.items.length) * 100;
      progress.style.width = `${percent}%`;
    }
  },

  async init() {
    const success = await this.fetchNews();
    if (success && this.items.length > 0) {
      this.render();
    } else {
      const container = document.getElementById('newsTicker');
      if (container) container.style.display = 'none';
    }
  }
};
