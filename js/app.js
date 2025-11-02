// 🐾 Pups & Parks™ - App JavaScript

// ===== GLOBAL STATE =====
const state = {
  posts: JSON.parse(localStorage.getItem('posts')) || [],
  currentUser: {
    name: 'Alex Thompson',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face'
  }
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
  // Initialize Lucide icons
  lucide.createIcons();
  
  // Load posts from localStorage
  loadPosts();
  
  // Initialize event listeners
  initializeEventListeners();
  
  // Add smooth scrolling
  addSmoothScrolling();
});

// ===== EVENT LISTENERS =====
function initializeEventListeners() {
  // Navigation smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
  
  // Button click effects
  document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function(e) {
      // Create ripple effect
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      ripple.classList.add('ripple');
      
      this.appendChild(ripple);
      
      setTimeout(() => ripple.remove(), 600);
    });
  });
}

// ===== FEED FUNCTIONS =====
function createPost() {
  const postText = document.getElementById('postText');
  const text = postText.value.trim();
  
  if (!text) {
    showNotification('Please write something to post!', 'warning');
    return;
  }
  
  const newPost = {
    id: Date.now(),
    user: state.currentUser.name,
    avatar: state.currentUser.avatar,
    content: text,
    image: null,
    location: null,
    timestamp: new Date(),
    likes: 0,
    comments: [],
    liked: false
  };
  
  state.posts.unshift(newPost);
  savePosts();
  
  // Clear composer
  postText.value = '';
  
  // Reload feed
  loadPosts();
  
  showNotification('Post created successfully!', 'success');
}

function loadPosts() {
  const feedContainer = document.getElementById('feedPosts');
  if (!feedContainer) return;
  
  // Clear existing posts (keep sample posts)
  const existingPosts = feedContainer.querySelectorAll('.post-card:not(.sample-post)');
  existingPosts.forEach(post => post.remove());
  
  // Add new posts
  state.posts.forEach(post => {
    const postElement = createPostElement(post);
    feedContainer.insertBefore(postElement, feedContainer.firstChild);
  });
  
  // Reinitialize icons
  lucide.createIcons();
}

function createPostElement(post) {
  const postCard = document.createElement('article');
  postCard.className = 'post-card glass';
  postCard.innerHTML = `
    <div class="post-header">
      <div class="user-info">
        <img src="${post.avatar}" alt="${post.user}" class="user-avatar">
        <div class="user-details">
          <h4>${post.user}</h4>
          <span class="post-time">${formatTime(post.timestamp)}</span>
        </div>
      </div>
      <button class="post-menu" onclick="showPostMenu(${post.id})">
        <i data-lucide="more-horizontal"></i>
      </button>
    </div>
    
    <div class="post-content">
      <p>${escapeHtml(post.content)}</p>
      ${post.image ? `<img src="${post.image}" alt="Post image" class="post-image">` : ''}
      ${post.location ? `
        <div class="location-tag">
          <i data-lucide="map-pin"></i>
          <span>${post.location}</span>
        </div>
      ` : ''}
    </div>
    
    <div class="post-actions">
      <button class="action-btn ${post.liked ? 'liked' : ''}" onclick="toggleLike(${post.id})">
        <i data-lucide="heart"></i>
        <span>${post.likes}</span>
      </button>
      <button class="action-btn" onclick="toggleComments(${post.id})">
        <i data-lucide="message-circle"></i>
        <span>${post.comments.length}</span>
      </button>
      <button class="action-btn" onclick="sharePost(${post.id})">
        <i data-lucide="share-2"></i>
        <span>Share</span>
      </button>
    </div>
    
    <div class="comments-section" id="comments-${post.id}" style="display: none;">
      <div class="comments-list">
        ${post.comments.map(comment => `
          <div class="comment">
            <img src="${comment.avatar}" alt="${comment.user}" class="comment-avatar">
            <div class="comment-content">
              <strong>${comment.user}</strong>
              <span>${escapeHtml(comment.text)}</span>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="comment-input">
        <input type="text" placeholder="Add a comment..." 
               onkeypress="if(event.key==='Enter') addComment(${post.id}, this.value)">
      </div>
    </div>
  `;
  
  return postCard;
}

// ===== POST INTERACTIONS =====
function toggleLike(postId) {
  const post = state.posts.find(p => p.id === postId);
  if (!post) return;
  
  post.liked = !post.liked;
  post.likes += post.liked ? 1 : -1;
  
  savePosts();
  loadPosts();
  
  // Animate like button
  const likeButton = document.querySelector(`[onclick="toggleLike(${postId})"]`);
  if (likeButton) {
    likeButton.style.transform = 'scale(1.2)';
    setTimeout(() => {
      likeButton.style.transform = 'scale(1)';
    }, 200);
  }
}

function toggleComments(postId) {
  const commentsSection = document.getElementById(`comments-${postId}`);
  if (!commentsSection) return;
  
  const isVisible = commentsSection.style.display !== 'none';
  commentsSection.style.display = isVisible ? 'none' : 'block';
  
  if (!isVisible) {
    commentsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function addComment(postId, text) {
  if (!text.trim()) return;
  
  const post = state.posts.find(p => p.id === postId);
  if (!post) return;
  
  post.comments.push({
    user: state.currentUser.name,
    avatar: state.currentUser.avatar,
    text: text.trim(),
    timestamp: new Date()
  });
  
  savePosts();
  loadPosts();
  
  // Clear input
  const input = document.querySelector(`#comments-${postId} input`);
  if (input) input.value = '';
}

