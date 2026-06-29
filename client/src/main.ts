import './style.css';

// TypeScript Interfaces
interface Movie {
  id: string;
  title: string;
  description: string;
  duration: number;
  language: string;
  posterUrl: string;
}

interface Screen {
  id: string;
  theatreId: string;
  name: string;
  totalSeats: number;
}

interface Theatre {
  id: string;
  name: string;
  location: string;
}

interface Show {
  id: string;
  startTime: string;
  price: number;
  screen: {
    id: string;
    name: string;
  };
  theatre: {
    id: string;
    name: string;
    location: string;
  };
}

interface Seat {
  id: string;
  showId: string;
  seatNumber: string;
  status: 'available' | 'locked' | 'booked';
  lockedBy: string | null;
  lockedAt: string | null;
  bookedBy: string | null;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

// Global Application State
const state = {
  token: localStorage.getItem('token'),
  user: null as User | null,
  movies: [] as Movie[],
  theatres: [] as Theatre[],
  screensMap: {} as Record<string, Screen[]>, // theatreId -> screens
  selectedMovie: null as Movie | null,
  shows: [] as Show[],
  selectedShow: null as Show | null,
  seats: [] as Seat[],
  selectedSeats: new Set<string>(), // set of seat IDs
  currentView: 'auth', // auth, movies, movie-details, seats, ticket, admin
  bookingResult: null as any | null,
  authTab: 'login', // login, signup
  pollIntervalId: null as any,
};

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '');

// Global DOM Container
const appEl = document.querySelector<HTMLDivElement>('#app')!;

