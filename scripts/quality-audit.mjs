import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
const root=process.cwd(),errors=[];
const read=path=>readFileSync(resolve(root,path),"utf8");
const check=(condition,message)=>{if(!condition)errors.push(message);};
const pages=["index.html","gaming-products.html","guides.html","about.html","how-we-review.html","affiliate-disclosure.html","privacy.html","terms.html","support.html"];
for(const path of pages){
 const html=read(path);
 for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)){
  const url=match[1];
  if(/^(?:https?:|mailto:|tel:|data:|#)/i.test(url)||url==="/")continue;
  const clean=decodeURIComponent(url.split(/[?#]/)[0]);
  check(existsSync(resolve(root,clean.replace(/^\\//,""))),path+": missing local target "+url);
 }
 const ids=[...html.matchAll(/\\bid="([^"]+)"/g)].map(match=>match[1]);
 check(new Set(ids).size===ids.length,path+": duplicate IDs");
 for(const tag of html.matchAll(/<[^>]+>/g)){
  const classes=tag[0].match(/\\bclass=/g)||[];
  check(classes.length<=1,path+": duplicate class attributes in "+tag[0].slice(0,160));
 }
}
const css=read("assets/gaming-3d.css"),home=read("index.html"),catalogue=read("gaming-products.html"),disclosure=read("affiliate-disclosure.html");
const manifest=JSON.parse(read("data/product-verification.json")),policy=manifest.outbound_link_policy||{},trackingId=policy.associate_tag;
check(css.length<30*1024,"CSS exceeds 30KB");
check(/prefers-reduced-motion/.test(css),"Reduced motion support missing");
check(/:focus-visible/.test(css),"Keyboard focus treatment missing");
check(/aria-label="Primary"/.test(home),"Primary nav label missing");
check(/aria-label="Mobile"/.test(home),"Mobile nav label missing");
check((catalogue.match(/class="product-card"/g)||[]).length===30,"Expected 30 product candidate cards");
check(/rel="noopener noreferrer"/.test(catalogue),"Safe external-link rel attributes missing");
check(policy.special_links_enabled===true,"Unverified Amazon Special Links must remain disabled until account-holder confirmation");
check(policy.affiliate_account_approval==="adult_account_holder_confirmed","Adult account-holder confirmation missing");
check(disclosure.includes("As an Amazon Associate I earn from qualifying purchases."),"Required Amazon disclosure missing");
check(catalogue.includes("As an Amazon Associate I earn from qualifying purchases."),"Catalogue affiliate disclosure missing");
const amazonLinks=[...catalogue.matchAll(/href="(https:\\/\\/www\\.amazon\\.com\\/[^"]+)"/gi)].map(m=>m[1]);
check(amazonLinks.length===30,"Expected 30 Amazon catalogue links");
check(amazonLinks.every(url=>new RegExp("[?&]tag="+trackingId+"(?:&|$)").test(url)),"Every Amazon link must use the confirmed Associate tag");
check((catalogue.match(/class="affiliate-link-disclosure">\\(affiliate link\\)<\\/small>/g)||[]).length===30,"Each Amazon link requires an adjacent affiliate label");
check(read("sitemap.xml").includes("https://progamefinds.online/guides.html"),"Public guides index missing from sitemap");
if(errors.length){console.error("PROGAMEFINDS QUALITY AUDIT: FAIL");for(const error of errors)console.error("- "+error);process.exit(1);}
console.log("PROGAMEFINDS QUALITY AUDIT: PASS");
console.log("Pages checked: "+pages.length+"; candidate product cards: 30; properly tagged Amazon Special Links: "+amazonLinks.length+".");
