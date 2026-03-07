/* ========================================
   DASHBOARD APPLICATION
   ======================================== */

const API = '';
const token = localStorage.getItem('token');

// Auth guard
if (!token) {
    window.location.href = '/';
}

// Set user info
const user = JSON.parse(localStorage.getItem('user') || '{}');
document.getElementById('userName').textContent = user.fullname || user.username || 'Admin';
document.getElementById('userRole').textContent = user.role || 'user';
document.getElementById('userAvatar').textContent = (user.fullname || user.username || 'A')[0].toUpperCase();

// ========== API Helper ==========
async function api(endpoint, method = 'GET', body = null) {
    const opts = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    };
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(`${API}${endpoint}`, opts);

    if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
        return;
    }

    return await res.json();
}

// ========== Toast ==========
function toast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ',
    };
    el.innerHTML = `<span>${icons[type] || ''}</span> ${message}`;
    container.appendChild(el);
    setTimeout(() => {
        el.classList.add('out');
        setTimeout(() => el.remove(), 300);
    }, 3000);
}

// ========== Navigation ==========
const navItems = document.querySelectorAll('.nav-item');
const pages = document.querySelectorAll('.page');
const pageTitles = {
    dashboard: 'Dashboard',
    banners: 'Banners',
    branches: 'Branches',
    countries: 'Countries',
    categories: 'Project Categories',
    projects: 'Projects',
    images: 'Project Images',
    users: 'Users',
};

function navigateTo(pageName) {
    navItems.forEach(n => n.classList.remove('active'));
    pages.forEach(p => p.classList.remove('active'));

    document.querySelector(`.nav-item[data-page="${pageName}"]`)?.classList.add('active');
    const pageEl = document.getElementById(`page-${pageName}`);
    if (pageEl) {
        pageEl.classList.add('active');
        pageEl.style.animation = 'none';
        pageEl.offsetHeight; // trigger reflow
        pageEl.style.animation = null;
    }
    document.getElementById('pageTitle').textContent = pageTitles[pageName] || pageName;

    // Load data
    loaders[pageName]?.();

    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('open');
}

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo(item.dataset.page);
    });
});

// Menu toggle
document.getElementById('menuToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
});

// ========== Entity Configurations ==========
const ENTITIES = {
    banner: {
        endpoint: '/api/banners',
        tableId: 'bannersTable',
        emptyId: 'bannersEmpty',
        columns: ['id', 'bannername', 'bannertype', 'countryid', 'position', 'isactive'],
        fields: [
            { key: 'bannername', label: 'Banner Name', type: 'text', required: true },
            { key: 'bannerdescription', label: 'Description', type: 'textarea' },
            { key: 'info1', label: 'Info', type: 'textarea' },
            { key: 'countryid', label: 'Country ID', type: 'number' },
            { key: 'bannertype', label: 'Banner Type', type: 'text' },
            { key: 'sequencenumber', label: 'Sequence Number', type: 'number' },
            { key: 'bannerurl', label: 'Banner URL', type: 'text' },
            { key: 'position', label: 'Position', type: 'text' },
            { key: 'isactive', label: 'Active', type: 'select', options: [{ v: true, l: 'Yes' }, { v: false, l: 'No' }] },
        ],
    },
    branch: {
        endpoint: '/api/branches',
        tableId: 'branchesTable',
        emptyId: 'branchesEmpty',
        columns: ['id', 'branchname', 'email', 'countrycode', 'contact1', 'isactive'],
        fields: [
            { key: 'branchname', label: 'Branch Name', type: 'text' },
            { key: 'email', label: 'Email', type: 'email' },
            { key: 'countryid', label: 'Country ID', type: 'number' },
            { key: 'countrycode', label: 'Country Code', type: 'text' },
            { key: 'branchaddress', label: 'Address', type: 'textarea' },
            { key: 'contact1', label: 'Contact 1', type: 'text' },
            { key: 'contact2', label: 'Contact 2', type: 'text' },
            { key: 'isactive', label: 'Active', type: 'select', options: [{ v: true, l: 'Yes' }, { v: false, l: 'No' }] },
        ],
    },
    country: {
        endpoint: '/api/countries',
        tableId: 'countriesTable',
        emptyId: 'countriesEmpty',
        columns: ['id', 'countrynameen', 'countrynamear', 'sequencenumber', 'isactive'],
        fields: [
            { key: 'countrynameen', label: 'Name (EN)', type: 'text' },
            { key: 'countrynamear', label: 'Name (AR)', type: 'text' },
            { key: 'sequencenumber', label: 'Sequence Number', type: 'number' },
            { key: 'logourl', label: 'Logo URL', type: 'text' },
            { key: 'countryurl', label: 'Country URL', type: 'text' },
            { key: 'isactive', label: 'Active', type: 'select', options: [{ v: true, l: 'Yes' }, { v: false, l: 'No' }] },
        ],
    },
    category: {
        endpoint: '/api/project-categories',
        tableId: 'categoriesTable',
        emptyId: 'categoriesEmpty',
        columns: ['id', 'category_name', 'cover_image_url'],
        fields: [
            { key: 'category_name', label: 'Category Name', type: 'text', required: true },
            { key: 'cover_image_url', label: 'Cover Image URL', type: 'text' },
        ],
    },
    project: {
        endpoint: '/api/projects',
        tableId: 'projectsTable',
        emptyId: 'projectsEmpty',
        columns: ['id', 'projectname', 'categoryid', 'projectdescription'],
        fields: [
            { key: 'projectname', label: 'Project Name', type: 'text', required: true },
            { key: 'categoryid', label: 'Category ID', type: 'number' },
            { key: 'projectdescription', label: 'Description', type: 'textarea' },
        ],
    },
    image: {
        endpoint: '/api/project-images',
        tableId: 'imagesTable',
        emptyId: 'imagesEmpty',
        columns: ['id', 'projectid', 'projectimageurl', 'sequencenumber', 'isactive'],
        fields: [
            { key: 'projectid', label: 'Project ID', type: 'number' },
            { key: 'projectimageurl', label: 'Image URL', type: 'text' },
            { key: 'sequencenumber', label: 'Sequence Number', type: 'number' },
            { key: 'isactive', label: 'Active', type: 'select', options: [{ v: true, l: 'Yes' }, { v: false, l: 'No' }] },
        ],
    },
    user: {
        endpoint: '/api/users',
        tableId: 'usersTable',
        emptyId: 'usersEmpty',
        columns: ['id', 'username', 'email', 'fullname', 'role', 'isactive'],
        fields: [
            { key: 'email', label: 'Email', type: 'email' },
            { key: 'fullname', label: 'Full Name', type: 'text' },
            { key: 'role', label: 'Role', type: 'text' },
            { key: 'isactive', label: 'Active', type: 'select', options: [{ v: true, l: 'Yes' }, { v: false, l: 'No' }] },
        ],
    },
};

