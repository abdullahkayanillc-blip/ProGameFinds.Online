(function(){
"use strict";
var search=document.getElementById("equipment-search");
var cards=Array.prototype.slice.call(document.querySelectorAll("[data-equipment-card]"));
var buttons=Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
var status=document.getElementById("catalogue-status");
var active="all";
function render(){
 var q=search?search.value.trim().toLowerCase():"";
 var visible=0;
 cards.forEach(function(card){
  var category=card.getAttribute("data-category")||"";
  var words=(card.textContent+" "+(card.getAttribute("data-search")||"")).toLowerCase();
  var matches=(active==="all"||category===active)&&(!q||words.indexOf(q)!==-1);
  card.hidden=!matches;
  if(matches)visible++;
 });
 if(status)status.textContent=visible?("Showing "+visible+" equipment research categories."):"No categories match that search. Try a broader term.";
}
buttons.forEach(function(button){button.addEventListener("click",function(){
 active=button.getAttribute("data-filter")||"all";
 buttons.forEach(function(other){var selected=other===button;other.setAttribute("aria-pressed",selected?"true":"false");});
 render();
});});
if(search){search.addEventListener("input",render);search.addEventListener("keydown",function(event){if(event.key==="Escape"){search.value="";render();}});}
Array.prototype.slice.call(document.querySelectorAll("[data-current-year]")).forEach(function(el){el.textContent=String(new Date().getFullYear());});
render();
})();