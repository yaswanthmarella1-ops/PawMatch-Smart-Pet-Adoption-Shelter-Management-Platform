window.navigateTo = navigateTo;
window.filterAnimals = filterAnimals;
window.approveApplication = approveApplication;

document.addEventListener("DOMContentLoaded", async () => {
    try {
        await seedDatabase();
        setupNavigation();
        setupEventListeners();
        navigateTo('dashboard'); 
    } catch (error) {
        console.error("App Init Failed:", error);
    }
});

// ROUTER
function setupNavigation() {
    document.querySelectorAll('.nav-link[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); 
            navigateTo(e.currentTarget.getAttribute('data-page'));
        });
    });
}

function navigateTo(page) {
    document.querySelectorAll('.page-section').forEach(sec => sec.classList.add('d-none'));
    document.querySelectorAll('.nav-link').forEach(nav => nav.classList.remove('active'));

    const target = document.getElementById(`${page}-section`);
    if(target) target.classList.remove('d-none');
    
    const activeNav = document.querySelector(`.nav-link[data-page="${page}"]`);
    if(activeNav) activeNav.classList.add('active');

    const titles = { 'dashboard': 'Good morning, Neha', 'animals': 'Animals & Medical', 'applications': 'Applications Overview', 'visits': 'Visit Calendar' };
    document.getElementById('page-title').innerText = titles[page];

    if (page === 'dashboard') { loadDashboardStats(); renderCharts(); }
    if (page === 'animals') { loadAnimals(); }
    if (page === 'applications') { loadApplications(); }
    if (page === 'visits') { loadVisits(); }
}

// DASHBOARD STATS
async function loadDashboardStats() {
    const animals = await db.animals.toArray();
    const apps = await db.applications.toArray();
    const visits = await db.visits.toArray();

    document.getElementById('stat-animals').innerText = animals.length;
    document.getElementById('stat-available').innerText = `${animals.filter(a => a.status === 'Available').length} available`;
    document.getElementById('stat-apps').innerText = apps.filter(a => a.status !== 'Approved').length;
    document.getElementById('stat-visits').innerText = visits.length;
}

// ANIMALS GRID
async function loadAnimals() {
    const animals = await db.animals.toArray();
    renderAnimalsGrid(animals);
}

function renderAnimalsGrid(animals) {
    const grid = document.getElementById('animals-grid');
    grid.innerHTML = '';
    
    if(animals.length === 0) {
        grid.innerHTML = '<div class="col-12 text-center text-muted py-5">No animals found.</div>';
        return;
    }

    animals.forEach(animal => {
        const tagsHtml = (animal.tags || []).map(t => `<span class="tag-badge">${t}</span>`).join('');
        const statusClass = animal.status ? animal.status.replace(' ', '') : 'Available';
        const imageUrl = animal.image || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=600&auto=format&fit=crop';

        grid.innerHTML += `
            <div class="col-md-6 col-xl-3">
                <div class="animal-card">
                    <img src="${imageUrl}" class="animal-img" alt="${animal.name}">
                    <div class="animal-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <h5 class="animal-name">${animal.name}</h5>
                            <span class="status-badge status-${statusClass}">${animal.status}</span>
                        </div>
                        <div class="animal-meta">${animal.species} · ${animal.breed} · ${animal.age}</div>
                        <div class="d-flex flex-wrap gap-2 mt-3">${tagsHtml}</div>
                    </div>
                </div>
            </div>
        `;
    });
}

async function filterAnimals() {
    const term = document.getElementById('search-animals').value.toLowerCase();
    const animals = await db.animals.toArray();
    renderAnimalsGrid(animals.filter(a => a.name.toLowerCase().includes(term) || a.breed.toLowerCase().includes(term)));
}

// APPLICATIONS TABLE
async function loadApplications() {
    const apps = await db.applications.toArray();
    const animals = await db.animals.toArray();
    const tbody = document.getElementById('applications-table-body');
    tbody.innerHTML = '';

    apps.forEach(app => {
        const animal = animals.find(a => a.id === app.animalId);
        const animalName = animal ? animal.name : 'Unknown';
        
        let actionBtn = app.status !== 'Approved' 
            ? `<button type="button" class="btn btn-sm btn-primary-green" onclick="approveApplication(${app.id}, ${app.animalId})">Approve</button>`
            : `<span class="text-success fw-bold"><i class="bi bi-check-circle-fill"></i> Adopted</span>`;

        tbody.innerHTML += `
            <tr>
                <td class="fw-bold">${app.adopterName}</td>
                <td>${animalName}</td>
                <td>
                    <div class="d-flex align-items-center gap-2">
                        <div class="progress" style="width: 80px; height: 6px;">
                            <div class="progress-bar ${app.eligibilityScore > 75 ? 'bg-success' : 'bg-warning'}" style="width: ${app.eligibilityScore}%"></div>
                        </div>
                        <span class="small fw-bold">${app.eligibilityScore}/100</span>
                    </div>
                </td>
                <td><span class="status-badge bg-light text-dark border">${app.status}</span></td>
                <td>${actionBtn}</td>
            </tr>
        `;
    });
}

async function approveApplication(appId, animalId) {
    if(confirm("Approve this adoption? This will mark the animal as Adopted.")) {
        await db.applications.update(appId, { status: 'Approved' });
        await db.animals.update(animalId, { status: 'Adopted' });
        loadApplications(); 
        alert("Adoption Approved successfully!");
    }
}

// VISITS
async function loadVisits() {
    const visits = await db.visits.toArray();
    const apps = await db.applications.toArray();
    const list = document.getElementById('visits-list');
    list.innerHTML = '';
    
    visits.forEach(v => {
        const app = apps.find(a => a.id === v.applicationId);
        list.innerHTML += `
            <div class="border rounded p-3 d-flex align-items-center gap-3 bg-white">
                <div class="bg-light p-3 rounded text-center" style="min-width: 90px;">
                    <i class="bi bi-calendar-event fs-5 text-primary-green"></i>
                    <div class="small fw-bold mt-1 text-dark">${v.date}</div>
                </div>
                <div>
                    <div class="fw-bold">${v.type} with ${app ? app.adopterName : 'Applicant'}</div>
                    <div class="text-muted small"><i class="bi bi-clock"></i> ${v.time}</div>
                </div>
            </div>
        `;
    });

    const select = document.getElementById('visit-app-id');
    select.innerHTML = '<option value="">Select Application...</option>';
    apps.forEach(a => select.innerHTML += `<option value="${a.id}">${a.adopterName} - App #${a.id}</option>`);
}

// FORMS
function setupEventListeners() {
    document.getElementById('animal-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await db.animals.add({
            name: document.getElementById('animal-name').value,
            species: document.getElementById('animal-species').value,
            breed: document.getElementById('animal-breed').value,
            tags: document.getElementById('animal-tags').value.split(',').map(t => t.trim()),
            age: 'Unknown',
            status: 'Available',
            image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=600&auto=format&fit=crop'
        });

        const modalEl = document.getElementById('addAnimalModal');
        bootstrap.Modal.getInstance(modalEl).hide();
        e.target.reset();
        navigateTo('animals'); // Go to animals page to see it
    });

    document.getElementById('visit-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await db.visits.add({
            applicationId: parseInt(document.getElementById('visit-app-id').value),
            animalId: 1, 
            date: document.getElementById('visit-date').value,
            time: document.getElementById('visit-time').value,
            type: 'At the shelter',
            status: 'Scheduled'
        });
        e.target.reset();
        loadVisits();
        alert("Visit scheduled successfully!");
    });
}