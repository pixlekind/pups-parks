/* Pups & Parks™ app bootstrap */
// Minimal local “DB”
const store = {
  posts: JSON.parse(localStorage.getItem("pp_posts") || "[]"),
  client: {
    favorites: JSON.parse(localStorage.getItem("pp_client_favorites") || "[]"),
    bookings: JSON.parse(localStorage.getItem("pp_client_bookings") || "[]"),
  },
  walker: {
    bookings: JSON.parse(localStorage.getItem("pp_walker_bookings") || "[]"),
    payouts: JSON.parse(localStorage.getItem("pp_walker_payouts") || "[]"),
    social: JSON.parse(localStorage.getItem("pp_walker_social") || "{}"),
    earningsMonth: Number(localStorage.getItem("pp_walker_earnings") || 0),
  },
};

// Lucide icons
function initIcons() {
  if (window.lucide && lucide.createIcons) lucide.createIcons();
}

// Helpers
function save() {
  localStorage.setItem("pp_posts", JSON.stringify(store.posts));
  localStorage.setItem("pp_client_favorites", JSON.stringify(store.client.favorites));
  localStorage.setItem("pp_client_bookings", JSON.stringify(store.client.bookings));
  localStorage.setItem("pp_walker_bookings", JSON.stringify(store.walker.bookings));
  localStorage.setItem("pp_walker_payouts", JSON.stringify(store.walker.payouts));
  localStorage.setItem("pp_walker_social", JSON.stringify(store.walker.social));
  localStorage.setItem("pp_walker_earnings", String(store.walker.earningsMonth));
}

function currencyGBP(val) {
  return `£${Number(val || 0).toFixed(2)}`;
}

// Navigation actions
function wireNav() {
  document.querySelectorAll("[data-action='signin']").forEach(btn =>
    btn.addEventListener("click", () => alert("Sign in flow coming soon"))
  );
  document.querySelectorAll("[data-action='get-started']").forEach(btn =>
    btn.addEventListener("click", () => window.location.href = "client-dashboard.html")
  );
}

// Feed page logic
function initFeed() {
  const postText = document.getElementById("postText");
  const feedPosts = document.getElementById("feedPosts");
  const photoInput = document.getElementById("photoInput");

  if (!feedPosts) return; // not on feed page

  renderFeed(feedPosts);

  window.createPost = function () {
    const text = (postText?.value || "").trim();
    if (!text) return;
    const newPost = {
      id: Date.now(),
      user: "You",
      time: "just now",
      text,
      image: window._lastPhoto || null,
      likes: 0,
      comments: [],
      location: window._lastLocation || null,
    };
    store.posts.unshift(newPost);
    save();
    postText.value = "";
    window._lastPhoto = null;
    window._lastLocation = null;
    renderFeed(feedPosts);
    initIcons();
  };

  window.addPhoto = () => photoInput?.click();
  window.handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { window._lastPhoto = reader.result; alert("Photo attached."); };
    reader.readAsDataURL(file);
  };

  window.addLocation = () => {
    const loc = prompt("Enter location or park name");
    if (loc) window._lastLocation = loc;
  };

  window.toggleLike = (id) => {
    const post = store.posts.find(p => p.id === id);
    if (!post) return;
    post.likes = (post.likes || 0) + 1;
    save();
    renderFeed(feedPosts);
    initIcons();
  };

  window.toggleComments = (id) => {
    const el = document.getElementById(`comments-${id}`);
    if (el) el.style.display = el.style.display === "none" ? "block" : "none";
  };

  window.addComment = (id, text) => {
    const post = store.posts.find(p => p.id === id);
    if (!post || !text?.trim()) return;
    post.comments.push({ user: "You", text, time: "just now" });
    save();
    renderFeed(feedPosts);
  };

  window.sharePost = (id) => alert(`Shared post ${id}`);
}

function renderFeed(container) {
  // Preload sample posts if empty
  if (store.posts.length === 0) {
    store.posts = [
      { id: 1001, user: "Sarah M.", time: "2 hours ago", text: "Bella loved Central Park 🍂🐕", image: null, likes: 24, comments: [] },
      { id: 1002, user: "David L.", time: "5 hours ago", text: "New walker ready in Downtown 🎉", image: null, likes: 15, comments: [] },
    ];
    save();
  }
  container.innerHTML = store.posts.map(p => `
    <article class="post-card">
      <div class="post-header">
        <div class="user-info">
          <div class="user-avatar" style="background:#eee;width:50px;height:50px;border-radius:50%"></div>
          <div class="user-details"><h4>${p.user}</h4><span class="post-time">${p.time}</span></div>
        </div>
        <button class="post-menu"><i data-lucide="more-horizontal"></i></button>
      </div>
      <div class="post-content">
        <p>${p.text}</p>
        ${p.image ? `<img src="${p.image}" alt="Post image" class="post-image" />` : ""}
        ${p.location ? `<div class="location-tag"><i data-lucide="map-pin"></i><span>${p.location}</span></div>` : ""}
      </div>
      <div class="post-actions">
        <button class="action-btn" onclick="toggleLike(${p.id})"><i data-lucide="heart"></i><span>${p.likes || 0}</span></button>
        <button class="action-btn" onclick="toggleComments(${p.id})"><i data-lucide="message-circle"></i><span>${p.comments?.length || 0}</span></button>
        <button class="action-btn" onclick="sharePost(${p.id})"><i data-lucide="share-2"></i><span>Share</span></button>
      </div>
      <div class="comments-section" id="comments-${p.id}" style="display:none;">
        ${(p.comments || []).map(c => `
          <div class="comment">
            <div class="comment-avatar" style="background:#eee;width:30px;height:30px;border-radius:50%"></div>
            <div class="comment-content"><strong>${c.user}</strong><span>${c.text}</span></div>
          </div>
        `).join("")}
        <div class="comment-input">
          <input type="text" placeholder="Add a comment..." onkeypress="if(event.key==='Enter'){ addComment(${p.id}, this.value); this.value=''; }">
        </div>
      </div>
    </article>
  `).join("");
}

