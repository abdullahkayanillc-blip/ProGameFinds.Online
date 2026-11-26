import {chromium} from "playwright";
const baseURL=process.env.PREVIEW_URL||"https://progamefinds.online",failures=[];
const check=(v,m)=>{console.log((v?"PASS ":"FAIL ")+m);if(!v)failures.push(m);};
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:960}});
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 const response=await page.goto(baseURL,{waitUntil:"networkidle",timeout:45000});
 check(!!response&&response.ok(),"Homepage responds successfully");
 check((await page.title()).includes("Gaming Gear"),"Homepage title identifies gaming gear");
 check(await page.locator("h1").count()===1,"One primary H1");
 check((await page.locator("h1").innerText()).includes("level-up"),"Gaming hero headline renders");
 check(await page.locator(".category-card").count()===10,"Ten gaming category cards render");
 const logo=page.locator(".brand img");check(await logo.count()>=1&&await logo.first().evaluate(img=>img.complete&&img.naturalWidth>0),"Brand logo loads");
 const productLink=page.locator('a[href="/gaming-products.html"]').first();check(await productLink.count()===1,"Gaming catalogue navigation exists");
 const productResponse=await page.request.get(new URL("/gaming-products.html",baseURL).toString());
 check(productResponse.ok(),"Gaming product catalogue responds successfully");
 const p=await browser.newPage({viewport:{width:1365,height:900}});
 await p.goto(new URL("/gaming-products.html",baseURL).toString(),{waitUntil:"networkidle",timeout:45000});
 const cards=p.locator(".product-card");check(await cards.count()>=20,"At least 20 product candidate cards render");
 const links=p.locator('a[href*="amazon.com/s?k="]');check(await links.count()===0,"No Amazon product-shopping links are present");
 const body=await p.locator("body").innerText();
 check(body.includes("Retail link status:"),"Catalogue explains that retail links are disabled");
 check(body.includes("Retail link currently unavailable."),"Product cards clearly show disabled retailer links");
 check(!body.includes("(affiliate link)"),"No affiliate labels remain visible");
 const metrics=await page.evaluate(()=>({width:innerWidth,documentWidth:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight}));
 check(metrics.documentWidth<=metrics.width,"Desktop layout has no horizontal overflow");
 await page.setViewportSize({width:390,height:844});await page.reload({waitUntil:"networkidle"});
 const mobile=await page.evaluate(()=>({width:innerWidth,documentWidth:document.documentElement.scrollWidth,menu:getComputedStyle(document.querySelector("details.mobile-nav")).display}));
 check(mobile.documentWidth<=mobile.width,"Mobile layout has no horizontal overflow");
 check(mobile.menu!=="none","Mobile navigation is visible");
 check(errors.length===0,"No uncaught browser errors");
 console.log("BROWSER METRICS "+JSON.stringify({desktop:metrics,mobile}));
}finally{await browser.close();}
if(failures.length){console.error("PROGAMEFINDS BROWSER QA FAILED: "+failures.length);process.exit(1);}
console.log("PROGAMEFINDS BROWSER QA PASSED");
