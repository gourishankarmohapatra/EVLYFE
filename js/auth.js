// Auth Module - EVLYFE
const Auth = {
  currentUser: null,
  authStateListeners: [],

  init() {
    auth.onAuthStateChanged((user) => {
      this.currentUser = user;
      this.authStateListeners.forEach(cb => cb(user));
      this.updateUI(user);
    });
  },

  onAuthStateChange(callback) {
    this.authStateListeners.push(callback);
  },

  updateUI(user) {
    const phoneUser = localStorage.getItem('evlyfe_phone');
    const loginType = localStorage.getItem('evlyfe_logged_in');

    // If Firebase user exists, use Firebase flow
    if (user) {
      const userBtns = document.querySelectorAll('.btn-user, .mobile-user-btn');
      userBtns.forEach(btn => {
        const initial = (user.displayName || user.email || 'U')[0].toUpperCase();
        btn.innerHTML = `<div class="user-avatar">${initial}</div>`;
        btn.onclick = () => this.toggleUserDropdown();
      });

      const dropdown = document.getElementById('userDropdown');
      if (dropdown) {
        const name = user.displayName || 'User';
        const email = user.email || '';
        const initial = name[0].toUpperCase();
        dropdown.innerHTML = `
          <div class="dropdown-user-header">
            <div class="dropdown-avatar">${initial}</div>
            <div class="dropdown-info">
              <div class="dropdown-name">${name}</div>
              <div class="dropdown-email">${email}</div>
            </div>
          </div>
          <div class="dropdown-divider"></div>
          <a href="#" class="dropdown-item" onclick="Auth.closeDropdown()"><i class="bi bi-person"></i> My Profile</a>
          <a href="#" class="dropdown-item" onclick="Auth.closeDropdown()"><i class="bi bi-heart"></i> Saved Vehicles</a>
          <a href="#" class="dropdown-item" onclick="Auth.closeDropdown()"><i class="bi bi-bell"></i> Price Alerts</a>
          <div class="dropdown-divider"></div>
          <a href="#" class="dropdown-item text-danger" onclick="Auth.logout()"><i class="bi bi-box-arrow-right"></i> Logout</a>
        `;
      }
      return;
    }

    // If phone user exists, use phone flow
    if (phoneUser && loginType === 'phone') {
      LoginModal.updateHeaderForLoggedInUser();
      return;
    }

    // No user logged in - show default person icon
    const userBtns = document.querySelectorAll('.btn-user, .mobile-user-btn');
    userBtns.forEach(btn => {
      btn.innerHTML = '<i class="bi bi-person"></i>';
      btn.onclick = () => LoginModal.open();
    });
  },

  // Email/Password Signup
  async signupWithEmail(email, password, displayName) {
    try {
      const result = await auth.createUserWithEmailAndPassword(email, password);
      await result.user.updateProfile({ displayName });
      await this.saveUserProfile(result.user, { displayName });
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: this.getErrorMsg(error.code) };
    }
  },

  // Email/Password Login
  async loginWithEmail(email, password) {
    try {
      const result = await auth.signInWithEmailAndPassword(email, password);
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: this.getErrorMsg(error.code) };
    }
  },

  // Google Login
  async loginWithGoogle() {
    try {
      const result = await auth.signInWithPopup(googleProvider);
      await this.saveUserProfile(result.user);
      return { success: true, user: result.user };
    } catch (error) {
      console.error('Google login error:', error.code, error.message);
      if (error.code === 'auth/popup-closed-by-user') {
        return { success: false, error: 'Login cancelled' };
      }
      return { success: false, error: this.getErrorMsg(error.code) };
    }
  },

  // Facebook Login
  async loginWithFacebook() {
    try {
      const result = await auth.signInWithPopup(facebookProvider);
      await this.saveUserProfile(result.user);
      return { success: true, user: result.user };
    } catch (error) {
      console.error('Facebook login error:', error.code, error.message);
      if (error.code === 'auth/popup-closed-by-user') {
        return { success: false, error: 'Login cancelled' };
      }
      return { success: false, error: this.getErrorMsg(error.code) };
    }
  },

  // Logout
  async logout() {
    try {
      await auth.signOut();
      this.currentUser = null;
      localStorage.removeItem('evlyfe_logged_in');
      window.location.href = 'index.html';
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  // Logout phone user
  logoutPhone() {
    localStorage.removeItem('evlyfe_phone');
    localStorage.removeItem('evlyfe_user_name');
    localStorage.removeItem('evlyfe_logged_in');
    window.location.href = 'index.html';
  },

  // Password Reset
  async resetPassword(email) {
    try {
      await auth.sendPasswordResetEmail(email);
      return { success: true };
    } catch (error) {
      return { success: false, error: this.getErrorMsg(error.code) };
    }
  },

  // Save user profile to Firestore
  async saveUserProfile(user, extraData = {}) {
    if (!user) return;
    const userRef = db.collection('users').doc(user.uid);
    const doc = await userRef.get();
    if (!doc.exists) {
      await userRef.set({
        email: user.email,
        displayName: user.displayName || extraData.displayName || 'User',
        photoURL: user.photoURL || '',
        city: localStorage.getItem('evlyfe_city') || '',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        ...extraData
      });
    }
  },

  // Get user profile from Firestore
  async getUserProfile(userId) {
    const doc = await db.collection('users').doc(userId).get();
    return doc.exists ? doc.data() : null;
  },

  // Save vehicle to favorites
  async saveVehicle(vehicleSlug) {
    if (!this.currentUser) return { success: false, error: 'Please login first' };
    try {
      await db.collection('savedVehicles').add({
        userId: this.currentUser.uid,
        vehicleSlug,
        savedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Remove vehicle from favorites
  async removeSavedVehicle(vehicleSlug) {
    if (!this.currentUser) return;
    const snapshot = await db.collection('savedVehicles')
      .where('userId', '==', this.currentUser.uid)
      .where('vehicleSlug', '==', vehicleSlug)
      .get();
    snapshot.forEach(doc => doc.ref.delete());
  },

  // Check if vehicle is saved
  async isVehicleSaved(vehicleSlug) {
    if (!this.currentUser) return false;
    const snapshot = await db.collection('savedVehicles')
      .where('userId', '==', this.currentUser.uid)
      .where('vehicleSlug', '==', vehicleSlug)
      .get();
    return !snapshot.empty;
  },

  // Get saved vehicles
  async getSavedVehicles() {
    if (!this.currentUser) return [];
    const snapshot = await db.collection('savedVehicles')
      .where('userId', '==', this.currentUser.uid)
      .get();
    return snapshot.docs.map(doc => doc.data().vehicleSlug);
  },

  // Toggle user dropdown
  toggleUserDropdown() {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      const mobileDropdown = document.getElementById('mobileUserDropdown');
      if (mobileDropdown) mobileDropdown.classList.toggle('show');
    } else {
      const dropdown = document.getElementById('userDropdown');
      if (dropdown) dropdown.classList.toggle('show');
    }
  },

  // Close dropdown
  closeDropdown() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) dropdown.classList.remove('show');
    const mobileDropdown = document.getElementById('mobileUserDropdown');
    if (mobileDropdown) mobileDropdown.classList.remove('show');
  },

  // Get error message
  getErrorMsg(code) {
    const errors = {
      'auth/user-not-found': 'No account found with this email',
      'auth/wrong-password': 'Incorrect password',
      'auth/email-already-in-use': 'Email already registered',
      'auth/weak-password': 'Password must be at least 6 characters',
      'auth/invalid-email': 'Invalid email address',
      'auth/too-many-requests': 'Too many attempts. Please try again later',
      'auth/network-request-failed': 'Network error. Please check your internet connection and try again.',
      'auth/popup-blocked': 'Popup blocked by browser. Please allow popups for this site and try again.',
      'auth/popup-closed-by-user': 'Login cancelled. You closed the login window.',
      'auth/account-exists-with-different-credential': 'An account already exists with the same email but a different sign-in method. Try logging in with the original method.',
      'auth/operation-not-allowed': 'Google Sign-In is not enabled. Please enable it in Firebase Console → Authentication → Sign-in method → Google → Enable.',
      'auth/unauthorized-domain': 'This domain is not authorized. Please add it in Firebase Console → Authentication → Settings → Authorized domains.',
      'auth/invalid-credential': 'Invalid credentials. Please check your email and password.',
      'auth/invalid-creation-time': 'Invalid creation time. Please try again.',
      'auth/user-disabled': 'This account has been disabled. Please contact support.',
      'auth/user-token-expired': 'Session expired. Please login again.',
      'auth/requires-recent-login': 'Please login again to continue.',
      'auth/credential-already-in-use': 'This credential is already associated with a different account.',
      'auth/invalid-api-key': 'Invalid API key. Please check Firebase configuration.',
      'auth/api-key-not-valid': 'API key not valid. Please check Firebase configuration.',
      'auth/unavailable': 'Authentication service is temporarily unavailable. Please try again in a few moments.',
      'auth/network-request-failed': 'Network error. Please check your internet connection.',
      'auth/quota-exceeded': 'Too many requests. Please try again later.',
      'auth/app-not-authorized': 'This app is not authorized to use Firebase Authentication. Check your Firebase project settings.',
      'auth/web-storage-unsupported': 'Browser storage is not supported or blocked. Please enable cookies and local storage.'
    };
    if (errors[code]) return errors[code];
    if (code && code.startsWith('auth/')) return `Authentication error (${code}). Please try again or contact support.`;
    return `Error: ${code || 'Unknown error'}. Please try again or contact support.`;
  }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  Auth.init();
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.user-menu-container') && !e.target.closest('.mobile-user-menu')) {
    Auth.closeDropdown();
  }
});
