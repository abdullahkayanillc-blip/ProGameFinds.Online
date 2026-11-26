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

check(policy.special_links_enabled===true,"Amazon Special Links may only be enabled after adult account-holder confirmation");
check(policy.affiliate_account_approval==="adult_account_holder_confirmed","Adult legal account-holder confirmation is missing");
check(policy.account_confirmation_date==="2026-11-26","Account-holder confirmation date is missing");
check(typeof tag==="string"&&tag.length>0,"Assigned Associates Tracking ID is missing");
check(policy.commission_claims_enabled===false,"Do not claim specific commission earnings");
check(policy.commission_disclosure_enabled===true,"Amazon affiliate commission disclosure must be enabled");

check(existsSync(resolve(root,logo)),"ProGameFinds brand logo is missing");
check(/gaming-3d\.css/.test(home),"Gaming design stylesheet is not loaded");
check(home.includes("/affiliate-disclosure.html"),"Homepage navigation must link to the affiliate disclosure page");
check(disclosure.includes("As an Amazon Associate I earn from qualifying purchases."),"Exact Amazon Associates disclosure is missing");
check(/affiliate disclosure/i.test(catalogue),"Catalogue affiliate disclosure heading is missing");
check(catalogue.includes("As an Amazon Associate I earn from qualifying purchases."),"Catalogue must show the Amazon Associates disclosure near product links");

const cards=[...catalogue.matchAll(/<article class="product-card">[\s\S]*?<\/article>/g)].map(m=>m[0]);
check(cards.length===30,"Expected 30 product candidate cards in the catalogue");
check(manifest.candidate_products.length===cards.length,"Catalogue and evidence manifest candidate counts differ");
for(const [index,card] of cards.entries()){
 const link=card.match(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
 check(!!link,"Product card "+(index+1)+" is missing its outbound research link");
 if(link){
  check(/^https:\/\/www\.amazon\.com\/s\?k=/.test(link[1]),"Product card "+(index+1)+" must use an Amazon search URL");
  let actualTag=null;
  try{actualTag=new URL(link[1]).searchParams.get("tag");}catch{}
  check(actualTag===tag,"Product card "+(index+1)+" does not use the account-confirmed Associate Tracking ID");
  check(/target="_blank"/i.test(card)&&/rel="noopener noreferrer"/i.test(card),"Product card "+(index+1)+" is missing safe external-link attributes");
  check(/class="affiliate-link-disclosure">\(affiliate link\)<\/small>/i.test(card),"Product card "+(index+1)+" is missing a visible affiliate link label");
 }
}
check(!/amazon\.com\/dp\//i.test(catalogue),"Unverified direct ASIN links are prohibited");
check(!/assets\/products\//i.test(home+catalogue),"Legacy non-gaming product artwork must not be presented as gaming product photography");
check(stylesheet.length<30*1024,"Gaming stylesheet exceeds 30KB");
check(/prefers-reduced-motion/.test(stylesheet),"Reduced-motion support missing");
check(/:focus-visible/.test(stylesheet),"Visible keyboard-focus treatment missing");

for(const asset of ["assets/brand/progamefinds-logo-horizontal.svg","assets/favicon.svg","assets/gaming-3d.css","assets/site.js"]){
 check(existsSync(resolve(root,asset)),"Required public asset missing: "+asset);
}
if(errors.length){
 console.error("GAMING PORTAL ASSET AND LINK-SAFETY AUDIT: FAIL");
 for(const error of errors)console.error("- "+error);
 process.exit(1);
}
console.log("GAMING PORTAL ASSET AND LINK-SAFETY AUDIT: PASS");
console.log("Candidates: "+cards.length+"; tagged Amazon Special Links: "+cards.length+"; exact ASINs verified: 0; tracking ID: "+tag+".");
