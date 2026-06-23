(function(){
  var BANDS = {
    'excellent': {low:0.82, high:0.88},
    'good':      {low:0.75, high:0.82},
    'needs-work':{low:0.62, high:0.75}
  };

  function formatUSD(n) {
    return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
  }

  function compute(value, condition) {
    var band = BANDS[condition];
    if (!band) return null;
    return {low: Math.round(value * band.low), high: Math.round(value * band.high)};
  }

  window.calcCompute = compute;

  var form = document.getElementById('calc-form');
  if (!form) return;

  var addrEl   = document.getElementById('calc-address');
  var valueEl  = document.getElementById('calc-value');
  var condEl   = document.getElementById('calc-condition');
  var resultEl = document.getElementById('calc-result');
  var rangeEl  = document.getElementById('calc-range');

  function clearErrors() {
    [addrEl, valueEl, condEl].forEach(function(el){
      el.classList.remove('calc-input--error');
    });
    ['calc-address-err','calc-value-err','calc-condition-err'].forEach(function(id){
      document.getElementById(id).textContent = '';
    });
  }

  function validate() {
    var errs = [];
    if (!addrEl.value.trim())
      errs.push({fieldId:'calc-address', errId:'calc-address-err', msg:'Please enter the property address.'});
    var v = parseFloat(valueEl.value);
    if (!valueEl.value || !isFinite(v) || v <= 0)
      errs.push({fieldId:'calc-value', errId:'calc-value-err', msg:'Please enter a valid market value greater than zero.'});
    if (!condEl.value)
      errs.push({fieldId:'calc-condition', errId:'calc-condition-err', msg:'Please select the home condition.'});
    return errs;
  }

  function showErrors(errs) {
    errs.forEach(function(e){
      document.getElementById(e.fieldId).classList.add('calc-input--error');
      document.getElementById(e.errId).textContent = e.msg;
    });
  }

  form.addEventListener('submit', function(e){
    e.preventDefault();
    clearErrors();
    var errs = validate();
    if (errs.length) { showErrors(errs); return; }
    var range = compute(parseFloat(valueEl.value), condEl.value);
    rangeEl.textContent = formatUSD(range.low) + '–' + formatUSD(range.high);
    resultEl.classList.add('visible');
    resultEl.scrollIntoView({behavior:'smooth', block:'nearest'});
  });
})();
