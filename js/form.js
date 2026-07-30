(function(){
  var form=document.getElementById('lead-form');
  if(!form)return;
  var btn=document.getElementById('submit-btn');
  var status=document.getElementById('form-status');
  var success=document.getElementById('form-success');
  form.addEventListener('submit',function(e){
    e.preventDefault();
    status.style.display='none';status.className='form-status';
    var v=function(n){return (form[n]&&form[n].value||'').trim();};
    var name=v('name'),phone=v('phone'),addr=v('propertyAddress');
    if(!name){return err('Please enter your name.');}
    if(phone.replace(/\D/g,'').length<10){return err('Please enter a valid phone number.');}
    if(!addr){return err('Please enter your property address.');}
    if(!form.smsConsent||!form.smsConsent.checked){return err('Please agree to be contacted so we can reach you.');}
    var msg=v('message');msg=(msg?msg+' | ':'')+'Consented to calls/texts (SMS opt-in)';
    btn.disabled=true;btn.textContent='Sending...';
    var attrib={};
    try{
      var td=(window._smTracking&&window._smTracking.getData())||{};
      var tu=td.utm||{};
      if(tu.source)attrib.utm_source=tu.source;
      if(tu.medium)attrib.utm_medium=tu.medium;
      if(tu.campaign)attrib.utm_campaign=tu.campaign;
      if(tu.content)attrib.utm_content=tu.content;
      if(tu.term)attrib.utm_term=tu.term;
      if(td.landingPage)attrib.landing=td.landingPage;
      if(td.referrer)attrib.referrer=td.referrer;
    }catch(e){}
    fetch('https://www.setmate.ai/api/public/seller-lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
      name:name,phone:phone,email:v('email')||null,propertyAddress:addr,
      situation:v('situation')||null,message:msg,source:'washingtonhomes4cash.com',attribution:attrib
    })}).then(function(r){return r.json();}).then(function(res){
      if(res&&res.success){form.style.display='none';success.style.display='block';success.scrollIntoView({behavior:'smooth',block:'center'});}
      else{err((res&&res.error)||'Something went wrong. Please call us at (425) 548-1993.');reset();}
    }).catch(function(){err('Could not submit. Please call us at (425) 548-1993.');reset();});
  });
  function err(m){status.textContent=m;status.className='form-status error';status.style.display='block';}
  function reset(){btn.disabled=false;btn.textContent='Get My Cash Offer';}
})();