// ========== Render Table ==========
function renderTable(entityKey, data) {
    const config = ENTITIES[entityKey];
    const table = document.getElementById(config.tableId);
    const tbody = table.querySelector('tbody');
    const emptyEl = document.getElementById(config.emptyId);

    tbody.innerHTML = '';

    if (!data || data.length === 0) {
        table.style.display = 'none';
        emptyEl.style.display = 'block';
        return;
    }

    table.style.display = 'table';
    emptyEl.style.display = 'none';

    data.forEach(row => {
        const tr = document.createElement('tr');
        config.columns.forEach(col => {
            const td = document.createElement('td');
            if (col === 'isactive') {
                td.innerHTML = row[col]
                    ? '<span class="badge badge-active">Active</span>'
                    : '<span class="badge badge-inactive">Inactive</span>';
            } else {
                td.textContent = row[col] ?? '—';
                td.title = row[col] ?? '';
            }
            tr.appendChild(td);
        });

        // Actions
        const actionTd = document.createElement('td');
        actionTd.innerHTML = `
            <div class="table-actions">
                <button class="btn-icon btn-icon-edit" title="Edit" onclick="editItem('${entityKey}', ${row.id})">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="btn-icon btn-icon-delete" title="Delete" onclick="deleteItem('${entityKey}', ${row.id})">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
            </div>
        `;
        tr.appendChild(actionTd);
        tbody.appendChild(tr);
    });
}

// ========== Data Loaders ==========
const entityDataCache = {};

async function loadEntity(entityKey) {
    const config = ENTITIES[entityKey];
    const data = await api(config.endpoint);
    if (data && data.success) {
        entityDataCache[entityKey] = data.result || [];
        renderTable(entityKey, data.result || []);
    }
    return data?.result || [];
}

const loaders = {
    dashboard: loadDashboard,
    banners: () => loadEntity('banner'),
    branches: () => loadEntity('branch'),
    countries: () => loadEntity('country'),
    categories: () => loadEntity('category'),
    projects: () => loadEntity('project'),
    images: () => loadEntity('image'),
    users: () => loadEntity('user'),
};

