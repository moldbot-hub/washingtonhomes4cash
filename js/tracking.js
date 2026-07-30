(function(){
  function get(k){try{return JSON.parse(localStorage.getItem('_sm_'+k));}catch(e){return null;}}
  function set(k,v){try{localStorage.setItem('_sm_'+k,JSON.stringify(v));}catch(e){}}
  var vid=get('vid');
  if(!vid){vid='v'+Date.now().toString(36)+Math.random().toString(36).slice(2,10);set('vid',vid);}
  if(get('referrer')===null){set('referrer',document.referrer||'');}
  if(get('landing')===null){set('landing',location.pathname+location.search);}
  if(get('utm')===null){
    var p=new URLSearchParams(location.search),u={},has=false;
    ['source','medium','campaign','content','term'].forEach(function(k){
      var v=p.get('utm_'+k);
      if(v){u[k]=v;has=true;}
    });
    set('utm',has?u:null);
  }
  var pages=get('pages')||[];
  pages.push({url:location.pathname+location.search,title:document.title,ts:new Date().toISOString()});
  if(pages.length>50)pages=pages.slice(pages.length-50);
  set('pages',pages);
  window._smTracking={
    getData:function(){
      return{visitorId:get('vid'),referrer:get('referrer')||null,landingPage:get('landing')||null,
        utm:get('utm')||null,pagesVisited:get('pages')||[]};
    },
    clear:function(){
      ['vid','referrer','landing','utm','pages'].forEach(function(k){try{localStorage.removeItem('_sm_'+k);}catch(e){}});
    }
  };
})();