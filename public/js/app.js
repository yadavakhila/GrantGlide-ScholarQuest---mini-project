// ==============================================================================
// GrantGlide – ScholarQuest: Main Application Controller
// Orchestrates All 8 Hackathon Modules with Real-Time Reactivity
// ==============================================================================

let currentStudent = null;
let allScholarships = [];
let allApplications = [];
let allDocuments = [];
let allNotifications = [];
let currentViewingScholarship = null;
let detailsModalInstance = null;
let addSchModalInstance = null;
let profileModalInstance = null;
let authModalInstance = null;
let editAppModalInstance = null;
let docUploadModalInstance = null;
let appToastInstance = null;

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', async () => {
  // Init Bootstrap Modals & Toasts
  const authEl = document.getElementById('authModal');
  if (authEl) authModalInstance = new bootstrap.Modal(authEl);

  const schDetEl = document.getElementById('scholarshipDetailsModal');
  if (schDetEl) detailsModalInstance = new bootstrap.Modal(schDetEl);

  const addSchEl = document.getElementById('addScholarshipModal');
  if (addSchEl) addSchModalInstance = new bootstrap.Modal(addSchEl);

  const profEl = document.getElementById('profileEditModal');
  if (profEl) profileModalInstance = new bootstrap.Modal(profEl);

  const editAppEl = document.getElementById('editApplicationModal');
  if (editAppEl) editAppModalInstance = new bootstrap.Modal(editAppEl);

  const docUpEl = document.getElementById('documentUploadModal');
  if (docUpEl) docUploadModalInstance = new bootstrap.Modal(docUpEl);

  const toastEl = document.getElementById('appToast');
  if (toastEl) appToastInstance = new bootstrap.Toast(toastEl, { delay: 4000 });

  // Load Saved or Initial Student Persona (Aarav Sharma)
  const savedStudent = localStorage.getItem('grantglide_current_student');
  if (savedStudent) {
    try {
      currentStudent = JSON.parse(savedStudent);
      updateStudentUI();
    } catch (e) {
      await loadStudentPersona('std-101');
    }
  } else {
    await loadStudentPersona('std-101');
  }

  // Load All Core Data
  await refreshCoreData();

  // Setup Hash Routing
  window.addEventListener('hashchange', handleHashRouting);
  if (window.location.hash) {
    handleHashRouting();
  } else {
    navigateTo('dashboard');
  }
});

// Refresh Core Data from APIs
async function refreshCoreData() {
  try {
    const [schRes, appRes, docRes, notifRes, statsRes] = await Promise.all([
      API.getScholarships(),
      API.getApplications(currentStudent ? currentStudent.id : 'std-101'),
      API.getDocuments(),
      API.getNotifications(),
      API.getStats()
    ]);

    if (schRes.success) allScholarships = schRes.data;
    if (appRes.success) allApplications = appRes.data;
    if (docRes.success) allDocuments = docRes.data;
    if (notifRes.success) allNotifications = notifRes.data;

    // Render components
    renderDashboard();
    renderDiscoveryCatalog(allScholarships);
    renderKanbanBoard();
    renderDocumentChecklist();
    renderDeadlinesView();
    renderNotifications();
    renderAdminTable();
  } catch (err) {
    console.error("Error refreshing core data:", err);
  }
}

// ==============================================================================
// NAVIGATION & ROUTING
// ==============================================================================
function navigateTo(viewName) {
  // Update sidebar active state
  document.querySelectorAll('.app-sidebar .nav-link').forEach(el => el.classList.remove('active'));
  const activeLink = document.getElementById(`nav-item-${viewName}`);
  if (activeLink) activeLink.classList.add('active');

  // Show selected view, hide others
  document.querySelectorAll('.content-view').forEach(el => el.classList.add('d-none'));
  const targetView = document.getElementById(`view-${viewName}`);
  if (targetView) {
    targetView.classList.remove('d-none');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Update hash
  if (window.location.hash !== `#${viewName}`) {
    window.location.hash = viewName;
  }

  // Trigger view-specific refreshes
  if (viewName === 'eligibility') {
    loadSavedProfileIntoChecker();
  } else if (viewName === 'admin') {
    loadAdminOverview();
  }
}

function handleHashRouting() {
  const hash = window.location.hash.replace('#', '') || 'dashboard';
  navigateTo(hash);
}

// ==============================================================================
// ==============================================================================
// MODULE 1 & 2: STUDENT PROFILE, AUTH & PERSONA MANAGEMENT
// ==============================================================================
async function loadStudentPersona(studentId) {
  const res = await API.getProfile(studentId);
  if (res.success) {
    currentStudent = res.user;
    localStorage.setItem('grantglide_current_student', JSON.stringify(currentStudent));
    updateStudentUI();
    // Refresh tracked applications for new persona
    const appRes = await API.getApplications(currentStudent.id);
    if (appRes.success) allApplications = appRes.data;
    renderKanbanBoard();
    renderDashboard();
    renderDocumentChecklist();
  }
}

function updateStudentUI() {
  const dropdownEl = document.getElementById('user-profile-dropdown');
  const authBtnsEl = document.getElementById('auth-buttons-container');

  if (!currentStudent) {
    if (dropdownEl) dropdownEl.classList.add('d-none');
    if (authBtnsEl) authBtnsEl.classList.remove('d-none');
    const nameEl = document.getElementById('dash-student-name');
    if (nameEl) nameEl.textContent = 'Scholar';
    return;
  }

  if (dropdownEl) dropdownEl.classList.remove('d-none');
  if (authBtnsEl) authBtnsEl.classList.add('d-none');

  const navName = document.getElementById('nav-user-name');
  if (navName) navName.textContent = currentStudent.name;

  const navRole = document.getElementById('nav-user-role');
  if (navRole) navRole.textContent = `${currentStudent.education_level || 'Student'} (${(currentStudent.course || 'Degree').split(' ')[0]})`;

  const navAvatar = document.getElementById('user-avatar-initial');
  if (navAvatar) navAvatar.textContent = (currentStudent.name || 'S').charAt(0).toUpperCase();

  // Dashboard banner
  const dashName = document.getElementById('dash-student-name');
  if (dashName) dashName.textContent = (currentStudent.name || 'Student').split(' ')[0];

  const dashCourse = document.getElementById('dash-banner-course');
  if (dashCourse) dashCourse.textContent = currentStudent.course || 'Degree';

  const dashMarks = document.getElementById('dash-banner-marks');
  if (dashMarks) dashMarks.textContent = `${currentStudent.percentage || 75}%`;

  const dashCat = document.getElementById('dash-banner-category');
  if (dashCat) dashCat.textContent = currentStudent.category || 'General';
}

function switchStudent(studentId) {
  loadStudentPersona(studentId);
  const nameMap = {
    'std-101': 'Aarav Sharma (UG Engineering, 84.5%)',
    'std-102': 'Priya Verma (OBC / Girl in Tech, 88.2%)',
    'std-103': 'Rahul Kumar (SC / Diploma, 76.0%)'
  };
  showToast(`Switched active persona to ${nameMap[studentId] || 'Student'}`);
}

function switchToAdmin() {
  navigateTo('admin');
  showToast("Logged into Administrator & Evaluator Control Panel");
}

function openAuthModal(defaultTab = 'signin') {
  if (!authModalInstance) {
    const el = document.getElementById('authModal');
    if (el) authModalInstance = new bootstrap.Modal(el);
  }
  if (defaultTab === 'register') {
    const regTabBtn = document.getElementById('tab-register-btn');
    if (regTabBtn) bootstrap.Tab.getOrCreateInstance(regTabBtn).show();
  } else {
    const signInTabBtn = document.getElementById('tab-signin-btn');
    if (signInTabBtn) bootstrap.Tab.getOrCreateInstance(signInTabBtn).show();
  }
  if (authModalInstance) authModalInstance.show();
}

function quickLogin(personaId) {
  if (personaId === 'admin') {
    switchToAdmin();
  } else {
    switchStudent(personaId);
  }
  if (authModalInstance) authModalInstance.hide();
}

async function handleLoginSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('signin-email').value;
  const password = document.getElementById('signin-password').value;
  const role = document.getElementById('signin-role').value;

  const res = await API.login({ email, password, role });
  if (res.success) {
    if (res.role === 'admin') {
      switchToAdmin();
    } else {
      currentStudent = res.user;
      localStorage.setItem('grantglide_current_student', JSON.stringify(currentStudent));
      updateStudentUI();
      await refreshCoreData();
      showToast(`Welcome back, ${currentStudent.name}!`);
      navigateTo('dashboard');
    }
    if (authModalInstance) authModalInstance.hide();
  } else {
    showToast(res.message || "Invalid credentials. Try Aarav or password123.");
  }
}

