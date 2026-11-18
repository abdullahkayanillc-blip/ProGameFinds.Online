(function () {
  "use strict";
  var search=document.getElementById("gear-search");
  var sections=Array.prototype.slice.call(document.querySelectorAll(".cat[data-category]"));
  var buttons=Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
  var status=document.getElementById("gear-status");
  var active="all";
  function refresh(){
    if(!sections.length)return;
    var q=search?search.value.trim().toLowerCase():"";
    var shown=0,groups=0;
    sections.forEach(function(section){
      var ok=active==="all"||section.getAttribute("data-category")===active;
      var count=0;
      Array.prototype.slice.call(section.querySelectorAll(".card")).forEach(function(card){
        var match=ok&&(!q||(card.textContent||"").toLowerCase().indexOf(q)!==-1);
        card.hidden=!match;
        if(match){count++;shown++;}
      });
      section.hidden=count===0;
      if(count)groups++;
    });
    if(status)status.textContent=shown
      ?"Showing "+shown+" listing"+(shown===1?"":"s")+" across "+groups+" categor"+(groups===1?"y.":"ies.")
      :"No listings match that search. Try another term or choose All gear.";
  }
  buttons.forEach(function(button){
    button.addEventListener("click",function(){
      active=button.getAttribute("data-filter")||"all";
      buttons.forEach(function(other){
        var selected=other===button;
        other.classList.toggle("is-active",selected);
        other.setAttribute("aria-pressed",selected?"true":"false");
      });
      refresh();
    });
  });
  if(search){
    search.addEventListener("input",refresh);
    document.addEventListener("keydown",function(event){
      var t=event.target;
      var editing=t&&(/INPUT|TEXTAREA|SELECT/.test(t.tagName)||t.isContentEditable);
      if(event.key==="/"&&!event.ctrlKey&&!event.metaKey&&!event.altKey&&!editing){event.preventDefault();search.focus();}
      if(event.key==="Escape"&&document.activeElement===search){search.value="";refresh();}
    });
  }
  refresh();
  Array.prototype.slice.call(document.querySelectorAll("[data-current-year]")).forEach(function(el){el.textContent=String(new Date().getFullYear());});
})();