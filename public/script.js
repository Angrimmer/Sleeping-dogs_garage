const API_URL = 'http://localhost:3000';
let editingVehicleId = null;
let allVehicles = [];

const vehicleList = document.getElementById('vehicle-list');
const logoutBtn = document.getElementById('logout-btn');
const addVehicleForm = document.getElementById('add-vehicle-form');
const searchInput = document.getElementById('search-input');
const vehicleModal = document.getElementById('vehicle-modal');
const modalBody = document.getElementById('modal-body');
const closeModalBtn = document.getElementById('close-modal');

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const message = document.getElementById('message');

function clearElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

function createTextElement(tag, text) {
  const element = document.createElement(tag);
  element.textContent = text;
  return element;
}

function createInfoLine(label, value) {
  const p = document.createElement('p');
  p.textContent = `${label} : ${value ?? ''}`;
  return p;
}

function isValidHttpUrl(value) {
  if (!value) return true;

  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

async function loadVehicles() {
  try {
    const response = await fetch(`${API_URL}/vehicles`);
    const vehicles = await response.json();

    allVehicles = vehicles;
    renderVehicles(allVehicles);
  } catch (error) {
    console.error('Erreur chargement véhicules :', error);

    if (vehicleList) {
      clearElement(vehicleList);
      vehicleList.appendChild(
        createTextElement('p', 'Erreur lors du chargement des véhicules.')
      );
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

function renderVehicleDetails(vehicle) {
  clearElement(modalBody);

  modalBody.appendChild(createTextElement('h2', vehicle.name));
  modalBody.appendChild(createInfoLine('Catégorie', vehicle.category));
  modalBody.appendChild(createInfoLine('Prix', vehicle.price));
  modalBody.appendChild(createInfoLine('Vitesse max', vehicle.top_speed));
  modalBody.appendChild(
    createInfoLine('Description', vehicle.description || 'Aucune description.')
  );
  modalBody.appendChild(createInfoLine('Votes', vehicle.vote_count ?? 0));
}

function addDetailsEvents() {
  const detailButtons = document.querySelectorAll('.details-btn');

  detailButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      const vehicleId = button.dataset.id;

      clearElement(modalBody);
      modalBody.appendChild(createTextElement('p', 'Chargement...'));
      openModal();

      try {
        const response = await fetch(`${API_URL}/vehicles/${vehicleId}`);
        const vehicle = await response.json();

        if (!response.ok) {
          clearElement(modalBody);
          modalBody.appendChild(
            createTextElement(
              'p',
              vehicle.message || 'Erreur lors du chargement du véhicule.'
            )
          );
          return;
        }

        renderVehicleDetails(vehicle);
      } catch (error) {
        console.error('Erreur chargement détail véhicule :', error);

        clearElement(modalBody);
        modalBody.appendChild(
          createTextElement('p', 'Erreur serveur ou réseau.')
        );
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

function createButton(text, className, vehicleId) {
  const button = document.createElement('button');
  button.textContent = text;
  button.classList.add(className);
  button.dataset.id = vehicleId;
  return button;
}

function renderVehicles(vehicles) {
  if (!vehicleList) return;

  clearElement(vehicleList);

  if (!vehicles.length) {
    vehicleList.appendChild(createTextElement('p', 'Aucun véhicule trouvé.'));
    return;
  }

  const votedVehicles = getVotedVehicles();

  vehicles.forEach((vehicle) => {
    const card = document.createElement('div');
    card.classList.add('vehicle-card');

    const alreadyVoted = votedVehicles.includes(Number(vehicle.id));

    card.appendChild(createTextElement('h3', vehicle.name));
    card.appendChild(createInfoLine('Catégorie', vehicle.category));
    card.appendChild(createInfoLine('Prix', vehicle.price));
    card.appendChild(createInfoLine('Vitesse max', vehicle.top_speed));
    card.appendChild(createInfoLine('Description', vehicle.description || ''));
    card.appendChild(createInfoLine('Votes', vehicle.vote_count));

    const actions = document.createElement('div');
    actions.classList.add('vehicle-actions');

    const detailsBtn = createButton('Voir plus', 'details-btn', vehicle.id);

    const voteBtn = createButton(
      alreadyVoted ? 'Déjà voté' : 'Voter',
      'vote-btn',
      vehicle.id
    );

    if (alreadyVoted) {
      voteBtn.disabled = true;
      voteBtn.classList.add('voted');
    }

    const editBtn = createButton('Modifier', 'edit-btn', vehicle.id);
    const deleteBtn = createButton('Supprimer', 'delete-btn', vehicle.id);

    actions.appendChild(detailsBtn);
    actions.appendChild(voteBtn);
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    card.appendChild(actions);
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
      const vehicle = allVehicles.find((v) => Number(v.id) === vehicleId);

      if (!vehicle) return;

      document.getElementById('name').value = vehicle.name || '';
      document.getElementById('category').value = vehicle.category || '';
      document.getElementById('price').value = vehicle.price || '';
      document.getElementById('top_speed').value = vehicle.top_speed || '';
      document.getElementById('image_url').value = vehicle.image_url || '';
      document.getElementById('description').value = vehicle.description || '';

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

      if (!confirmDelete) return;

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

    if (!isValidHttpUrl(image_url)) {
      if (message) {
        message.textContent = "L'URL de l'image doit commencer par http:// ou https://";
      }
      return;
    }

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

if (vehicleList) {
  loadVehicles();
}