async function handleRegisterSubmit(e) {
  e.preventDefault();
  const studentData = {
    name: document.getElementById('reg-name').value,
    email: document.getElementById('reg-email').value,
    password: document.getElementById('reg-password').value,
    phone: document.getElementById('reg-phone').value,
    education_level: document.getElementById('reg-level').value,
    course: document.getElementById('reg-course').value,
    percentage: parseFloat(document.getElementById('reg-marks').value),
    cgpa: document.getElementById('reg-cgpa').value || "8.5",
    family_income: parseInt(document.getElementById('reg-income').value, 10),
    category: document.getElementById('reg-category').value,
    gender: document.getElementById('reg-gender').value,
    state: document.getElementById('reg-state').value || "Delhi",
    college: document.getElementById('reg-college').value || "University Institute",
    year_of_study: document.getElementById('reg-year').value || "1st Year",
    disability_status: "No",
    single_girl_child: "No"
  };

  const res = await API.register(studentData);
  if (res.success) {
    currentStudent = res.user;
    localStorage.setItem('grantglide_current_student', JSON.stringify(currentStudent));
    updateStudentUI();
    await refreshCoreData();
    if (authModalInstance) authModalInstance.hide();
    showToast(`Account created successfully! Welcome, ${currentStudent.name}!`);
    navigateTo('eligibility');
  } else {
    showToast(res.message || "Registration failed. Try again.");
  }
}

function logoutUser() {
  currentStudent = null;
  localStorage.removeItem('grantglide_current_student');
  updateStudentUI();
  showToast("You have been signed out.");
  openAuthModal('signin');
}

function openProfileEditModal() {
  if (!currentStudent) {
    openAuthModal('signin');
    return;
  }
  document.getElementById('prof-form-name').value = currentStudent.name || '';
  document.getElementById('prof-form-email').value = currentStudent.email || '';
  document.getElementById('prof-form-level').value = currentStudent.education_level || 'Undergraduate';
  document.getElementById('prof-form-course').value = currentStudent.course || '';
  document.getElementById('prof-form-college').value = currentStudent.college || '';
  document.getElementById('prof-form-year').value = currentStudent.year_of_study || '1st Year';
  document.getElementById('prof-form-marks').value = currentStudent.percentage || 75;
  document.getElementById('prof-form-cgpa').value = currentStudent.cgpa || '';
  document.getElementById('prof-form-income').value = currentStudent.family_income || 300000;
  document.getElementById('prof-form-category').value = currentStudent.category || 'General';
  document.getElementById('prof-form-gender').value = currentStudent.gender || 'Male';
  document.getElementById('prof-form-state').value = currentStudent.state || 'Maharashtra';
  
  const singleGirlEl = document.getElementById('prof-form-single-girl');
  if (singleGirlEl) singleGirlEl.checked = currentStudent.single_girl_child === 'Yes';
  
  const pwdEl = document.getElementById('prof-form-pwd');
  if (pwdEl) pwdEl.checked = currentStudent.disability_status === 'Yes';

  profileModalInstance.show();
}

async function handleSaveProfile(e) {
  e.preventDefault();
  const updatedData = {
    id: currentStudent ? currentStudent.id : 'std-101',
    name: document.getElementById('prof-form-name').value,
    education_level: document.getElementById('prof-form-level').value,
    course: document.getElementById('prof-form-course').value,
    college: document.getElementById('prof-form-college').value,
    year_of_study: document.getElementById('prof-form-year').value,
    percentage: parseFloat(document.getElementById('prof-form-marks').value),
    cgpa: document.getElementById('prof-form-cgpa').value,
    family_income: parseInt(document.getElementById('prof-form-income').value, 10),
    category: document.getElementById('prof-form-category').value,
    gender: document.getElementById('prof-form-gender').value,
    state: document.getElementById('prof-form-state').value,
    single_girl_child: document.getElementById('prof-form-single-girl').checked ? 'Yes' : 'No',
    disability_status: document.getElementById('prof-form-pwd').checked ? 'Yes' : 'No'
  };

  const res = await API.updateProfile(updatedData);
  if (res.success) {
    currentStudent = res.user;
    localStorage.setItem('grantglide_current_student', JSON.stringify(currentStudent));
    updateStudentUI();
    profileModalInstance.hide();
    showToast("Profile details updated successfully!");
    renderDashboard();
    renderDocumentChecklist();
  }
}

