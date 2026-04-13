/**
 * Multi-step Cash Offer Form for washingtonhomes4cash.com
 * Renders inside #offer-form-container, results in #offer-results-container
 * Pure vanilla JavaScript — no frameworks.
 */

/* ── Configuration ───────────────────────────────────────────────── */

const CONFIG = {
  apiUrl: 'https://www.setmate.ai/api/public/cash-offer',
  apiKey: 'co_eff8fa1a866766449a6d81c7f5f672e8',
  domain: 'washingtonhomes4cash.com',
  phone: '(425) 286-5639',
  googlePlacesApiKey: 'AIzaSyDyJAA7J5lQxnzW-RO_beCUQlT2roApS1A',
};

/* ── State ───────────────────────────────────────────────────────── */

const formData = {
  address: '',
  propertyType: '',
  beds: null,
  baths: null,
  sqft: null,
  yearBuilt: null,
  lotSqft: null,
  condition: '',
  issues: [],
  notes: '',
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  timeline: '',
  reasonForSelling: '',
};

let currentStep = 1;
const totalSteps = 4;
let autocomplete = null;

/* ── Helpers ─────────────────────────────────────────────────────── */

function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0;
    var v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const visitorId = generateUUID();

function getUtmParams() {
  var params = new URLSearchParams(window.location.search);
  return {
    source: params.get('utm_source') || '',
    medium: params.get('utm_medium') || '',
    campaign: params.get('utm_campaign') || '',
  };
}

function formatPhone(value) {
  var digits = value.replace(/\D/g, '').substring(0, 10);
  if (digits.length === 0) return '';
  if (digits.length <= 3) return '(' + digits;
  if (digits.length <= 6) return '(' + digits.substring(0, 3) + ') ' + digits.substring(3);
  return '(' + digits.substring(0, 3) + ') ' + digits.substring(3, 6) + '-' + digits.substring(6);
}