// Helper functions for API calls
async function apiFetch(path: string, options: RequestInit = {}) {
  const headers: HeadersInit = {};
  
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (state.token) {
    headers['Authorization'] = `Bearer ${state.token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    data = { error: text };
  }

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Request failed');
  }

  return data;
}

// Notification Helper
function showNotification(message: string, isError = false) {
  // Remove existing notification if any
  const existing = document.querySelector('.global-notification');
  if (existing) existing.remove();

  const notification = document.createElement('div');
  notification.className = `global-notification glass-card feedback-msg ${isError ? 'feedback-error' : 'feedback-success'}`;
  notification.style.position = 'fixed';
  notification.style.top = '20px';
  notification.style.left = '50%';
  notification.style.transform = 'translateX(-50%)';
  notification.style.zIndex = '9999';
  notification.style.display = 'block';
  notification.style.animation = 'fadeIn 0.3s ease-out';
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.5s ease';
    setTimeout(() => notification.remove(), 500);
  }, 4000);
}

// Check current authentication on load
async function checkAuth() {
  if (!state.token) {
    navigate('auth');
    return;
  }

  try {
    const data = await apiFetch('/auth/me');
    // The backend /auth/me returns: { name, email, createdAt }
    // Let's decode the JWT token payload to get the role (since the me endpoint does not return it).
    const payload = JSON.parse(atob(state.token.split('.')[1]));
    state.user = {
      id: payload.id,
      name: data.name,
      email: data.email,
      role: payload.role || 'user',
    };
    navigate('movies');
  } catch (err) {
    console.error('Session expired', err);
    logout();
  }
}

function logout() {
  localStorage.removeItem('token');
  state.token = null;
  state.user = null;
  state.selectedMovie = null;
  state.selectedShow = null;
  state.selectedSeats.clear();
  navigate('auth');
}

// View Controller (Router)
function navigate(view: string) {
  if (state.pollIntervalId) {
    clearInterval(state.pollIntervalId);
    state.pollIntervalId = null;
  }
  state.currentView = view;
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// App Renderer
function render() {
  if (state.currentView === 'auth') {
    renderAuth();
  } else if (state.currentView === 'movies') {
    renderMovies();
  } else if (state.currentView === 'seats') {
    renderSeatMap();
  } else if (state.currentView === 'ticket') {
    renderTicket();
  } else if (state.currentView === 'admin') {
    renderAdmin();
  }
}

// Common Header Markup
function getHeaderHTML() {
  if (!state.user) return '';
  return `
    <header>
      <div class="header-container">
        <a href="#" class="logo" id="nav-logo">
          <strong>BMS</strong>
        </a>
        <div class="nav-user">
          ${state.user.role === 'admin' ? '<a href="#" class="admin-link" id="nav-admin">Admin Panel</a>' : ''}
          <div class="user-profile">
            <div class="user-avatar">${state.user.name.charAt(0).toUpperCase()}</div>
            <span>${state.user.name}</span>
          </div>
          <button class="logout-btn" id="logout-btn">Logout</button>
        </div>
      </div>
    </header>
    <div class="subheader">
      <div class="subheader-container">
        <a href="#" class="subheader-link" style="color: #fff; font-weight: 750;">Movies</a>
        <a href="#" class="subheader-link">Stream</a>
        <a href="#" class="subheader-link">Events</a>
        <a href="#" class="subheader-link">Plays</a>
        <a href="#" class="subheader-link">Sports</a>
        <a href="#" class="subheader-link">Activities</a>
      </div>
    </div>
  `;
}

function bindHeaderEvents() {
  const logo = document.querySelector('#nav-logo');
  if (logo) {
    logo.addEventListener('click', (e) => {
      e.preventDefault();
      navigate('movies');
    });
  }

  const logoutBtn = document.querySelector('#logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      logout();
    });
  }

  const adminLink = document.querySelector('#nav-admin');
  if (adminLink) {
    adminLink.addEventListener('click', (e) => {
      e.preventDefault();
      navigate('admin');
    });
  }
}

// Render Authentication View
function renderAuth() {
  appEl.innerHTML = `
    <div class="auth-container">
      <div class="auth-card glass-card">
        <div class="auth-header">
          <h1>Cinemagic</h1>
          <p>Your portal to ultimate movie experiences</p>
        </div>
        
        <div class="auth-error" id="auth-error-box"></div>

        <div class="auth-tabs">
          <button class="auth-tab ${state.authTab === 'login' ? 'active' : ''}" id="tab-login">Login</button>
          <button class="auth-tab ${state.authTab === 'signup' ? 'active' : ''}" id="tab-signup">Register</button>
        </div>

        <form id="auth-form" class="auth-form">
          ${state.authTab === 'signup' ? `
            <div class="form-group">
              <label for="auth-name">FULL NAME</label>
              <input type="text" id="auth-name" class="form-input" placeholder="John Doe" required minlength="2">
            </div>
          ` : ''}
          <div class="form-group">
            <label for="auth-email">EMAIL ADDRESS</label>
            <input type="email" id="auth-email" class="form-input" placeholder="you@example.com" required>
          </div>
          <div class="form-group">
            <label for="auth-password">PASSWORD</label>
            <input type="password" id="auth-password" class="form-input" placeholder="••••••••" required minlength="8">
          </div>
          <button type="submit" class="btn-primary auth-btn">
            ${state.authTab === 'login' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  `;

  // Bind Auth Tab toggles
  document.querySelector('#tab-login')!.addEventListener('click', () => {
    state.authTab = 'login';
    renderAuth();
  });
  document.querySelector('#tab-signup')!.addEventListener('click', () => {
    state.authTab = 'signup';
    renderAuth();
  });

  // Bind Form Submission
  const form = document.querySelector('#auth-form')!;
  const errorBox = document.querySelector('#auth-error-box') as HTMLDivElement;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.style.display = 'none';

    const email = (document.querySelector('#auth-email') as HTMLInputElement).value;
    const password = (document.querySelector('#auth-password') as HTMLInputElement).value;

    try {
      if (state.authTab === 'login') {
        const data = await apiFetch('/auth/sign-in', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        localStorage.setItem('token', data.token);
        state.token = data.token;
        showNotification('Login Successful!');
        await checkAuth();
      } else {
        const name = (document.querySelector('#auth-name') as HTMLInputElement).value;
        await apiFetch('/auth/sign-up', {
          method: 'POST',
          body: JSON.stringify({ name, email, password }),
        });
        showNotification('Account created successfully! Please sign in.');
        state.authTab = 'login';
        renderAuth();
      }
    } catch (err: any) {
      errorBox.textContent = err.message || 'Authentication failed';
      errorBox.style.display = 'block';
    }
  });
}

// Render Movies Grid View
async function renderMovies() {
  appEl.innerHTML = `
    ${getHeaderHTML()}
    <main>
      <div class="spinner-container" id="movies-loader">
        <div class="spinner"></div>
        <p>Loading showtimes & movies...</p>
      </div>
      <div id="movies-content" style="display:none;">
        <div id="featured-movie-sec"></div>
        <h2 class="section-title">Now Showing</h2>
        <div class="movie-grid" id="movie-grid-container"></div>
      </div>
    </main>

    <!-- Detail Modal -->
    <div class="modal-overlay" id="movie-detail-modal">
      <div class="modal-content glass-card" id="movie-detail-content"></div>
    </div>
  `;

  bindHeaderEvents();

  try {
    const response = await apiFetch('/movies/get-all-movie');
    state.movies = response.data;

    const loader = document.querySelector('#movies-loader') as HTMLDivElement;
    const content = document.querySelector('#movies-content') as HTMLDivElement;
    if (loader) loader.style.display = 'none';
    if (content) content.style.display = 'block';

    const featuredSec = document.querySelector('#featured-movie-sec')!;
    const gridContainer = document.querySelector('#movie-grid-container')!;

    if (state.movies.length === 0) {
      gridContainer.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 48px; color: var(--text-muted);">
          <h3>No movies found in database.</h3>
          ${state.user?.role === 'admin' ? '<p style="margin-top: 12px;">Use the Admin Dashboard to add movies!</p>' : '<p style="margin-top: 12px;">Please ask an admin to seed the database.</p>'}
        </div>
      `;
      return;
    }

    // Set first movie as featured banner
    const featured = state.movies[0];
    featuredSec.innerHTML = `
      <div class="featured-hero">
        <div class="featured-bg" style="background-image: url('${featured.posterUrl}')"></div>
        <div class="featured-overlay"></div>
        <div class="featured-content">
          <img src="${featured.posterUrl}" class="featured-poster-shortcut" alt="${featured.title}">
          <div class="featured-details">
            <span class="badge badge-featured">Featured Movie</span>
            <h1 class="featured-title">${featured.title}</h1>
            <div class="featured-meta">
              <span>⏱️ ${featured.duration} min</span>
              <span>🗣️ ${featured.language}</span>
            </div>
            <p class="featured-desc">${featured.description || 'No description available.'}</p>
            <button class="btn-primary" id="featured-book-btn">Book Tickets Now</button>
          </div>
        </div>
      </div>
    `;

    document.querySelector('#featured-book-btn')!.addEventListener('click', () => {
      openMovieDetail(featured);
    });

    // Populate remaining movie cards in grid
    gridContainer.innerHTML = state.movies.map((movie) => `
      <div class="movie-card" data-id="${movie.id}">
        <div class="movie-poster-container">
          <img src="${movie.posterUrl}" class="movie-poster" alt="${movie.title}" onerror="this.src='https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=500'">
          <div class="movie-poster-overlay">
            <button class="btn-primary">Book Now</button>
          </div>
        </div>
        <div class="movie-info">
          <h3 class="movie-title">${movie.title}</h3>
          <div class="movie-meta-tags">
            <span>${movie.language}</span>
            <span>•</span>
            <span>${movie.duration}m</span>
          </div>
        </div>
      </div>
    `).join('');

    // Bind card clicks
    document.querySelectorAll('.movie-card').forEach((card) => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id')!;
        const movie = state.movies.find((m) => m.id === id)!;
        openMovieDetail(movie);
      });
    });

  } catch (err: any) {
    showNotification(err.message || 'Failed to load movies', true);
  }
}

