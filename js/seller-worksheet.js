(function(){
  'use strict';const tool=document.querySelector('[data-seller-tool]');if(!tool)return;
  const boxes=[...tool.querySelectorAll('input[type=checkbox]')];const result=tool.querySelector('[data-tool-result]');
  function update(){const gaps=boxes.filter(i=>!i.checked);result.textContent=gaps.length? 'Topics to clarify: '+gaps.map(i=>i.dataset.question).join(' '):'All preparation topics marked. This does not establish a property value, purchase approval, legal readiness, or safe entry. Keep your questions and confirm the written terms.';}
  tool.addEventListener('change',event=>{if(event.target.matches('input[type=checkbox]'))update();});tool.querySelector('[data-print]').addEventListener('click',()=>window.print());
  tool.querySelector('[data-reset]').addEventListener('click',()=>{boxes.forEach(i=>i.checked=false);tool.querySelector('textarea').value='';update();});update();
})();