function unformatPhone(value) {
  return value.replace(/\D/g, '');
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function formatCurrency(num) {
  if (num == null) return '$0';
  return '$' + Number(num).toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  var d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/* ── DOM helpers ─────────────────────────────────────────────────── */

function el(tag, attrs, children) {
  var node = document.createElement(tag);
  if (attrs) {
    Object.keys(attrs).forEach(function (key) {
      if (key === 'className') {
        node.className = attrs[key];
      } else if (key === 'innerHTML') {
        node.innerHTML = attrs[key];
      } else if (key.indexOf('on') === 0) {
        node.addEventListener(key.substring(2).toLowerCase(), attrs[key]);
      } else {
        node.setAttribute(key, attrs[key]);
      }
    });
  }
  if (children) {
    if (typeof children === 'string') {
      node.appendChild(document.createTextNode(children));
    } else if (Array.isArray(children)) {
      children.forEach(function (child) {
        if (!child) return;
        if (typeof child === 'string') {
          node.appendChild(document.createTextNode(child));
        } else {
          node.appendChild(child);
        }
      });
    } else {
      node.appendChild(children);
    }
  }
  return node;
}

function clearContainer(id) {
  var c = document.getElementById(id);
  if (c) c.innerHTML = '';
  return c;
}

/* ── Progress Bar ────────────────────────────────────────────────── */

function renderProgress(step) {
  var wrap = el('div', { className: 'progress-steps' });
  for (var i = 1; i <= totalSteps; i++) {
    var cls = 'progress-step';
    if (i < step) cls += ' completed';
    if (i === step) cls += ' active';
    var dot = el('div', { className: cls }, [
      el('span', { className: 'progress-step-number' }, String(i)),
    ]);
    wrap.appendChild(dot);
    if (i < totalSteps) {
      var line = el('div', { className: 'progress-line' + (i < step ? ' completed' : '') });
      wrap.appendChild(line);
    }
  }
  var label = el('p', { className: 'progress-label' }, 'Step ' + step + ' of ' + totalSteps);
  var outer = el('div', { className: 'progress-wrapper' }, [wrap, label]);
  return outer;
}

/* ── Transitions ─────────────────────────────────────────────────── */

function transitionTo(container, renderFn) {
  container.style.opacity = '0';
  container.style.transition = 'opacity 0.25s ease';
  setTimeout(function () {
    container.innerHTML = '';
    renderFn(container);
    container.style.opacity = '1';
  }, 250);
}

/* ── Button Group helper ─────────────────────────────────────────── */

function renderButtonGroup(options, selectedValue, onSelect) {
  var group = el('div', { className: 'button-group' });
  options.forEach(function (opt) {
    var val = typeof opt === 'object' ? opt.value : opt;
    var label = typeof opt === 'object' ? opt.label : String(opt);
    var cls = 'btn-option' + (String(selectedValue) === String(val) ? ' selected' : '');
    var btn = el('button', {
      type: 'button',
      className: cls,
      onClick: function () {
        group.querySelectorAll('.btn-option').forEach(function (b) {
          b.classList.remove('selected');
        });
        btn.classList.add('selected');
        onSelect(val);
      },
    }, label);
    group.appendChild(btn);
  });
  return group;
}

/* ================================================================ */
/*  STEP 1 — Property Address                                       */
/* ================================================================ */

function renderStep1(container) {
  currentStep = 1;

  var section = el('div', { className: 'form-section fade-in' });
  section.appendChild(renderProgress(1));
  section.appendChild(el('h2', null, 'Where is your property?'));

  var input = el('input', {
    type: 'text',
    id: 'address-input',
    className: 'form-input form-input-lg',
    placeholder: 'Enter your property address',
    value: formData.address,
  });

  section.appendChild(el('div', { className: 'form-group' }, [
    el('label', { for: 'address-input', className: 'form-label' }, 'Property Address'),
    input,
  ]));

  var errMsg = el('p', { className: 'form-error', id: 'step1-error' });
  section.appendChild(errMsg);

  var submitBtn = el('button', {
    type: 'button',
    className: 'cta-button cta-button-lg',
    onClick: function () {
      var val = input.value.trim();
      if (!val) {
        errMsg.textContent = 'Please enter your property address.';
        return;
      }
      formData.address = val;
      transitionTo(container, renderStep2);
    },
  }, 'Get My Cash Offer');

  section.appendChild(submitBtn);
  container.appendChild(section);

  // Initialise Google Places autocomplete after DOM insertion
  setTimeout(function () {
    initAutocomplete(input);
  }, 0);
}

function initAutocomplete(inputEl) {
  // Guard: don't attach twice (e.g. on step re-render)
  if (inputEl.dataset.autocompleteAttached) return;
  inputEl.dataset.autocompleteAttached = 'true';

  // PlaceAutocompleteElement is the current API (Autocomplete deprecated for new keys post-March 2025)
  if (typeof google !== 'undefined' && google.maps && google.maps.places &&
      typeof google.maps.places.PlaceAutocompleteElement !== 'undefined') {
    try {
      // Wrap the original input in a container for the new element
      var wrapper = inputEl.parentNode;
      // Hide original input and insert the new element in its place
      var pac = new google.maps.places.PlaceAutocompleteElement({
        componentRestrictions: { country: 'us' },
        types: ['address'],
      });
      // Style it to match
      pac.style.width = '100%';
      pac.style.display = 'block';
      pac.setAttribute('placeholder', 'Enter your property address');
      pac.className = inputEl.className;
      inputEl.style.display = 'none';
      wrapper.insertBefore(pac, inputEl);
      pac.addEventListener('gmp-placeselect', function (e) {
        var addr = e.place && e.place.formattedAddress ? e.place.formattedAddress :
                   (pac.value || '');
        inputEl.value = addr;
        formData.address = addr;
      });
      // Keep plain input in sync for manual/typed entries
      pac.addEventListener('input', function () {
        inputEl.value = pac.value || '';
        formData.address = inputEl.value;
      });
      return;
    } catch (e) {
      console.warn('PlaceAutocompleteElement failed, falling back:', e);
      inputEl.style.display = '';
    }
  }

  // Fallback: legacy Autocomplete (works for keys created before March 2025)
  if (typeof google !== 'undefined' && google.maps && google.maps.places &&
      typeof google.maps.places.Autocomplete !== 'undefined') {
    try {
      var ac = new google.maps.places.Autocomplete(inputEl, {
        types: ['address'],
        componentRestrictions: { country: 'us' },
      });
      ac.addListener('place_changed', function () {
        var place = ac.getPlace();
        if (place && place.formatted_address) {
          inputEl.value = place.formatted_address;
          formData.address = place.formatted_address;
        }
      });
    } catch (e) {
      console.warn('Autocomplete fallback failed:', e);
    }
  }
  // If neither API works, field remains a plain text input — form still functions
}

/* ================================================================ */
/*  STEP 2 — Property Details                                       */
/* ================================================================ */

function renderStep2(container) {
  currentStep = 2;

  var section = el('div', { className: 'form-section fade-in' });
  section.appendChild(renderProgress(2));
  section.appendChild(el('h2', null, 'Tell us about your property'));

  // Property type — radio buttons
  var types = [
    { value: 'single_family', label: 'Single Family' },
    { value: 'duplex_triplex', label: 'Duplex / Triplex' },
    { value: 'condo_townhouse', label: 'Condo / Townhouse' },
    { value: 'mobile_home', label: 'Mobile Home' },
    { value: 'other', label: 'Other' },
  ];

  var typeGroup = el('div', { className: 'form-group' });
  typeGroup.appendChild(el('label', { className: 'form-label' }, 'Property Type'));
  var typeRadios = el('div', { className: 'radio-group' });
  types.forEach(function (t) {
    var id = 'ptype-' + t.value;
    var radio = el('input', { type: 'radio', name: 'propertyType', id: id, value: t.value });
    if (formData.propertyType === t.value) radio.checked = true;
    radio.addEventListener('change', function () {
      formData.propertyType = t.value;
    });
    var lbl = el('label', { for: id, className: 'radio-label' }, [radio, el('span', null, ' ' + t.label)]);
    typeRadios.appendChild(lbl);
  });
  typeGroup.appendChild(typeRadios);
  section.appendChild(typeGroup);

  // Bedrooms
  section.appendChild(el('div', { className: 'form-group' }, [
    el('label', { className: 'form-label' }, 'Bedrooms'),
    renderButtonGroup(
      [1, 2, 3, 4, 5, { value: '6+', label: '6+' }],
      formData.beds,
      function (v) { formData.beds = v; }
    ),
  ]));

  // Bathrooms
  section.appendChild(el('div', { className: 'form-group' }, [
    el('label', { className: 'form-label' }, 'Bathrooms'),
    renderButtonGroup(
      [1, 1.5, 2, 2.5, 3, 3.5, { value: '4+', label: '4+' }],
      formData.baths,
      function (v) { formData.baths = v; }
    ),
  ]));

  // Sqft with presets
  var sqftInput = el('input', {
    type: 'number',
    id: 'sqft-input',
    className: 'form-input',
    placeholder: 'e.g. 1500',
    value: formData.sqft || '',
    min: '100',
    max: '50000',
  });
  sqftInput.addEventListener('input', function () {
    formData.sqft = sqftInput.value ? Number(sqftInput.value) : null;
    // deselect presets
    sqftPresets.querySelectorAll('.btn-option').forEach(function (b) { b.classList.remove('selected'); });
  });
  var sqftPresets = renderButtonGroup(
    [800, 1200, 1500, 2000, 2500, { value: 3000, label: '3000+' }],
    formData.sqft,
    function (v) {
      formData.sqft = Number(v);
      sqftInput.value = v;
    }
  );

  section.appendChild(el('div', { className: 'form-group' }, [
    el('label', { for: 'sqft-input', className: 'form-label' }, 'Approximate Square Feet'),
    sqftPresets,
    sqftInput,
  ]));

  // Year built (optional)
  var yrInput = el('input', {
    type: 'number',
    id: 'year-built',
    className: 'form-input',
    placeholder: 'e.g. 1985',
    value: formData.yearBuilt || '',
    min: '1800',
    max: '2030',
  });
  yrInput.addEventListener('input', function () {
    formData.yearBuilt = yrInput.value ? Number(yrInput.value) : null;
  });
  section.appendChild(el('div', { className: 'form-group' }, [
    el('label', { for: 'year-built', className: 'form-label' }, 'Year Built (optional)'),
    yrInput,
  ]));

  // Lot size (optional)
  var lotInput = el('input', {
    type: 'number',
    id: 'lot-sqft',
    className: 'form-input',
    placeholder: 'e.g. 6000',
    value: formData.lotSqft || '',
    min: '0',
  });
  lotInput.addEventListener('input', function () {
    formData.lotSqft = lotInput.value ? Number(lotInput.value) : null;
  });
  section.appendChild(el('div', { className: 'form-group' }, [
    el('label', { for: 'lot-sqft', className: 'form-label' }, 'Lot Size in Sqft (optional)'),
    lotInput,
  ]));

  // Error
  var errMsg = el('p', { className: 'form-error', id: 'step2-error' });
  section.appendChild(errMsg);

  // Nav
  section.appendChild(renderNav(
    function () { transitionTo(container, renderStep1); },
    function () {
      if (!formData.propertyType) { errMsg.textContent = 'Please select a property type.'; return; }
      if (!formData.beds) { errMsg.textContent = 'Please select bedrooms.'; return; }
      if (!formData.baths) { errMsg.textContent = 'Please select bathrooms.'; return; }
      if (!formData.sqft) { errMsg.textContent = 'Please enter approximate square footage.'; return; }
      transitionTo(container, renderStep3);
    }
  ));

  container.appendChild(section);
}

/* ================================================================ */
/*  STEP 3 — Property Condition                                     */
/* ================================================================ */

var conditionOptions = [
  { value: 'excellent', label: 'Excellent', desc: 'Move-in ready, recently updated', icon: '&#10024;' },
  { value: 'good', label: 'Good', desc: 'Needs minor cosmetic work', icon: '&#128396;' },
  { value: 'fair', label: 'Fair', desc: 'Needs moderate repairs', icon: '&#128295;' },
  { value: 'poor', label: 'Poor', desc: 'Needs major renovation', icon: '&#127959;' },
];

var issuesList = [
  { value: 'roof', label: 'Roof problems' },
  { value: 'foundation', label: 'Foundation issues' },
  { value: 'plumbing', label: 'Plumbing problems' },
  { value: 'electrical', label: 'Electrical issues' },
  { value: 'mold', label: 'Mold / mildew' },
  { value: 'fire_damage', label: 'Fire damage' },
  { value: 'water_damage', label: 'Water damage' },
  { value: 'structural', label: 'Structural problems' },
  { value: 'tenant', label: 'Tenant issues' },
  { value: 'code_violations', label: 'Code violations' },
];

function renderStep3(container) {
  currentStep = 3;

  var section = el('div', { className: 'form-section fade-in' });
  section.appendChild(renderProgress(3));
  section.appendChild(el('h2', null, 'What condition is your property in?'));

  // Condition cards
  var cardsWrap = el('div', { className: 'condition-cards' });
  conditionOptions.forEach(function (opt) {
    var cls = 'condition-card' + (formData.condition === opt.value ? ' selected' : '');
    var card = el('div', { className: cls });
    card.innerHTML =
      '<div class="condition-icon">' + opt.icon + '</div>' +
      '<div class="condition-label">' + opt.label + '</div>' +
      '<div class="condition-desc">' + opt.desc + '</div>';
    card.addEventListener('click', function () {
      cardsWrap.querySelectorAll('.condition-card').forEach(function (c) { c.classList.remove('selected'); });
      card.classList.add('selected');
      formData.condition = opt.value;
    });
    cardsWrap.appendChild(card);
  });
  section.appendChild(el('div', { className: 'form-group' }, [
    el('label', { className: 'form-label' }, 'Overall Condition'),
    cardsWrap,
  ]));

  // Issues checklist
  var issuesWrap = el('div', { className: 'checkbox-group' });
  issuesList.forEach(function (issue) {
    var id = 'issue-' + issue.value;
    var cb = el('input', { type: 'checkbox', id: id, value: issue.value });
    if (formData.issues.indexOf(issue.value) !== -1) cb.checked = true;
    cb.addEventListener('change', function () {
      if (cb.checked) {
        if (formData.issues.indexOf(issue.value) === -1) formData.issues.push(issue.value);
      } else {
        formData.issues = formData.issues.filter(function (v) { return v !== issue.value; });
      }
    });
    var lbl = el('label', { for: id, className: 'checkbox-label' }, [cb, el('span', null, ' ' + issue.label)]);
    issuesWrap.appendChild(lbl);
  });
  section.appendChild(el('div', { className: 'form-group' }, [
    el('label', { className: 'form-label' }, 'Known Issues (select all that apply)'),
    issuesWrap,
  ]));

  // Notes textarea
  var notes = el('textarea', {
    id: 'notes',
    className: 'form-input form-textarea',
    placeholder: 'Anything else we should know about the property?',
    rows: '3',
  });
  notes.value = formData.notes;
  notes.addEventListener('input', function () { formData.notes = notes.value; });
  section.appendChild(el('div', { className: 'form-group' }, [
    el('label', { for: 'notes', className: 'form-label' }, 'Additional Notes (optional)'),
    notes,
  ]));

  // Error
  var errMsg = el('p', { className: 'form-error', id: 'step3-error' });
  section.appendChild(errMsg);

  // Nav
  section.appendChild(renderNav(
    function () { transitionTo(container, renderStep2); },
    function () {
      if (!formData.condition) { errMsg.textContent = 'Please select a condition.'; return; }
      transitionTo(container, renderStep4);
    }
  ));

  container.appendChild(section);
}

/* ================================================================ */
/*  STEP 4 — Contact Info                                           */
/* ================================================================ */

function renderStep4(container) {
  currentStep = 4;

  var section = el('div', { className: 'form-section fade-in' });
  section.appendChild(renderProgress(4));
  section.appendChild(el('h2', null, 'Almost there! Where should we send your offer?'));

  // First name
  var firstName = el('input', {
    type: 'text',
    id: 'first-name',
    className: 'form-input',
    placeholder: 'First Name',
    value: formData.firstName,
    required: 'required',
  });
  firstName.addEventListener('input', function () { formData.firstName = firstName.value; });
  section.appendChild(el('div', { className: 'form-group' }, [
    el('label', { for: 'first-name', className: 'form-label' }, 'First Name *'),
    firstName,
  ]));

  // Last name
  var lastName = el('input', {
    type: 'text',
    id: 'last-name',
    className: 'form-input',
    placeholder: 'Last Name',
    value: formData.lastName,
  });
  lastName.addEventListener('input', function () { formData.lastName = lastName.value; });
  section.appendChild(el('div', { className: 'form-group' }, [
    el('label', { for: 'last-name', className: 'form-label' }, 'Last Name'),
    lastName,
  ]));

  // Phone
  var phone = el('input', {
    type: 'tel',
    id: 'phone',
    className: 'form-input',
    placeholder: '(555) 123-4567',
    value: formData.phone ? formatPhone(formData.phone) : '',
    required: 'required',
  });
  phone.addEventListener('input', function () {
    var cursor = phone.selectionStart;
    var prevLen = phone.value.length;
    phone.value = formatPhone(phone.value);
    var newLen = phone.value.length;
    var newCursor = cursor + (newLen - prevLen);
    phone.setSelectionRange(newCursor, newCursor);
    formData.phone = unformatPhone(phone.value);
  });
  section.appendChild(el('div', { className: 'form-group' }, [
    el('label', { for: 'phone', className: 'form-label' }, 'Phone *'),
    phone,
  ]));

  // Email
  var email = el('input', {
    type: 'email',
    id: 'email',
    className: 'form-input',
    placeholder: 'you@example.com',
    value: formData.email,
    required: 'required',
  });
  email.addEventListener('input', function () { formData.email = email.value; });
  section.appendChild(el('div', { className: 'form-group' }, [
    el('label', { for: 'email', className: 'form-label' }, 'Email *'),
    email,
  ]));

  // Timeline
  var timeline = el('select', { id: 'timeline', className: 'form-input form-select' });
  [
    { value: '', label: 'How soon do you need to sell?' },
    { value: 'asap', label: 'ASAP' },
    { value: '1-3 months', label: '1-3 Months' },
    { value: '3-6 months', label: '3-6 Months' },
    { value: 'exploring', label: 'Just Exploring' },
  ].forEach(function (o) {
    var opt = el('option', { value: o.value }, o.label);
    if (formData.timeline === o.value) opt.selected = true;
    timeline.appendChild(opt);
  });
  timeline.addEventListener('change', function () { formData.timeline = timeline.value; });
  section.appendChild(el('div', { className: 'form-group' }, [
    el('label', { for: 'timeline', className: 'form-label' }, 'Timeline'),
    timeline,
  ]));

  // Reason for selling
  var reason = el('select', { id: 'reason', className: 'form-input form-select' });
  [
    { value: '', label: 'Why are you selling? (optional)' },
    { value: 'moving', label: 'Moving' },
    { value: 'divorce', label: 'Divorce' },
    { value: 'inherited', label: 'Inherited' },
    { value: 'foreclosure', label: 'Foreclosure' },
    { value: 'repairs', label: 'Repairs Too Expensive' },
    { value: 'downsizing', label: 'Downsizing' },
    { value: 'other', label: 'Other' },
    { value: 'prefer_not_to_say', label: 'Prefer Not to Say' },
  ].forEach(function (o) {
    var opt = el('option', { value: o.value }, o.label);
    if (formData.reasonForSelling === o.value) opt.selected = true;
    reason.appendChild(opt);
  });
  reason.addEventListener('change', function () { formData.reasonForSelling = reason.value; });
  section.appendChild(el('div', { className: 'form-group' }, [
    el('label', { for: 'reason', className: 'form-label' }, 'Reason for Selling'),
    reason,
  ]));

  // Consent checkbox
  var consent = el('input', { type: 'checkbox', id: 'consent' });
  section.appendChild(el('div', { className: 'form-group checkbox-single' }, [
    el('label', { for: 'consent', className: 'checkbox-label' }, [
      consent,
      el('span', null, ' I agree to receive communications about my offer'),
    ]),
  ]));

  // Error
  var errMsg = el('p', { className: 'form-error', id: 'step4-error' });
  section.appendChild(errMsg);

  // Submit button (instead of normal nav)
  var backBtn = el('button', {
    type: 'button',
    className: 'btn-back',
    onClick: function () { transitionTo(container, renderStep3); },
  }, 'Back');

  var submitBtn = el('button', {
    type: 'button',
    className: 'cta-button cta-button-lg cta-button-gold',
    onClick: function () {
      // Validate
      if (!formData.firstName.trim()) { errMsg.textContent = 'Please enter your first name.'; return; }
      if (!formData.phone || formData.phone.length < 10) { errMsg.textContent = 'Please enter a valid phone number.'; return; }
      if (!formData.email.trim() || !isValidEmail(formData.email)) { errMsg.textContent = 'Please enter a valid email address.'; return; }
      if (!consent.checked) { errMsg.textContent = 'Please agree to receive communications.'; return; }
      submitOffer(container);
    },
  }, 'Get My Cash Offer');

  var nav = el('div', { className: 'form-nav' }, [backBtn, submitBtn]);
  section.appendChild(nav);

  container.appendChild(section);
}

/* ── Navigation helper ───────────────────────────────────────────── */

function renderNav(onBack, onNext) {
  var children = [];
  if (onBack) {
    children.push(el('button', {
      type: 'button',
      className: 'btn-back',
      onClick: onBack,
    }, 'Back'));
  }
  if (onNext) {
    children.push(el('button', {
      type: 'button',
      className: 'cta-button',
      onClick: onNext,
    }, 'Next'));
  }
  return el('div', { className: 'form-nav' }, children);
}

/* ================================================================ */
/*  STEP 5 — Loading / Processing                                   */
/* ================================================================ */

function renderLoading(container) {
  container.innerHTML = '';

  var overlay = el('div', { className: 'loading-overlay' });

  var spinner = el('div', { className: 'loading-spinner' });
  overlay.appendChild(spinner);

  var statusText = el('p', { className: 'loading-status' }, 'Finding your property details...');
  overlay.appendChild(statusText);

  overlay.appendChild(el('p', { className: 'loading-note' }, 'This typically takes 15-30 seconds'));

  container.appendChild(overlay);

  var messages = [
    'Finding your property details...',
    'Searching for comparable sales in your area...',
    'Calculating renovation estimates...',
    'Computing your cash offer...',
    'Validating with our AI analyst...',
  ];
  var idx = 0;
  var interval = setInterval(function () {
    idx = (idx + 1) % messages.length;
    statusText.textContent = messages[idx];
  }, 3000);

  return function stopLoading() {
    clearInterval(interval);
  };
}

/* ================================================================ */
/*  API Submission                                                   */
/* ================================================================ */

function submitOffer(container) {
  var stopLoading = renderLoading(container);

  var payload = {
    address: formData.address,
    firstName: formData.firstName.trim(),
    lastName: formData.lastName.trim(),
    phone: formData.phone,
    email: formData.email.trim(),
    beds: parseNumeric(formData.beds),
    baths: parseNumeric(formData.baths),
    sqft: formData.sqft ? Number(formData.sqft) : null,
    yearBuilt: formData.yearBuilt ? Number(formData.yearBuilt) : null,
    propertyType: formData.propertyType,
    lotSqft: formData.lotSqft ? Number(formData.lotSqft) : null,
    condition: formData.condition,
    issues: formData.issues,
    timeline: formData.timeline,
    reasonForSelling: formData.reasonForSelling,
    notes: formData.notes,
    source: CONFIG.domain,
    tracking: {
      visitorId: visitorId,
      referrer: document.referrer || '',
      utm: getUtmParams(),
    },
  };

  fetch(CONFIG.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': CONFIG.apiKey,
    },
    body: JSON.stringify(payload),
  })
    .then(function (res) {
      if (!res.ok) {
        return res.json().then(function (body) {
          throw new Error(body.message || body.error || 'Request failed (' + res.status + ')');
        }).catch(function (e) {
          if (e.message) throw e;
          throw new Error('Request failed (' + res.status + ')');
        });
      }
      return res.json();
    })
    .then(function (data) {
      stopLoading();
      renderResults(data);
    })
    .catch(function (err) {
      stopLoading();
      renderError(container, err.message || 'Something went wrong. Please try again.');
    });
}

