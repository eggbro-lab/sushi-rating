const sushiListElement = document.getElementById('sushi-list');
const topRatedListElement = document.getElementById('top-rated-list');
const sushiForm = document.getElementById('sushi-form');
const modal = document.getElementById('rating-modal');
const modalTitle = document.getElementById('modal-title');
const ratingButtons = document.getElementById('rating-buttons');
const closeModal = document.getElementById('close-modal');

const STORAGE_KEY = 'sushiRatingAppData';
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=900&q=80';

function getDefaultImage(name = '') {
  const imageMap = {
    'Dragon Roll': 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=900&q=80',
    'Salmon Nigiri': 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=900&q=80',
    'Spicy Tuna': 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=900&q=80'
  };

  return imageMap[name] || DEFAULT_IMAGE;
}

let sushiItems = [
  { id: 1, name: 'Dragon Roll', description: 'Crab, avocado, eel sauce', image: getDefaultImage('Dragon Roll'), ratings: [5, 4, 5] },
  { id: 2, name: 'Salmon Nigiri', description: 'Fresh salmon over seasoned rice', image: getDefaultImage('Salmon Nigiri'), ratings: [4, 4, 5] },
  { id: 3, name: 'Spicy Tuna', description: 'Tuna, spicy mayo, scallion', image: getDefaultImage('Spicy Tuna'), ratings: [5, 3, 4] },
  { id: 4, name: 'California Roll', description: 'Crab, avocado, cucumber', image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=900&q=80', ratings: [4, 5, 4] },
  { id: 5, name: 'Eel Avocado Roll', description: 'Grilled eel, avocado, sweet sauce', image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=900&q=80', ratings: [4, 3, 5] },
  { id: 6, name: 'Tuna Tataki', description: 'Seared tuna with citrus and herbs', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=900&q=80', ratings: [5, 4, 4] },
  { id: 7, name: 'Rainbow Roll', description: 'Tuna, salmon, avocado, cucumber', image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=900&q=80', ratings: [4, 5, 4] },
  { id: 8, name: 'Shrimp Tempura Roll', description: 'Crispy shrimp with lettuce and sauce', image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=900&q=80', ratings: [4, 4, 5] },
  { id: 9, name: 'Yellowtail Jalapeño', description: 'Hamachi with fresh jalapeño kick', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=900&q=80', ratings: [5, 3, 4] }
];
let activeSushiId = null;

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      sushiItems = parsed.map((item) => ({
        ...item,
        image: item.image || getDefaultImage(item.name)
      }));
    }
  } catch (error) {
    console.warn('Could not load saved sushi data', error);
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sushiItems));
}

function getAverage(ratings) {
  if (ratings.length === 0) return 0;
  return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
}

function renderStars(value) {
  const stars = [];
  const rounded = Math.round(value);
  for (let i = 1; i <= 5; i += 1) {
    stars.push(`<span class="star">${i <= rounded ? '★' : '☆'}</span>`);
  }
  return stars.join('');
}

function getSortedItems() {
  return [...sushiItems].sort((a, b) => getAverage(b.ratings) - getAverage(a.ratings));
}

function renderTopRated() {
  topRatedListElement.innerHTML = '';

  const topItems = getSortedItems().slice(0, 3);

  if (topItems.length === 0) {
    topRatedListElement.innerHTML = '<p class="metadata">No ratings yet. Be the first to rate a sushi.</p>';
    return;
  }

  topItems.forEach((item, index) => {
    const average = getAverage(item.ratings);
    const card = document.createElement('article');
    card.className = 'top-rated-card';
    card.innerHTML = `
      <span class="top-rated-badge">#${index + 1} Favorite</span>
      <img class="sushi-image" src="${item.image || getDefaultImage(item.name)}" alt="${item.name}" />
      <div>
        <h3>${item.name}</h3>
        <p class="metadata">${item.description}</p>
      </div>
      <div class="rating-summary">
        <div class="stars">${renderStars(average)}</div>
        <span>${average.toFixed(1)} / 5</span>
      </div>
    `;
    topRatedListElement.appendChild(card);
  });
}

function renderSushiList() {
  sushiListElement.innerHTML = '';

  const sortedItems = getSortedItems();

  sortedItems.forEach((item) => {
    const average = getAverage(item.ratings);
    const card = document.createElement('article');
    card.className = 'sushi-card';
    card.innerHTML = `
      <img class="sushi-image" src="${item.image || getDefaultImage(item.name)}" alt="${item.name}" />
      <div>
        <h3>${item.name}</h3>
        <p class="metadata">${item.description}</p>
      </div>
      <div class="rating-summary">
        <div class="stars">${renderStars(average)}</div>
        <span>${average.toFixed(1)} / 5</span>
      </div>
      <button class="button button-primary" data-id="${item.id}">Rate this sushi</button>
    `;

    const button = card.querySelector('button');
    button.addEventListener('click', () => openRatingModal(item.id));
    sushiListElement.appendChild(card);
  });

  renderTopRated();
}

function openRatingModal(id) {
  activeSushiId = id;
  const item = sushiItems.find((s) => s.id === id);
  if (!item) return;

  modalTitle.textContent = `Rate ${item.name}`;
  ratingButtons.innerHTML = '';

  for (let score = 5; score >= 1; score -= 1) {
    const button = document.createElement('button');
    button.className = 'button button-alt';
    button.textContent = `${score} Star${score === 1 ? '' : 's'}`;
    button.addEventListener('click', () => submitRating(score));
    ratingButtons.appendChild(button);
  }

  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
}

function closeRatingModal() {
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
  activeSushiId = null;
}

function submitRating(score) {
  const item = sushiItems.find((s) => s.id === activeSushiId);
  if (!item) return;

  item.ratings.push(score);
  saveData();
  renderSushiList();
  closeRatingModal();
}

sushiForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const nameInput = document.getElementById('sushi-name');
  const descInput = document.getElementById('sushi-desc');
  const imageInput = document.getElementById('sushi-image');
  const newName = nameInput.value.trim();
  const newDesc = descInput.value.trim();
  const newImage = imageInput.value.trim();

  if (!newName || !newDesc) return;

  sushiItems.push({
    id: Date.now(),
    name: newName,
    description: newDesc,
    image: newImage || getDefaultImage(newName),
    ratings: []
  });

  saveData();
  renderSushiList();

  sushiForm.reset();
});

closeModal.addEventListener('click', closeRatingModal);
modal.addEventListener('click', (event) => {
  if (event.target === modal) closeRatingModal();
});

loadData();
renderSushiList();
