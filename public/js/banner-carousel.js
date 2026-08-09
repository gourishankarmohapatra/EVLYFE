// EVLYFE Banner Carousel - Auto-sliding with glassmorphism
const BannerCarousel = {
  currentIndex: 0,
  autoSlideInterval: null,
  slideDelay: 3200,
  isPaused: false,

  slides: [
    {
      type: 'image',
      src: 'images/banner-ev1.jpg',
      title: 'Discover Electric Vehicles',
      subtitle: 'Explore 200+ EVs across India'
    },
    {
      type: 'image',
      src: 'images/banner-ev2.jpg',
      title: 'Electric Scooters',
      subtitle: 'Affordable urban commuting'
    },
    {
      type: 'image',
      src: 'images/banner-ev3.jpg',
      title: 'Electric Cars',
      subtitle: 'Premium electric mobility'
    },
    {
      type: 'image',
      src: 'images/banner-ev4.jpg',
      title: 'Battery Technology',
      subtitle: 'Advanced EV battery solutions'
    },
    {
      type: 'image',
      src: 'images/banner-ev5.jpg',
      title: 'Charging Network',
      subtitle: '1000+ charging stations across India'
    },
    {
      type: 'image',
      src: 'images/banner-ev6.jpg',
      title: 'Future of Mobility',
      subtitle: 'Sustainable electric transportation'
    }
  ],

  render() {
    const container = document.getElementById('bannerCarousel');
    if (!container) return;

    container.innerHTML = `
      <div class="banner-carousel-wrapper">
        <div class="banner-slides" id="bannerSlides">
          ${this.slides.map((slide, i) => `
            <div class="banner-slide ${i === 0 ? 'active' : ''}" data-index="${i}">
              <img src="${slide.src}" class="banner-slide-image" alt="${slide.title}" loading="${i === 0 ? 'eager' : 'lazy'}">
              <div class="banner-slide-overlay"></div>
              <div class="banner-slide-content">
                <h3 class="banner-slide-title">${slide.title}</h3>
                <p class="banner-slide-subtitle">${slide.subtitle}</p>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="banner-nav-dots" id="bannerDots">
          ${this.slides.map((_, i) => `
            <button class="banner-dot ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Go to slide ${i + 1}"></button>
          `).join('')}
        </div>

        <button class="banner-nav-btn banner-nav-prev" id="bannerPrev" aria-label="Previous">
          <i class="bi bi-chevron-left"></i>
        </button>
        <button class="banner-nav-btn banner-nav-next" id="bannerNext" aria-label="Next">
          <i class="bi bi-chevron-right"></i>
        </button>
      </div>
    `;

    this.bindEvents();
    this.startAutoSlide();
  },

  bindEvents() {
    const prevBtn = document.getElementById('bannerPrev');
    const nextBtn = document.getElementById('bannerNext');
    const dots = document.querySelectorAll('.banner-dot');
    const wrapper = document.querySelector('.banner-carousel-wrapper');

    if (prevBtn) prevBtn.addEventListener('click', () => this.prev());
    if (nextBtn) nextBtn.addEventListener('click', () => this.next());

    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        const index = parseInt(dot.dataset.index);
        this.goToSlide(index);
      });
    });

    if (wrapper) {
      wrapper.addEventListener('mouseenter', () => this.pause());
      wrapper.addEventListener('mouseleave', () => this.resume());
    }

    // Touch support
    let touchStartX = 0;
    if (wrapper) {
      wrapper.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        this.pause();
      }, { passive: true });

      wrapper.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
          diff > 0 ? this.next() : this.prev();
        }
        this.resume();
      }, { passive: true });
    }
  },

  startAutoSlide() {
    this.stopAutoSlide();
    this.autoSlideInterval = setInterval(() => {
      if (!this.isPaused) {
        this.next();
      }
    }, this.slideDelay);
  },

  stopAutoSlide() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
      this.autoSlideInterval = null;
    }
  },

  pause() {
    this.isPaused = true;
  },

  resume() {
    this.isPaused = false;
  },

  goToSlide(index) {
    const slides = document.querySelectorAll('.banner-slide');
    const dots = document.querySelectorAll('.banner-dot');

    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));

    this.currentIndex = index;
    slides[index].classList.add('active');
    dots[index].classList.add('active');
  },

  next() {
    const nextIndex = (this.currentIndex + 1) % this.slides.length;
    this.goToSlide(nextIndex);
  },

  prev() {
    const prevIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
    this.goToSlide(prevIndex);
  },

  init() {
    this.render();
  }
};