// ==============================================================================
// MODULE 1: DASHBOARD RENDERING
// ==============================================================================
function renderDashboard() {
  if (!allScholarships.length) return;

  // Calculate statistics
  const eligibleSchemes = allScholarships.filter(s => {
    if (!currentStudent) return true;
    const marksOk = (currentStudent.percentage || 0) >= (s.min_percentage || 0);
    const incomeOk = (currentStudent.family_income || 0) <= (s.max_family_income || 9999999);
    const catOk = s.categories.includes('All') || s.categories.includes(currentStudent.category);
    return marksOk && incomeOk && catOk;
  });

  const urgentCount = allScholarships.filter(s => (s.days_left || 0) <= 14).length;
  const trackedCount = allApplications.length;

  document.getElementById('stat-eligible-count').textContent = eligibleSchemes.length;
  document.getElementById('stat-tracked-count').textContent = trackedCount;
  document.getElementById('stat-urgent-deadlines').textContent = urgentCount;
  document.getElementById('dash-eligible-highlight').textContent = `${eligibleSchemes.length} matching scholarships`;

  // Recommended Scholarships Top 4
  const recommended = eligibleSchemes.slice(0, 4);
  const container = document.getElementById('dash-recommended-container');
  if (container) {
    container.innerHTML = recommended.map(s => `
      <div class="col-md-6">
        <div class="scholarship-card">
          <div>
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="badge-type ${s.type === 'Government' ? 'badge-govt' : 'badge-private'}">${s.type} • ${s.subtype || ''}</span>
              <span class="badge ${s.days_left <= 7 ? 'badge-urgent' : (s.days_left <= 20 ? 'badge-approaching' : 'badge-active')}">
                <i class="fa-regular fa-clock me-1"></i> ${s.days_left > 0 ? `${s.days_left}d left` : 'Closed'}
              </span>
            </div>
            <h5 class="fw-bold text-dark mb-1" style="font-size: 1.05rem;">${s.name}</h5>
            <div class="text-muted mb-3" style="font-size: 0.82rem;">${s.provider}</div>
            <div class="amount-highlight mb-3">${s.amount}</div>
          </div>
          <div class="d-flex gap-2 mt-2 pt-2 border-top">
            <button class="btn btn-outline-primary btn-sm flex-grow-1 rounded-pill" onclick="viewScholarshipDetails('${s.id}')">
              View Details
            </button>
            <button class="btn btn-primary btn-sm rounded-pill px-3" onclick="addScholarshipToTracker('${s.id}')" title="Add to Tracker">
              <i class="fa-solid fa-plus"></i> Track
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Mini applications preview
  const miniAppsContainer = document.getElementById('dash-applications-mini');
  if (miniAppsContainer) {
    if (allApplications.length === 0) {
      miniAppsContainer.innerHTML = `<div class="p-3 text-center text-muted" style="font-size: 0.85rem;">No tracked applications yet. Discover scholarships and click 'Track'!</div>`;
    } else {
      miniAppsContainer.innerHTML = allApplications.slice(0, 3).map(app => `
        <div class="d-flex justify-content-between align-items-center p-3 rounded bg-light border mb-2">
          <div>
            <div class="fw-bold text-dark" style="font-size: 0.9rem;">${app.scholarship_name}</div>
            <div class="text-muted" style="font-size: 0.78rem;">${app.provider} • Grant: ${app.amount}</div>
          </div>
          <span class="badge ${getBadgeClassForStatus(app.status)} px-3 py-2 rounded-pill">${app.status}</span>
        </div>
      `).join('');
    }
  }

  // Deadlines widget
  const deadlinesWidget = document.getElementById('dash-deadlines-widget');
  if (deadlinesWidget) {
    const sorted = [...allScholarships].sort((a, b) => a.days_left - b.days_left).slice(0, 3);
    deadlinesWidget.innerHTML = sorted.map(s => `
      <div class="p-3 rounded border bg-light">
        <div class="d-flex justify-content-between align-items-center mb-1">
          <strong class="text-dark" style="font-size: 0.85rem;">${s.name.length > 28 ? s.name.substring(0, 28) + '...' : s.name}</strong>
          <span class="badge ${s.days_left <= 7 ? 'bg-danger' : 'bg-warning text-dark'}">${s.days_left} days left</span>
        </div>
        <div class="d-flex justify-content-between align-items-center text-muted" style="font-size: 0.78rem;">
          <span>Closing: ${s.deadline}</span>
          <a href="#" onclick="viewScholarshipDetails('${s.id}'); return false;" class="text-primary text-decoration-none">Details &rarr;</a>
        </div>
      </div>
    `).join('');
  }
}

// ==============================================================================
// MODULE 3: SCHOLARSHIP DISCOVERY CATALOG & FILTERS
// ==============================================================================
let currentCatalogLayout = 'grid';
let comparedScholarshipIds = [];

function setCatalogLayout(layout) {
  currentCatalogLayout = layout;
  const gridBtn = document.getElementById('btn-view-grid');
  const listBtn = document.getElementById('btn-view-list');
  if (gridBtn && listBtn) {
    gridBtn.classList.toggle('active', layout === 'grid');
    listBtn.classList.toggle('active', layout === 'list');
  }
  applyFilters();
}

function renderActiveFilterPills() {
  const container = document.getElementById('active-filter-pills');
  if (!container) return;

  const q = (document.getElementById('filter-q')?.value || '').trim();
  const type = document.getElementById('filter-type')?.value;
  const level = document.getElementById('filter-level')?.value;
  const category = document.getElementById('filter-category')?.value;
  const gender = document.getElementById('filter-gender')?.value;

  const pills = [];
  if (q) pills.push({ label: `Search: "${q}"`, reset: () => { document.getElementById('filter-q').value = ''; } });
  if (type && type !== 'All') pills.push({ label: `Type: ${type}`, reset: () => { document.getElementById('filter-type').value = 'All'; } });
  if (level && level !== 'All') pills.push({ label: `Level: ${level}`, reset: () => { document.getElementById('filter-level').value = 'All'; } });
  if (category && category !== 'All') pills.push({ label: `Category: ${category}`, reset: () => { document.getElementById('filter-category').value = 'All'; } });
  if (gender && gender !== 'All') pills.push({ label: `Gender: ${gender}`, reset: () => { document.getElementById('filter-gender').value = 'All'; } });

  if (pills.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = `
    <span class="text-muted small align-self-center me-1">Active filters:</span>
    ${pills.map((p, idx) => `
      <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1 rounded-pill d-inline-flex align-items-center gap-1" style="font-size: 0.75rem;">
        ${p.label}
        <i class="fa-solid fa-xmark text-muted" style="cursor: pointer;" onclick="window._resetFilterIdx(${idx})"></i>
      </span>
    `).join('')}
    <button class="btn btn-link btn-sm p-0 text-decoration-none small text-danger" onclick="resetFilters()">Clear All</button>
  `;

  window._activePills = pills;
  window._resetFilterIdx = (idx) => {
    if (window._activePills && window._activePills[idx]) {
      window._activePills[idx].reset();
      applyFilters();
    }
  };
}

function renderDiscoveryCatalog(scholarships) {
  const container = document.getElementById('scholarship-catalog-grid');
  const countBadge = document.getElementById('catalog-count-badge');
  if (countBadge) countBadge.textContent = `${scholarships.length} Schemes Available`;

  renderActiveFilterPills();

  if (!container) return;

  if (scholarships.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="p-5 rounded-4 bg-light border text-muted">
          <i class="fa-solid fa-filter-circle-xmark fa-3x mb-3 text-secondary"></i>
          <h4>No scholarships match these specific filters</h4>
          <p class="mb-3">Try adjusting your filters, clearing keywords, or increasing the income ceiling slider.</p>
          <button class="btn btn-outline-primary rounded-pill" onclick="resetFilters()">Reset All Filters</button>
        </div>
      </div>
    `;
    return;
  }

  if (currentCatalogLayout === 'list') {
    container.innerHTML = scholarships.map(s => {
      const isCompared = comparedScholarshipIds.includes(s.id);
      return `
        <div class="col-12">
          <div class="card-custom p-3 p-md-4 d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3">
            <div class="flex-grow-1">
              <div class="d-flex flex-wrap align-items-center gap-2 mb-1">
                <span class="badge-type ${s.type === 'Government' ? 'badge-govt' : 'badge-private'}">${s.type}</span>
                <span class="badge ${s.days_left <= 7 ? 'badge-urgent' : (s.days_left <= 20 ? 'badge-approaching' : 'badge-active')}">
                  ${s.days_left > 0 ? `${s.days_left}d remaining` : 'Closed'}
                </span>
                <span class="text-muted small"><i class="fa-solid fa-building-columns me-1"></i> ${s.provider}</span>
              </div>
              <h5 class="fw-bold text-dark mb-2" style="font-size: 1.1rem;">${s.name}</h5>
              <div class="d-flex flex-wrap gap-2 text-muted small">
                <span><strong>Award:</strong> <span class="text-primary fw-bold">${s.amount}</span></span>
                <span>•</span>
                <span><strong>Min Marks:</strong> ${s.min_percentage}%</span>
                <span>•</span>
                <span><strong>Max Income:</strong> ₹${(s.max_family_income / 100000).toFixed(1)}L/yr</span>
                <span>•</span>
                <span><strong>Categories:</strong> ${s.categories ? s.categories.join(', ') : 'All'}</span>
              </div>
            </div>
            <div class="d-flex gap-2 flex-shrink-0 align-self-stretch align-self-lg-center">
              <button class="btn btn-sm ${isCompared ? 'btn-warning text-dark' : 'btn-outline-secondary'} rounded-pill px-3" onclick="toggleCompareScholarship('${s.id}')" title="Compare this scheme">
                <i class="fa-solid fa-code-compare me-1"></i> ${isCompared ? 'Comparing' : 'Compare'}
              </button>
              <button class="btn btn-outline-primary btn-sm rounded-pill px-3" onclick="viewScholarshipDetails('${s.id}')">
                Details
              </button>
              <button class="btn btn-primary btn-sm rounded-pill px-3" onclick="addScholarshipToTracker('${s.id}')" title="Track in Application Board">
                <i class="fa-solid fa-plus me-1"></i> Track
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
    return;
  }

  container.innerHTML = scholarships.map(s => {
    const isCompared = comparedScholarshipIds.includes(s.id);
    return `
      <div class="col-md-6 col-xl-4">
        <div class="scholarship-card">
          <div>
            <!-- Header tags -->
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="badge-type ${s.type === 'Government' ? 'badge-govt' : 'badge-private'}">${s.type}</span>
              <span class="badge ${s.days_left <= 7 ? 'badge-urgent' : (s.days_left <= 20 ? 'badge-approaching' : 'badge-active')}">
                ${s.days_left > 0 ? `${s.days_left}d remaining` : 'Closed'}
              </span>
            </div>

            <h5 class="fw-bold text-dark mb-1" style="font-size: 1.05rem; min-height: 50px;">
              ${s.name}
            </h5>
            <div class="text-muted mb-3" style="font-size: 0.8rem;">
              <i class="fa-solid fa-building-columns me-1"></i> ${s.provider}
            </div>

            <div class="amount-highlight mb-3">${s.amount}</div>

            <!-- Criteria tags -->
            <div class="d-flex flex-wrap gap-1 mb-3">
              <span class="badge bg-light text-dark border" style="font-size: 0.72rem;">Min ${s.min_percentage}% Marks</span>
              <span class="badge bg-light text-dark border" style="font-size: 0.72rem;">Income &le; ₹${(s.max_family_income / 100000).toFixed(1)}L</span>
              <span class="badge bg-light text-dark border" style="font-size: 0.72rem;">${s.gender === 'All' ? 'All Genders' : s.gender}</span>
            </div>

            <p class="text-muted text-truncate-2 mb-3" style="font-size: 0.85rem; line-height: 1.5; min-height: 40px;">
              ${s.description ? s.description.substring(0, 110) + '...' : ''}
            </p>
          </div>

          <div class="border-top pt-3 d-flex gap-2">
            <button class="btn btn-sm ${isCompared ? 'btn-warning text-dark' : 'btn-outline-secondary'} rounded-pill px-2" onclick="toggleCompareScholarship('${s.id}')" title="Compare scheme">
              <i class="fa-solid fa-code-compare"></i>
            </button>
            <button class="btn btn-outline-primary btn-sm flex-grow-1 rounded-pill" onclick="viewScholarshipDetails('${s.id}')">
              Details & Apply
            </button>
            <button class="btn btn-primary btn-sm rounded-pill px-3" onclick="addScholarshipToTracker('${s.id}')" title="Track in Application Board">
              <i class="fa-solid fa-plus"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function applyFilters() {
  const q = (document.getElementById('filter-q').value || '').toLowerCase();
  const type = document.getElementById('filter-type').value;
  const level = document.getElementById('filter-level').value;
  const category = document.getElementById('filter-category').value;
  const gender = document.getElementById('filter-gender').value;
  const stateEl = document.getElementById('filter-state');
  const stateVal = stateEl ? stateEl.value : 'All';
  const sortEl = document.getElementById('catalog-sort');
  const sortVal = sortEl ? sortEl.value : 'deadline_asc';
  const incomeMax = parseInt(document.getElementById('filter-income').value, 10);

  let filtered = allScholarships.filter(s => {
    // Keyword
    if (q) {
      const matchQ = s.name.toLowerCase().includes(q) || s.provider.toLowerCase().includes(q) || (s.description || '').toLowerCase().includes(q);
      if (!matchQ) return false;
    }
    // Type
    if (type !== 'All' && s.type.toLowerCase() !== type.toLowerCase()) return false;
    // Level
    if (level !== 'All' && !(s.level.includes('All') || s.level.includes(level))) return false;
    // Category
    if (category !== 'All' && !(s.categories.includes('All') || s.categories.includes(category))) return false;
    // Gender
    if (gender !== 'All' && s.gender !== 'All' && s.gender.toLowerCase() !== gender.toLowerCase()) return false;
    // State
    if (stateVal !== 'All') {
      if (stateVal === 'Central' && s.subtype !== 'Central') return false;
      else if (stateVal !== 'Central') {
        const text = (s.name + ' ' + (s.description || '') + ' ' + s.provider).toLowerCase();
        if (!text.includes(stateVal.toLowerCase()) && s.subtype !== 'Central') return false;
      }
    }
    // Income
    if (incomeMax < 1500000 && s.max_family_income > incomeMax) return false;

    return true;
  });

  // Sorting
  if (sortVal === 'deadline_asc') {
    filtered.sort((a, b) => (a.days_left || 999) - (b.days_left || 999));
  } else if (sortVal === 'amount_desc') {
    filtered.sort((a, b) => (b.amount_val || 0) - (a.amount_val || 0));
  } else if (sortVal === 'marks_asc') {
    filtered.sort((a, b) => (a.min_percentage || 0) - (b.min_percentage || 0));
  } else if (sortVal === 'name_asc') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  renderDiscoveryCatalog(filtered);
}

function updateIncomeFilterLabel(val) {
  const label = document.getElementById('filter-income-val');
  if (parseInt(val, 10) >= 1500000) {
    label.textContent = "No Limit (₹15L+)";
  } else {
    label.textContent = `≤ ₹${(val / 100000).toFixed(1)} Lakhs`;
  }
  applyFilters();
}

function resetFilters() {
  document.getElementById('filter-q').value = '';
  document.getElementById('filter-type').value = 'All';
  document.getElementById('filter-level').value = 'All';
  document.getElementById('filter-category').value = 'All';
  document.getElementById('filter-gender').value = 'All';
  if (document.getElementById('filter-state')) document.getElementById('filter-state').value = 'All';
  if (document.getElementById('catalog-sort')) document.getElementById('catalog-sort').value = 'deadline_asc';
  document.getElementById('filter-income').value = 1500000;
  document.getElementById('filter-income-val').textContent = 'No Limit';
  renderDiscoveryCatalog(allScholarships);
}

function matchCurrentStudentFilters() {
  if (!currentStudent) return;
  document.getElementById('filter-level').value = currentStudent.education_level || 'All';
  document.getElementById('filter-category').value = currentStudent.category || 'All';
  document.getElementById('filter-gender').value = currentStudent.gender || 'All';
  applyFilters();
  showToast(`Applied filters matching ${currentStudent.name}'s profile.`);
}

function handleGlobalSearch(e) {
  const query = e.target.value;
  navigateTo('discovery');
  document.getElementById('filter-q').value = query;
  applyFilters();
}

// ==============================================================================
// MODULE 4: SMART ELIGIBILITY CHECKER (DIAGNOSTIC ENGINE)
// ==============================================================================
function loadSavedProfileIntoChecker() {
  if (!currentStudent) return;
  document.getElementById('chk-level').value = currentStudent.education_level || 'Undergraduate';
  document.getElementById('chk-course').value = currentStudent.course || 'Engineering';
  document.getElementById('chk-percentage').value = currentStudent.percentage || 75;
  document.getElementById('chk-income').value = currentStudent.family_income || 300000;
  document.getElementById('chk-category').value = currentStudent.category || 'General';
  document.getElementById('chk-gender').value = currentStudent.gender || 'Male';
  document.getElementById('chk-single-girl').checked = currentStudent.single_girl_child === 'Yes';
  document.getElementById('chk-pwd').checked = currentStudent.disability_status === 'Yes';

  // Automatically execute check
  runEligibilityCheck();
}

async function runEligibilityCheck(e) {
  if (e) e.preventDefault();

  const profile = {
    education_level: document.getElementById('chk-level').value,
    course: document.getElementById('chk-course').value,
    percentage: parseFloat(document.getElementById('chk-percentage').value),
    family_income: parseInt(document.getElementById('chk-income').value, 10),
    category: document.getElementById('chk-category').value,
    gender: document.getElementById('chk-gender').value,
    single_girl_child: document.getElementById('chk-single-girl').checked ? 'Yes' : 'No',
    disability_status: document.getElementById('chk-pwd').checked ? 'Yes' : 'No'
  };

  const res = await API.checkEligibility(profile);
  if (res.success) {
    renderEligibilityResults(res.summary, res.results);
  }
}

function renderEligibilityResults(summary, results) {
  document.getElementById('summary-fully-count').textContent = summary.fully_eligible;
  document.getElementById('summary-partial-count').textContent = summary.partially_eligible;
  document.getElementById('summary-ineligible-count').textContent = summary.ineligible;

  const listContainer = document.getElementById('eligibility-results-list');
  if (!listContainer) return;

  listContainer.innerHTML = results.map(item => `
    <div class="card-custom p-4">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-3">
        <div>
          <span class="badge ${item.match_percentage === 100 ? 'bg-success' : (item.match_percentage >= 60 ? 'bg-warning text-dark' : 'bg-danger')} px-3 py-2 rounded-pill fw-bold">
            ${item.match_percentage}% Eligibility Fit • ${item.status}
          </span>
          <h5 class="fw-bold text-dark mt-2 mb-1">${item.scholarship_name}</h5>
          <div class="text-muted" style="font-size: 0.82rem;">${item.provider} • Grant: <strong class="text-primary">${item.amount}</strong></div>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-primary btn-sm rounded-pill" onclick="viewScholarshipDetails('${item.scholarship_id}')">
            View Details
          </button>
          <button class="btn btn-primary btn-sm rounded-pill" onclick="addScholarshipToTracker('${item.scholarship_id}')">
            <i class="fa-solid fa-plus me-1"></i> Track
          </button>
        </div>
      </div>

      <!-- Match Progress Bar -->
      <div class="match-meter mb-3">
        <div class="match-meter-bar ${item.match_percentage === 100 ? 'bg-success' : (item.match_percentage >= 60 ? 'bg-warning' : 'bg-danger')}" style="width: ${item.match_percentage}%;"></div>
      </div>

      <!-- Diagnostic Criteria Pills -->
      <div class="row g-2">
        ${item.breakdown.map(crit => `
          <div class="col-md-6">
            <div class="criteria-pill ${crit.passed ? 'passed' : 'failed'}">
              <div class="d-flex align-items-center gap-2">
                <i class="fa-solid ${crit.passed ? 'fa-circle-check text-success' : 'fa-circle-xmark text-danger'}"></i>
                <div>
                  <div class="fw-bold" style="font-size: 0.82rem;">${crit.criterion}</div>
                  <div class="text-muted" style="font-size: 0.75rem;">${crit.explanation}</div>
                </div>
              </div>
              <span class="badge ${crit.passed ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}" style="font-size: 0.7rem;">
                ${crit.passed ? 'Satisfied' : 'Not Met'}
              </span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

// ==============================================================================
// MODULE 5: SCHOLARSHIP DETAILS MODAL
// ==============================================================================
function viewScholarshipDetails(scholarshipId) {
  const sch = allScholarships.find(s => s.id === scholarshipId);
  if (!sch) return;

  currentViewingScholarship = sch;

  document.getElementById('modal-sch-type').textContent = `${sch.type} • ${sch.subtype || ''}`;
  document.getElementById('modal-sch-title').textContent = sch.name;
  document.getElementById('modal-sch-provider').textContent = sch.provider;
  document.getElementById('modal-sch-amount').textContent = sch.amount;
  document.getElementById('modal-sch-deadline').textContent = `${sch.deadline} (${sch.days_left}d left)`;
  document.getElementById('modal-sch-marks').textContent = `Min ${sch.min_percentage}% Marks`;
  document.getElementById('modal-sch-desc').textContent = sch.description || 'Comprehensive financial assistance scheme.';

  // Criteria
  const criteriaList = document.getElementById('modal-sch-criteria');
  criteriaList.innerHTML = `
    <li><strong>Education Levels:</strong> ${sch.level ? sch.level.join(', ') : 'All'}</li>
    <li><strong>Eligible Courses:</strong> ${sch.courses ? sch.courses.join(', ') : 'All Streams'}</li>
    <li><strong>Income Ceiling:</strong> ₹${(sch.max_family_income || 0).toLocaleString('en-IN')} / year</li>
    <li><strong>Eligible Categories:</strong> ${sch.categories ? sch.categories.join(', ') : 'All'}</li>
    <li><strong>Gender:</strong> ${sch.gender || 'All'}</li>
  `;

  // Documents
  const docsList = document.getElementById('modal-sch-docs');
  docsList.innerHTML = (sch.documents_required || []).map(doc => `
    <span class="badge bg-light text-dark border p-2" style="font-size: 0.8rem;">
      <i class="fa-regular fa-file-lines me-1 text-primary"></i> ${doc}
    </span>
  `).join('');

  // Steps
  const stepsList = document.getElementById('modal-sch-steps');
  stepsList.innerHTML = (sch.application_steps || []).map(step => `
    <li class="mb-2">${step}</li>
  `).join('');

  // Links
  document.getElementById('modal-sch-portal-btn').href = sch.official_url || '#';

  detailsModalInstance.show();
}

function addCurrentModalToTracker() {
  if (!currentViewingScholarship) return;
  addScholarshipToTracker(currentViewingScholarship.id);
  detailsModalInstance.hide();
}

// ==============================================================================
// MODULE 6: DOCUMENT ASSISTANCE, READINESS & UPLOAD SIMULATOR
// ==============================================================================
function renderDocumentChecklist() {
  const container = document.getElementById('documents-master-container');
  if (!container || !allDocuments.length) return;

  const studentKey = currentStudent ? currentStudent.id : 'std-101';
  const savedStatuses = JSON.parse(localStorage.getItem(`scholarquest_doc_status_${studentKey}`) || '{}');

  // Calculate readiness score
  let readyCount = 0;
  let pendingCount = 0;

  allDocuments.forEach(doc => {
    const st = savedStatuses[doc.id]?.status || 'Need to Get';
    if (st === 'Ready') readyCount++;
    else pendingCount++;
  });

  const totalDocs = allDocuments.length;
  const readinessPct = totalDocs > 0 ? Math.round((readyCount / totalDocs) * 100) : 0;

  // Update banner elements if present
  const pctBadge = document.getElementById('doc-readiness-percentage');
  const barEl = document.getElementById('doc-readiness-bar');
  const readyTxt = document.getElementById('doc-ready-count');
  const pendTxt = document.getElementById('doc-pending-count');

  if (pctBadge) pctBadge.textContent = `${readinessPct}% Ready`;
  if (barEl) {
    barEl.style.width = `${readinessPct}%`;
    barEl.className = `progress-bar ${readinessPct >= 80 ? 'bg-success' : (readinessPct >= 50 ? 'bg-warning' : 'bg-danger')}`;
  }
  if (readyTxt) readyTxt.innerHTML = `<i class="fa-solid fa-circle-check text-success me-1"></i>${readyCount} Verified / Ready`;
  if (pendTxt) pendTxt.innerHTML = `<i class="fa-solid fa-clock text-warning me-1"></i>${pendingCount} Pending / Missing`;

  container.innerHTML = allDocuments.map(doc => {
    const docData = savedStatuses[doc.id] || { status: 'Need to Get', ref: '', date: '' };
    const currentStatus = docData.status;

    return `
      <div class="doc-item">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-2">
          <div>
            <span class="badge bg-primary-subtle text-primary mb-1">${doc.category}</span>
            <h5 class="fw-bold text-dark mb-0">${doc.name}</h5>
            ${docData.ref ? `<div class="text-success mt-1" style="font-size: 0.75rem;"><i class="fa-solid fa-file-circle-check me-1"></i>Certificate No: <strong>${docData.ref}</strong> ${docData.date ? `(Issued: ${docData.date})` : ''}</div>` : ''}
          </div>
          <div class="d-flex align-items-center gap-2">
            <div class="btn-group btn-group-sm" role="group">
              <button type="button" class="btn ${currentStatus === 'Ready' ? 'btn-success' : 'btn-outline-success'}" onclick="setDocStatus('${doc.id}', 'Ready')">
                <i class="fa-solid fa-check me-1"></i> Ready
              </button>
              <button type="button" class="btn ${currentStatus === 'In Progress' ? 'btn-warning text-dark' : 'btn-outline-warning'}" onclick="setDocStatus('${doc.id}', 'In Progress')">
                In Progress
              </button>
              <button type="button" class="btn ${currentStatus === 'Need to Get' ? 'btn-danger' : 'btn-outline-danger'}" onclick="setDocStatus('${doc.id}', 'Need to Get')">
                Need to Get
              </button>
            </div>
            <button type="button" class="btn btn-sm btn-outline-primary rounded-pill px-3" onclick="openDocumentUploadModal('${doc.id}')" title="Upload certificate copy">
              <i class="fa-solid fa-cloud-arrow-up me-1"></i> Upload
            </button>
          </div>
        </div>

        <div class="p-3 rounded bg-light border mb-2" style="font-size: 0.85rem;">
          <div class="mb-1"><strong><i class="fa-solid fa-building-shield text-secondary me-1"></i> Issuing Authority:</strong> ${doc.issuing_authority}</div>
          <div class="mb-1"><strong><i class="fa-solid fa-circle-info text-primary me-1"></i> How to Obtain:</strong> ${doc.how_to_obtain}</div>
          <div class="text-danger"><strong><i class="fa-solid fa-triangle-exclamation me-1"></i> Common Trap:</strong> ${doc.common_rejection_reasons}</div>
        </div>

        <div class="d-flex gap-1 flex-wrap">
          <span class="text-muted" style="font-size: 0.75rem;">Required for:</span>
          ${(doc.mandatory_for || []).map(m => `<span class="badge bg-white text-muted border" style="font-size: 0.72rem;">${m}</span>`).join(' ')}
        </div>
      </div>
    `;
  }).join('');
}

function setDocStatus(docId, status) {
  const studentKey = currentStudent ? currentStudent.id : 'std-101';
  const savedStatuses = JSON.parse(localStorage.getItem(`scholarquest_doc_status_${studentKey}`) || '{}');
  const existing = savedStatuses[docId] || {};
  savedStatuses[docId] = { ...existing, status };
  localStorage.setItem(`scholarquest_doc_status_${studentKey}`, JSON.stringify(savedStatuses));
  renderDocumentChecklist();
  showToast(`Document status marked as "${status}"`);
}

function openDocumentUploadModal(docId) {
  const doc = allDocuments.find(d => d.id === docId);
  if (!doc) return;
  document.getElementById('upload-doc-id').value = doc.id;
  document.getElementById('upload-doc-name').value = doc.name;
  
  const studentKey = currentStudent ? currentStudent.id : 'std-101';
  const savedStatuses = JSON.parse(localStorage.getItem(`scholarquest_doc_status_${studentKey}`) || '{}');
  const existing = savedStatuses[docId] || {};
  document.getElementById('upload-doc-ref').value = existing.ref || '';
  document.getElementById('upload-doc-date').value = existing.date || new Date().toISOString().split('T')[0];

  if (docUploadModalInstance) docUploadModalInstance.show();
}

function handleDocUploadSubmit(e) {
  e.preventDefault();
  const docId = document.getElementById('upload-doc-id').value;
  const refNo = document.getElementById('upload-doc-ref').value || `DOC-${Math.floor(1000 + Math.random() * 9000)}`;
  const issueDate = document.getElementById('upload-doc-date').value || new Date().toISOString().split('T')[0];

  const studentKey = currentStudent ? currentStudent.id : 'std-101';
  const savedStatuses = JSON.parse(localStorage.getItem(`scholarquest_doc_status_${studentKey}`) || '{}');
  savedStatuses[docId] = {
    status: 'Ready',
    ref: refNo,
    date: issueDate
  };
  localStorage.setItem(`scholarquest_doc_status_${studentKey}`, JSON.stringify(savedStatuses));

  if (docUploadModalInstance) docUploadModalInstance.hide();
  renderDocumentChecklist();
  showToast("Document verified and uploaded successfully!");
}

// ==============================================================================
// MODULE 7: DEADLINE REMINDER & CALENDAR
// ==============================================================================
function renderDeadlinesView() {
  const urgentContainer = document.getElementById('deadlines-urgent-container');
  const approachingContainer = document.getElementById('deadlines-approaching-container');
  const activeContainer = document.getElementById('deadlines-active-container');

  if (!urgentContainer || !approachingContainer || !activeContainer) return;

  const urgent = allScholarships.filter(s => (s.days_left || 0) <= 7);
  const approaching = allScholarships.filter(s => (s.days_left || 0) > 7 && (s.days_left || 0) <= 21);
  const active = allScholarships.filter(s => (s.days_left || 0) > 21);

  const renderCard = (s, badgeClass) => `
    <div class="card-custom p-3 d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3">
      <div>
        <div class="d-flex align-items-center gap-2 mb-1">
          <span class="badge ${badgeClass} px-3 py-1 rounded-pill">${s.days_left} Days Left</span>
          <span class="text-muted" style="font-size: 0.8rem;">Closing Date: <strong>${s.deadline}</strong></span>
        </div>
        <h5 class="fw-bold text-dark mb-0" style="font-size: 1.05rem;">${s.name}</h5>
        <div class="text-muted" style="font-size: 0.8rem;">${s.provider} • Award: ${s.amount}</div>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-primary btn-sm rounded-pill" onclick="viewScholarshipDetails('${s.id}')">View Details</button>
        <button class="btn btn-primary btn-sm rounded-pill" onclick="addScholarshipToTracker('${s.id}')">Track</button>
      </div>
    </div>
  `;

  urgentContainer.innerHTML = urgent.length ? urgent.map(s => renderCard(s, 'bg-danger text-white')).join('') : '<div class="text-muted p-2">No urgent deadlines in this window.</div>';
  approachingContainer.innerHTML = approaching.length ? approaching.map(s => renderCard(s, 'bg-warning text-dark')).join('') : '<div class="text-muted p-2">No deadlines approaching in this window.</div>';
  activeContainer.innerHTML = active.length ? active.map(s => renderCard(s, 'bg-success text-white')).join('') : '<div class="text-muted p-2">No active scholarships.</div>';
}

function simulateDeadlineAlert() {
  showToast("🔔 Reminder Alert: HDFC Bank Parivartan Scholarship closes in 5 days! Complete your upload on Buddy4Study.");
}

// ==============================================================================
// MODULE 7: APPLICATION PROGRESS TRACKER (KANBAN)
// ==============================================================================
async function addScholarshipToTracker(scholarshipId) {
  const sch = allScholarships.find(s => s.id === scholarshipId);
  const data = {
    student_id: currentStudent ? currentStudent.id : 'std-101',
    scholarship_id: scholarshipId,
    status: 'Saved',
    deadline: sch ? sch.deadline : '',
    notes: 'Added from scholarship discovery.'
  };

  const res = await API.addApplication(data);
  if (res.success) {
    showToast(`Added "${sch ? sch.name : 'Scholarship'}" to Application Tracker!`);
    await refreshCoreData();
  } else {
    showToast(res.message || "Already in your tracker.");
  }
}

function renderKanbanBoard() {
  const stages = ['Saved', 'In Progress', 'Submitted', 'Under Review', 'Awarded'];
  const stageColIds = {
    'Saved': 'kanban-saved',
    'In Progress': 'kanban-progress',
    'Submitted': 'kanban-submitted',
    'Under Review': 'kanban-review',
    'Awarded': 'kanban-awarded'
  };
  const stageCountIds = {
    'Saved': 'col-count-saved',
    'In Progress': 'col-count-progress',
    'Submitted': 'col-count-submitted',
    'Under Review': 'col-count-review',
    'Awarded': 'col-count-awarded'
  };

  stages.forEach(stage => {
    const colEl = document.getElementById(stageColIds[stage]);
    const countEl = document.getElementById(stageCountIds[stage]);
    if (!colEl) return;

    const filtered = allApplications.filter(a => a.status.toLowerCase() === stage.toLowerCase());
    if (countEl) countEl.textContent = filtered.length;

    if (filtered.length === 0) {
      colEl.innerHTML = `<div class="p-3 text-center text-muted" style="font-size: 0.78rem;">No applications in this stage</div>`;
      return;
    }

    colEl.innerHTML = filtered.map(app => `
      <div class="kanban-card">
        <div class="d-flex justify-content-between align-items-center mb-1">
          <span class="badge bg-light text-primary border" style="font-size: 0.7rem;">${app.provider || 'Portal'}</span>
          <span class="text-danger fw-bold" style="font-size: 0.72rem;">${app.days_left ? `${app.days_left}d left` : ''}</span>
        </div>
        <div class="fw-bold text-dark mb-1" style="font-size: 0.88rem;">${app.scholarship_name}</div>
        <div class="text-primary fw-semibold mb-2" style="font-size: 0.82rem;">${app.amount}</div>

        ${app.application_no ? `
          <div class="p-1 px-2 rounded bg-light border text-muted mb-2 d-flex justify-content-between align-items-center" style="font-size: 0.72rem;">
            <span><strong>Ref:</strong> ${app.application_no}</span>
            ${app.submission_date ? `<span>${app.submission_date}</span>` : ''}
          </div>
        ` : ''}

        <p class="text-muted mb-2" style="font-size: 0.76rem; font-style: italic;">
          "${app.notes || 'No custom notes'}"
        </p>

        <!-- Stage Mover Controls & Edit -->
        <div class="d-flex justify-content-between align-items-center pt-2 border-top">
          <div class="dropdown">
            <button class="btn btn-light btn-sm dropdown-toggle py-0 px-2" style="font-size: 0.72rem;" type="button" data-bs-toggle="dropdown">
              Move Stage
            </button>
            <ul class="dropdown-menu shadow-sm" style="font-size: 0.8rem;">
              ${stages.map(s => `
                <li><a class="dropdown-item ${s === app.status ? 'active' : ''}" href="#" onclick="updateAppStage('${app.id}', '${s}'); return false;">${s}</a></li>
              `).join('')}
            </ul>
          </div>
          <div class="d-flex align-items-center gap-2">
            <button class="btn btn-link btn-sm text-secondary p-0" onclick="openEditApplicationModal('${app.id}')" title="Edit Application Reference & Notes">
              <i class="fa-solid fa-pen-to-square" style="font-size: 0.78rem;"></i>
            </button>
            <button class="btn btn-link btn-sm text-danger p-0" onclick="deleteFromTracker('${app.id}')" title="Remove from Tracker">
              <i class="fa-solid fa-trash-can" style="font-size: 0.78rem;"></i>
            </button>
          </div>
        </div>
      </div>
    `).join('');
  });
}

function openEditApplicationModal(appId) {
  const app = allApplications.find(a => a.id === appId);
  if (!app) return;

  document.getElementById('edit-app-id').value = app.id;
  document.getElementById('edit-app-sch-name').value = app.scholarship_name || 'Scholarship';
  document.getElementById('edit-app-no').value = app.application_no || '';
  document.getElementById('edit-app-status').value = app.status || 'Saved';
  document.getElementById('edit-app-date').value = app.submission_date || '';
  document.getElementById('edit-app-notes').value = app.notes || '';

  if (editAppModalInstance) editAppModalInstance.show();
}

async function handleSaveApplicationDetails(e) {
  e.preventDefault();
  const appId = document.getElementById('edit-app-id').value;
  const updateData = {
    application_no: document.getElementById('edit-app-no').value,
    status: document.getElementById('edit-app-status').value,
    submission_date: document.getElementById('edit-app-date').value,
    notes: document.getElementById('edit-app-notes').value
  };

  const res = await API.updateApplication(appId, updateData);
  if (res.success) {
    if (editAppModalInstance) editAppModalInstance.hide();
    showToast("Application records updated successfully!");
    await refreshCoreData();
  }
}

async function updateAppStage(appId, newStage) {
  const res = await API.updateApplication(appId, { status: newStage });
  if (res.success) {
    showToast(`Updated application stage to "${newStage}"`);
    await refreshCoreData();
  }
}

async function deleteFromTracker(appId) {
  if (confirm("Remove this application from your tracker?")) {
    const res = await API.deleteApplication(appId);
    if (res.success) {
      showToast("Removed from tracker.");
      await refreshCoreData();
    }
  }
}

// ==============================================================================
// MODULE 8: ADMIN MANAGEMENT PANEL
// ==============================================================================
async function loadAdminOverview() {
  const res = await API.getAdminOverview();
  if (res.success) {
    allScholarships = res.scholarships;
    renderAdminTable();
    renderAdminStudentsTable(res.students);
    document.getElementById('admin-sch-count').textContent = res.scholarships.length;
    document.getElementById('admin-students-count').textContent = res.students.length;
  }
}

function switchAdminTab(tabName) {
  document.querySelectorAll('#admin-tabs .nav-link').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('#view-admin .card-custom').forEach(el => el.classList.add('d-none'));

  event.currentTarget.classList.add('active');
  const target = document.getElementById(`admin-tab-${tabName}`);
  if (target) target.classList.remove('d-none');
}

function renderAdminTable() {
  const tbody = document.getElementById('admin-scholarships-table-body');
  if (!tbody) return;

  tbody.innerHTML = allScholarships.map(s => `
    <tr>
      <td>
        <div class="fw-bold text-dark">${s.name}</div>
        <div class="text-muted" style="font-size: 0.75rem;">${s.provider}</div>
      </td>
      <td><span class="badge ${s.type === 'Government' ? 'bg-primary-subtle text-primary' : 'bg-warning-subtle text-warning'}">${s.type}</span></td>
      <td class="fw-bold text-primary">${s.amount}</td>
      <td>Min ${s.min_percentage}%</td>
      <td>&le; ₹${(s.max_family_income || 0).toLocaleString('en-IN')}</td>
      <td>${s.deadline}</td>
      <td>
        <div class="d-flex gap-1">
          <button class="btn btn-sm btn-outline-secondary" onclick="openEditScholarshipModal('${s.id}')" title="Edit">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger" onclick="handleDeleteScholarship('${s.id}')" title="Delete">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderAdminStudentsTable(students) {
  const tbody = document.getElementById('admin-students-table-body');
  if (!tbody) return;

  tbody.innerHTML = students.map(st => `
    <tr>
      <td>
        <div class="fw-bold text-dark">${st.name}</div>
        <div class="text-muted" style="font-size: 0.75rem;">${st.email}</div>
      </td>
      <td>
        <div>${st.course}</div>
        <div class="text-muted" style="font-size: 0.75rem;">${st.college || 'Institution'}</div>
      </td>
      <td><span class="badge bg-light text-dark border">${st.percentage}%</span></td>
      <td>₹${(st.family_income || 0).toLocaleString('en-IN')} / yr</td>
      <td><span class="badge bg-secondary-subtle text-secondary">${st.category}</span></td>
      <td class="text-muted" style="font-size: 0.8rem;">${st.created_at || '2026-11-01'}</td>
    </tr>
  `).join('');
}

function openAddScholarshipModal() {
  document.getElementById('adminModalTitle').textContent = "Add New Scholarship Listing";
  document.getElementById('admin-sch-id').value = "";
  document.getElementById('admin-scholarship-form').reset();
  addSchModalInstance.show();
}

function openEditScholarshipModal(id) {
  const sch = allScholarships.find(s => s.id === id);
  if (!sch) return;

  document.getElementById('adminModalTitle').textContent = "Edit Scholarship Listing";
  document.getElementById('admin-sch-id').value = sch.id;
  document.getElementById('admin-form-name').value = sch.name;
  document.getElementById('admin-form-provider').value = sch.provider;
  document.getElementById('admin-form-type').value = sch.type;
  document.getElementById('admin-form-amount').value = sch.amount;
  document.getElementById('admin-form-amount-val').value = sch.amount_val || 50000;
  document.getElementById('admin-form-min-marks').value = sch.min_percentage;
  document.getElementById('admin-form-max-income').value = sch.max_family_income;
  document.getElementById('admin-form-deadline').value = sch.deadline;
  document.getElementById('admin-form-level').value = (sch.level || []).join(', ');
  document.getElementById('admin-form-categories').value = (sch.categories || []).join(', ');
  document.getElementById('admin-form-url').value = sch.official_url;
  document.getElementById('admin-form-desc').value = sch.description || '';

  addSchModalInstance.show();
}

async function handleAdminSaveScholarship(e) {
  e.preventDefault();
  const id = document.getElementById('admin-sch-id').value;
  const payload = {
    name: document.getElementById('admin-form-name').value,
    provider: document.getElementById('admin-form-provider').value,
    type: document.getElementById('admin-form-type').value,
    amount: document.getElementById('admin-form-amount').value,
    amount_val: parseInt(document.getElementById('admin-form-amount-val').value, 10),
    min_percentage: parseFloat(document.getElementById('admin-form-min-marks').value),
    max_family_income: parseInt(document.getElementById('admin-form-max-income').value, 10),
    deadline: document.getElementById('admin-form-deadline').value,
    level: document.getElementById('admin-form-level').value.split(',').map(s => s.trim()),
    categories: document.getElementById('admin-form-categories').value.split(',').map(s => s.trim()),
    official_url: document.getElementById('admin-form-url').value,
    description: document.getElementById('admin-form-desc').value
  };

  let res;
  if (id) {
    res = await API.updateScholarship(id, payload);
  } else {
    res = await API.createScholarship(payload);
  }

  if (res.success) {
    addSchModalInstance.hide();
    showToast(id ? "Scholarship updated successfully!" : "New scholarship created!");
    await refreshCoreData();
    loadAdminOverview();
  }
}

async function handleDeleteScholarship(id) {
  if (confirm("Are you sure you want to delete this scholarship listing?")) {
    const res = await API.deleteScholarship(id);
    if (res.success) {
      showToast("Scholarship deleted.");
      await refreshCoreData();
      loadAdminOverview();
    }
  }
}

// ==============================================================================
// NOTIFICATIONS & TOAST ALERTS
// ==============================================================================
function renderNotifications() {
  const container = document.getElementById('notif-list-container');
  const badge = document.getElementById('notif-badge');
  if (!container) return;

  const unread = allNotifications.filter(n => !n.read);
  if (badge) {
    badge.textContent = unread.length;
    badge.style.display = unread.length > 0 ? 'inline-block' : 'none';
  }

  container.innerHTML = allNotifications.map(n => `
    <li class="p-2 mb-1 rounded ${n.read ? 'bg-light' : 'bg-primary-subtle'}">
      <div class="d-flex justify-content-between align-items-center mb-1">
        <strong style="font-size: 0.8rem;" class="${n.read ? 'text-dark' : 'text-primary'}">${n.title}</strong>
        <span class="badge ${n.type === 'Urgent' ? 'bg-danger' : 'bg-secondary'}" style="font-size: 0.65rem;">${n.type}</span>
      </div>
      <p class="mb-0 text-muted" style="font-size: 0.75rem;">${n.message}</p>
    </li>
  `).join('');
}

function markAllNotifsRead() {
  allNotifications.forEach(n => n.read = true);
  renderNotifications();
  showToast("All notifications marked as read.");
}

function showToast(message) {
  const toastEl = document.getElementById('toastMessage');
  if (toastEl) toastEl.textContent = message;
  if (appToastInstance) appToastInstance.show();
}

function getBadgeClassForStatus(status) {
  switch (status.toLowerCase()) {
    case 'saved': return 'bg-secondary-subtle text-secondary';
    case 'in progress': return 'bg-warning-subtle text-warning';
    case 'submitted': return 'bg-primary-subtle text-primary';
    case 'under review': return 'bg-info-subtle text-info';
    case 'awarded': return 'bg-success-subtle text-success';
    default: return 'bg-light text-dark';
  }
}

// ==============================================================================
// Hackathon Framework Structure Modal Opener
// ==============================================================================
let frameworkModalInstance = null;
function openFrameworkModal() {
  const modalEl = document.getElementById('frameworkModal');
  if (!modalEl) return;
  if (!frameworkModalInstance) {
    frameworkModalInstance = new bootstrap.Modal(modalEl);
  }
  frameworkModalInstance.show();
}

// ==============================================================================
// SCHOLARSHIP COMPARISON ENGINE
// ==============================================================================
function toggleCompareScholarship(id) {
  const idx = comparedScholarshipIds.indexOf(id);
  if (idx >= 0) {
    comparedScholarshipIds.splice(idx, 1);
  } else {
    if (comparedScholarshipIds.length >= 3) {
      showToast("You can compare up to 3 scholarships at a time.");
      return;
    }
    comparedScholarshipIds.push(id);
  }
  updateComparisonTray();
  applyFilters();
}

function updateComparisonTray() {
  const tray = document.getElementById('comparison-tray');
  const countEl = document.getElementById('compare-count');
  const previewEl = document.getElementById('compare-names-preview');
  if (!tray) return;

  if (comparedScholarshipIds.length === 0) {
    tray.classList.add('d-none');
    return;
  }

  tray.classList.remove('d-none');
  if (countEl) countEl.textContent = comparedScholarshipIds.length;

  const names = comparedScholarshipIds.map(id => {
    const s = allScholarships.find(x => x.id === id);
    return s ? `<span class="badge bg-white text-dark">${s.name.substring(0, 22)}...</span>` : '';
  }).join('');
  if (previewEl) previewEl.innerHTML = names;
}

function clearComparison() {
  comparedScholarshipIds = [];
  updateComparisonTray();
  applyFilters();
}

let comparisonModalInstance = null;
function openComparisonModal() {
  if (comparedScholarshipIds.length < 2) {
    showToast("Please select at least 2 scholarships to compare.");
    return;
  }
  const modalEl = document.getElementById('comparisonModal');
  if (!modalEl) return;
  if (!comparisonModalInstance) {
    comparisonModalInstance = new bootstrap.Modal(modalEl);
  }

  const schs = comparedScholarshipIds.map(id => allScholarships.find(s => s.id === id)).filter(Boolean);
  const table = document.getElementById('comparison-table');
  if (table) {
    table.innerHTML = `
      <thead class="table-light">
        <tr>
          <th style="width: 25%;">Comparison Criteria</th>
          ${schs.map(s => `<th style="width: ${75 / schs.length}%;" class="text-primary fw-bold">${s.name}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Provider Body</strong></td>
          ${schs.map(s => `<td>${s.provider}</td>`).join('')}
        </tr>
        <tr>
          <td><strong>Scheme Type</strong></td>
          ${schs.map(s => `<td><span class="badge ${s.type === 'Government' ? 'bg-primary' : 'bg-success'}">${s.type} (${s.subtype || 'National'})</span></td>`).join('')}
        </tr>
        <tr>
          <td><strong>Grant Amount</strong></td>
          ${schs.map(s => `<td class="h6 text-primary fw-bold">${s.amount}</td>`).join('')}
        </tr>
        <tr>
          <td><strong>Application Deadline</strong></td>
          ${schs.map(s => `<td><span class="badge ${s.days_left <= 7 ? 'bg-danger' : 'bg-warning text-dark'}">${s.deadline} (${s.days_left}d left)</span></td>`).join('')}
        </tr>
        <tr>
          <td><strong>Min Marks % Required</strong></td>
          ${schs.map(s => `<td><strong>${s.min_percentage}%</strong></td>`).join('')}
        </tr>
        <tr>
          <td><strong>Family Income Ceiling</strong></td>
          ${schs.map(s => `<td>₹${(s.max_family_income || 0).toLocaleString('en-IN')}/yr</td>`).join('')}
        </tr>
        <tr>
          <td><strong>Target Social Category</strong></td>
          ${schs.map(s => `<td>${s.categories ? s.categories.join(', ') : 'All'}</td>`).join('')}
        </tr>
        <tr>
          <td><strong>Education Level</strong></td>
          ${schs.map(s => `<td>${s.level ? s.level.join(', ') : 'All'}</td>`).join('')}
        </tr>
        <tr>
          <td><strong>Official Action</strong></td>
          ${schs.map(s => `
            <td>
              <a href="${s.official_url}" target="_blank" class="btn btn-sm btn-primary rounded-pill w-100 mb-1">Apply on Portal</a>
              <button class="btn btn-sm btn-outline-primary rounded-pill w-100" onclick="addScholarshipToTracker('${s.id}')">Add to Tracker</button>
            </td>
          `).join('')}
        </tr>
      </tbody>
    `;
  }

  comparisonModalInstance.show();
}

// ==============================================================================
// WHAT-IF ELIGIBILITY SIMULATOR
// ==============================================================================
function handleSimulateWhatIf() {
  const marks = parseFloat(document.getElementById('sim-marks-slider').value);
  const income = parseInt(document.getElementById('sim-income-slider').value, 10);

  document.getElementById('sim-marks-val').textContent = `${marks}%`;
  document.getElementById('sim-income-val').textContent = `₹${(income).toLocaleString('en-IN')} / yr`;

  // Count how many scholarships match simulated criteria
  const unlocked = allScholarships.filter(s => s.min_percentage <= marks && s.max_family_income >= income);
  const unlockedVal = unlocked.reduce((acc, cur) => acc + (cur.amount_val || 0), 0);

  const msgEl = document.getElementById('sim-unlocked-message');
  if (msgEl) {
    msgEl.innerHTML = `
      <i class="fa-solid fa-sparkles text-warning me-1"></i> At <strong>${marks}%</strong> and <strong>₹${(income / 100000).toFixed(1)}L/yr</strong>, you qualify for <strong class="text-success">${unlocked.length} scholarships</strong> with cumulative grant value of <strong class="text-primary">₹${(unlockedVal / 100000).toFixed(1)} Lakhs+</strong>!
    `;
  }
}

// ==============================================================================
// APPLICATION DOSSIER (PRINT / EXPORT)
// ==============================================================================
let dossierModalInstance = null;
function openApplicationDossier() {
  const modalEl = document.getElementById('dossierModal');
  if (!modalEl) return;
  if (!dossierModalInstance) {
    dossierModalInstance = new bootstrap.Modal(modalEl);
  }

  const student = currentStudent || {
    id: 'std-101',
    name: 'Aarav Sharma',
    course: 'B.Tech Computer Science',
    college: 'Delhi Technological University',
    percentage: 84.5,
    cgpa: '8.6',
    family_income: 320000,
    category: 'General',
    gender: 'Male'
  };

  document.getElementById('dossier-name').textContent = student.name;
  document.getElementById('dossier-id').textContent = student.id;
  document.getElementById('dossier-course').textContent = student.course;
  document.getElementById('dossier-college').textContent = student.college;
  document.getElementById('dossier-marks').textContent = `${student.percentage}% (CGPA ${student.cgpa || '8.0'})`;
  document.getElementById('dossier-income').textContent = `₹${(student.family_income || 0).toLocaleString('en-IN')} / year`;
  document.getElementById('dossier-cat').textContent = student.category;
  document.getElementById('dossier-gender').textContent = student.gender;
  document.getElementById('dossier-date').textContent = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  // Render applications in dossier
  const appsTable = document.getElementById('dossier-apps-table');
  if (appsTable) {
    appsTable.innerHTML = (allApplications.length ? allApplications : [
      { scholarship_name: 'Central Sector Scheme', amount: '₹20,000 / yr', application_no: 'NSP2026-CS-89211', status: 'Submitted' }
    ]).map(a => `
      <tr>
        <td><strong>${a.scholarship_name}</strong></td>
        <td>${a.amount || '₹50,000 / yr'}</td>
        <td><code>${a.application_no || 'DRAFT-PENDING'}</code></td>
        <td><span class="badge ${getBadgeClassForStatus(a.status)}">${a.status}</span></td>
      </tr>
    `).join('');
  }

  // Render documents in dossier
  const docsTable = document.getElementById('dossier-docs-table');
  const studentKey = currentStudent ? currentStudent.id : 'std-101';
  const savedStatuses = JSON.parse(localStorage.getItem(`scholarquest_doc_status_${studentKey}`) || '{}');
  if (docsTable) {
    docsTable.innerHTML = allDocuments.map(d => {
      const st = savedStatuses[d.id]?.status || (['Aadhaar Card', 'Income Certificate', 'Class 10th & 12th Board Marksheets'].includes(d.name) ? 'Verified' : 'Pending Upload');
      return `
        <tr>
          <td><strong>${d.name}</strong></td>
          <td class="text-muted">${d.issuing_authority || 'Tehsildar / DigiLocker'}</td>
          <td><span class="badge ${st === 'Verified' || st === 'Ready' ? 'bg-success' : 'bg-warning text-dark'}">${st}</span></td>
        </tr>
      `;
    }).join('');
  }

  dossierModalInstance.show();
}

// ==============================================================================
// AI SCHOLARSHIP ADVISOR CHATBOT ENGINE
// ==============================================================================
function toggleAdvisorChat() {
  const windowEl = document.getElementById('advisor-chat-window');
  if (windowEl) {
    windowEl.classList.toggle('d-none');
    if (!windowEl.classList.contains('d-none')) {
      const studentNameEl = document.getElementById('chat-student-name');
      if (studentNameEl && currentStudent) studentNameEl.textContent = currentStudent.name.split(' ')[0];
      const input = document.getElementById('advisor-input');
      if (input) input.focus();
    }
  }
}

function sendQuickPrompt(query) {
  const input = document.getElementById('advisor-input');
  if (input) {
    input.value = query;
    handleAdvisorSubmit(new Event('submit'));
  }
}

function handleAdvisorSubmit(e) {
  if (e && e.preventDefault) e.preventDefault();
  const input = document.getElementById('advisor-input');
  const query = (input?.value || '').trim();
  if (!query) return;

  const chatBody = document.getElementById('advisor-chat-body');
  if (!chatBody) return;

  // Append user bubble
  chatBody.innerHTML += `
    <div class="chat-bubble-user">${query}</div>
  `;
  input.value = '';

  // Generate intelligent response based on query
  setTimeout(() => {
    const qLower = query.toLowerCase();
    let reply = "";

    if (qLower.includes('girl') || qLower.includes('women') || qLower.includes('female')) {
      const girlSchemes = allScholarships.filter(s => s.gender === 'Female');
      reply = `👩‍🎓 Found <strong>${girlSchemes.length} scholarships</strong> exclusively for female scholars:<br>
        • <strong>AICTE Pragati:</strong> ₹50,000/yr for B.Tech/Diploma (Deadline: 30 Nov)<br>
        • <strong>Adobe WIT:</strong> ₹1,00,000 + Tech Internship (Deadline: 10 Dec)<br>
        • <strong>Begum Hazrat Mahal:</strong> ₹6,000/yr for Minority girls.<br>
        <button class="btn btn-sm btn-outline-primary rounded-pill mt-2" onclick="navigateTo('discovery'); document.getElementById('filter-gender').value='Female'; applyFilters(); toggleAdvisorChat();">Filter Female Schemes</button>
      `;
    } else if (qLower.includes('high') || qLower.includes('amount') || qLower.includes('50k') || qLower.includes('lakh')) {
      const highSchemes = allScholarships.filter(s => (s.amount_val || 0) >= 50000).slice(0, 3);
      reply = `💰 Here are the top 3 highest-value scholarship schemes:<br>
        ${highSchemes.map(s => `• <strong>${s.name}</strong>: <span class="text-primary fw-bold">${s.amount}</span> (Deadline: ${s.deadline})`).join('<br>')}<br>
        <button class="btn btn-sm btn-outline-primary rounded-pill mt-2" onclick="navigateTo('discovery'); document.getElementById('catalog-sort').value='amount_desc'; applyFilters(); toggleAdvisorChat();">Sort by Highest Amount</button>
      `;
    } else if (qLower.includes('closing') || qLower.includes('deadline') || qLower.includes('urgent') || qLower.includes('month')) {
      const urgent = allScholarships.filter(s => (s.days_left || 0) <= 14);
      reply = `⏳ <strong>${urgent.length} schemes</strong> close in the next 14 days:<br>
        ${urgent.map(s => `• <strong>${s.name.substring(0, 35)}...</strong> (⚠️ ${s.days_left} days remaining)`).join('<br>')}<br>
        <button class="btn btn-sm btn-outline-danger rounded-pill mt-2" onclick="navigateTo('deadlines'); toggleAdvisorChat();">Open Deadline Calendar</button>
      `;
    } else if (qLower.includes('document') || qLower.includes('nsp') || qLower.includes('digilocker') || qLower.includes('cert')) {
      reply = `📄 For National & State portals, you need:<br>
        1. <strong>Aadhaar Card</strong> (DigiLocker verified)<br>
        2. <strong>Income Certificate</strong> (Tehsildar signed, issued current FY)<br>
        3. <strong>Bonafide Certificate</strong> (Signed by Principal)<br>
        4. <strong>Marksheet & Fee Receipt</strong>.<br>
        <button class="btn btn-sm btn-outline-success rounded-pill mt-2" onclick="navigateTo('documents'); toggleAdvisorChat();">Check My Documents</button>
      `;
    } else {
      // General match
      const matches = allScholarships.filter(s => s.name.toLowerCase().includes(qLower) || s.provider.toLowerCase().includes(qLower) || s.categories?.some(c => c.toLowerCase().includes(qLower))).slice(0, 2);
      if (matches.length) {
        reply = `🎯 Found ${matches.length} matching schemes:<br>
          ${matches.map(s => `• <strong>${s.name}</strong> (${s.amount})`).join('<br>')}<br>
          <button class="btn btn-sm btn-outline-primary rounded-pill mt-2" onclick="navigateTo('discovery'); document.getElementById('filter-q').value='${query}'; applyFilters(); toggleAdvisorChat();">View in Catalog</button>
        `;
      } else {
        reply = `💡 You can discover all schemes matching your profile by using the <strong>Smart Eligibility Checker</strong> or checking the <strong>Discovery Catalog</strong> with filters.<br>
          <button class="btn btn-sm btn-primary rounded-pill mt-2" onclick="navigateTo('eligibility'); toggleAdvisorChat();">Run Eligibility Diagnostic</button>
        `;
      }
    }

    chatBody.innerHTML += `
      <div class="chat-bubble-ai">${reply}</div>
    `;
    chatBody.scrollTop = chatBody.scrollHeight;
  }, 400);

  chatBody.scrollTop = chatBody.scrollHeight;
}
