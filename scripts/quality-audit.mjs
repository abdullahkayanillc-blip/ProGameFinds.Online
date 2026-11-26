import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
const root=process.cwd(),errors=[];
const read=path=>readFileSync(resolve(root,path),"utf8");
const check=(condition,message)=>{if(!condition)errors.push(message);};
const pages=["index.html","gaming-products.html","guides.html","about.html","how-we-review.html","affiliate-disclosure.html","privacy.html","terms.html","support.html","product-research-archive.html"];
for(const path of pages){
 const html=read(path);
 for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)){
  const url=match[1];
  if(/^(?:https?:|mailto:|tel:|data:|#)/i.test(url)||url==="/")continue;
  const clean=decodeURIComponent(url.split(/[?#]/)[0]);
  check(existsSync(resolve(root,clean.replace(/^\//,""))),path+": missing local target "+url);
 }
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
 check(new Set(ids).size===ids.length,path+": duplicate IDs");
 for(const tag of html.matchAll(/<[^>]+>/g)){
  const classes=tag[0].match(/\bclass=/g)||[];
  check(classes.length<=1,path+": duplicate class attributes in "+tag[0].slice(0,160));
 }
}
const css=read("assets/gaming-3d.css"),home=read("index.html"),catalogue=read("gaming-products.html"),disclosure=read("affiliate-disclosure.html");
const manifest=JSON.parse(read("data/product-verification.json")),policy=manifest.outbound_link_policy||{},trackingId=policy.associate_tag;
const archiveData=JSON.parse(read("data/historical-22-product-research.json")),archive=read("product-research-archive.html");
check(css.length<30*1024,"CSS exceeds 30KB");
check(/prefers-reduced-motion/.test(css),"Reduced motion support missing");
check(/:focus-visible/.test(css),"Keyboard focus treatment missing");
check(/aria-label="Primary"/.test(home),"Primary nav label missing");
check(/aria-label="Mobile"/.test(home),"Mobile nav label missing");
check((catalogue.match(/class="product-card"/g)||[]).length===30,"Expected 30 product candidate cards");
check(!/amazon\.(?:com|[a-z.]+)\/(?:s\?k=|dp\/)/i.test(catalogue),"Amazon product-shopping links must be removed");
check(policy.special_links_enabled===false,"Amazon Special Links must remain disabled");
check(policy.affiliate_account_approval==="not_applicable_links_removed","Affiliate-account status must not be presented as active");
check(!disclosure.includes("As an Amazon Associate I earn from qualifying purchases."),"No active Amazon earnings statement while links are disabled");
check(!catalogue.includes("As an Amazon Associate I earn from qualifying purchases."),"Catalogue must not claim active Amazon commissions");
const amazonLinks=[...catalogue.matchAll(/href="(https?:\/\/[^"]*amazon\.[^"]+)"/gi)].map(m=>m[1]);
check(amazonLinks.length===0,"No Amazon product-shopping links may remain");
check(!/tag=progamefinds-20/i.test(catalogue),"Affiliate Tracking ID must not remain in the catalogue");
check((archive.match(/class="archive-card"/g)||[]).length===22,"Historical archive card count must equal 22");
check(archiveData.products.length===22&&archiveData.products.filter(p=>p.asin).length===20,"Historical archive dataset counts are incorrect");
check(archiveData.products.every(p=>p.amazon_listing_status==="not_checked"&&p.affiliate_url===null),"Historical archive must retain unverified status and no affiliate URLs");
check(!/amazon\.com\/(?:dp\/|s\?k=)|tag=progamefinds-20/i.test(archive),"Historical archive must not contain retailer or affiliate links");
check(!/affiliate-link-disclosure|\(affiliate link\)/i.test(catalogue),"Affiliate link labels must be removed");
check(read("sitemap.xml").includes("https://progamefinds.online/guides.html"),"Public guides index missing from sitemap");
if(errors.length){console.error("PROGAMEFINDS QUALITY AUDIT: FAIL");for(const error of errors)console.error("- "+error);process.exit(1);}
console.log("PROGAMEFINDS QUALITY AUDIT: PASS");
console.log("Pages checked: "+pages.length+"; candidate product cards: 30; active Amazon product links: "+amazonLinks.length+".");