// Open Movie Detail & Showtimes Modal
// Open Movie Detail & Showtimes Modal
async function openMovieDetail(movie: Movie) {
  state.selectedMovie = movie;

  const modal = document.querySelector('#movie-detail-modal') as HTMLDivElement;
  const content = document.querySelector('#movie-detail-content') as HTMLDivElement;

  modal.classList.add('active');
  content.innerHTML = `
    <button class="modal-close" id="modal-close-btn">&times;</button>
    <div class="movie-detail-banner">
      <div class="movie-detail-banner-bg" style="background-image: url('${movie.posterUrl}')"></div>
      <div class="movie-detail-banner-container">
        <img class="movie-detail-poster" src="${movie.posterUrl}" alt="${movie.title}" onerror="this.src='https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=500'">
        <div class="movie-detail-info">
          <h1>${movie.title}</h1>
          <div class="rating-box">
            <span class="rating-star">★</span>
            <span style="font-weight: 700; font-size: 1.1rem; color: #fff;">9.2/10</span>
            <span style="color: #bbb; font-size: 0.85rem;">(12.5K votes)</span>
          </div>
          <div class="tags">
            <span class="tag">UA</span>
            <span class="tag">${movie.language}</span>
            <span class="tag">2D</span>
          </div>
          <div class="duration-lang">
            <span>⏱️ ${movie.duration} minutes</span>
            <span style="margin: 0 8px;">•</span>
            <span>📅 Now Showing</span>
          </div>
          <p class="description">${movie.description || 'No description available.'}</p>
        </div>
      </div>
    </div>
    <div class="showtimes-section">
      <div class="showtimes-header-bar">
        <h2>Available Cinemas & Showtimes</h2>
      </div>
      <div id="showtimes-container">
        <div class="spinner-container" style="min-height: 100px;">
          <div class="spinner" style="width: 32px; height: 32px;"></div>
        </div>
      </div>
    </div>
  `;

  // Bind close buttons
  document.querySelector('#modal-close-btn')!.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });

  // Fetch showtimes
  try {
    const showtimesRes = await apiFetch(`/shows/${movie.id}`);
    const shows: Show[] = showtimesRes.data;
    state.shows = shows;

    const container = document.querySelector('#showtimes-container')!;

    if (shows.length === 0) {
      container.innerHTML = `
        <p style="color: var(--bms-text-muted); font-style: italic;">No showtimes scheduled for this movie yet.</p>
        ${state.user?.role === 'admin' ? '<p style="margin-top: 10px; font-size: 0.9rem;"><a href="#" id="modal-admin-shortcut" style="color: var(--bms-red); font-weight:600; text-decoration:none;">Add shows in the Admin Panel</a></p>' : ''}
      `;
      if (state.user?.role === 'admin') {
        document.querySelector('#modal-admin-shortcut')?.addEventListener('click', (e) => {
          e.preventDefault();
          modal.classList.remove('active');
          navigate('admin');
        });
      }
      return;
    }

    // Group shows by theatre
    const grouped: Record<string, { theatre: Show['theatre']; shows: Show[] }> = {};
    shows.forEach((show) => {
      const tId = show.theatre.id;
      if (!grouped[tId]) {
        grouped[tId] = {
          theatre: show.theatre,
          shows: [],
        };
      }
      grouped[tId].shows.push(show);
    });

    // Sort shows within theatre by date/time
    Object.values(grouped).forEach((group) => {
      group.shows.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    });

    container.innerHTML = Object.values(grouped).map((group) => `
      <div class="theatre-row">
        <div class="theatre-info-col">
          <h3 class="theatre-name"><span>♡</span> ${group.theatre.name}</h3>
          <p class="theatre-location">📍 ${group.theatre.location}</p>
        </div>
        <div class="showtimes-list-col">
          ${group.shows.map((show) => {
            const timeString = new Date(show.startTime).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });
            const dateString = new Date(show.startTime).toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
            });
            return `
              <button class="showtime-pill" data-id="${show.id}">
                <span class="showtime-time">${timeString}</span>
                <span class="showtime-price">₹${show.price}</span>
                <span class="showtime-screen">${dateString} • ${show.screen.name}</span>
              </button>
            `;
          }).join('')}
        </div>
      </div>
    `).join('');

    // Bind show select click
    document.querySelectorAll('.showtime-pill').forEach((pill) => {
      pill.addEventListener('click', () => {
        const showId = pill.getAttribute('data-id')!;
        const show = state.shows.find((s) => s.id === showId)!;
        modal.classList.remove('active');
        selectShow(show);
      });
    });

  } catch (err: any) {
    const container = document.querySelector('#showtimes-container');
    if (container) {
      container.innerHTML = `<p style="color: var(--danger);">Error loading showtimes: ${err.message}</p>`;
    }
  }
}

