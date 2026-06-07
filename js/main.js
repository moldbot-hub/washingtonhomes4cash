(function(){
  var t=document.querySelector('.nav__toggle'),l=document.querySelector('.nav__links');
  if(t&&l){t.addEventListener('click',function(){var o=l.classList.toggle('open');t.setAttribute('aria-expanded',o);});
    l.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){l.classList.remove('open');});});}
  document.querySelectorAll('a[href^="#"]').forEach(function(a){a.addEventListener('click',function(e){
    var id=this.getAttribute('href');if(id==='#'||id.length<2)return;var el=document.querySelector(id);
    if(el){e.preventDefault();var n=document.querySelector('.nav');var off=n?n.offsetHeight:0;
      window.scrollTo({top:el.getBoundingClientRect().top+window.pageYOffset-off-16,behavior:'smooth'});}});});
  var f=document.querySelectorAll('.faq-item');f.forEach(function(i){i.addEventListener('toggle',function(){
    if(i.open)f.forEach(function(o){if(o!==i)o.removeAttribute('open');});});});
})();