// ========== Dashboard Stats ==========
async function loadDashboard() {
    const statsConfig = [
        { key: 'banner', label: 'Banners', endpoint: '/api/banners', color: '#3b82f6', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>' },
        { key: 'branch', label: 'Branches', endpoint: '/api/branches', color: '#8b5cf6', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>' },
        { key: 'country', label: 'Countries', endpoint: '/api/countries', color: '#06b6d4', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>' },
        { key: 'category', label: 'Categories', endpoint: '/api/project-categories', color: '#f59e0b', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>' },
        { key: 'project', label: 'Projects', endpoint: '/api/projects', color: '#10b981', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>' },
        { key: 'image', label: 'Images', endpoint: '/api/project-images', color: '#f43f5e', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>' },
        { key: 'user', label: 'Users', endpoint: '/api/users', color: '#a855f7', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' },
    ];

    const grid = document.getElementById('statsGrid');
    grid.innerHTML = '';

    const promises = statsConfig.map(async (s) => {
        const data = await api(s.endpoint);
        const count = data?.result?.length ?? 0;
        return { ...s, count };
    });

    const results = await Promise.all(promises);

    results.forEach(s => {
        const card = document.createElement('div');
        card.className = 'stat-card';
        card.style.setProperty('--card-accent', s.color);
        card.style.setProperty('--card-accent-bg', s.color + '18');
        card.innerHTML = `
            <div class="stat-icon">${s.icon}</div>
            <div class="stat-value">${s.count}</div>
            <div class="stat-label">${s.label}</div>
        `;
        card.addEventListener('click', () => {
            const pageMap = { banner: 'banners', branch: 'branches', country: 'countries', category: 'categories', project: 'projects', image: 'images', user: 'users' };
            navigateTo(pageMap[s.key]);
        });
        grid.appendChild(card);
    });
}

// ========== Modal ==========
let currentModalEntity = null;
let currentEditId = null;

function openModal(entityKey, editData = null) {
    currentModalEntity = entityKey;
    currentEditId = editData?.id || null;
    const config = ENTITIES[entityKey];
    const isEdit = !!editData;

    document.getElementById('modalTitle').textContent = isEdit ? `Edit ${entityKey}` : `Add ${entityKey}`;
    const form = document.getElementById('modalForm');
    form.innerHTML = '';

    config.fields.forEach(f => {
        const group = document.createElement('div');
        group.className = 'form-group';

        const label = document.createElement('label');
        label.textContent = f.label;
        label.setAttribute('for', `field_${f.key}`);
        group.appendChild(label);

        let input;
        if (f.type === 'textarea') {
            input = document.createElement('textarea');
        } else if (f.type === 'select') {
            input = document.createElement('select');
            const defaultOpt = document.createElement('option');
            defaultOpt.value = '';
            defaultOpt.textContent = `Select ${f.label}`;
            input.appendChild(defaultOpt);
            f.options.forEach(opt => {
                const o = document.createElement('option');
                o.value = opt.v;
                o.textContent = opt.l;
                input.appendChild(o);
            });
        } else {
            input = document.createElement('input');
            input.type = f.type || 'text';
        }

        input.id = `field_${f.key}`;
        input.name = f.key;
        if (f.required) input.required = true;

        // Pre-fill for edit
        if (isEdit && editData[f.key] !== undefined && editData[f.key] !== null) {
            input.value = editData[f.key];
        }

        group.appendChild(input);
        form.appendChild(group);
    });

    document.getElementById('modalOverlay').classList.add('active');
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
    currentModalEntity = null;
    currentEditId = null;
}

// Close modal on overlay click
document.getElementById('modalOverlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
});

// Close modal on Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

async function saveModal() {
    const config = ENTITIES[currentModalEntity];
    const form = document.getElementById('modalForm');
    const body = {};

    config.fields.forEach(f => {
        const input = form.querySelector(`[name="${f.key}"]`);
        if (!input) return;
        let val = input.value;

        if (val === '') {
            if (!currentEditId) return; // skip empty on create
            val = null;
        } else if (f.type === 'number') {
            val = parseInt(val, 10);
            if (isNaN(val)) return;
        } else if (f.type === 'select' && f.options) {
            if (val === 'true') val = true;
            else if (val === 'false') val = false;
        }

        body[f.key] = val;
    });

    let data;
    if (currentEditId) {
        data = await api(`${config.endpoint}/${currentEditId}`, 'PUT', body);
    } else {
        data = await api(config.endpoint, 'POST', body);
    }

    if (data?.success) {
        toast(currentEditId ? 'Updated successfully' : 'Created successfully', 'success');
        closeModal();
        // Reload current entity
        loadEntity(currentModalEntity);
    } else {
        toast(data?.error || 'Operation failed', 'error');
    }
}

// ========== Edit ==========
async function editItem(entityKey, id) {
    const config = ENTITIES[entityKey];
    const data = await api(`${config.endpoint}/${id}`);
    if (data?.success && data.result) {
        openModal(entityKey, data.result);
    } else {
        toast('Failed to load item', 'error');
    }
}

// ========== Delete ==========
async function deleteItem(entityKey, id) {
    if (!confirm('Are you sure you want to delete this item?')) return;

    const config = ENTITIES[entityKey];
    const data = await api(`${config.endpoint}/${id}`, 'DELETE');
    if (data?.success) {
        toast('Deleted successfully', 'success');
        loadEntity(entityKey);
    } else {
        toast(data?.error || 'Delete failed', 'error');
    }
}

// ========== Init ==========
navigateTo('dashboard');