// Seat Selection Actions
async function selectShow(show: Show) {
  state.selectedShow = show;
  state.selectedSeats.clear();
  navigate('seats');
}

async function renderSeatMap() {
  if (!state.selectedShow || !state.selectedMovie) {
    navigate('movies');
    return;
  }

  const show = state.selectedShow;
  const movie = state.selectedMovie;
  const timeString = new Date(show.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateString = new Date(show.startTime).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  appEl.innerHTML = `
    ${getHeaderHTML()}
    <main>
      <div class="seat-view-container">
        <div class="seat-header">
          <div class="seat-header-details">
            <h2>${movie.title}</h2>
            <p>
              <span>🏢 ${show.theatre.name}</span>
              <span>🖥️ ${show.screen.name}</span>
              <span>📅 ${dateString} at ${timeString}</span>
              <span>💰 ₹${show.price} / ticket</span>
            </p>
          </div>
          <button class="logout-btn" id="seat-back-home-btn" style="border-color: rgba(255,255,255,0.4); color: #fff;">← Change Show</button>
        </div>

        <div class="seat-body">
          <div class="screen-arc-container">
            <div class="screen-arc"></div>
            <span class="screen-text">All eyes this way</span>
          </div>

          <div class="spinner-container" id="seats-loader" style="min-height: 150px;">
            <div class="spinner" style="width: 36px; height: 36px;"></div>
            <p>Loading layout & seat statuses...</p>
          </div>

          <div id="seats-content" style="display:none; width:100%;">
            <div class="seats-grid" id="seats-grid-element"></div>

            <div class="seat-legend">
              <div class="legend-item"><div class="legend-color available"></div> Available</div>
              <div class="legend-item"><div class="legend-color selected"></div> Selected</div>
              <div class="legend-item"><div class="legend-color booked"></div> Booked</div>
              <div class="legend-item"><div class="legend-color locked"></div> Locked</div>
            </div>

            <div class="booking-summary-bar">
              <div class="summary-text">
                <span class="summary-count" id="seat-count-text">0 Seats Selected</span>
                <span class="summary-total" id="seat-total-text">₹0</span>
              </div>
              <div>
                <button class="btn-primary" id="seat-pay-btn" disabled>Confirm & Pay</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  `;

  bindHeaderEvents();

  // Change Show click
  document.querySelector('#seat-back-home-btn')!.addEventListener('click', () => {
    navigate('movies');
  });

  try {
    const response = await apiFetch(`/seats/${show.id}`);
    const rawSeats: Seat[] = response.data;
    
    // Sort seats by seatNumber so grid aligns rows correctly
    // If seats are numbers (e.g. "0", "1", "2"), sort numerically.
    rawSeats.sort((a, b) => parseInt(a.seatNumber, 10) - parseInt(b.seatNumber, 10));
    state.seats = rawSeats;

    const loader = document.querySelector('#seats-loader') as HTMLDivElement;
    const content = document.querySelector('#seats-content') as HTMLDivElement;
    if (loader) loader.style.display = 'none';
    if (content) content.style.display = 'block';

    const grid = document.querySelector('#seats-grid-element') as HTMLDivElement;
    
    // We adjust grid column layout depending on total seats
    const colsCount = 10; // Seeder creates 30, 40 etc. so 10 cols is a clean default.
    grid.style.gridTemplateColumns = `repeat(${colsCount}, 1fr)`;

    grid.innerHTML = state.seats.map((seat) => {
      let statusClass = seat.status; // available, locked, booked
      
      // Highlight seat index labels
      const label = parseInt(seat.seatNumber, 10) + 1;

      return `
        <button class="seat ${statusClass}" data-id="${seat.id}" ${statusClass !== 'available' ? 'disabled' : ''}>
          ${label}
        </button>
      `;
    }).join('');

    // Bind seat selections
    const payBtn = document.querySelector('#seat-pay-btn') as HTMLButtonElement;
    const countText = document.querySelector('#seat-count-text')!;
    const totalText = document.querySelector('#seat-total-text')!;

    document.querySelectorAll('.seat.available').forEach((seatBtn) => {
      seatBtn.addEventListener('click', () => {
        const seatId = seatBtn.getAttribute('data-id')!;
        
        if (state.selectedSeats.has(seatId)) {
          state.selectedSeats.delete(seatId);
          seatBtn.classList.remove('selected');
        } else {
          state.selectedSeats.add(seatId);
          seatBtn.classList.add('selected');
        }

        // Update summaries
        const count = state.selectedSeats.size;
        const total = count * show.price;

        countText.textContent = `${count} Seat${count !== 1 ? 's' : ''} Selected`;
        totalText.textContent = `₹${total}`;
        
        if (count > 0) {
          payBtn.removeAttribute('disabled');
        } else {
          payBtn.setAttribute('disabled', 'true');
        }
      });
    });

    // Pay Button Flow
    payBtn.addEventListener('click', async () => {
      payBtn.setAttribute('disabled', 'true');
      payBtn.textContent = 'Locking seats...';

      try {
        const seatIdsArray = Array.from(state.selectedSeats);
        
        // 1. Create booking (locks seats & returns order details)
        const bookingResponse = await apiFetch('/bookings/create', {
          method: 'POST',
          body: JSON.stringify({
            showId: show.id,
            seatIds: seatIdsArray,
          }),
        });

        state.bookingResult = bookingResponse;
        
        // 2. Load Razorpay Checkout modal
        const razorpayOptions = {
          key: 'rzp_test_T6KtTmNiboogPM', // Test key from server env
          amount: bookingResponse.order.amount, // in paise
          currency: bookingResponse.order.currency,
          name: 'Cinemagic Tickets',
          description: `${movie.title} - ${show.theatre.name}`,
          order_id: bookingResponse.order.id,
          handler: async function (response: any) {
            // Callback trigger on payment success
            showNotification('Payment authorized. Confirming booking...');
            try {
              await apiFetch('/bookings/verify-payment', {
                method: 'POST',
                body: JSON.stringify({
                  bookingId: bookingResponse.booking.id,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                }),
              });

              showNotification('Booking confirmed successfully!');
              navigate('ticket');
            } catch (confirmErr: any) {
              showNotification(confirmErr.message || 'Payment verification failed', true);
              navigate('movies');
            }
          },
          prefill: {
            name: state.user?.name || '',
            email: state.user?.email || '',
          },
          theme: {
            color: '#8b5cf6',
          },
          modal: {
            ondismiss: function () {
              showNotification('Payment cancelled. Seats will unlock in 5 minutes.', true);
              navigate('movies');
            },
          },
        };

        // Open checkout modal
        const rzp = new (window as any).Razorpay(razorpayOptions);
        rzp.open();

      } catch (err: any) {
        showNotification(err.message || 'Booking process failed', true);
        payBtn.removeAttribute('disabled');
        payBtn.textContent = 'Confirm & Pay';
      }
    });

    // Start polling seat statuses every 3 seconds for concurrency
    state.pollIntervalId = setInterval(async () => {
      try {
        const pollResponse = await apiFetch(`/seats/${show.id}`);
        const updatedSeats: Seat[] = pollResponse.data;

        updatedSeats.forEach((updatedSeat) => {
          const seatIndex = state.seats.findIndex((s) => s.id === updatedSeat.id);
          if (seatIndex !== -1) {
            state.seats[seatIndex] = updatedSeat;

            const seatBtn = document.querySelector(`.seat[data-id="${updatedSeat.id}"]`) as HTMLButtonElement;
            if (seatBtn) {
              // Reset status classes
              seatBtn.className = 'seat';

              if (updatedSeat.status === 'booked') {
                seatBtn.classList.add('booked');
                seatBtn.setAttribute('disabled', 'true');
                if (state.selectedSeats.has(updatedSeat.id)) {
                  state.selectedSeats.delete(updatedSeat.id);
                  showNotification(`Seat ${parseInt(updatedSeat.seatNumber, 10) + 1} was just booked by another user.`, true);
                }
              } else if (updatedSeat.status === 'locked') {
                // If locked by someone else, disable and show as locked
                if (updatedSeat.lockedBy !== state.user?.id) {
                  seatBtn.classList.add('locked');
                  seatBtn.setAttribute('disabled', 'true');
                  if (state.selectedSeats.has(updatedSeat.id)) {
                    state.selectedSeats.delete(updatedSeat.id);
                    showNotification(`Seat ${parseInt(updatedSeat.seatNumber, 10) + 1} was just locked by another user.`, true);
                  }
                } else {
                  // If locked by the current user, show it as selected
                  state.selectedSeats.add(updatedSeat.id);
                  seatBtn.classList.add('selected');
                  seatBtn.removeAttribute('disabled');
                }
              } else {
                // available
                if (state.selectedSeats.has(updatedSeat.id)) {
                  seatBtn.classList.add('selected');
                } else {
                  seatBtn.classList.add('available');
                }
                seatBtn.removeAttribute('disabled');
              }
            }
          }
        });

        // Recalculate totals
        const count = state.selectedSeats.size;
        const total = count * show.price;
        countText.textContent = `${count} Seat${count !== 1 ? 's' : ''} Selected`;
        totalText.textContent = `₹${total}`;
        if (count > 0) {
          payBtn.removeAttribute('disabled');
        } else {
          payBtn.setAttribute('disabled', 'true');
        }

      } catch (pollErr) {
        console.error('Failed to poll seat statuses', pollErr);
      }
    }, 3000);

  } catch (err: any) {
    showNotification(err.message || 'Failed to load seats', true);
  }
}

// Render Success Ticket View
function renderTicket() {
  if (!state.bookingResult || !state.selectedMovie || !state.selectedShow) {
    navigate('movies');
    return;
  }

  const movie = state.selectedMovie;
  const show = state.selectedShow;
  const booking = state.bookingResult.booking;
  const totalAmount = state.bookingResult.totalAmount;

  const timeString = new Date(show.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateString = new Date(show.startTime).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  // Map selected seat indices
  const seatNumbers = Array.from(state.selectedSeats).map((id) => {
    const seatObj = state.seats.find((s) => s.id === id);
    return seatObj ? parseInt(seatObj.seatNumber, 10) + 1 : '?';
  }).sort((a: any, b: any) => a - b).join(', ');

  appEl.innerHTML = `
    ${getHeaderHTML()}
    <div class="ticket-container">
      <div class="ticket-card">
        <div class="ticket-top">
          <div class="success-badge">✓</div>
          <h2 class="ticket-title">Booking Confirmed</h2>
          <p class="ticket-desc">Show this ticket at the cinema entry</p>
        </div>
        <div class="ticket-bottom">
          <div class="ticket-details-grid">
            <div>
              <div class="ticket-detail-label">Movie</div>
              <div class="ticket-detail-value">${movie.title}</div>
            </div>
            <div>
              <div class="ticket-detail-label">Cinema</div>
              <div class="ticket-detail-value">${show.theatre.name}</div>
            </div>
            <div>
              <div class="ticket-detail-label">Date & Time</div>
              <div class="ticket-detail-value">${dateString} • ${timeString}</div>
            </div>
            <div>
              <div class="ticket-detail-label">Screen</div>
              <div class="ticket-detail-value">${show.screen.name}</div>
            </div>
            <div>
              <div class="ticket-detail-label">Seats</div>
              <div class="ticket-detail-value">Row A: Seat ${seatNumbers}</div>
            </div>
            <div>
              <div class="ticket-detail-label">Amount Paid</div>
              <div class="ticket-detail-value">₹${totalAmount}</div>
            </div>
          </div>

          <div class="ticket-barcode-sec">
            <div class="barcode"></div>
            <div class="barcode-text">${booking.id.substring(0, 8).toUpperCase()}-${booking.userId.substring(0, 4).toUpperCase()}</div>
          </div>

          <div class="back-btn-container">
            <button class="btn-primary" id="back-home-btn" style="width: 100%;">Back to Home</button>
          </div>
        </div>
      </div>
    </div>
  `;

  bindHeaderEvents();

  document.querySelector('#back-home-btn')!.addEventListener('click', () => {
    state.bookingResult = null;
    state.selectedMovie = null;
    state.selectedShow = null;
    state.selectedSeats.clear();
    navigate('movies');
  });
}

// Render Admin Panel View
async function renderAdmin() {
  if (!state.user || state.user.role !== 'admin') {
    navigate('movies');
    return;
  }

  appEl.innerHTML = `
    ${getHeaderHTML()}
    <main>
      <div class="admin-section">
        <div class="admin-header">
          <h2>Admin Control Panel</h2>
          <button class="btn-secondary" id="admin-back-btn">← Back to Movies</button>
        </div>

        <div class="admin-grid">
          <!-- 1. Add Movie Form -->
          <div class="admin-panel-card glass-card">
            <h3>Add New Movie</h3>
            <div class="feedback-msg" id="movie-feedback"></div>
            <form id="admin-movie-form" class="admin-form">
              <div class="form-group">
                <label for="m-title">MOVIE TITLE</label>
                <input type="text" id="m-title" class="form-input" placeholder="e.g. Inception" required>
              </div>
              <div class="form-group">
                <label for="m-desc">DESCRIPTION</label>
                <textarea id="m-desc" class="form-input" rows="3" placeholder="Movie synopsis..." required style="resize:vertical;"></textarea>
              </div>
              <div class="form-group-row">
                <div class="form-group">
                  <label for="m-duration">DURATION (MINUTES)</label>
                  <input type="number" id="m-duration" class="form-input" min="1" placeholder="e.g. 148" required>
                </div>
                <div class="form-group">
                  <label for="m-lang">LANGUAGE</label>
                  <input type="text" id="m-lang" class="form-input" placeholder="e.g. English" required>
                </div>
              </div>
              <div class="form-group">
                <label>POSTER IMAGE</label>
                <div class="file-upload-wrapper">
                  <button type="button" class="file-upload-btn" id="file-label-btn">Choose Image File...</button>
                  <input type="file" id="m-poster" accept="image/*" required>
                </div>
              </div>
              <button type="submit" class="btn-primary" style="width:100%; margin-top: 10px;">Create Movie</button>
            </form>
          </div>

          <!-- 2. Add Theatre Form -->
          <div class="admin-panel-card glass-card">
            <h3>Create Theatre</h3>
            <div class="feedback-msg" id="theatre-feedback"></div>
            <form id="admin-theatre-form" class="admin-form">
              <div class="form-group">
                <label for="t-name">THEATRE NAME</label>
                <input type="text" id="t-name" class="form-input" placeholder="e.g. PVR Select CityWalk" required>
              </div>
              <div class="form-group">
                <label for="t-loc">LOCATION / CITY</label>
                <input type="text" id="t-loc" class="form-input" placeholder="e.g. Saket, New Delhi" required>
              </div>
              <button type="submit" class="btn-primary" style="width:100%; margin-top: 10px;">Create Theatre</button>
            </form>
          </div>

          <!-- 3. Create Screen Form -->
          <div class="admin-panel-card glass-card">
            <h3>Add Screen to Theatre</h3>
            <div class="feedback-msg" id="screen-feedback"></div>
            <form id="admin-screen-form" class="admin-form">
              <div class="form-group">
                <label for="s-theatre">SELECT THEATRE</label>
                <select id="s-theatre" class="form-input" required>
                  <option value="">-- Choose Theatre --</option>
                </select>
              </div>
              <div class="form-group-row">
                <div class="form-group">
                  <label for="s-name">SCREEN NAME</label>
                  <input type="text" id="s-name" class="form-input" placeholder="e.g. Screen 1 or IMAX" required>
                </div>
                <div class="form-group">
                  <label for="s-seats">TOTAL SEATS CAPACITY</label>
                  <input type="number" id="s-seats" class="form-input" min="20" placeholder="Min 20 seats" required>
                </div>
              </div>
              <button type="submit" class="btn-primary" style="width:100%; margin-top: 10px;">Add Screen</button>
            </form>
          </div>

          <!-- 4. Schedule Show Form -->
          <div class="admin-panel-card glass-card">
            <h3>Schedule Showtime</h3>
            <div class="feedback-msg" id="show-feedback"></div>
            <form id="admin-show-form" class="admin-form">
              <div class="form-group">
                <label for="sh-movie">SELECT MOVIE</label>
                <select id="sh-movie" class="form-input" required>
                  <option value="">-- Choose Movie --</option>
                </select>
              </div>
              <div class="form-group">
                <label for="sh-theatre">SELECT THEATRE</label>
                <select id="sh-theatre" class="form-input" required>
                  <option value="">-- Choose Theatre --</option>
                </select>
              </div>
              <div class="form-group">
                <label for="sh-screen">SELECT SCREEN</label>
                <select id="sh-screen" class="form-input" required disabled>
                  <option value="">-- Choose Screen --</option>
                </select>
              </div>
              <div class="form-group-row">
                <div class="form-group">
                  <label for="sh-time">START DATE & TIME</label>
                  <input type="datetime-local" id="sh-time" class="form-input" required>
                </div>
                <div class="form-group">
                  <label for="sh-price">TICKET PRICE (INR)</label>
                  <input type="number" id="sh-price" class="form-input" min="1" placeholder="e.g. 250" required>
                </div>
              </div>
              <button type="submit" class="btn-primary" style="width:100%; margin-top: 10px;">Schedule Show</button>
            </form>
          </div>

        </div>
      </div>
    </main>
  `;

  bindHeaderEvents();

  // Back button event
  document.querySelector('#admin-back-btn')!.addEventListener('click', () => {
    navigate('movies');
  });

  // Handle file name display for upload input
  const fileInput = document.querySelector('#m-poster') as HTMLInputElement;
  const fileLabelBtn = document.querySelector('#file-label-btn')!;
  fileInput.addEventListener('change', () => {
    if (fileInput.files && fileInput.files[0]) {
      fileLabelBtn.textContent = `Selected: ${fileInput.files[0].name}`;
    } else {
      fileLabelBtn.textContent = 'Choose Image File...';
    }
  });

  // Populate drop-downs
  await loadAdminDropdowns();

  // 1. Movie form submit
  const movieForm = document.querySelector('#admin-movie-form') as HTMLFormElement;
  const movieFeedback = document.querySelector('#movie-feedback') as HTMLDivElement;
  movieForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    movieFeedback.style.display = 'none';
    
    const title = (document.querySelector('#m-title') as HTMLInputElement).value;
    const description = (document.querySelector('#m-desc') as HTMLTextAreaElement).value;
    const duration = (document.querySelector('#m-duration') as HTMLInputElement).value;
    const language = (document.querySelector('#m-lang') as HTMLInputElement).value;
    const file = fileInput.files?.[0];

    if (!file) {
      showFeedback(movieFeedback, 'Poster image file is required', true);
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('duration', duration);
    formData.append('language', language);
    formData.append('poster', file);

    try {
      await apiFetch('/movies/add-movie', {
        method: 'POST',
        body: formData,
      });

      showFeedback(movieFeedback, 'Movie created successfully!');
      movieForm.reset();
      fileLabelBtn.textContent = 'Choose Image File...';
      await loadAdminDropdowns(); // refresh movie lists
    } catch (err: any) {
      showFeedback(movieFeedback, err.message || 'Failed to create movie', true);
    }
  });

  // 2. Theatre form submit
  const theatreForm = document.querySelector('#admin-theatre-form') as HTMLFormElement;
  const theatreFeedback = document.querySelector('#theatre-feedback') as HTMLDivElement;
  theatreForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    theatreFeedback.style.display = 'none';
    const name = (document.querySelector('#t-name') as HTMLInputElement).value;
    const location = (document.querySelector('#t-loc') as HTMLInputElement).value;

    try {
      await apiFetch('/theatre/create-theatre', {
        method: 'POST',
        body: JSON.stringify({ name, location }),
      });
      showFeedback(theatreFeedback, 'Theatre created successfully!');
      theatreForm.reset();
      await loadAdminDropdowns(); // refresh dropdown list
    } catch (err: any) {
      showFeedback(theatreFeedback, err.message || 'Failed to create theatre', true);
    }
  });

  // 3. Screen form submit
  const screenForm = document.querySelector('#admin-screen-form') as HTMLFormElement;
  const screenFeedback = document.querySelector('#screen-feedback') as HTMLDivElement;
  screenForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    screenFeedback.style.display = 'none';
    const theatreId = (document.querySelector('#s-theatre') as HTMLSelectElement).value;
    const name = (document.querySelector('#s-name') as HTMLInputElement).value;
    const totalSeats = parseInt((document.querySelector('#s-seats') as HTMLInputElement).value, 10);

    try {
      await apiFetch('/screens/create-screen', {
        method: 'POST',
        body: JSON.stringify({ theatreId, name, totalSeats }),
      });
      showFeedback(screenFeedback, 'Screen created successfully!');
      screenForm.reset();
    } catch (err: any) {
      showFeedback(screenFeedback, err.message || 'Failed to create screen', true);
    }
  });

  // 4. Show form submit
  const showForm = document.querySelector('#admin-show-form') as HTMLFormElement;
  const showFeedbackEl = document.querySelector('#show-feedback') as HTMLDivElement;
  showForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    showFeedbackEl.style.display = 'none';
    
    const movieId = (document.querySelector('#sh-movie') as HTMLSelectElement).value;
    const screenId = (document.querySelector('#sh-screen') as HTMLSelectElement).value;
    const timeLocal = (document.querySelector('#sh-time') as HTMLInputElement).value;
    const price = parseInt((document.querySelector('#sh-price') as HTMLInputElement).value, 10);

    try {
      const startTime = new Date(timeLocal).toISOString(); // Converts local time to UTC ISO format required by Zod schema
      await apiFetch('/shows/create-show', {
        method: 'POST',
        body: JSON.stringify({ movieId, screenId, startTime, price }),
      });
      showFeedback(showFeedbackEl, 'Showtime scheduled successfully!');
      showForm.reset();
      (document.querySelector('#sh-screen') as HTMLSelectElement).setAttribute('disabled', 'true');
    } catch (err: any) {
      showFeedback(showFeedbackEl, err.message || 'Failed to schedule showtime', true);
    }
  });

  // Screen selector auto-enable inside show scheduler
  const shTheatreSelect = document.querySelector('#sh-theatre') as HTMLSelectElement;
  const shScreenSelect = document.querySelector('#sh-screen') as HTMLSelectElement;
  
  shTheatreSelect.addEventListener('change', async () => {
    const theatreId = shTheatreSelect.value;
    shScreenSelect.innerHTML = '<option value="">-- Choose Screen --</option>';
    if (!theatreId) {
      shScreenSelect.setAttribute('disabled', 'true');
      return;
    }

    try {
      shScreenSelect.innerHTML = '<option value="">Loading screens...</option>';
      const screens = await fetchScreens(theatreId);
      if (screens.length === 0) {
        shScreenSelect.innerHTML = '<option value="">No screens. Create one first!</option>';
        shScreenSelect.setAttribute('disabled', 'true');
      } else {
        shScreenSelect.innerHTML = '<option value="">-- Choose Screen --</option>' +
          screens.map((s) => `<option value="${s.id}">${s.name} (${s.totalSeats} seats)</option>`).join('');
        shScreenSelect.removeAttribute('disabled');
      }
    } catch (err) {
      shScreenSelect.innerHTML = '<option value="">Failed to load screens</option>';
    }
  });
}

