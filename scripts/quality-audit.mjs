import { readFileSync, existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
const root=process.cwd(),errors=[];
const read=p=>readFileSync(resolve(root,p),"utf8");
const check=(ok,msg)=>{if(!ok)errors.push(msg);};
const pages=["index.html","strength-equipment.html","cardio-equipment.html","home-gym.html","fitness-accessories.html","gym-flooring-storage.html","mobility-recovery.html","guides.html","guides/planning-a-home-gym.html","guides/strength-equipment-selection.html","guides/cardio-equipment-buying-guide.html","guides/choosing-gym-flooring.html","guides/fitness-equipment-safety-checklist.html","guides/checking-an-amazon-product-listing.html","guides/cleaning-and-maintaining-equipment.html","collections.html","about.html","how-we-review.html","affiliate-disclosure.html","privacy.html","terms.html","support.html"];
let refs=0;
for(const p of pages){
 const h=read(p);
 check(/<title>[^<]+<\/title>/.test(h),p+": title missing");
 check(/name="description"/.test(h),p+": description missing");
 check(/rel="canonical"/.test(h),p+": canonical missing");
 check(/name="viewport"/.test(h),p+": viewport missing");
 check(!/href="https?:\/\/(?!progamefinds\.online)/i.test(h),p+": external shopping/source anchor found");
 for(const m of h.matchAll(/(?:href|src)="([^"]+)"/g)){
  const u=m[1];
  if(/^(?:https?:|mailto:|tel:|data:|#)/i.test(u)||u==="/")continue;
  const clean=decodeURIComponent(u.split(/[?#]/)[0]);
  const target=resolve(root,clean.replace(/^\//,""));
  refs++;
  check(existsSync(target),p+": broken local asset or page "+u);
 }
 const ids=[...h.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 check(new Set(ids).size===ids.length,p+": duplicate element IDs");
}
const js=read("assets/site.js"),css=read("assets/fitness-portal.css");
check(js.length<=8*1024,"JavaScript source exceeds 8 KB");
check(css.length<=30*1024,"CSS source exceeds 30 KB");
check(!/amazon\.com|manufacturer|retailer|distributor|tag=/i.test(js),"JavaScript must not generate external shopping links");
check(/prefers-reduced-motion/.test(css),"Reduced-motion preference is missing");
check(/:focus-visible/.test(css),"Visible keyboard focus style is missing");
check(!/\\sstyle=["\x27]/i.test(pages.map(read).join("\\n")),"Inline styles violate the strict Content Security Policy");
check(/aria-label="Primary"/.test(read("index.html")),"Primary navigation label missing");
check(/role="status"/.test(read("index.html")),"Accessible search-result status missing");
check(JSON.parse(read("data/fitness-equipment-evidence.json")).product_records.length===0,"Unverified product records were added");
check(JSON.parse(read("data/product-verification.json")).active_product_records.length===0,"Legacy product records remain active");
if(errors.length){console.error("FITNESS EDITORIAL QUALITY AUDIT: FAIL");for(const e of errors)console.error("- "+e);process.exit(1);}
console.log("FITNESS EDITORIAL QUALITY AUDIT: PASS");
console.log("Active pages: "+pages.length+"; local refs checked: "+refs+"; JS: "+js.length+" bytes; CSS: "+css.length+" bytes.");
