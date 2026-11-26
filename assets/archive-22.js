(function(){
"use strict";
var search=document.getElementById("archive-search");
var cards=Array.prototype.slice.call(document.querySelectorAll("[data-archive-card]"));
var buttons=Array.prototype.slice.call(document.querySelectorAll("[data-archive-filter]"));
var status=document.getElementById("archive-status");
var active="all";
function render(){
 var q=search?search.value.trim().toLowerCase():"";
 var visible=0;
 cards.forEach(function(card){
  var category=card.getAttribute("data-category")||"";
  var words=(card.textContent+" "+(card.getAttribute("data-search")||"")).toLowerCase();
  var match=(active==="all"||category===active)&&(!q||words.indexOf(q)!==-1);
  card.hidden=!match;
  if(match)visible++;
 });
 if(status)status.textContent="Showing "+visible+" of "+cards.length+" historical records.";
}
buttons.forEach(function(button){button.addEventListener("click",function(){
 active=button.getAttribute("data-archive-filter")||"all";
 buttons.forEach(function(other){other.setAttribute("aria-pressed",other===button?"true":"false");});
 render();
});});
if(search){search.addEventListener("input",render);search.addEventListener("keydown",function(event){if(event.key==="Escape"){search.value="";render();}});}
render();
})();