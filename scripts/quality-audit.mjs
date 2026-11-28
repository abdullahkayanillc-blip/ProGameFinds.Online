import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
const root=process.cwd(),errors=[];
const read=path=>readFileSync(resolve(root,path),"utf8");
const check=(condition,message)=>{if(!condition)errors.push(message);};
const pages=["index.html","gaming-products.html","gamesir-g7-pro-research.html","guides.html",
  "guides/selecting-a-gaming-mouse.html",
  "guides/selecting-a-gaming-keyboard.html",
  "guides/gaming-headset-compatibility-guide.html",
  "guides/controller-platform-compatibility.html",
  "guides/gaming-monitor-resolution-refresh-rate.html",
  "guides/wired-vs-wireless-gaming-gear-guide.html",
  "guides/balanced-gaming-setup-planning.html",
  "guides/gaming-desk-space-and-fit.html",
  "guides/handheld-pc-gaming-accessory-compatibility.html",
  "guides/verify-gaming-product-listing.html",
"about.html","how-we-review.html","affiliate-disclosure.html","privacy.html","terms.html","support.html","product-research-archive.html"];
const blogPages=["blog/index.html","blog/controller-stick-sensor-technology.html","blog/handheld-pc-usbc-docking.html","blog/vram-vs-ram-vs-storage.html","blog/streaming-microphone-basics.html","blog/understanding-game-latency.html"];
for(const page of pages){ const html=read(page); check(!/<a\b[^>]*href=["']https?:\/\//i.test(html),page+": external website links must remain disabled"); }
for(const path of [...pages,...blogPages]){
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
const css=read("assets/gaming-3d.css"),home=read("index.html"),headers=read("_headers"),catalogue=read("gaming-products.html"),disclosure=read("affiliate-disclosure.html");
const coreEarlyHint='Link: </assets/gaming-3d.css?v=20261128-brand-refresh>; rel=preload; as=style';
for(const route of ["/","/gaming-products","/gamesir-g7-pro-research","/product-research-archive","/guides","/guides/*","/about","/how-we-review","/affiliate-disclosure","/privacy","/terms","/support"]) check(headers.includes(route+"\n  "+coreEarlyHint),route+": core CSS Early Hint missing");
const homepageHeaderBlock=(headers.split("\n\n/gaming-products\n")[0]||"");
const detailHeaderBlock=(headers.split("\n\n/gamesir-g7-pro-research\n")[1]||"").split("\n\n/product-research-archive\n")[0]||"";
check(homepageHeaderBlock.includes("Link: </assets/brand/hero-showcase.svg?v=20261128-brand-refresh>; rel=preload; as=image"),"Homepage hero Early Hint missing");
check(homepageHeaderBlock.includes("Link: </assets/g7-pro-research.css?v=20261128-performance>; rel=preload; as=style"),"Homepage spotlight CSS Early Hint missing");
check(detailHeaderBlock.includes("Link: </assets/g7-pro-research.css?v=20261128-performance>; rel=preload; as=style"),"GameSir detail CSS Early Hint missing");
check(/research-controller\.svg[^>]*loading="lazy"[^>]*decoding="async"/.test(home),"Below-fold homepage spotlight image should be lazy loaded");
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
const blogIndex=read("blog/index.html"),blogCss=read("assets/blog.css");
const blogArticles=blogPages.filter(path=>path!=="blog/index.html");
check((blogIndex.match(/class="blog-card"/g)||[]).length===5,"Blog index must contain exactly five original article cards");
check(blogCss.length<12*1024,"Blog stylesheet exceeds 12KB");
check(home.includes('href="/blog/"'),"Homepage primary navigation must include the blog");
check(home.includes("Go deeper into gaming tech"),"Homepage editorial blog feature is missing");
check(read("guides.html").includes('href="/blog/"'),"Buying guides index must link to the blog");
check(catalogue.includes('href="/blog/"'),"Gaming catalogue must link to the blog");
const allowedSourceHosts=["gamesir.com","displayport.org","nvidia.com","shure.com","microsoft.com"];
for(const path of blogArticles){
 const html=read(path);
 const wordCount=(html.replace(/<[^>]*>/g," ").replace(/&[^;]+;/g," ").match(/\b[\w'-]+\b/g)||[]).length;
 check(wordCount>=500,path+": article should contain at least 500 words");
 check(/class="post-sources"/.test(html),path+": source notes missing");
 check(/ProGameFinds Editorial Team/.test(html),path+": editorial byline missing");
 check(/article:published_time/.test(html),path+": published-date metadata missing");
 const outbound=[...html.matchAll(/href="(https?:\/\/[^"]+)"/gi)].map(m=>m[1]);
 const external=outbound.filter(url=>{try{const host=new URL(url).hostname.toLowerCase();return host!=="progamefinds.online"&&!host.endsWith(".progamefinds.online");}catch(e){return true;}});
 check(external.length>=1,path+": official source references missing");
 for(const url of external){
  try { const host=new URL(url).hostname.toLowerCase(); check(allowedSourceHosts.some(domain=>host===domain||host.endsWith("."+domain)),path+": unapproved external source domain "+host); }
  catch(e){ check(false,path+": malformed source URL"); }
 }
 check(!/amazon\.(?:com|co\.uk|ca|de|co\.jp)|tag=progamefinds-20|affiliate-link-disclosure/i.test(html),path+": retailer or affiliate content is prohibited");
}
for(const route of ["/blog","/blog/*"]) {
 check(headers.includes(route+"\n")&&headers.includes("Link: </assets/gaming-3d.css?v=20261128-brand-refresh>; rel=preload; as=style"),route+": shared CSS Early Hint missing");
 check(headers.includes(route+"\n")&&headers.includes("Link: </assets/blog.css?v=20261128-blog-launch>; rel=preload; as=style"),route+": blog CSS Early Hint missing");
}
if(errors.length){console.error("PROGAMEFINDS QUALITY AUDIT: FAIL");for(const error of errors)console.error("- "+error);process.exit(1);}
console.log("PROGAMEFINDS QUALITY AUDIT: PASS");
console.log("Pages checked: "+pages.length+"; candidate product cards: 30; active Amazon product links: "+amazonLinks.length+".");
