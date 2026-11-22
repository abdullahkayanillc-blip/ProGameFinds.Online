(function () {
  "use strict";
  var search = document.getElementById("gear-search");
  var sections = Array.prototype.slice.call(document.querySelectorAll(".cat[data-category]"));
  var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
  var status = document.getElementById("gear-status");
  var active = "all";
  var products = [];

  function categoryFor(asset) {
    if (/mouse/.test(asset || "")) return "mice";
    if (/headset/.test(asset || "")) return "headsets";
    if (/keyboard/.test(asset || "")) return "keyboards";
    if (/controller/.test(asset || "")) return "controllers";
    if (/chair/.test(asset || "")) return "chairs";
    return "setup";
  }

  function makeCard(product) {
    var card = document.createElement("article");
    card.className = "card";
    card.setAttribute("data-product", "");
    var top = document.createElement("div");
    top.className = "card-top";
    var image = document.createElement("img");
    image.className = "card-ic";
    image.src = product.image_rights && product.image_rights.illustration_asset || "/assets/products/setup.svg";
    image.alt = "";
    image.width = 64;
    image.height = 64;
    image.loading = "lazy";
    var badge = document.createElement("span");
    badge.className = "tag-alt";
    badge.textContent = product.model_identity_status === "manufacturer_source_checked" ? "Manufacturer checked" : "Candidate";
    top.append(image, badge);
    var title = document.createElement("h4");
    title.textContent = product.product_name || "Gaming gear";
    var maker = document.createElement("p");
    maker.className = "pick";
    maker.textContent = product.manufacturer && product.manufacturer !== "Unspecified" ? product.manufacturer : "Category guide";
    var details = document.createElement("p");
    details.className = "spec";
    var facts = product.manufacturer_facts;
    if (facts && Object.keys(facts).length) {
      details.textContent = Object.entries(facts).map(function (entry) { return entry[0].replace(/_/g, " ") + ": " + entry[1]; }).join(" · ");
    } else {
      details.textContent = "Compare the exact model, platform compatibility, dimensions and warranty before choosing.";
    }
    var note = document.createElement("p");
    note.className = "asin";
    note.textContent = "Retailer listing, seller and variant not yet verified.";
    card.append(top, title, maker, details, note);
    if (product.manufacturer_source) {
      var link = document.createElement("a");
      link.className = "btn btn-ghost";
      link.href = product.manufacturer_source;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Manufacturer details";
      card.append(link);
    }
    return card;
  }

  function render() {
    sections.forEach(function (section) {
      var grid = section.querySelector(".grid");
      if (grid) grid.replaceChildren();
    });
    products.forEach(function (product) {
      var category = categoryFor(product.image_rights && product.image_rights.illustration_asset);
      var section = document.querySelector('.cat[data-category="' + category + '"]');
      if (!section) section = document.querySelector('.cat[data-category="setup"]');
      var grid = section && section.querySelector(".grid");
      if (grid) grid.appendChild(makeCard(product));
    });
    refresh();
  }

  function refresh() {
    if (!sections.length) return;
    var q = search ? search.value.trim().toLowerCase() : "";
    var shown = 0, groups = 0;
    sections.forEach(function (section) {
      var ok = active === "all" || section.getAttribute("data-category") === active;
      var count = 0;
      Array.prototype.slice.call(section.querySelectorAll(".card")).forEach(function (card) {
        var match = ok && (!q || (card.textContent || "").toLowerCase().indexOf(q) !== -1);
        card.hidden = !match;
        if (match) { count++; shown++; }
      });
      section.hidden = count === 0;
      if (count) groups++;
    });
    if (status) status.textContent = shown
      ? "Showing " + shown + " catalogue candidates across " + groups + " categor" + (groups === 1 ? "y." : "ies.") + " Retailer matches are not yet verified."
      : "No listings match that search. Try another term or choose All gear.";
  }

  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      active = button.getAttribute("data-filter") || "all";
      buttons.forEach(function (other) {
        var selected = other === button;
        other.classList.toggle("is-active", selected);
        other.setAttribute("aria-pressed", selected ? "true" : "false");
      });
      refresh();
    });
  });
  if (search) {
    search.addEventListener("input", refresh);
    document.addEventListener("keydown", function (event) {
      var t = event.target;
      var editing = t && (/INPUT|TEXTAREA|SELECT/.test(t.tagName) || t.isContentEditable);
      if (event.key === "/" && !event.ctrlKey && !event.metaKey && !event.altKey && !editing) { event.preventDefault(); search.focus(); }
      if (event.key === "Escape" && document.activeElement === search) { search.value = ""; refresh(); }
    });
  }
  fetch("/data/product-verification.json", { credentials: "same-origin" })
    .then(function (response) { if (!response.ok) throw new Error("Catalogue unavailable"); return response.json(); })
    .then(function (data) { products = Array.isArray(data.products) ? data.products : []; render(); })
    .catch(function () { if (status) status.textContent = "The catalogue could not be loaded. Please try again later."; });
  Array.prototype.slice.call(document.querySelectorAll("[data-current-year]")).forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
})();