function parseNumeric(val) {
  if (val == null) return null;
  var str = String(val).replace('+', '');
  var num = parseFloat(str);
  return isNaN(num) ? val : num;
}

/* ── Error display ───────────────────────────────────────────────── */

function renderError(container, message) {
  container.innerHTML = '';

  var section = el('div', { className: 'form-section fade-in error-section' });
  section.appendChild(el('h2', null, 'Oops, something went wrong'));
  section.appendChild(el('p', { className: 'error-message' }, message));
  section.appendChild(el('p', null, [
    'Please try again or call us directly at ',
    el('a', { href: 'tel:' + CONFIG.phone.replace(/\D/g, '') }, CONFIG.phone),
    '.',
  ]));

  var retryBtn = el('button', {
    type: 'button',
    className: 'cta-button',
    onClick: function () { transitionTo(container, renderStep4); },
  }, 'Try Again');
  section.appendChild(retryBtn);

  container.appendChild(section);
}

/* ================================================================ */
/*  STEP 6 — Results                                                */
/* ================================================================ */

function renderResults(data) {
  var formContainer = document.getElementById('offer-form-container');
  if (formContainer) formContainer.style.display = 'none';

  var resultsContainer = clearContainer('offer-results-container');
  if (!resultsContainer) return;

  resultsContainer.style.opacity = '0';
  resultsContainer.style.transition = 'opacity 0.4s ease';

  var wrap = el('div', { className: 'offer-results fade-in' });

  // ── Offer Box ──
  var offer = data.offer || data;
  var offerAmount = offer.offerAmount || offer.cashOffer || offer.amount || 0;

  var offerBox = el('div', { className: 'offer-box' });
  offerBox.appendChild(el('h2', { className: 'offer-amount' }, 'Your Cash Offer: ' + formatCurrency(offerAmount)));
  offerBox.appendChild(el('p', { className: 'offer-terms' }, 'All Cash  |  Close in 7-30 Days  |  As-Is  |  No Fees'));
  wrap.appendChild(offerBox);

  // ── How We Got This Number ──
  var arv = offer.arv || offer.afterRepairValue || 0;
  var threshold = offer.threshold || (arv * 0.7);
  var rehabCost = offer.rehabCost || offer.estimatedRehab || 0;

  var breakdownSection = el('div', { className: 'results-section' });
  breakdownSection.appendChild(el('h3', null, 'How We Got This Number'));

  var table = el('table', { className: 'breakdown-table' });
  var tbody = el('tbody');
  [
    ['After Repair Value (ARV)', formatCurrency(arv), 'Based on comparable sales'],
    ['Our Buying Threshold (70%)', formatCurrency(threshold), ''],
    ['Estimated Rehab Cost', '-' + formatCurrency(rehabCost), ''],
    ['Your Cash Offer', formatCurrency(offerAmount), ''],
  ].forEach(function (row, i) {
    var tr = el('tr', i === 3 ? { className: 'total-row' } : null, [
      el('td', null, row[0]),
      el('td', { className: 'amount' }, row[1]),
      el('td', { className: 'note' }, row[2]),
    ]);
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  breakdownSection.appendChild(table);
  wrap.appendChild(breakdownSection);

  // ── Comparable Sales ──
  var comps = offer.comps || offer.comparables || [];
  if (comps.length > 0) {
    var compsSection = el('div', { className: 'results-section' });
    compsSection.appendChild(el('h3', null, 'Comparable Sales'));

    var compsGrid = el('div', { className: 'comps-grid' });
    comps.slice(0, 3).forEach(function (comp) {
      var card = el('div', { className: 'comp-card' });
      card.appendChild(el('p', { className: 'comp-address' }, comp.address || 'N/A'));
      card.appendChild(el('p', { className: 'comp-price' }, formatCurrency(comp.soldPrice || comp.price)));
      var details = [
        'Sold: ' + formatDate(comp.soldDate || comp.date),
        (comp.beds || '-') + ' bd / ' + (comp.baths || '-') + ' ba',
        (comp.sqft ? comp.sqft.toLocaleString() + ' sqft' : ''),
        (comp.pricePerSqft ? formatCurrency(comp.pricePerSqft) + '/sqft' : ''),
      ].filter(Boolean).join('  |  ');
      card.appendChild(el('p', { className: 'comp-details' }, details));
      if (comp.condition) {
        card.appendChild(el('p', { className: 'comp-condition' }, 'Condition: ' + comp.condition));
      }
      compsGrid.appendChild(card);
    });
    compsSection.appendChild(compsGrid);
    compsSection.appendChild(el('p', { className: 'results-note' }, 'You can verify these sales on Zillow or Redfin.'));
    wrap.appendChild(compsSection);
  }

  // ── Rehab Breakdown ──
  var rehab = offer.rehabBreakdown || offer.rehab || null;
  if (rehab) {
    var rehabSection = el('div', { className: 'results-section' });
    rehabSection.appendChild(el('h3', null, 'Rehab Breakdown'));

    var rTable = el('table', { className: 'breakdown-table' });
    var rTbody = el('tbody');
    var level = rehab.level || formData.condition || 'N/A';
    var ratePerSqft = rehab.ratePerSqft || rehab.rate || 0;
    var totalCost = rehab.totalCost || rehab.total || rehabCost;
    var desc = rehab.description || '';

    [
      ['Rehab Level', level.charAt(0).toUpperCase() + level.slice(1)],
      ['Rate per Sqft', formatCurrency(ratePerSqft)],
      ['Total Rehab Cost', formatCurrency(totalCost)],
    ].forEach(function (row) {
      rTbody.appendChild(el('tr', null, [
        el('td', null, row[0]),
        el('td', { className: 'amount' }, row[1]),
      ]));
    });
    rTable.appendChild(rTbody);
    rehabSection.appendChild(rTable);
    if (desc) {
      rehabSection.appendChild(el('p', { className: 'results-note' }, desc));
    }
    wrap.appendChild(rehabSection);
  }

  // ── Alternative Options ──
  var altSection = el('div', { className: 'results-section' });
  altSection.appendChild(el('h3', null, 'Alternative Options'));

  var altGrid = el('div', { className: 'alt-grid' });

  var sfCard = el('div', { className: 'alternative-card' });
  sfCard.appendChild(el('h4', null, 'Seller Financing'));
  sfCard.appendChild(el('p', null, 'Keep earning monthly income from your property. We make consistent payments while you build long-term wealth through interest.'));
  sfCard.appendChild(el('a', {
    href: '#',
    className: 'alt-link',
    onClick: function (e) { e.preventDefault(); alert('Seller financing details coming soon! Call ' + CONFIG.phone + ' to learn more.'); },
  }, 'Learn More'));
  altGrid.appendChild(sfCard);

  var novCard = el('div', { className: 'alternative-card' });
  novCard.appendChild(el('h4', null, 'Novation'));
  novCard.appendChild(el('p', null, 'Get a higher sale price. We handle all the marketing, repairs, and showings while you keep ownership until closing.'));
  novCard.appendChild(el('a', {
    href: '#',
    className: 'alt-link',
    onClick: function (e) { e.preventDefault(); alert('Novation details coming soon! Call ' + CONFIG.phone + ' to learn more.'); },
  }, 'Learn More'));
  altGrid.appendChild(novCard);

  altSection.appendChild(altGrid);
  wrap.appendChild(altSection);

  // ── Download PDF ──
  var offerId = offer.id || offer.offerId || '';
  if (offerId) {
    var pdfBtn = el('a', {
      href: CONFIG.apiUrl.replace(/\/cash-offer$/, '') + '/cash-offer/' + offerId + '/pdf',
      className: 'cta-button cta-button-outline',
      target: '_blank',
      rel: 'noopener',
    }, 'Download Offer as PDF');
    wrap.appendChild(el('div', { className: 'pdf-download' }, [pdfBtn]));
  }

  // ── CTA ──
  var ctaSection = el('div', { className: 'results-cta' });
  ctaSection.appendChild(el('p', null, [
    'Questions about your offer? Call us at ',
    el('a', { href: 'tel:' + CONFIG.phone.replace(/\D/g, '') }, CONFIG.phone),
    ' or reply to the text we just sent you.',
  ]));
  ctaSection.appendChild(el('p', null, 'Want to discuss seller financing or novation? Let us know!'));
  wrap.appendChild(ctaSection);

  resultsContainer.appendChild(wrap);

  // Fade in
  setTimeout(function () {
    resultsContainer.style.opacity = '1';
  }, 50);
}

/* ================================================================ */
/*  Google Maps API Loader                                          */
/* ================================================================ */

function loadGooglePlaces() {
  if (document.getElementById('google-places-script')) return;
  // Use the new Google Maps bootstrap loader with loading=async (required for new API keys)
  var script = document.createElement('script');
  script.id = 'google-places-script';
  script.src = 'https://maps.googleapis.com/maps/api/js?key=' +
    CONFIG.googlePlacesApiKey + '&libraries=places&loading=async&callback=_googlePlacesReady';
  script.async = true;
  document.head.appendChild(script);
}

// Callback for Google Maps load
window._googlePlacesReady = function () {
  var input = document.getElementById('address-input');
  if (input) initAutocomplete(input);
};

/* ================================================================ */
/*  Init                                                            */
/* ================================================================ */

function initOfferForm() {
  var container = document.getElementById('offer-form-container');
  if (!container) {
    console.error('offer-form.js: #offer-form-container not found');
    return;
  }

  // Ensure results container exists
  if (!document.getElementById('offer-results-container')) {
    var results = document.createElement('div');
    results.id = 'offer-results-container';
    container.parentNode.insertBefore(results, container.nextSibling);
  }

  // Load Google Places API
  loadGooglePlaces();

  // Render step 1
  renderStep1(container);
}

// Auto-init on DOMContentLoaded if not already called
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initOfferForm);
} else {
  initOfferForm();
}
