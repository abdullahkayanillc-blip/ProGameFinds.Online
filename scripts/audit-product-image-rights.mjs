import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
const root=process.cwd(),errors=[];
const check=(ok,msg)=>{if(!ok)errors.push(msg);};
const evidence=JSON.parse(readFileSync(resolve(root,"data/fitness-equipment-evidence.json"),"utf8"));
const home=readFileSync(resolve(root,"index.html"),"utf8");
const js=readFileSync(resolve(root,"assets/site.js"),"utf8");
check(evidence.status==="editorial_categories_only","Evidence register must be editorial-category-only");
check(Array.isArray(evidence.product_records)&&evidence.product_records.length===0,"No unverified product listing should be published");
check(evidence.links?.status==="all_external_product_links_disabled","External product links must remain disabled");
check(!/amazon\.com|manufacturer|retailer|distributor|tag=/i.test(js),"The catalogue JavaScript must not generate product or affiliate links");
check(/no active Amazon Special Links/i.test(home),"Homepage affiliate-disabled notice missing");
for(const p of ["assets/products/mouse.svg","assets/products/headset.svg","assets/products/keyboard.svg","assets/products/controller.svg","assets/products/chair.svg","assets/products/lighting.svg"]){
 // Original legacy illustrations are retained in the repository but not used by the new fitness portal.
 check(existsSync(resolve(root,p)),"Preserved legacy vector artwork unexpectedly missing: "+p);
}
if(errors.length){console.error("PRODUCT ASSET AND LINK-SAFETY AUDIT: FAIL");for(const e of errors)console.error("- "+e);process.exit(1);}
console.log("PRODUCT ASSET AND LINK-SAFETY AUDIT: PASS");
console.log("No product cards, retailer URLs, manufacturer shopping links or affiliate tags are enabled.");
console.log("Original legacy vector artwork remains preserved but unused.");
