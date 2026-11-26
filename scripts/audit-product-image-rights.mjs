import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root=process.cwd();
const errors=[];
const read=path=>readFileSync(resolve(root,path),"utf8");
const check=(condition,message)=>{if(!condition)errors.push(message);};

const manifest=JSON.parse(read("data/product-verification.json"));
const policy=manifest.outbound_link_policy||{};
const home=read("index.html");
const catalogue=read("gaming-products.html");
const disclosure=read("affiliate-disclosure.html");
const stylesheet=read("assets/gaming-3d.css");
const logo="assets/brand/progamefinds-logo-horizontal.svg";
const tag=policy.associate_tag;

check(manifest.status==="gaming_catalogue_restored_retailer_verification_pending","Gaming evidence manifest status mismatch");
check(manifest.candidate_products.length===30,"Expected 30 gaming product candidates in the evidence manifest");
check(manifest.candidate_products.every(p=>
 p.status==="candidate_not_verified" &&
 p.asin===null && p.seller===null && p.variant===null &&
 p.retailer_url===null && p.price===null && p.availability===null
),"A product candidate is incorrectly marked as retailer-verified");

check(policy.special_links_enabled===false,"Amazon Special Links must be disabled");
check(policy.affiliate_account_approval==="not_applicable_links_removed","Affiliate programme status must not be presented as active");
check(policy.associate_tag===null,"Affiliate tracking ID must be removed from active site configuration");
check(tag===null,"No Associates Tracking ID should be active while all shopping links are removed");
check(policy.commission_claims_enabled===false,"Do not claim specific commission earnings");
check(policy.commission_disclosure_enabled===false,"Affiliate commission disclosure must be disabled while there are no affiliate links");

check(existsSync(resolve(root,logo)),"ProGameFinds brand logo is missing");
check(/gaming-3d\.css/.test(home),"Gaming design stylesheet is not loaded");
check(home.includes("/affiliate-disclosure.html"),"Homepage navigation must link to the affiliate disclosure page");
check(!disclosure.includes("As an Amazon Associate I earn from qualifying purchases."),"Active Amazon earnings statement must be removed");
check(/retail link status/i.test(catalogue),"Catalogue must show current retail-link status");
check(!catalogue.includes("As an Amazon Associate I earn from qualifying purchases."),"Catalogue must not make an active Amazon commission claim");

const cards=[...catalogue.matchAll(/<article class="product-card">[\s\S]*?<\/article>/g)].map(m=>m[0]);
check(cards.length===30,"Expected 30 product candidate cards in the catalogue");
check(manifest.candidate_products.length===cards.length,"Catalogue and evidence manifest candidate counts differ");
for(const [index,card] of cards.entries()){
 check(!/<a\b[^>]*href="https?:\/\//i.test(card),"Product card "+(index+1)+" must not contain an external retailer link");
 check(!/affiliate-link-disclosure|\(affiliate link\)/i.test(card),"Product card "+(index+1)+" must not show an affiliate label");
 check(card.includes("Retail link currently unavailable."),"Product card "+(index+1)+" must show that its retail link is disabled");
}
check(!/assets\/products\//i.test(home+catalogue),"Legacy non-gaming product artwork must not be presented as gaming product photography");
check(stylesheet.length<30*1024,"Gaming stylesheet exceeds 30KB");
check(/prefers-reduced-motion/.test(stylesheet),"Reduced-motion support missing");
check(/:focus-visible/.test(stylesheet),"Visible keyboard-focus treatment missing");

for(const asset of ["assets/brand/progamefinds-logo-horizontal.svg","assets/favicon.svg","assets/gaming-3d.css","assets/site.js"]){
 check(existsSync(resolve(root,asset)),"Required public asset missing: "+asset);
}
const research=read("gamesir-g7-pro-research.html");
check(research.includes("/assets/research-controller.svg"),"GameSir page must use the original site illustration");
check(/not a photograph/i.test(research),"Original illustration must not be represented as exact product photography");
check(!/assets\/products\//i.test(research),"Research page must not reuse a generic catalogue product asset as exact product photography");
check(!/amazon\.com\/dp\/|tag=progamefinds-20|linkCode=ll2/i.test(research),"Research page must not publish unapproved retailer or affiliate links");
check(!/<a\b[^>]*href=["']https?:\/\//i.test(research),"Research page must not contain external website links");
check(research.includes("mailto:support@progamefinds.online"),"Community review submissions must use the disclosed manual-review channel");
check(existsSync(resolve(root,"assets/research-controller.svg")),"Original research illustration asset is missing");
if(errors.length){
 console.error("GAMING PORTAL ASSET AND LINK-SAFETY AUDIT: FAIL");
 for(const error of errors)console.error("- "+error);
 process.exit(1);
}
console.log("GAMING PORTAL ASSET AND LINK-SAFETY AUDIT: PASS");
console.log("Candidates: "+cards.length+"; active retailer shopping links: 0; exact ASINs verified: 0.");