// Client dashboard: find walkers/parks
const SAMPLE_WALKERS = [
  { id: "w1", name: "Alex T.", rating: 4.9, walks: 45, city: "Southend-on-Sea", distanceKm: 1.2 },
  { id: "w2", name: "Lisa M.", rating: 4.8, walks: 62, city: "Leigh-on-Sea", distanceKm: 3.5 },
  { id: "w3", name: "James R.", rating: 5.0, walks: 38, city: "Westcliff-on-Sea", distanceKm: 4.1 },
];

const SAMPLE_PARKS = [
  { id: "p1", name: "Southchurch Park", postsToday: 12, city: "Southend-on-Sea", distanceKm: 1.0 },
  { id: "p2", name: "Priory Park", postsToday: 18, city: "Southend-on-Sea", distanceKm: 2.2 },
  { id: "p3", name: "Chalkwell Park", postsToday: 9, city: "Westcliff-on-Sea", distanceKm: 3.8 },
];

function initClientDashboard() {
  const walkersEl = document.getElementById("nearbyWalkers");
  const parksEl = document.getElementById("nearbyParks");
  const btnGeoWalkers = document.getElementById("btnGeoWalkers");
  const btnSearchWalkers = document.getElementById("btnSearchWalkers");
  const postcodeWalkers = document.getElementById("postcodeWalkers");
  const btnGeoParks = document.getElementById("btnGeoParks");
  const btnSearchParks = document.getElementById("btnSearchParks");
  const postcodeParks = document.getElementById("postcodeParks");
  const clientBookings = document.getElementById("clientBookings");
  const clientFavorites = document.getElementById("clientFavorites");
  if (!walkersEl || !parksEl) return;

  function renderWalkers(list) {
    walkersEl.innerHTML = list.map(w => `
      <div class="post-card">
        <div class="post-header">
          <div class="user-info">
            <div class="user-avatar" style="background:#eee;width:50px;height:50px;border-radius:50%"></div>
            <div class="user-details"><h4>${w.name}</h4><span class="post-time">⭐ ${w.rating} (${w.walks} walks)</span></div>
          </div>
        </div>
        <div class="post-actions">
          <button class="action-btn" onclick="bookWalker('${w.id}')"><i data-lucide='calendar-plus'></i><span>Book</span></button>
          <button class="action-btn" onclick="favoriteWalker('${w.id}')"><i data-lucide='star'></i><span>Save</span></button>
          <span style="margin-left:auto;color:var(--neutral-600)">${w.city} • ${w.distanceKm} km</span>
        </div>
      </div>
    `).join("");
    initIcons();
  }

  function renderParks(list) {
    parksEl.innerHTML = list.map(p => `
      <div class="post-card">
        <div class="post-header"><div class="user-details"><h4>${p.name}</h4><span class="post-time">${p.city} • ${p.distanceKm} km</span></div></div>
        <div class="post-actions">
          <button class="action-btn" onclick="viewPark('${p.id}')"><i data-lucide='map'></i><span>View</span></button>
          <span style="margin-left:auto;color:var(--neutral-600)">${p.postsToday} posts today</span>
        </div>
      </div>
    `).join("");
    initIcons();
  }

  function searchByCity(city) {
    const c = (city || "").toLowerCase();
    renderWalkers(SAMPLE_WALKERS.filter(w => w.city.toLowerCase().includes(c)));
    renderParks(SAMPLE_PARKS.filter(p => p.city.toLowerCase().includes(c)));
  }

  btnGeoWalkers?.addEventListener("click", () => {
    navigator.geolocation?.getCurrentPosition(
      () => { renderWalkers(SAMPLE_WALKERS); },
      () => { alert("Location permission denied. Showing nearby by city."); renderWalkers(SAMPLE_WALKERS); }
    );
  });
  btnSearchWalkers?.addEventListener("click", () => searchByCity(postcodeWalkers?.value));
  btnGeoParks?.addEventListener("click", () => {
    navigator.geolocation?.getCurrentPosition(
      () => { renderParks(SAMPLE_PARKS); },
      () => { alert("Location permission denied. Showing nearby by city."); renderParks(SAMPLE_PARKS); }
    );
  });
  btnSearchParks?.addEventListener("click", () => searchByCity(postcodeParks?.value));

  // Bookings & favorites
  window.bookWalker = (id) => {
    const walker = SAMPLE_WALKERS.find(w => w.id === id);
    if (!walker) return;
    store.client.bookings.push({ id: Date.now(), walker: walker.name, at: new Date().toISOString() });
    save(); renderClientBookings(); alert(`Booked ${walker.name}`);
  };
  window.favoriteWalker = (id) => {
    const walker = SAMPLE_WALKERS.find(w => w.id === id);
    if (!walker) return;
    if (!store.client.favorites.find(f => f.name === walker.name)) store.client.favorites.push({ name: walker.name });
    save(); renderClientFavorites(); alert(`Saved ${walker.name}`);
  };
  window.viewPark = (id) => alert(`Viewing park ${id}`);

  function renderClientBookings() {
    clientBookings.innerHTML = (store.client.bookings || []).map(b => `
      <div class="post-card"><div class="post-content"><p>Walk with ${b.walker}</p><p class="post-time">${new Date(b.at).toLocaleString()}</p></div></div>
    `).join("") || "<p class='sub'>No upcoming bookings</p>";
  }

  function renderClientFavorites() {
    clientFavorites.innerHTML = (store.client.favorites || []).map(f => `
      <div class="post-card"><div class="post-content"><p>⭐ ${f.name}</p></div></div>
    `).join("") || "<p class='sub'>No saved walkers</p>";
  }

  renderWalkers(SAMPLE_WALKERS);
  renderParks(SAMPLE_PARKS);
  renderClientBookings();
  renderClientFavorites();
}