function sharePost(postId) {
  const post = state.posts.find(p => p.id === postId);
  if (!post) return;
  
  if (navigator.share) {
    navigator.share({
      title: 'Pups & Parks Post',
      text: post.content,
      url: window.location.href
    });
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(`${post.content} - ${window.location.href}`);
    showNotification('Link copied to clipboard!', 'success');
  }
}

function showPostMenu(postId) {
  // Simple menu (can be enhanced with proper dropdown)
  const action = confirm('Delete this post?');
  if (action) {
    state.posts = state.posts.filter(p => p.id !== postId);
    savePosts();
    loadPosts();
    showNotification('Post deleted!', 'success');
  }
}

// ===== COMPOSER FUNCTIONS =====
function addPhoto() {
  document.getElementById('photoInput').click();
}

function handlePhotoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    // In a real app, you would upload to server
    showNotification('Photo ready to upload!', 'success');
  };
  reader.readAsDataURL(file);
}

function addLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      // In a real app, you would reverse geocode
      showNotification('Location added!', 'success');
    }, () => {
      showNotification('Unable to get location', 'error');
    });
  }
}

function addTag() {
  const postText = document.getElementById('postText');
  postText.value += ' #';
  postText.focus();
}

// ===== PROFILE FUNCTIONS =====
function editProfile() {
  showNotification('Profile editing coming soon!', 'info');
}

function toggleSetting(settingName, enabled) {
  showNotification(`${settingName} ${enabled ? 'enabled' : 'disabled'}`, 'success');
}

// ===== UTILITY FUNCTIONS =====
function savePosts() {
  localStorage.setItem('posts', JSON.stringify(state.posts));
}

function formatTime(timestamp) {
  const now = new Date();
  const postTime = new Date(timestamp);
  const diffMs = now - postTime;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return postTime.toLocaleDateString();
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <i data-lucide="${getIconForType(type)}"></i>
    <span>${message}</span>
  `;
  
  // Add styles
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${getColorForType(type)};
    color: white;
    padding: 16px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    display: flex;
    align-items: center;
    gap: 12px;
    z-index: 10000;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  lucide.createIcons();
  
  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  // Remove after delay
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function getIconForType(type) {
  const icons = {
    success: 'check-circle',
    error: 'x-circle',
    warning: 'alert-circle',
    info: 'info'
  };
  return icons[type] || 'info';
}

function getColorForType(type) {
  const colors = {
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6'
  };
  return colors[type] || '#3B82F6';
}

function addSmoothScrolling() {
  // Add smooth scroll behavior for older browsers
  document.documentElement.style.scrollBehavior = 'smooth';
}

// ===== PRICING FUNCTIONS =====
function selectPlan(planType) {
  showNotification(`${planType} plan selected! Proceeding to checkout...`, 'success');
  
  // In a real app, this would redirect to payment
  setTimeout(() => {
    window.location.href = '#checkout';
  }, 1500);
}

// ===== ANIMATION OBSERVER =====
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Observe elements for scroll animations
document.addEventListener('DOMContentLoaded', () => {
  const animatedElements = document.querySelectorAll('.feature-card, .pricing-card, .post-card');
  animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
});