// Show feedback inside forms
function showFeedback(el: HTMLDivElement, msg: string, isError = false) {
  el.textContent = msg;
  el.className = `feedback-msg ${isError ? 'feedback-error' : 'feedback-success'}`;
  el.style.display = 'block';
  setTimeout(() => {
    el.style.display = 'none';
  }, 5000);
}

// Fetch screens list with caching
async function fetchScreens(theatreId: string): Promise<Screen[]> {
  if (state.screensMap[theatreId]) {
    return state.screensMap[theatreId];
  }
  const res = await apiFetch(`/screens/${theatreId}`);
  state.screensMap[theatreId] = res.data;
  return res.data;
}

// Load Dropdowns in Admin panel
async function loadAdminDropdowns() {
  try {
    // Fetch theatres
    const resTheatres = await apiFetch('/theatre/get-all-theatres');
    state.theatres = resTheatres.data;
    
    // Fetch movies
    const resMovies = await apiFetch('/movies/get-all-movie');
    state.movies = resMovies.data;

    // Populate theatre dropdowns
    const sTheatre = document.querySelector('#s-theatre') as HTMLSelectElement;
    const shTheatre = document.querySelector('#sh-theatre') as HTMLSelectElement;
    if (sTheatre) {
      sTheatre.innerHTML = '<option value="">-- Choose Theatre --</option>' +
        state.theatres.map((t) => `<option value="${t.id}">${t.name}</option>`).join('');
    }
    if (shTheatre) {
      shTheatre.innerHTML = '<option value="">-- Choose Theatre --</option>' +
        state.theatres.map((t) => `<option value="${t.id}">${t.name}</option>`).join('');
    }

    // Populate movies dropdown
    const shMovie = document.querySelector('#sh-movie') as HTMLSelectElement;
    if (shMovie) {
      shMovie.innerHTML = '<option value="">-- Choose Movie --</option>' +
        state.movies.map((m) => `<option value="${m.id}">${m.title}</option>`).join('');
    }

  } catch (err) {
    console.error('Failed to pre-load dropdown lists for admin panels', err);
  }
}

// Start application authentication check
checkAuth();
