// ==============================================================================
// GrantGlide – ScholarQuest: Interactive 10-Slide Hackathon Presentation Deck
// Built according to Hackathon Presentation Structure (Section 12)
// ==============================================================================

const presentationSlides = [
  // Slide 1
  {
    slideNumber: 1,
    title: "GrantGlide – ScholarQuest",
    subtitle: "Smart Scholarship Discovery and Application Platform",
    category: "Education Technology | Hackathon Project",
    contentHtml: `
      <div class="row align-items-center my-auto">
        <div class="col-md-7">
          <span class="slide-number-pill mb-3">Slide 01 / 10 • Title & Vision</span>
          <h1 class="display-5 fw-bold text-dark mt-2 mb-3">GrantGlide – ScholarQuest</h1>
          <h4 class="text-primary fw-semibold mb-4">Empowering Students Through Smart, Accessible Financial Assistance</h4>
          <p class="lead text-muted" style="font-size: 1.05rem;">
            A centralized, intelligent web platform connecting students with matching scholarships, demystifying eligibility criteria, and tracking deadlines end-to-end.
          </p>
          <div class="d-flex flex-wrap gap-3 mt-4">
            <div class="p-2 px-3 rounded bg-light border"><strong>Domain:</strong> Education Technology (EdTech)</div>
            <div class="p-2 px-3 rounded bg-light border"><strong>Prototype Status:</strong> Live & Operational</div>
          </div>
        </div>
        <div class="col-md-5 text-center mt-4 mt-md-0">
          <div class="p-4 rounded-4 bg-primary text-white shadow-lg">
            <i class="fa-solid fa-graduation-cap display-1 mb-3"></i>
            <h4 class="fw-bold mb-1">ScholarQuest Platform</h4>
            <p class="mb-0 text-white-50" style="font-size: 0.9rem;">From Discovery to Disbursement</p>
          </div>
        </div>
      </div>
    `
  },

  // Slide 2
  {
    slideNumber: 2,
    title: "Problem Statement",
    subtitle: "Why Students Miss Financial Assistance",
    category: "Section 2 • Problem Statement",
    contentHtml: `
      <div>
        <span class="slide-number-pill mb-3">Slide 02 / 10 • Problem Statement</span>
        <h2 class="fw-bold text-dark mt-2 mb-3">The Core Challenge</h2>
        <p class="lead text-muted mb-4">
          Thousands of scholarships worth crores remain unclaimed every year, while millions of deserving students abandon higher education due to financial hardship.
        </p>
        <div class="row g-3">
          <div class="col-md-6">
            <div class="p-3 rounded-4 bg-light border h-100">
              <h5 class="fw-bold text-danger mb-2"><i class="fa-solid fa-triangle-exclamation me-2"></i>Scattered Information</h5>
              <p class="text-muted mb-0" style="font-size: 0.9rem;">
                Opportunities are fragmented across hundreds of central government ministries, state departments, corporate CSR foundations, and universities with no unified portal.
              </p>
            </div>
          </div>
          <div class="col-md-6">
            <div class="p-3 rounded-4 bg-light border h-100">
              <h5 class="fw-bold text-danger mb-2"><i class="fa-solid fa-file-circle-question me-2"></i>Complex Eligibility Rules</h5>
              <p class="text-muted mb-0" style="font-size: 0.9rem;">
                Multi-layered requirements—family income limits, caste quotas, academic thresholds, gender conditions—are difficult to interpret and verify manually.
              </p>
            </div>
          </div>
        </div>
      </div>
    `
  },

  // Slide 3
  {
    slideNumber: 3,
    title: "Existing Problems",
    subtitle: "Key Pain Points Faced by Students",
    category: "Section 3 • Existing Gaps",
    contentHtml: `
      <div>
        <span class="slide-number-pill mb-3">Slide 03 / 10 • Existing Problems</span>
        <h2 class="fw-bold text-dark mt-2 mb-3">What Goes Wrong Today?</h2>
        <div class="row g-3 mt-2">
          <div class="col-md-4">
            <div class="p-3 rounded-3 bg-white border shadow-sm h-100">
              <div class="text-danger fw-bold mb-2"><i class="fa-solid fa-hourglass-end me-1"></i> Missed Deadlines</div>
              <p class="text-muted" style="font-size: 0.85rem;">Students learn about scholarship opportunities days after the application portal has officially closed.</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="p-3 rounded-3 bg-white border shadow-sm h-100">
              <div class="text-danger fw-bold mb-2"><i class="fa-solid fa-ban me-1"></i> Document Rejections</div>
              <p class="text-muted" style="font-size: 0.85rem;">Lack of clarity regarding valid income certificates, DigiLocker formats, or bonafide verifications leads to disqualification.</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="p-3 rounded-3 bg-white border shadow-sm h-100">
              <div class="text-danger fw-bold mb-2"><i class="fa-solid fa-eye-slash me-1"></i> Zero Application Visibility</div>
              <p class="text-muted" style="font-size: 0.85rem;">Students have no centralized dashboard to monitor submission status, nodal officer verification, or DBT disbursement.</p>
            </div>
          </div>
        </div>
      </div>
    `
  },

  // Slide 4
  {
    slideNumber: 4,
    title: "Proposed Solution",
    subtitle: "GrantGlide – ScholarQuest Platform Architecture",
    category: "Section 4 • Proposed Solution",
    contentHtml: `
      <div>
        <span class="slide-number-pill mb-3">Slide 04 / 10 • Proposed Solution</span>
        <h2 class="fw-bold text-dark mt-2 mb-3">Our Intelligent Solution</h2>
        <p class="lead text-muted mb-4">
          A centralized, student-first platform that automates scholarship discovery, transparently verifies eligibility criteria, and guides applicants to completion.
        </p>
        <div class="row g-3">
          <div class="col-md-3">
            <div class="p-3 rounded bg-primary-subtle text-primary border text-center h-100">
              <i class="fa-solid fa-address-card fa-2x mb-2"></i>
              <div class="fw-bold">1. Single Profile</div>
              <p class="text-muted mb-0" style="font-size: 0.78rem;">Academic marks, category, income & location stored once.</p>
            </div>
          </div>
          <div class="col-md-3">
            <div class="p-3 rounded bg-success-subtle text-success border text-center h-100">
              <i class="fa-solid fa-bullseye fa-2x mb-2"></i>
              <div class="fw-bold">2. Rule Evaluator</div>
              <p class="text-muted mb-0" style="font-size: 0.78rem;">Instant 100% or partial match diagnostic with breakdown.</p>
            </div>
          </div>
          <div class="col-md-3">
            <div class="p-3 rounded bg-warning-subtle text-warning border text-center h-100">
              <i class="fa-solid fa-list-check fa-2x mb-2"></i>
              <div class="fw-bold">3. Unified Docs</div>
              <p class="text-muted mb-0" style="font-size: 0.78rem;">Actionable checklists with authority issuance guides.</p>
            </div>
          </div>
          <div class="col-md-3">
            <div class="p-3 rounded bg-info-subtle text-info border text-center h-100">
              <i class="fa-solid fa-calendar-check fa-2x mb-2"></i>
              <div class="fw-bold">4. Deadline Tracker</div>
              <p class="text-muted mb-0" style="font-size: 0.78rem;">Live countdown timers and visual calendar alerts.</p>
            </div>
          </div>
        </div>
      </div>
    `
  },

  // Slide 5
  {
    slideNumber: 5,
    title: "Key Features & Modules",
    subtitle: "8 Cohesive Functional Modules",
    category: "Section 5 • Key Features",
    contentHtml: `
      <div>
        <span class="slide-number-pill mb-3">Slide 05 / 10 • Key Features</span>
        <h2 class="fw-bold text-dark mt-2 mb-3">Comprehensive Module Architecture</h2>
        <div class="row g-2">
          <div class="col-md-6">
            <div class="p-2 px-3 rounded bg-light border d-flex align-items-center gap-2">
              <span class="badge bg-primary">Mod 1</span> <strong>Student Registration & Login:</strong> Auth & demo personas
            </div>
          </div>
          <div class="col-md-6">
            <div class="p-2 px-3 rounded bg-light border d-flex align-items-center gap-2">
              <span class="badge bg-primary">Mod 2</span> <strong>Profile Management:</strong> Marks, family income & categories
            </div>
          </div>
          <div class="col-md-6">
            <div class="p-2 px-3 rounded bg-primary-subtle text-primary border d-flex align-items-center gap-2">
              <span class="badge bg-primary">Mod 3</span> <strong>Scholarship Discovery:</strong> Multi-faceted search & catalog
            </div>
          </div>
          <div class="col-md-6">
            <div class="p-2 px-3 rounded bg-success-subtle text-success border d-flex align-items-center gap-2">
              <span class="badge bg-success">Mod 4</span> <strong>Smart Eligibility Checker:</strong> Diagnostic rule engine
            </div>
          </div>
          <div class="col-md-6">
            <div class="p-2 px-3 rounded bg-light border d-flex align-items-center gap-2">
              <span class="badge bg-primary">Mod 5</span> <strong>Application Guidance:</strong> 6-step walkthrough & portal links
            </div>
          </div>
          <div class="col-md-6">
            <div class="p-2 px-3 rounded bg-light border d-flex align-items-center gap-2">
              <span class="badge bg-primary">Mod 6</span> <strong>Document Management:</strong> Checklists, guides & rejection tips
            </div>
          </div>
          <div class="col-md-6">
            <div class="p-2 px-3 rounded bg-warning-subtle text-dark border d-flex align-items-center gap-2">
              <span class="badge bg-warning text-dark">Mod 7</span> <strong>Deadline & Notification:</strong> Urgency clocks & calendar
            </div>
          </div>
          <div class="col-md-6">
            <div class="p-2 px-3 rounded bg-danger-subtle text-danger border d-flex align-items-center gap-2">
              <span class="badge bg-danger">Mod 8</span> <strong>Admin Management:</strong> Add, edit, delete schemes & roster
            </div>
          </div>
        </div>
      </div>
    `
  },

  // Slide 6
  {
    slideNumber: 6,
    title: "Working Process",
    subtitle: "From Profile Setup to Scholarship Award",
    category: "Section 6 • Working Process",
    contentHtml: `
      <div>
        <span class="slide-number-pill mb-3">Slide 06 / 10 • Workflow</span>
        <h2 class="fw-bold text-dark mt-2 mb-3">The 6-Step Workflow</h2>
        <div class="row g-3 mt-2 text-center">
          <div class="col-md-2">
            <div class="p-3 rounded bg-light border h-100">
              <div class="h4 text-primary fw-bold">Step 1</div>
              <div class="fw-semibold" style="font-size: 0.85rem;">Student Registration</div>
              <p class="text-muted" style="font-size: 0.75rem;">Account setup & academic details</p>
            </div>
          </div>
          <div class="col-md-2">
            <div class="p-3 rounded bg-light border h-100">
              <div class="h4 text-primary fw-bold">Step 2</div>
              <div class="fw-semibold" style="font-size: 0.85rem;">Profile Analysis</div>
              <p class="text-muted" style="font-size: 0.75rem;">Marks, income & social quotas</p>
            </div>
          </div>
          <div class="col-md-2">
            <div class="p-3 rounded bg-light border h-100">
              <div class="h4 text-primary fw-bold">Step 3</div>
              <div class="fw-semibold" style="font-size: 0.85rem;">Smart Matching</div>
              <p class="text-muted" style="font-size: 0.75rem;">Rule engine evaluates schemes</p>
            </div>
          </div>
          <div class="col-md-2">
            <div class="p-3 rounded bg-light border h-100">
              <div class="h4 text-primary fw-bold">Step 4</div>
              <div class="fw-semibold" style="font-size: 0.85rem;">View Diagnostics</div>
              <p class="text-muted" style="font-size: 0.75rem;">See met vs unmet conditions</p>
            </div>
          </div>
          <div class="col-md-2">
            <div class="p-3 rounded bg-light border h-100">
              <div class="h4 text-primary fw-bold">Step 5</div>
              <div class="fw-semibold" style="font-size: 0.85rem;">Apply on Portal</div>
              <p class="text-muted" style="font-size: 0.75rem;">Official NSP / CSR portals</p>
            </div>
          </div>
          <div class="col-md-2">
            <div class="p-3 rounded bg-success-subtle text-success border h-100">
              <div class="h4 text-success fw-bold">Step 6</div>
              <div class="fw-semibold" style="font-size: 0.85rem;">Track to Award</div>
              <p class="text-muted" style="font-size: 0.75rem;">Monitor approval & DBT</p>
            </div>
          </div>
        </div>
      </div>
    `
  },

  // Slide 7
  {
    slideNumber: 7,
    title: "Technologies Used",
    subtitle: "Modern, Scalable Full-Stack Architecture",
    category: "Section 7 • Technologies",
    contentHtml: `
      <div>
        <span class="slide-number-pill mb-3">Slide 07 / 10 • Technology Stack</span>
        <h2 class="fw-bold text-dark mt-2 mb-3">Technology Framework</h2>
        <div class="row g-3">
          <div class="col-md-3">
            <div class="p-3 rounded-4 bg-light border h-100">
              <div class="text-primary fw-bold mb-2"><i class="fa-solid fa-code"></i> Frontend</div>
              <ul class="text-muted ps-3 mb-0" style="font-size: 0.85rem;">
                <li>HTML5 & Modern Semantic Web</li>
                <li>CSS3 & Responsive Design</li>
                <li>Bootstrap 5.3 Framework</li>
                <li>Vanilla JS (Zero bundle overhead)</li>
              </ul>
            </div>
          </div>
          <div class="col-md-3">
            <div class="p-3 rounded-4 bg-light border h-100">
              <div class="text-primary fw-bold mb-2"><i class="fa-solid fa-server"></i> Backend Runtime</div>
              <ul class="text-muted ps-3 mb-0" style="font-size: 0.85rem;">
                <li>Node.js Native REST Engine</li>
                <li>Python Flask (Alternative Backend)</li>
                <li>Zero external npm dependency lock</li>
                <li>High throughput & low latency</li>
              </ul>
            </div>
          </div>
          <div class="col-md-3">
            <div class="p-3 rounded-4 bg-light border h-100">
              <div class="text-primary fw-bold mb-2"><i class="fa-solid fa-database"></i> Database</div>
              <ul class="text-muted ps-3 mb-0" style="font-size: 0.85rem;">
                <li>JSON Multi-Entity Store</li>
                <li>MySQL / SQLite Schema ready</li>
                <li>ACID compliant file persistence</li>
                <li>Indexed search queries</li>
              </ul>
            </div>
          </div>
          <div class="col-md-3">
            <div class="p-3 rounded-4 bg-light border h-100">
              <div class="text-primary fw-bold mb-2"><i class="fa-solid fa-gears"></i> Developer Experience</div>
              <ul class="text-muted ps-3 mb-0" style="font-size: 0.85rem;">
                <li>VS Code & Antigravity IDE</li>
                <li>RESTful API Endpoints</li>
                <li>Git Version Control</li>
                <li>Cross-platform Windows/Mac/Linux</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    `
  },

  // Slide 8
  {
    slideNumber: 8,
    title: "Innovation and Uniqueness",
    subtitle: "What Makes GrantGlide Stand Out?",
    category: "Section 8 • Innovation",
    contentHtml: `
      <div>
        <span class="slide-number-pill mb-3">Slide 08 / 10 • Innovation & Uniqueness</span>
        <h2 class="fw-bold text-dark mt-2 mb-3">Our Competitive Edge</h2>
        <div class="row g-3">
          <div class="col-md-6">
            <div class="p-3 rounded bg-light border">
              <h5 class="fw-bold text-primary mb-1"><i class="fa-solid fa-microchip me-2"></i>Transparent Diagnostic Engine</h5>
              <p class="text-muted mb-0" style="font-size: 0.85rem;">Unlike black-box portals, GrantGlide shows the exact reason why a student does or does not meet criteria (income ceiling, percentage, category).</p>
            </div>
          </div>
          <div class="col-md-6">
            <div class="p-3 rounded bg-light border">
              <h5 class="fw-bold text-primary mb-1"><i class="fa-solid fa-stopwatch me-2"></i>Urgency-Aware Deadline Alerts</h5>
              <p class="text-muted mb-0" style="font-size: 0.85rem;">Dynamic countdown timers, color-coded urgency badges (< 7 days, < 21 days), and visual month calendar avoid last-minute rush.</p>
            </div>
          </div>
          <div class="col-md-6">
            <div class="p-3 rounded bg-light border">
              <h5 class="fw-bold text-primary mb-1"><i class="fa-solid fa-shield-check me-2"></i>Anti-Rejection Document Guidance</h5>
              <p class="text-muted mb-0" style="font-size: 0.85rem;">Step-by-step instructions on issuing authorities (Tehsildar, SDM) and the top rejection traps to watch out for.</p>
            </div>
          </div>
          <div class="col-md-6">
            <div class="p-3 rounded bg-light border">
              <h5 class="fw-bold text-primary mb-1"><i class="fa-solid fa-kanban me-2"></i>Built-in Application Kanban</h5>
              <p class="text-muted mb-0" style="font-size: 0.85rem;">Interactive 5-stage tracking pipeline from Saved to Submitted to Awarded with application reference ID management.</p>
            </div>
          </div>
        </div>
      </div>
    `
  },

  // Slide 9
  {
    slideNumber: 9,
    title: "Expected Outcomes",
    subtitle: "Measurable Impact for Students and Institutions",
    category: "Section 9 • Expected Outcomes",
    contentHtml: `
      <div>
        <span class="slide-number-pill mb-3">Slide 09 / 10 • Expected Outcomes</span>
        <h2 class="fw-bold text-dark mt-2 mb-3">Transformative Impact</h2>
        <div class="row g-3 text-center">
          <div class="col-md-4">
            <div class="p-4 rounded-4 bg-success-subtle border border-success h-100">
              <div class="display-6 fw-bold text-success mb-1">85%</div>
              <div class="fw-bold text-dark">Time Saved</div>
              <p class="text-muted mb-0" style="font-size: 0.85rem;">Search and verification time reduced from days of scattered research to 2 minutes.</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="p-4 rounded-4 bg-primary-subtle border border-primary h-100">
              <div class="display-6 fw-bold text-primary mb-1">0%</div>
              <div class="fw-bold text-dark">Missed Deadlines</div>
              <p class="text-muted mb-0" style="font-size: 0.85rem;">Automated countdown alerts and calendar reminders keep students proactive.</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="p-4 rounded-4 bg-warning-subtle border border-warning h-100">
              <div class="display-6 fw-bold text-dark mb-1">3x</div>
              <div class="fw-bold text-dark">Discovery Multiplier</div>
              <p class="text-muted mb-0" style="font-size: 0.85rem;">Underprivileged, rural, and first-generation learners uncover high-value CSR and state grants.</p>
            </div>
          </div>
        </div>
      </div>
    `
  },

  // Slide 10
  {
    slideNumber: 10,
    title: "Conclusion & Future Scope",
    subtitle: "Roadmap to Scale GrantGlide",
    category: "Section 10 • Conclusion",
    contentHtml: `
      <div>
        <span class="slide-number-pill mb-3">Slide 10 / 10 • Conclusion & Future Scope</span>
        <h2 class="fw-bold text-dark mt-2 mb-3">Summary & Roadmap</h2>
        <p class="lead text-muted mb-4">
          GrantGlide – ScholarQuest successfully bridges the gap between educational aspirations and financial opportunity through intelligent design and transparency.
        </p>
        <div class="row g-3">
          <div class="col-md-6">
            <div class="p-3 rounded bg-light border h-100">
              <h5 class="fw-bold text-primary mb-2"><i class="fa-solid fa-flag-checkered me-2"></i>Prototype Accomplished Today</h5>
              <ul class="text-muted ps-3 mb-0" style="font-size: 0.85rem; line-height: 1.8;">
                <li>8 fully functional modules operational</li>
                <li>Smart rule-based eligibility comparison engine</li>
                <li>Curated database of national and corporate scholarships</li>
                <li>Interactive deadline calendar and application Kanban</li>
              </ul>
            </div>
          </div>
          <div class="col-md-6">
            <div class="p-3 rounded bg-light border h-100">
              <h5 class="fw-bold text-primary mb-2"><i class="fa-solid fa-rocket me-2"></i>Future Enhancements</h5>
              <ul class="text-muted ps-3 mb-0" style="font-size: 0.85rem; line-height: 1.8;">
                <li>AI LLM Scholarship Assistant & Chatbot</li>
                <li>Multilingual UI in 10+ Indian Regional Languages</li>
                <li>Direct DigiLocker & NSP API Integration for 1-click verification</li>
                <li>Android & iOS Mobile Application with push notifications</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    `
  }
];

