/* ============================================
   Property Analysis Form — Multi-step + Results
   ============================================ */
(function () {
  'use strict';

  var API_URL = 'https://www.setmate.ai/api/public/property-analysis';
  var API_KEY = 'nwgc_lead_2026_sk';

  var host = window.location.hostname.replace(/^www\./, '');
  var brandEmail = host === 'washingtonhomes4cash.com' ? 'team@washingtonhomes4cash.com'
    : host === 'washingtonhomeoffers.com' ? 'offers@washingtonhomeoffers.com'
    : 'david@davidbuyshomes4cash.com';

  /* ── State ──────────────────────────────────────────────────── */
  var currentStep = 1;
  var formData = {
    address: '',
    propertyType: '',
    beds: null,
    baths: null,
    sqft: null,
    yearBuilt: null,
    condition: {
      overall: '', kitchen: '', bathrooms: '', roof: '', flooring: '',
      windows: '', exterior: '', hvac: '', electrical: '',
      paintInterior: '', paintExterior: '',
    },
    firstName: '', lastName: '', phone: '', email: '', consent: false,
  };

  /* ── Helpers ────────────────────────────────────────────────── */
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'className') node.className = attrs[k];
      else if (k === 'style' && typeof attrs[k] === 'string') node.style.cssText = attrs[k];
      else if (k === 'colspan') node.setAttribute('colspan', attrs[k]);
      else node.setAttribute(k, attrs[k]);
    });
    if (typeof children === 'string') node.textContent = children;
    else if (Array.isArray(children)) children.forEach(function (c) { if (c) node.appendChild(c); });
    else if (children instanceof Node) node.appendChild(children);
    return node;
  }

  function fmt(n) { return '$' + Number(n).toLocaleString('en-US'); }
  function fmtRange(lo, hi) { return fmt(lo) + ' – ' + fmt(hi); }

  var container;

  function transitionTo(cont, renderFn) {
    cont.style.opacity = '0';
    setTimeout(function () {
      cont.innerHTML = '';
      renderFn(cont);
      cont.style.opacity = '1';
      window.scrollTo({ top: cont.offsetTop - 90, behavior: 'smooth' });
    }, 200);
  }

  function renderProgress(step) {
    var labels = ['Address', 'Details', 'Condition', 'Contact'];
    var wrap = el('div', { className: 'progress-steps' });
    for (var i = 1; i <= 4; i++) {
      var cls = 'progress-steps__step';
      if (i < step) cls += ' completed';
      else if (i === step) cls += ' active';
      wrap.appendChild(el('div', { className: cls }, String(i)));
      if (i < 4) wrap.appendChild(el('div', { className: 'progress-steps__line' + (i < step ? ' active' : '') }));
    }
    var outer = el('div', { className: 'progress-wrapper' });
    outer.appendChild(wrap);
    outer.appendChild(el('p', { className: 'progress-label' }, 'Step ' + step + ' of 4: ' + labels[step - 1]));
    return outer;
  }

  function renderButtonGroup(options, selectedValue, onSelect) {
    var group = el('div', { className: 'button-group' });
    options.forEach(function (opt) {
      var val = typeof opt === 'object' ? opt.value : opt;
      var label = typeof opt === 'object' ? opt.label : String(opt);
      var btn = el('button', { type: 'button', className: 'btn-option' + (String(val) === String(selectedValue) ? ' selected' : '') }, label);
      btn.addEventListener('click', function () {
        group.querySelectorAll('.btn-option').forEach(function (b) { b.classList.remove('selected'); });
        btn.classList.add('selected');
        onSelect(val);
      });
      group.appendChild(btn);
    });
    return group;
  }

  function renderNav(onBack, onNext, nextLabel) {
    var nav = el('div', { className: 'form-actions' });
    if (onBack) {
      var backBtn = el('button', { type: 'button', className: 'btn-back' }, '← Back');
      backBtn.addEventListener('click', onBack);
      nav.appendChild(backBtn);
    }
    var nextBtn = el('button', { type: 'button', className: 'cta-button' }, nextLabel || 'Continue →');
    nextBtn.addEventListener('click', onNext);
    nav.appendChild(nextBtn);
    return nav;
  }

  /* ── Step 1: Address ────────────────────────────────────────── */
  function renderStep1(cont) {
    currentStep = 1;
    var section = el('div', { className: 'form-section fade-in' });
    section.appendChild(renderProgress(1));
    section.appendChild(el('h2', null, 'Enter Your Property Address'));
    section.appendChild(el('p', { className: 'form-hint' },
      "We’ll pull comparable sales and county records to build your free analysis."));

    var input = el('input', {
      type: 'text', className: 'form-input form-input-lg',
      placeholder: 'e.g. 1234 Main St, Everett, WA 98201',
      id: 'address-input', autocomplete: 'street-address',
    });
    input.value = formData.address;
    input.addEventListener('input', function () { formData.address = input.value; });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') section.querySelector('.cta-button').click();
    });
    section.appendChild(el('div', { className: 'form-group' }, [
      el('label', { className: 'form-label', for: 'address-input' }, 'Property Address'),
      input,
    ]));

    var errMsg = el('p', { className: 'form-error' });
    section.appendChild(errMsg);
    section.appendChild(renderNav(null, function () {
      var addr = formData.address.trim();
      if (!addr || addr.length < 10) { errMsg.textContent = 'Please enter a full street address including city and state.'; return; }
      transitionTo(cont, renderStep2);
    }, 'Look Up My Property →'));
    cont.appendChild(section);
    setTimeout(function () { input.focus(); }, 250);
  }

  /* ── Step 2: Property Details ───────────────────────────────── */
  function renderStep2(cont) {
    currentStep = 2;
    var section = el('div', { className: 'form-section fade-in' });
    section.appendChild(renderProgress(2));
    section.appendChild(el('h2', null, 'Tell Us About Your Property'));
    section.appendChild(el('p', { className: 'form-hint' },
      "This helps us find the best comps. If you’re unsure about a field, your best guess works."));

    section.appendChild(el('div', { className: 'form-group' }, [
      el('label', { className: 'form-label' }, 'Property Type'),
      renderButtonGroup([
        { value: 'single_family', label: 'Single Family' },
        { value: 'condo_townhouse', label: 'Condo / Townhouse' },
        { value: 'duplex_triplex', label: 'Duplex / Triplex' },
        { value: 'mobile_home', label: 'Mobile / Manufactured' },
      ], formData.propertyType, function (v) { formData.propertyType = v; }),
    ]));

    section.appendChild(el('div', { className: 'form-group' }, [
      el('label', { className: 'form-label' }, 'Bedrooms'),
      renderButtonGroup([1, 2, 3, 4, 5, { value: '6+', label: '6+' }],
        formData.beds, function (v) { formData.beds = v; }),
    ]));

    section.appendChild(el('div', { className: 'form-group' }, [
      el('label', { className: 'form-label' }, 'Bathrooms'),
      renderButtonGroup([1, 1.5, 2, 2.5, 3, { value: '4+', label: '4+' }],
        formData.baths, function (v) { formData.baths = v; }),
    ]));

    var sqftInput = el('input', {
      type: 'number', className: 'form-input', id: 'sqft-input',
      placeholder: 'e.g. 1500', value: formData.sqft || '', min: '100', max: '50000',
    });
    sqftInput.addEventListener('input', function () {
      formData.sqft = sqftInput.value ? Number(sqftInput.value) : null;
    });
    var sqftPresets = renderButtonGroup(
      [800, 1200, 1500, 2000, 2500, { value: 3000, label: '3000+' }],
      formData.sqft, function (v) { formData.sqft = Number(v); sqftInput.value = v; });
    section.appendChild(el('div', { className: 'form-group' }, [
      el('label', { className: 'form-label', for: 'sqft-input' }, 'Approximate Square Footage'),
      sqftPresets, sqftInput,
    ]));

    var yrInput = el('input', {
      type: 'number', className: 'form-input', id: 'year-input',
      placeholder: 'e.g. 1985', value: formData.yearBuilt || '', min: '1800', max: '2030',
    });
    yrInput.addEventListener('input', function () {
      formData.yearBuilt = yrInput.value ? Number(yrInput.value) : null;
    });
    section.appendChild(el('div', { className: 'form-group' }, [
      el('label', { className: 'form-label', for: 'year-input' }, 'Year Built (optional)'),
      yrInput,
    ]));

    var errMsg = el('p', { className: 'form-error' });
    section.appendChild(errMsg);
    section.appendChild(renderNav(
      function () { transitionTo(cont, renderStep1); },
      function () {
        if (!formData.beds) { errMsg.textContent = 'Please select number of bedrooms.'; return; }
        if (!formData.baths) { errMsg.textContent = 'Please select number of bathrooms.'; return; }
        if (!formData.sqft) { errMsg.textContent = 'Please enter approximate square footage.'; return; }
        transitionTo(cont, renderStep3);
      }
    ));
    cont.appendChild(section);
  }

  /* ── Step 3: Condition Assessment ───────────────────────────── */
  var conditionDefs = [
    { key: 'kitchen', label: 'Kitchen', opts: [
      { value: 'updated', label: 'Updated', desc: 'Recent remodel' },
      { value: 'original', label: 'Original', desc: 'Functional, dated style' },
      { value: 'dated', label: 'Needs Work', desc: 'Old cabinets, worn counters' },
    ]},
    { key: 'bathrooms', label: 'Bathrooms', opts: [
      { value: 'updated', label: 'Updated', desc: 'Modern fixtures' },
      { value: 'original', label: 'Original', desc: 'Old but functional' },
      { value: 'dated', label: 'Needs Work', desc: 'Worn tile, old fixtures' },
    ]},
    { key: 'roof', label: 'Roof', opts: [
      { value: 'good', label: 'Good', desc: 'Under 15 years' },
      { value: 'fair', label: 'Fair', desc: '15-25 years' },
      { value: 'poor', label: 'Needs Replacement', desc: '25+ years or leaking' },
    ]},
    { key: 'flooring', label: 'Flooring', opts: [
      { value: 'good', label: 'Good', desc: 'Clean, no damage' },
      { value: 'worn', label: 'Worn', desc: 'Scratched or stained' },
      { value: 'damaged', label: 'Needs Replacement', desc: 'Damaged or very dated' },
    ]},
    { key: 'windows', label: 'Windows', opts: [
      { value: 'good', label: 'Good', desc: 'Double-pane, sealed' },
      { value: 'original', label: 'Original', desc: 'Old but functional' },
      { value: 'drafty', label: 'Drafty / Failing', desc: 'Single pane or broken seals' },
    ]},
    { key: 'exterior', label: 'Siding / Exterior', opts: [
      { value: 'good', label: 'Good', desc: 'Solid, recently painted' },
      { value: 'fair', label: 'Fair', desc: 'Needs paint or minor repair' },
      { value: 'poor', label: 'Poor', desc: 'Rot, damage, or failing' },
    ]},
    { key: 'hvac', label: 'Heating / Cooling', opts: [
      { value: 'good', label: 'Working Well', desc: 'Under 15 years old' },
      { value: 'old', label: 'Old / Aging', desc: '15+ years, still works' },
      { value: 'not_working', label: 'Not Working', desc: 'Broken or unreliable' },
    ]},
    { key: 'electrical', label: 'Electrical', opts: [
      { value: 'good', label: 'Good', desc: 'Modern wiring and panel' },
      { value: 'original', label: 'Original', desc: 'Old panel, works fine' },
      { value: 'knob_tube', label: 'Knob & Tube', desc: 'Needs full rewire' },
    ]},
    { key: 'paintInterior', label: 'Interior Paint', opts: [
      { value: 'good', label: 'Good', desc: 'Clean, neutral colors' },
      { value: 'fair', label: 'Fair', desc: 'Some scuffs or bold colors' },
      { value: 'needs_paint', label: 'Needs Paint', desc: 'Peeling or stained' },
    ]},
    { key: 'paintExterior', label: 'Exterior Paint', opts: [
      { value: 'good', label: 'Good', desc: 'Recently painted' },
      { value: 'fair', label: 'Fair', desc: 'Fading or minor peeling' },
      { value: 'needs_paint', label: 'Needs Paint', desc: 'Peeling or bare wood' },
    ]},
  ];

  function renderStep3(cont) {
    currentStep = 3;
    var section = el('div', { className: 'form-section fade-in' });
    section.appendChild(renderProgress(3));
    section.appendChild(el('h2', null, "Rate Your Home’s Condition"));
    section.appendChild(el('p', { className: 'form-hint' },
      "Be honest — this helps us build an accurate rehab estimate. Selecting “needs work” won’t automatically lower your offer."));

    // Overall condition (4-option cards)
    var overallGroup = el('div', { className: 'form-group' });
    overallGroup.appendChild(el('label', { className: 'form-label' }, 'Overall Condition'));
    var overallCards = el('div', { className: 'condition-cards' });
    [
      { value: 'excellent', label: 'Excellent', desc: 'Move-in ready, recently updated' },
      { value: 'good', label: 'Good', desc: 'Well-maintained, minor wear' },
      { value: 'fair', label: 'Fair', desc: 'Livable but needs updates' },
      { value: 'poor', label: 'Poor', desc: 'Major work needed' },
    ].forEach(function (opt) {
      var card = el('div', { className: 'condition-card' + (formData.condition.overall === opt.value ? ' selected' : '') });
      card.appendChild(el('span', { className: 'title' }, opt.label));
      card.appendChild(el('span', { className: 'desc' }, opt.desc));
      card.addEventListener('click', function () {
        overallCards.querySelectorAll('.condition-card').forEach(function (c) { c.classList.remove('selected'); });
        card.classList.add('selected');
        formData.condition.overall = opt.value;
      });
      overallCards.appendChild(card);
    });
    overallGroup.appendChild(overallCards);
    section.appendChild(overallGroup);

    section.appendChild(el('hr', { className: 'form-divider' }));
    section.appendChild(el('h3', { className: 'form-subhead' }, 'Component Details'));
    section.appendChild(el('p', { className: 'form-hint' },
      "Rate each area for a more precise estimate. Skip any you’re unsure about."));

    // Compact condition rows
    var condGrid = el('div', { className: 'cond-grid' });
    conditionDefs.forEach(function (def) {
      var row = el('div', { className: 'cond-row' });
      row.appendChild(el('span', { className: 'cond-label' }, def.label));
      var opts = el('div', { className: 'cond-options' });
      def.opts.forEach(function (opt) {
        var btn = el('button', {
          type: 'button',
          className: 'cond-btn' + (formData.condition[def.key] === opt.value ? ' selected' : ''),
          title: opt.desc,
        }, opt.label);
        btn.addEventListener('click', function () {
          opts.querySelectorAll('.cond-btn').forEach(function (b) { b.classList.remove('selected'); });
          btn.classList.add('selected');
          formData.condition[def.key] = opt.value;
        });
        opts.appendChild(btn);
      });
      row.appendChild(opts);
      condGrid.appendChild(row);
    });
    section.appendChild(condGrid);

    var errMsg = el('p', { className: 'form-error' });
    section.appendChild(errMsg);
    section.appendChild(renderNav(
      function () { transitionTo(cont, renderStep2); },
      function () {
        if (!formData.condition.overall) { errMsg.textContent = 'Please rate the overall condition of your home.'; return; }
        transitionTo(cont, renderStep4);
      }
    ));
    cont.appendChild(section);
  }

  /* ── Step 4: Contact Info ───────────────────────────────────── */
  function renderStep4(cont) {
    currentStep = 4;
    var section = el('div', { className: 'form-section fade-in' });
    section.appendChild(renderProgress(4));
    section.appendChild(el('h2', null, 'Almost There — Where Should We Send Your Analysis?'));
    section.appendChild(el('p', { className: 'form-hint' },
      'Your detailed property analysis with comps, valuations, and offer options takes about 30 seconds to generate.'));

    var fields = [
      { key: 'firstName', label: 'First Name', type: 'text', placeholder: 'First name', auto: 'given-name', required: true },
      { key: 'lastName', label: 'Last Name (optional)', type: 'text', placeholder: 'Last name', auto: 'family-name' },
      { key: 'phone', label: 'Phone Number', type: 'tel', placeholder: '(425) 555-1234', auto: 'tel', required: true },
      { key: 'email', label: 'Email Address', type: 'email', placeholder: 'you@email.com', auto: 'email', required: true },
    ];
    var inputs = {};
    fields.forEach(function (f) {
      var inp = el('input', { type: f.type, className: 'form-input', placeholder: f.placeholder, autocomplete: f.auto });
      inp.value = formData[f.key];
      inp.addEventListener('input', function () { formData[f.key] = inp.value; });
      inputs[f.key] = inp;
      section.appendChild(el('div', { className: 'form-group' }, [
        el('label', { className: 'form-label' }, f.label), inp,
      ]));
    });

    var consentCb = el('input', { type: 'checkbox' });
    consentCb.checked = formData.consent;
    consentCb.addEventListener('change', function () { formData.consent = consentCb.checked; });
    var consentWrap = el('label', { className: 'consent-label' });
    consentWrap.appendChild(consentCb);
    consentWrap.appendChild(el('span', null,
      'I agree to receive my free property analysis and a follow-up call. No spam — just your numbers.'));
    section.appendChild(consentWrap);

    var errMsg = el('p', { className: 'form-error' });
    section.appendChild(errMsg);
    section.appendChild(renderNav(
      function () { transitionTo(cont, renderStep3); },
      function () {
        if (!formData.firstName.trim()) { errMsg.textContent = 'Please enter your first name.'; return; }
        var digits = formData.phone.replace(/\D/g, '');
        if (digits.length < 10) { errMsg.textContent = 'Please enter a valid phone number.'; return; }
        if (!formData.email.trim() || !formData.email.includes('@')) { errMsg.textContent = 'Please enter a valid email address.'; return; }
        if (!formData.consent) { errMsg.textContent = 'Please check the consent box to continue.'; return; }
        submitForm(cont);
      },
      'Get My Free Analysis'
    ));
    cont.appendChild(section);
    setTimeout(function () { inputs.firstName.focus(); }, 250);
  }

  /* ── Loading ────────────────────────────────────────────────── */
  var loadingMessages = [
    'Searching county records…',
    'Finding comparable sales near your home…',
    'Verifying comp details…',
    'Ranking comps by similarity…',
    'Calculating your property valuations…',
    'Building your rehab estimate…',
    'Preparing your offer options…',
  ];

  function renderLoading(cont) {
    cont.innerHTML = '';
    var wrap = el('div', { className: 'loading-overlay fade-in',
      style: 'position:static; background:none; color:var(--text-dark); padding:80px 20px;' });
    wrap.appendChild(el('div', { className: 'spinner' }));
    var status = el('p', { className: 'status' }, loadingMessages[0]);
    wrap.appendChild(status);
    wrap.appendChild(el('p', { className: 'substatus' }, 'This usually takes 20–40 seconds'));
    cont.appendChild(wrap);
    var idx = 0;
    var iv = setInterval(function () {
      idx++;
      if (idx < loadingMessages.length) status.textContent = loadingMessages[idx];
    }, 5000);
    return function () { clearInterval(iv); };
  }

  /* ── Submit ─────────────────────────────────────────────────── */
  function submitForm(cont) {
    var stopLoading = renderLoading(cont);
    var payload = {
      address: formData.address.trim(),
      propertyDetails: {
        beds: Number(formData.beds) || 3,
        baths: Number(formData.baths) || 2,
        sqft: Number(formData.sqft) || 1500,
        yearBuilt: Number(formData.yearBuilt) || 0,
      },
      condition: formData.condition,
      contact: {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim() || undefined,
        phone: formData.phone.trim(),
        email: formData.email.trim(),
      },
      source: host || 'property-analysis-website',
      tracking: { referrer: document.referrer || '', utm: parseUtm() },
    };
    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
      body: JSON.stringify(payload),
    })
      .then(function (res) {
        if (!res.ok) return res.json().then(function (d) { throw new Error(d.error || 'Request failed'); });
        return res.json();
      })
      .then(function (data) { stopLoading(); renderResults(cont, data); })
      .catch(function (err) { stopLoading(); renderError(cont, err.message); });
  }

  function parseUtm() {
    try {
      var p = new URLSearchParams(window.location.search);
      var u = {};
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(function (k) {
        if (p.get(k)) u[k] = p.get(k);
      });
      return Object.keys(u).length ? u : undefined;
    } catch (e) { return undefined; }
  }

  /* ── Error ──────────────────────────────────────────────────── */
  function renderError(cont, message) {
    cont.innerHTML = '';
    var wrap = el('div', { className: 'error-message' });
    wrap.appendChild(el('h3', null, 'Something Went Wrong'));
    wrap.appendChild(el('p', null, message || "We couldn’t analyze this property. Please try again or call us directly."));
    var btn = el('button', { className: 'cta-button', type: 'button' }, 'Try Again');
    btn.addEventListener('click', function () { transitionTo(cont, renderStep1); });
    wrap.appendChild(btn);
    wrap.appendChild(el('p', { style: 'margin-top:16px;' },
      el('a', { href: 'tel:4252865639' }, 'Or call us: (425) 286-5639')));
    cont.appendChild(wrap);
  }

  /* ── Results ────────────────────────────────────────────────── */
  function renderResults(cont, data) {
    cont.innerHTML = '';
    var r = el('div', { className: 'ar fade-in' });

    // ── Hero ──
    var hero = el('div', { className: 'ar-hero' });
    hero.appendChild(el('p', { className: 'ar-hero-label' }, 'Your Free Property Analysis'));
    hero.appendChild(el('h2', { className: 'ar-hero-addr' }, data.subject.address));
    var chips = el('div', { className: 'ar-chips' });
    if (data.subject.beds) chips.appendChild(el('span', { className: 'ar-chip' }, data.subject.beds + ' bed'));
    if (data.subject.baths) chips.appendChild(el('span', { className: 'ar-chip' }, data.subject.baths + ' bath'));
    if (data.subject.sqft) chips.appendChild(el('span', { className: 'ar-chip' }, data.subject.sqft.toLocaleString() + ' sqft'));
    if (data.subject.yearBuilt) chips.appendChild(el('span', { className: 'ar-chip' }, 'Built ' + data.subject.yearBuilt));
    hero.appendChild(chips);
    r.appendChild(hero);

    // ── Valuation Cards ──
    r.appendChild(el('h3', { className: 'ar-section-title' }, 'What Your Home Is Worth'));
    var valGrid = el('div', { className: 'ar-val-grid' });
    [
      { label: 'As-Is Value', range: data.valuation.asIs, cls: 'ar-val--amber',
        note: 'What your home would likely sell for today, in its current condition.' },
      { label: 'Original / Clean Value', range: data.valuation.originalClean, cls: 'ar-val--blue',
        note: 'Value after cleaning, minor repairs, and professional staging.' },
      { label: 'Luxury Renovated ARV', range: data.valuation.luxuryArv, cls: 'ar-val--green',
        note: 'After-repair value with a full, high-quality renovation.' },
    ].forEach(function (v) {
      var card = el('div', { className: 'ar-val-card ' + v.cls });
      card.appendChild(el('div', { className: 'ar-val-label' }, v.label));
      card.appendChild(el('div', { className: 'ar-val-range' }, fmtRange(v.range.low, v.range.high)));
      card.appendChild(el('div', { className: 'ar-val-note' }, v.note));
      valGrid.appendChild(card);
    });
    r.appendChild(valGrid);

    // ── Comps ──
    if (data.comps && data.comps.length) {
      r.appendChild(el('h3', { className: 'ar-section-title' },
        'Comparable Sales (' + data.comps.length + ' properties)'));
      r.appendChild(el('p', { className: 'form-hint' },
        'These recently sold homes near you were used to calculate your valuations.'));
      var grid = el('div', { className: 'comps-grid' });
      data.comps.forEach(function (c) {
        var card = el('div', { className: 'comp-card' });
        var badgeText = c.conditionTag === 'luxury' ? 'Renovated'
          : c.conditionTag === 'as-is' ? 'As-Is / Original' : 'Clean / Average';
        var badgeCls = c.conditionTag === 'luxury' ? 'ar-badge--green'
          : c.conditionTag === 'as-is' ? 'ar-badge--amber' : 'ar-badge--blue';
        var body = el('div', { className: 'comp-card__body' });
        body.appendChild(el('div', { className: 'comp-card__price' }, fmt(c.soldPrice)));
        body.appendChild(el('div', { className: 'comp-card__address' }, c.address));
        var dets = el('div', { className: 'comp-card__details' });
        dets.appendChild(el('span', null, c.beds + 'bd / ' + c.baths + 'ba'));
        dets.appendChild(el('span', null, (c.sqft || 0).toLocaleString() + ' sqft'));
        dets.appendChild(el('span', null, fmt(c.pricePerSqft) + '/sf'));
        if (c.distance) dets.appendChild(el('span', null, c.distance.toFixed(1) + ' mi'));
        body.appendChild(dets);
        body.appendChild(el('span', { className: 'ar-badge ' + badgeCls }, badgeText));
        if (c.soldDate) body.appendChild(el('div', { style: 'font-size:0.78rem;color:var(--text-muted);margin-top:4px;' }, 'Sold ' + c.soldDate));
        card.appendChild(body);
        grid.appendChild(card);
      });
      r.appendChild(grid);
    }

    // ── Rehab Estimate ──
    if (data.rehab && data.rehab.items && data.rehab.items.length) {
      r.appendChild(el('h3', { className: 'ar-section-title' }, 'Estimated Renovation Costs'));
      r.appendChild(el('p', { className: 'form-hint' },
        'Based on the condition you described. Reflects current contractor pricing in the Puget Sound area.'));

      var tbl = el('table', { className: 'ar-table' });
      var thead = el('thead');
      var hr = el('tr');
      hr.appendChild(el('th', null, 'Item'));
      hr.appendChild(el('th', null, 'Scope of Work'));
      hr.appendChild(el('th', { style: 'text-align:right' }, 'Est. Cost'));
      thead.appendChild(hr);
      tbl.appendChild(thead);

      var tbody = el('tbody');
      data.rehab.items.forEach(function (it) {
        var row = el('tr');
        row.appendChild(el('td', { className: 'ar-table-item' }, it.name));
        row.appendChild(el('td', { className: 'ar-table-scope' }, it.scope));
        row.appendChild(el('td', { style: 'text-align:right; white-space:nowrap;' }, fmt(it.cost)));
        tbody.appendChild(row);
      });
      // Totals
      function addTotalRow(label, val, bold) {
        var row = el('tr', bold ? { className: 'ar-table-total' } : null);
        row.appendChild(el('td', { colspan: '2' }, label));
        row.appendChild(el('td', { style: 'text-align:right; white-space:nowrap;' }, fmt(val)));
        tbody.appendChild(row);
      }
      addTotalRow('Subtotal', data.rehab.subtotal, false);
      addTotalRow('Contingency (12%)', data.rehab.contingency, false);
      addTotalRow('GC Overhead (10%)', data.rehab.gcOverhead, false);
      addTotalRow('Total Estimated Rehab', data.rehab.total, true);
      tbl.appendChild(tbody);
      r.appendChild(tbl);
    }

    // ── Offer Paths ──
    r.appendChild(el('h3', { className: 'ar-section-title' }, 'Your Options'));

    // Path A: Cash
    var pathA = el('div', { className: 'ar-path ar-path--cash' });
    pathA.appendChild(el('div', { className: 'ar-path-tag' }, 'Option A'));
    pathA.appendChild(el('h4', null, 'Cash Offer'));
    pathA.appendChild(el('div', { className: 'ar-path-amount' }, fmt(data.cashOffer.amount)));
    var cashUl = el('ul', { className: 'ar-path-list' });
    [
      'Close in ' + data.cashOffer.closeDays + ' days or on your schedule',
      fmt(data.cashOffer.earnest) + ' earnest money deposit',
      data.cashOffer.inspectionDays + '-day inspection period',
      'No agent fees, no closing costs to you',
      'No repairs or showings needed',
    ].forEach(function (t) { cashUl.appendChild(el('li', null, t)); });
    pathA.appendChild(cashUl);
    var bump = el('div', { className: 'ar-bump' });
    bump.appendChild(el('strong', null, 'The Bump Rule: '));
    bump.appendChild(document.createTextNode(data.cashOffer.bumpRule));
    pathA.appendChild(bump);
    r.appendChild(pathA);

    // Path B: Sale Partnership
    if (data.salePartnership && data.salePartnership.viable) {
      var pathB = el('div', { className: 'ar-path ar-path--partner' });
      pathB.appendChild(el('div', { className: 'ar-path-tag' }, 'Option B'));
      pathB.appendChild(el('h4', null, 'Sale Partnership'));
      pathB.appendChild(el('div', { className: 'ar-path-amount' }, fmt(data.salePartnership.guaranteed) + '+'));
      pathB.appendChild(el('p', { className: 'ar-path-desc' },
        'We invest up to ' + fmt(data.salePartnership.renovationBudget) +
        ' to renovate your home, list it at ~' + fmt(data.salePartnership.listPrice) +
        ', and split the upside. You get a guaranteed minimum of ' +
        fmt(data.salePartnership.guaranteed) + ' plus ' +
        data.salePartnership.profitSharePct + '% of any profit above that.'));
      var partUl = el('ul', { className: 'ar-path-list' });
      [
        'Guaranteed minimum: ' + fmt(data.salePartnership.guaranteed),
        'Estimated total: ' + fmt(data.salePartnership.estimatedTotal),
        'Timeline: ' + data.salePartnership.timeline,
        'We handle all renovation, staging, and sale',
        'No out-of-pocket cost to you',
      ].forEach(function (t) { partUl.appendChild(el('li', null, t)); });
      pathB.appendChild(partUl);
      r.appendChild(pathB);
    }

    // ── CTA ──
    var cta = el('div', { className: 'results-cta' });
    cta.appendChild(el('h3', { style: 'color:var(--white); margin-bottom:12px;' }, 'Ready to Move Forward?'));
    cta.appendChild(el('p', null, 'Call or text us to discuss your options. No pressure, no obligation.'));
    var btns = el('div', { style: 'display:flex; gap:12px; justify-content:center; flex-wrap:wrap; margin-top:16px;' });
    btns.appendChild(el('a', { href: 'tel:4252865639', className: 'cta-button' }, 'Call (425) 286-5639'));
    btns.appendChild(el('a', { href: 'mailto:' + brandEmail,
      className: 'cta-button cta-button--outline', style: 'color:var(--gold); border-color:var(--gold);' }, 'Send Email'));
    cta.appendChild(btns);
    cta.appendChild(el('p', { style: 'font-size:0.82rem; margin-top:16px; color:rgba(255,255,255,0.55);' },
      'This analysis is an estimate based on comparable sales data. Final offer may vary after property inspection.'));
    r.appendChild(cta);

    cont.appendChild(r);
    window.scrollTo({ top: cont.offsetTop - 90, behavior: 'smooth' });
  }

  /* ── Init ───────────────────────────────────────────────────── */
  function init() {
    container = document.getElementById('offer-form-container');
    if (!container) return;
    container.style.transition = 'opacity 0.2s ease';
    renderStep1(container);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
