const API_URL = 'http://localhost:3000';
let editingVehicleId = null;
let allVehicles = [];

// Éléments index.html
const vehicleList = document.getElementById('vehicle-list');
const logoutBtn = document.getElementById('logout-btn');
const addVehicleForm = document.getElementById('add-vehicle-form');
const searchInput = document.getElementById('search-input');
const vehicleModal = document.getElementById('vehicle-modal');
const modalBody = document.getElementById('modal-body');
const closeModalBtn = document.getElementById('close-modal');

// Éléments login.html
const loginForm = document.getElementById('login-form');

// Éléments register.html
const registerForm = document.getElementById('register-form');

// Élément commun éventuel
const message = document.getElementById('message');


// =========================
// Partie index.html
// =========================

async function loadVehicles() {
  try {
    console.log('Chargement véhicules...');
    const response = await fetch(`${API_URL}/vehicles`);
    console.log('Status fetch :', response.status);

    const text = await response.text();
    console.log('Réponse brute :', text);

    allVehicles = JSON.parse(text);
    renderVehicles(allVehicles);
  } catch (error) {
    console.error('Erreur chargement véhicules :', error);
    if (vehicleList) {
      vehicleList.innerHTML = `<p>Erreur lors du chargement des véhicules.</p>`;
    }
  }
}

function openModal() {
  if (vehicleModal) {
    vehicleModal.classList.remove('hidden');
  }
}

function closeModal() {
  if (vehicleModal) {
    vehicleModal.classList.add('hidden');
  }
}

function addDetailsEvents() {
  const detailButtons = document.querySelectorAll('.details-btn');

  detailButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      const vehicleId = button.dataset.id;

      modalBody.innerHTML = `<p>Chargement...</p>`;
      openModal();

      try {
        const response = await fetch(`${API_URL}/vehicles/${vehicleId}`);
        const vehicle = await response.json();

        if (!response.ok) {
          modalBody.innerHTML = `<p>${vehicle.message || 'Erreur lors du chargement du véhicule.'}</p>`;
          return;
        }

        modalBody.innerHTML = `
          <h2>${vehicle.name}</h2>
          <p><strong>Catégorie :</strong> ${vehicle.category}</p>
          <p><strong>Prix :</strong> ${vehicle.price}</p>
          <p><strong>Vitesse max :</strong> ${vehicle.top_speed}</p>
          <p><strong>Description :</strong> ${vehicle.description || 'Aucune description.'}</p>
          <p><strong>Votes :</strong> ${vehicle.vote_count ?? 0}</p>
        `;
      } catch (error) {
        console.error('Erreur chargement détail véhicule :', error);
        modalBody.innerHTML = `<p>Erreur serveur ou réseau.</p>`;
      }
    });
  });
}

if (closeModalBtn) {
  closeModalBtn.addEventListener('click', closeModal);
}

if (vehicleModal) {
  vehicleModal.addEventListener('click', (e) => {
    if (e.target === vehicleModal) {
      closeModal();
    }
  });
}

function getVotedVehicles() {
  return JSON.parse(localStorage.getItem('votedVehicles') || '[]');
}

function saveVotedVehicle(vehicleId) {
  const votedVehicles = getVotedVehicles();
  const id = Number(vehicleId);

  if (!votedVehicles.includes(id)) {
    votedVehicles.push(id);
    localStorage.setItem('votedVehicles', JSON.stringify(votedVehicles));
  }
}

function renderVehicles(vehicles) {
  if (!vehicleList) return;

  vehicleList.innerHTML = '';

  if (!vehicles.length) {
    vehicleList.innerHTML = '<p>Aucun véhicule trouvé.</p>';
    return;
  }

  const votedVehicles = getVotedVehicles();

  vehicles.forEach((vehicle) => {
    const card = document.createElement('div');
    const alreadyVoted = votedVehicles.includes(Number(vehicle.id));
    card.classList.add('vehicle-card');

    card.innerHTML = `
      <h3>${vehicle.name}</h3>
      <p>Catégorie : ${vehicle.category}</p>
      <p>Prix : ${vehicle.price}</p>
      <p>Vitesse max : ${vehicle.top_speed}</p>
      <p>Description : ${vehicle.description || ''}</p>
      <p>Votes : ${vehicle.vote_count}</p>

      <div class="vehicle-actions">
        <button class="details-btn" data-id="${vehicle.id}">Voir plus</button>
        <button 
          class="vote-btn ${alreadyVoted ? 'voted' : ''}" 
          data-id="${vehicle.id}"
          ${alreadyVoted ? 'disabled' : ''}>
          ${alreadyVoted ? 'Déjà voté' : 'Voter'}
        </button>
        <button class="edit-btn" data-id="${vehicle.id}">Modifier</button>
        <button class="delete-btn" data-id="${vehicle.id}">Supprimer</button>
      </div>
    `;

    vehicleList.appendChild(card);
  });

  addDetailsEvents();
  addVoteEvents();
  addEditEvents();
  addDeleteEvents();
}

