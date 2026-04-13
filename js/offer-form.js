function renderStep2(container) {
  currentStep = 2;

  var section = el('div', { className: 'form-section fade-in' });
  section.appendChild(renderProgress(2));
  section.appendChild(el('h2', null, 'Confirm Your Property Details'));

  // Still loading
  if (!formData.countyDataLoaded) {
    var loadWrap = el('div', { className: 'county-loading' });
    loadWrap.appendChild(el('div', { className: 'mini-spinner' }));
    loadWrap.appendChild(el('span', { className: 'county-loading-text' },
      'Pulling your property details from county records\u2026'));
    section.appendChild(loadWrap);
    container.appendChild(section);
    return;
  }

  var data = formData.countyData;

  // County data found: show summary card
  if (data && (data.beds || data.sqft || data.propertyType)) {

    var summaryCard = el('div', { className: 'property-summary-card' });
    var typeLabels = {
      single_family: 'Single Family', duplex_triplex: 'Duplex / Triplex',
      condo_townhouse: 'Condo / Townhouse', mobile_home: 'Mobile Home',
    };
    var typeLabel = typeLabels[data.propertyType] || data.propertyType || 'Residential';

    var summaryGrid = el('div', { className: 'property-summary-grid' });
    var summaryItems = [
      { icon: '#', label: 'Type',      value: typeLabel },
      { icon: '#', label: 'Bedrooms',  value: data.beds  != null ? data.beds  + ' bed'  : null },
      { icon: '#', label: 'Bathrooms', value: data.baths != null ? data.baths + ' bath' : null },
      { icon: '#', label: 'Sqft',      value: data.sqft  != null ? Number(data.sqft).toLocaleString() + ' sqft' : null },
      { icon: '#', label: 'Built',     value: data.yearBuilt ? String(data.yearBuilt) : null },
      { icon: '#', label: 'Lot',       value: data.lotSqft ? Number(data.lotSqft).toLocaleString() + ' sqft lot' : null },
    ].filter(function (i) { return i.value; });

    summaryItems.forEach(function (item) {
      var chip = el('div', { className: 'summary-chip' });
      chip.appendChild(el('span', { className: 'summary-chip-label' }, item.label + ':'));
      chip.appendChild(el('span', { className: 'summary-chip-value' }, item.value));
      summaryGrid.appendChild(chip);
    });

    summaryCard.appendChild(el('div', { className: 'summary-card-label' },
      '\u2713 Found in county records'));
    summaryCard.appendChild(summaryGrid);
    section.appendChild(summaryCard);

    // "Is any of this incorrect?" toggle
    var correctionDetails = el('div', {
      className: 'conditional-block',
      style: formData.countyDataCorrect === 'yes' ? '' : 'display:none',
    });

    var correctGroup = el('div', { className: 'form-group' });
    correctGroup.appendChild(el('label', { className: 'form-label' },
      'Is any of this information incorrect?'));
    correctGroup.appendChild(renderButtonGroup(
      [{ value: 'no', label: 'Looks right' }, { value: 'yes', label: "Something's off" }],
      formData.countyDataCorrect || 'no',
      function (v) {
        formData.countyDataCorrect = v;
        correctionDetails.style.display = v === 'yes' ? '' : 'none';
      }
    ));
    correctGroup.appendChild(correctionDetails);
    section.appendChild(correctGroup);

    // Correction textarea
    var correctionsTA = el('textarea', {
      className: 'form-input form-textarea',
      placeholder: "Describe what's incorrect \u2014 e.g. \"It's actually 4 bed, not 3\" or \"Sqft is 1,800, not 1,200\"",
      rows: '2',
    });
    correctionsTA.value = formData.countyDataCorrections || '';
    correctionsTA.addEventListener('input', function () {
      formData.countyDataCorrections = correctionsTA.value;
    });
    correctionDetails.appendChild(el('div', { className: 'form-group' }, [
      el('label', { className: 'form-label' }, "What's incorrect?"),
      correctionsTA,
    ]));

    correctionDetails.appendChild(el('p', { className: 'form-hint', style: 'margin-top:4px' },
      'Update the values below so we calculate your offer correctly:'));

    correctionDetails.appendChild(el('div', { className: 'form-group' }, [
      el('label', { className: 'form-label' }, 'Correct bedrooms'),
      renderButtonGroup(
        [1, 2, 3, 4, 5, { value: '6+', label: '6+' }],
        formData.beds,
        function (v) { formData.beds = v; }
      ),
    ]));

    correctionDetails.appendChild(el('div', { className: 'form-group' }, [
      el('label', { className: 'form-label' }, 'Correct bathrooms'),
      renderButtonGroup(
        [1, 1.5, 2, 2.5, 3, 3.5, { value: '4+', label: '4+' }],
        formData.baths,
        function (v) { formData.baths = v; }
      ),
    ]));

    var corrSqftInput = el('input', {
      type: 'number', className: 'form-input',
      placeholder: 'Correct square footage', value: formData.sqft || '',
      min: '100', max: '50000',
    });
    corrSqftInput.addEventListener('input', function () {
      formData.sqft = corrSqftInput.value ? Number(corrSqftInput.value) : null;
    });
    correctionDetails.appendChild(el('div', { className: 'form-group' }, [
      el('label', { className: 'form-label' }, 'Correct square footage'),
      corrSqftInput,
    ]));

    correctionDetails.appendChild(el('div', { className: 'form-group' }, [
      el('label', { className: 'form-label' }, 'Correct property type'),
      renderButtonGroup(
        [
          { value: 'single_family',   label: 'Single Family' },
          { value: 'duplex_triplex',  label: 'Duplex / Triplex' },
          { value: 'condo_townhouse', label: 'Condo / Townhouse' },
          { value: 'mobile_home',     label: 'Mobile Home' },
          { value: 'other',           label: 'Other' },
        ],
        formData.propertyType,
        function (v) { formData.propertyType = v; }
      ),
    ]));

  } else {
    // County data NOT found: manual entry fallback
    var noBadge = el('div', { className: 'county-badge county-badge-info' },
      '\u2139\ufe0f We couldn\'t pull county records automatically \u2014 please fill in your property details below.');
    section.appendChild(noBadge);

    section.appendChild(el('div', { className: 'form-group' }, [
      el('label', { className: 'form-label' }, 'Property Type'),
      renderButtonGroup(
        [
          { value: 'single_family',   label: 'Single Family' },
          { value: 'duplex_triplex',  label: 'Duplex / Triplex' },
          { value: 'condo_townhouse', label: 'Condo / Townhouse' },
          { value: 'mobile_home',     label: 'Mobile Home' },
          { value: 'other',           label: 'Other' },
        ],
        formData.propertyType,
        function (v) { formData.propertyType = v; }
      ),
    ]));

    section.appendChild(el('div', { className: 'form-group' }, [
      el('label', { className: 'form-label' }, 'Bedrooms'),
      renderButtonGroup(
        [1, 2, 3, 4, 5, { value: '6+', label: '6+' }],
        formData.beds,
        function (v) { formData.beds = v; }
      ),
    ]));

    section.appendChild(el('div', { className: 'form-group' }, [
      el('label', { className: 'form-label' }, 'Bathrooms'),
      renderButtonGroup(
        [1, 1.5, 2, 2.5, 3, 3.5, { value: '4+', label: '4+' }],
        formData.baths,
        function (v) { formData.baths = v; }
      ),
    ]));

    var sqftInput = el('input', {
      type: 'number', id: 'sqft-input', className: 'form-input',
      placeholder: 'e.g. 1500', value: formData.sqft || '',
      min: '100', max: '50000',
    });
    sqftInput.addEventListener('input', function () {
      formData.sqft = sqftInput.value ? Number(sqftInput.value) : null;
      sqftPresets.querySelectorAll('.btn-option').forEach(function (b) { b.classList.remove('selected'); });
    });
    var sqftPresets = renderButtonGroup(
      [800, 1200, 1500, 2000, 2500, { value: 3000, label: '3000+' }],
      formData.sqft,
      function (v) { formData.sqft = Number(v); sqftInput.value = v; }
    );
    section.appendChild(el('div', { className: 'form-group' }, [
      el('label', { for: 'sqft-input', className: 'form-label' }, 'Square Footage'),
      sqftPresets, sqftInput,
    ]));

    var yrInput = el('input', {
      type: 'number', id: 'year-built', className: 'form-input',
      placeholder: 'e.g. 1985', value: formData.yearBuilt || '',
      min: '1800', max: '2030',
    });
    yrInput.addEventListener('input', function () {
      formData.yearBuilt = yrInput.value ? Number(yrInput.value) : null;
    });
    section.appendChild(el('div', { className: 'form-group' }, [
      el('label', { for: 'year-built', className: 'form-label' }, 'Year Built (optional)'),
      yrInput,
    ]));
  }

  // Improvements / ADU (both paths)
  section.appendChild(el('hr', { className: 'form-divider' }));
  section.appendChild(el('h3', { className: 'form-subhead' },
    'Improvements Not Reflected in County Records'));
  section.appendChild(el('p', { className: 'form-hint' },
    'County records sometimes lag years behind actual work. ' +
    'Let us know about anything we may have missed \u2014 it can increase your offer.'));

  // Additions toggle
  var additionsDetails = el('div', {
    className: 'conditional-block',
    style: formData.hasAdditions === 'yes' ? '' : 'display:none',
  });
  var additionsGroup = el('div', { className: 'form-group' });
  additionsGroup.appendChild(el('label', { className: 'form-label' },
    'Have you made additions or improvements not in county records?'));
  additionsGroup.appendChild(renderButtonGroup(
    [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }],
    formData.hasAdditions,
    function (v) { formData.hasAdditions = v; additionsDetails.style.display = v === 'yes' ? '' : 'none'; }
  ));
  additionsGroup.appendChild(additionsDetails);
  section.appendChild(additionsGroup);

  var addDesc = el('textarea', {
    className: 'form-input form-textarea',
    placeholder: 'Describe improvements \u2014 e.g. "Added 400 sqft master suite in 2019, converted garage to office"',
    rows: '3',
  });
  addDesc.value = formData.additionsDescription;
  addDesc.addEventListener('input', function () { formData.additionsDescription = addDesc.value; });
  additionsDetails.appendChild(el('div', { className: 'form-group' }, [
    el('label', { className: 'form-label' }, 'Describe the improvements'),
    addDesc,
  ]));
  additionsDetails.appendChild(el('div', { className: 'form-group' }, [
    el('label', { className: 'form-label' }, 'Were these additions permitted?'),
    renderButtonGroup(
      [
        { value: 'yes',     label: 'Yes \u2014 fully permitted' },
        { value: 'partial', label: 'Partially permitted' },
        { value: 'no',      label: 'No permits pulled' },
      ],
      formData.additionsPermitted,
      function (v) { formData.additionsPermitted = v; }
    ),
  ]));

  // ADU toggle
  var aduDetails = el('div', {
    className: 'conditional-block',
    style: formData.hasADU === 'yes' ? '' : 'display:none',
  });
  var aduGroup = el('div', { className: 'form-group' });
  aduGroup.appendChild(el('label', { className: 'form-label' },
    'Is there an ADU on the property? (in-law suite, garage conversion, basement unit, detached cottage, etc.)'));
  aduGroup.appendChild(renderButtonGroup(
    [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }],
    formData.hasADU,
    function (v) { formData.hasADU = v; aduDetails.style.display = v === 'yes' ? '' : 'none'; }
  ));
  aduGroup.appendChild(aduDetails);
  section.appendChild(aduGroup);

  var aduTypeSelect = el('select', { className: 'form-input' });
  [
    { value: '',          label: 'Select ADU type\u2026' },
    { value: 'attached',  label: 'Attached addition / in-law suite' },
    { value: 'garage',    label: 'Garage conversion' },
    { value: 'basement',  label: 'Basement unit' },
    { value: 'detached',  label: 'Detached cottage / backyard unit' },
    { value: 'other',     label: 'Other' },
  ].forEach(function (o) {
    var opt = el('option', { value: o.value }, o.label);
    if (formData.aduType === o.value) opt.selected = true;
    aduTypeSelect.appendChild(opt);
  });
  aduTypeSelect.addEventListener('change', function () { formData.aduType = aduTypeSelect.value; });
  aduDetails.appendChild(el('div', { className: 'form-group' }, [
    el('label', { className: 'form-label' }, 'ADU type'), aduTypeSelect,
  ]));
  aduDetails.appendChild(el('div', { className: 'form-group' }, [
    el('label', { className: 'form-label' }, 'Is the ADU permitted?'),
    renderButtonGroup(
      [{ value: 'yes', label: 'Yes \u2014 permitted' }, { value: 'no', label: 'No \u2014 unpermitted' }],
      formData.aduPermitted,
      function (v) { formData.aduPermitted = v; }
    ),
  ]));
  var aduSqftInput = el('input', {
    type: 'number', className: 'form-input',
    placeholder: 'e.g. 600', value: formData.aduSqft || '', min: '50',
  });
  aduSqftInput.addEventListener('input', function () {
    formData.aduSqft = aduSqftInput.value ? Number(aduSqftInput.value) : null;
  });
  aduDetails.appendChild(el('div', { className: 'form-group' }, [
    el('label', { className: 'form-label' }, 'Approximate ADU size in sqft (optional)'),
    aduSqftInput,
  ]));

  // Other changes
  var otherTA = el('textarea', {
    className: 'form-input form-textarea',
    placeholder: 'Solar panels, new roof, full kitchen remodel, additional bedrooms\u2026 anything our search may have missed.',
    rows: '3',
  });
  otherTA.value = formData.otherChanges || '';
  otherTA.addEventListener('input', function () { formData.otherChanges = otherTA.value; });
  section.appendChild(el('div', { className: 'form-group' }, [
    el('label', { className: 'form-label' }, 'Anything else not captured above? (optional)'),
    otherTA,
  ]));

  var errMsg = el('p', { className: 'form-error', id: 'step2-error' });
  section.appendChild(errMsg);

  section.appendChild(renderNav(
    function () { transitionTo(container, renderStep1); },
    function () {
      var hasCountyData = formData.countyData && (formData.countyData.beds || formData.countyData.sqft);
      if (!hasCountyData) {
        if (!formData.propertyType) { errMsg.textContent = 'Please select a property type.'; return; }
        if (!formData.beds)         { errMsg.textContent = 'Please select number of bedrooms.'; return; }
        if (!formData.baths)        { errMsg.textContent = 'Please select number of bathrooms.'; return; }
        if (!formData.sqft)         { errMsg.textContent = 'Please enter approximate square footage.'; return; }
      }
      transitionTo(container, renderStep3);
    }
  ));

  container.appendChild(section);
}