let currentSlideIndex = 0;
let presentationModalInstance = null;

function openPresentationModal() {
  const modalEl = document.getElementById('presentationModal');
  if (!modalEl) return;
  if (!presentationModalInstance) {
    presentationModalInstance = new bootstrap.Modal(modalEl);
  }
  renderSlide(currentSlideIndex);
  presentationModalInstance.show();
}

function renderSlide(index) {
  if (index < 0) index = 0;
  if (index >= presentationSlides.length) index = presentationSlides.length - 1;
  currentSlideIndex = index;

  const slide = presentationSlides[index];
  const container = document.getElementById('current-slide-content');
  const counterHeader = document.getElementById('slide-counter-header');
  const dotsContainer = document.getElementById('slide-dots-container');
  const prevBtn = document.getElementById('prev-slide-btn');
  const nextBtn = document.getElementById('next-slide-btn');

  if (container) {
    container.innerHTML = slide.contentHtml;
  }
  if (counterHeader) {
    counterHeader.textContent = `Slide ${index + 1} / ${presentationSlides.length}`;
  }

  // Dots
  if (dotsContainer) {
    dotsContainer.innerHTML = presentationSlides.map((s, idx) => `
      <button class="btn btn-sm rounded-circle p-0" style="width: 10px; height: 10px; background-color: ${idx === index ? 'var(--primary)' : '#cbd5e1'}; border: none;" onclick="renderSlide(${idx})" title="Slide ${idx + 1}"></button>
    `).join('');
  }

  if (prevBtn) prevBtn.disabled = index === 0;
  if (nextBtn) {
    if (index === presentationSlides.length - 1) {
      nextBtn.innerHTML = 'Finish <i class="fa-solid fa-check ms-1"></i>';
    } else {
      nextBtn.innerHTML = 'Next <i class="fa-solid fa-arrow-right ms-2"></i>';
    }
  }
}

function nextSlide() {
  if (currentSlideIndex < presentationSlides.length - 1) {
    renderSlide(currentSlideIndex + 1);
  } else {
    if (presentationModalInstance) presentationModalInstance.hide();
  }
}

function prevSlide() {
  if (currentSlideIndex > 0) {
    renderSlide(currentSlideIndex - 1);
  }
}

// Global Keyboard Navigation for Hackathon Pitch Presentation
document.addEventListener('keydown', (e) => {
  const modalEl = document.getElementById('presentationModal');
  if (modalEl && modalEl.classList.contains('show')) {
    if (e.key === 'ArrowRight' || e.key === 'Space') {
      e.preventDefault();
      nextSlide();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevSlide();
    }
  }
});