function addVoteEvents() {
  const voteButtons = document.querySelectorAll('.vote-btn');

  voteButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      const vehicleId = button.dataset.id;
      const token = localStorage.getItem('token');

      if (!token) {
        alert('Vous devez être connecté pour voter.');
        window.location.href = 'login.html';
        return;
      }

      try {
        const response = await fetch(`${API_URL}/vehicles/${vehicleId}/vote`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await response.json();
        alert(data.message);

        if (response.ok) {
          button.textContent = 'Déjà voté';
          button.disabled = true;
          button.classList.add('voted');
        }

        if (response.ok || response.status === 409) {
          saveVotedVehicle(vehicleId);
          button.textContent = 'Déjà voté';
          button.disabled = true;
          button.classList.add('voted');
        }
      } catch (error) {
        console.error('Erreur lors du vote :', error);
        alert('Erreur lors du vote.');
      }
    });
  });
}

function addEditEvents() {
  const editButtons = document.querySelectorAll('.edit-btn');

  editButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const vehicleId = Number(button.dataset.id);

      const card = button.closest('.vehicle-card');
      if (!card) return;

      const vehicleName = card.querySelector('h3')?.textContent || '';
      const paragraphs = card.querySelectorAll('p');

      const category = paragraphs[0]?.textContent.replace('Catégorie : ', '') || '';
      const price = paragraphs[1]?.textContent.replace('Prix : ', '') || '';
      const topSpeed = paragraphs[2]?.textContent.replace('Vitesse max : ', '') || '';
      const description = paragraphs[3]?.textContent.replace('Description : ', '') || '';

      document.getElementById('name').value = vehicleName;
      document.getElementById('category').value = category;
      document.getElementById('price').value = price;
      document.getElementById('top_speed').value = topSpeed;
      document.getElementById('description').value = description;

      editingVehicleId = vehicleId;

      if (message) {
        message.textContent = `Mode modification activé pour le véhicule ID ${vehicleId}`;
      }

      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  });
}

function addDeleteEvents() {
  const deleteButtons = document.querySelectorAll('.delete-btn');

  deleteButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      const vehicleId = button.dataset.id;
      const token = localStorage.getItem('token');

      if (!token) {
        alert('Vous devez être connecté pour supprimer un véhicule.');
        window.location.href = 'login.html';
        return;
      }

      const confirmDelete = confirm('Voulez-vous vraiment supprimer ce véhicule ?');

      if (!confirmDelete) {
        return;
      }

      try {
        const response = await fetch(`${API_URL}/vehicles/${vehicleId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await response.json();
        alert(data.message);

        if (response.ok) {
          loadVehicles();
        }
      } catch (error) {
        console.error('Erreur lors de la suppression :', error);
        alert('Erreur lors de la suppression.');
      }
    });
  });
}

if (searchInput) {
  searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.trim().toLowerCase();

    const filteredVehicles = allVehicles.filter((vehicle) => {
      const name = vehicle.name?.toLowerCase() || '';
      const category = vehicle.category?.toLowerCase() || '';

      return name.includes(searchTerm) || category.includes(searchTerm);
    });

    renderVehicles(filteredVehicles);
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    alert('Déconnexion réussie.');
    window.location.href = 'index.html';
  });
}


// =========================
// Ajout / modification véhicule
// =========================

if (addVehicleForm) {
  addVehicleForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');

    if (!token) {
      alert('Vous devez être connecté pour ajouter ou modifier un véhicule.');
      window.location.href = 'login.html';
      return;
    }

    const name = document.getElementById('name').value.trim();
    const category = document.getElementById('category').value.trim();
    const price = document.getElementById('price').value.trim();
    const top_speed = document.getElementById('top_speed').value.trim();
    const image_url = document.getElementById('image_url').value.trim();
    const description = document.getElementById('description').value.trim();

    try {
      const url = editingVehicleId
        ? `${API_URL}/vehicles/${editingVehicleId}`
        : `${API_URL}/vehicles/add`;

      const method = editingVehicleId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          category,
          price,
          top_speed,
          image_url,
          description
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (message) {
          message.textContent = data.message || 'Erreur lors de l’opération sur le véhicule';
        }
        return;
      }

      if (message) {
        message.textContent = data.message || 'Opération réussie';
      }

      addVehicleForm.reset();
      editingVehicleId = null;
      loadVehicles();
    } catch (error) {
      console.error('Erreur ajout / modification véhicule :', error);

      if (message) {
        message.textContent = 'Erreur serveur ou réseau';
      }
    }
  });
}


// =========================
// Partie login.html
// =========================

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        if (message) {
          message.textContent = data.message || 'Erreur de connexion';
        }
        return;
      }

      localStorage.setItem('token', data.token);

      if (message) {
        message.textContent = 'Connexion réussie';
      }

      window.location.href = 'index.html';
    } catch (error) {
      console.error('Erreur login :', error);

      if (message) {
        message.textContent = 'Erreur serveur ou réseau';
      }
    }
  });
}


// =========================
// Partie register.html
// =========================

if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        if (message) {
          message.textContent = data.message || 'Erreur d’inscription';
        }
        return;
      }

      if (message) {
        message.textContent = 'Inscription réussie, redirection...';
      }

      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1000);
    } catch (error) {
      console.error('Erreur register :', error);

      if (message) {
        message.textContent = 'Erreur serveur ou réseau';
      }
    }
  });
}


// =========================
// Initialisation
// =========================

if (vehicleList) {
  loadVehicles();
}