// Walker dashboard logic
function initWalkerDashboard() {
  const walkerBookingsEl = document.getElementById("walkerBookings");
  const walkerPayoutsEl = document.getElementById("walkerPayouts");
  const btnNewBooking = document.getElementById("btnNewBooking");
  const btnTriggerPayout = document.getElementById("btnTriggerPayout");
  const earningsEl = document.getElementById("walkerEarnings");
  const bookingsCountEl = document.getElementById("walkerBookingsCount");
  const btnSubscribe = document.getElementById("btnSubscribe");
  const btnSaveSocial = document.getElementById("btnSaveSocial");
  const socialInputs = {
    instagram: document.getElementById("socialInstagram"),
    twitter: document.getElementById("socialTwitter"),
    facebook: document.getElementById("socialFacebook"),
    website: document.getElementById("socialWebsite"),
  };
  if (!walkerBookingsEl) return;

  function renderWalker() {
    walkerBookingsEl.innerHTML = (store.walker.bookings || []).map(b => `
      <div class="post-card"><div class="post-content"><p>${b.client} • ${b.park}</p><p class="post-time">${new Date(b.at).toLocaleString()}</p></div></div>
    `).join("") || "<p class='sub'>No bookings yet</p>";

    walkerPayoutsEl.innerHTML = (store.walker.payouts || []).map(p => `
      <div class="post-card"><div class="post-content"><p>Payout ${currencyGBP(p.amount)}</p><p class="post-time">${new Date(p.at).toLocaleString()}</p></div></div>
    `).join("") || "<p class='sub'>No payouts yet</p>";

    earningsEl.textContent = currencyGBP(store.walker.earningsMonth);
    bookingsCountEl.textContent = (store.walker.bookings || []).length;
  }

  btnNewBooking?.addEventListener("click", () => {
    store.walker.bookings.push({
      id: Date.now(),
      client: "Test client",
      park: "Southchurch Park",
      at: new Date().toISOString(),
    });
    store.walker.earningsMonth += 12.0; // sample earning per walk
    save(); renderWalker();
  });

  btnTriggerPayout?.addEventListener("click", () => {
    if (store.walker.earningsMonth <= 0) return alert("No earnings to pay out.");
    store.walker.payouts.push({ id: Date.now(), amount: store.walker.earningsMonth, at: new Date().toISOString() });
    store.walker.earningsMonth = 0;
    save(); renderWalker(); alert("Payout triggered (test).");
  });

  btnSubscribe?.addEventListener("click", () => {
    alert("Subscription: £25/month. Stripe checkout will be integrated next.");
  });

  btnSaveSocial?.addEventListener("click", () => {
    const social = {};
    Object.entries(socialInputs).forEach(([key, input]) => {
      const val = input?.value?.trim();
      if (val) social[key] = val;
    });
    store.walker.social = social;
    save();
    alert("Social links saved.");
  });

  // Prefill socials
  Object.entries(store.walker.social || {}).forEach(([key, val]) => {
    if (socialInputs[key]) socialInputs[key].value = val;
  });

  renderWalker();
}

// Bootstrap
document.addEventListener("DOMContentLoaded", () => {
  wireNav();
  initIcons();
  initFeed();
  initClientDashboard();
  initWalkerDashboard();
});
