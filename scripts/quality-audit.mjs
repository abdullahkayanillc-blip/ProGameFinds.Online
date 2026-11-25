import {readFileSync,existsSync} from "node:fs";
import {resolve} from "node:path";
const root=process.cwd(),errors=[];const read=p=>readFileSync(resolve(root,p),"utf8");const check=(v,m)=>{if(!v)errors.push(m)};
for(const p of ["index.html","gaming-products.html"]){
 const h=read(p);
 for(const m of h.matchAll(/(?:href|src)="([^"]+)"/g)){
  const u=m[1];if(/^(?:https?:|mailto:|tel:|data:|#)/i.test(u)||u==="/")continue;
  const clean=decodeURIComponent(u.split(/[?#]/)[0]);
  check(existsSync(resolve(root,clean.replace(/^\//,""))),p+": missing local target "+u);
 }
 const ids=[...h.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);check(new Set(ids).size===ids.length,p+": duplicate IDs");
}
const css=read("assets/gaming-3d.css"),home=read("index.html"),catalogue=read("gaming-products.html");
check(css.length<30*1024,"CSS exceeds 30KB");
check(/prefers-reduced-motion/.test(css),"Reduced motion support missing");
check(/:focus-visible/.test(css),"Keyboard focus treatment missing");
check(/aria-label="Primary"/.test(home),"Primary nav label missing");
check(/aria-label="Mobile"/.test(home),"Mobile nav label missing");
check((catalogue.match(/class="product-card"/g)||[]).length>=20,"Insufficient product candidate cards");
check(/rel="noopener noreferrer"/.test(catalogue),"Safe external-link rel attributes missing");
check(!/tag=[a-z0-9-]+/i.test(catalogue),"Unverified affiliate tracking tag detected");
if(errors.length){console.error("PROGAMEFINDS QUALITY AUDIT: FAIL");for(const e of errors)console.error("- "+e);process.exit(1);}
console.log("PROGAMEFINDS QUALITY AUDIT: PASS");
